"use strict";

const { createWorker } = require("tesseract.js");
const sharp = require("sharp");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const multer = require("multer");

dayjs.extend(customParseFormat);

/* ─────────────────────────────────────────────────────────────────────────
   SINGLETON WORKER & FIFO QUEUE (Isolated Promise Pattern)
   ───────────────────────────────────────────────────────────────────────── */

let worker = null;
let queue = Promise.resolve();

/**
 * Initializes the singleton Tesseract worker.
 * Must be called in server.js startup.
 */
async function initWorker() {
  if (worker) return;
  try {
    worker = await createWorker("eng");
    console.log("OCR Worker Ready (Singleton Mode)");
  } catch (err) {
    console.error("FATAL: Failed to initialize OCR Worker:", err);
    throw err;
  }
}

/**
 * Ensures thread-safe sequential access to the singleton worker.
 * @param {Function} task - Async function returning OCR results.
 * @returns {Promise} - Isolated promise for the specific task.
 */
function queueTask(task) {
  // Isolate this task's promise
  const result = queue.then(() => task());

  // Update the global queue to chain next tasks (regardless of this one's success)
  queue = result.catch((err) => {
    console.error("OCR Task Failed in Queue:", err);
    return Promise.resolve(); // Swallow error so chain doesn't break
  });

  return result;
}

/**
 * DO NOT CALL WORKER.RECOGNIZE DIRECTLY.
 * Always use this wrapper to ensure queue-safe sequential processing.
 */
async function runOCRWithQueue(buffer) {
  if (!worker) throw new Error("OCR Worker not initialized. Please try again later.");

  return queueTask(async () => {
    const { data } = await worker.recognize(buffer);
    return data;
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   MULTER – Memory storage, 2 MB limit
   ───────────────────────────────────────────────────────────────────────── */

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/tiff", "image/bmp"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(new Error("Invalid file type."));
    }
    cb(null, true);
  },
});

/* ─────────────────────────────────────────────────────────────────────────
   ADAPTIVE PREPROCESSING
   ───────────────────────────────────────────────────────────────────────── */

const THRESHOLD_VAL = 135; // Fine-tuned for financial documents

async function preprocess(buffer, useThreshold = false) {
  let pipeline = sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .grayscale()
    .normalize();

  if (useThreshold) {
    pipeline = pipeline.threshold(THRESHOLD_VAL).linear(1.2, -0.1);
  }

  return pipeline.sharpen().png().toBuffer();
}

/* ─────────────────────────────────────────────────────────────────────────
   FINANCIAL PARSING & NORMALIZATION
   ───────────────────────────────────────────────────────────────────────── */

const MAX_AMOUNT_CAP = 10000000; // 10 Million

function normalizeNumberString(str) {
  if (!str) return "";
  return str
    .replace(/[₹$£€]/g, "")
    .replace(/Rs\.?/gi, "")
    .replace(/O/g, "0")
    .replace(/o(?=\d)/g, "0")
    .replace(/l(?=\d)/g, "1")
    .replace(/I(?=\d)/g, "1")
    .replace(/S(?=\d)/g, "5")
    .trim();
}

function parsePrice(raw) {
  if (!raw) return null;
  let s = normalizeNumberString(raw);

  // Trim trailing separators (e.g., "1200." -> "1200")
  s = s.replace(/[.,]$/, "");

  const hasComma = s.includes(",");
  const hasDot = s.includes(".");

  let finalValue;
  if (hasComma && hasDot) {
    // Mixed format: Last one determines decimal
    const lastComma = s.lastIndexOf(",");
    const lastDot = s.lastIndexOf(".");
    if (lastComma > lastDot) {
      // EU Format: 1.200,50
      finalValue = parseFloat(s.replace(/\./g, "").replace(",", "."));
    } else {
      // US Format: 1,200.50
      finalValue = parseFloat(s.replace(/,/g, ""));
    }
  } else if (hasComma || hasDot) {
    const sep = hasComma ? "," : ".";
    const parts = s.split(sep);
    const lastPart = parts[parts.length - 1];
    if (lastPart.length === 2) {
      // Logic: If separator is 2 digits from right, it's a decimal
      finalValue = parseFloat(s.replace(new RegExp(`\\${sep}`, "g"), (match, offset) => {
        return offset === s.length - 3 ? "." : "";
      }));
    } else {
      // Treat as thousands separator
      finalValue = parseFloat(s.replace(new RegExp(`\\${sep}`, "g"), ""));
    }
  } else {
    finalValue = parseFloat(s);
  }

  if (isNaN(finalValue) || finalValue < 0 || finalValue > MAX_AMOUNT_CAP) {
    return null;
  }
  return finalValue;
}

/* ─────────────────────────────────────────────────────────────────────────
   RANKED EXTRACTION logic
   ───────────────────────────────────────────────────────────────────────── */

function extractAmount(text) {
  const PATTERNS = [
    { tier: 100, re: /(?:grand\s*t[o0]tal|net\s*payable|t[o0]tal\s*due|amount\s*due|payable\s*amount|net\s*amount)\s*[:\-]?\s*[₹$£€Rs.]*\s*([0-9Ool,]+\.?[0-9]*)/gi },
    { tier: 50, re: /\bt[o0]tal\s*(?:amount)?\s*[:\-]?\s*[₹$£€Rs.]*\s*([0-9Ool,]+\.?[0-9]*)/gi },
    { tier: 50, re: /\bamount\s*[:\-]?\s*[₹$£€Rs.]*\s*([0-9Ool,]+\.?[0-9]*)/gi },
    { tier: 0, re: /[₹$£€]\s*([0-9Ool,]+\.?[0-9]*)/g }
  ];

  let candidates = [];
  const PENALTY_KEYWORDS = /\b(?:paid|discount|change|refund|cash\s*back|subtotal)\b/i;

  PATTERNS.forEach(p => {
    const re = new RegExp(p.re.source, p.re.flags);
    let m;
    while ((m = re.exec(text)) !== null) {
      const val = parsePrice(m[1]);
      if (val === null) continue;

      let score = p.tier;
      
      // Proximity & Keyword Heuristics
      const context = text.substring(Math.max(0, m.index - 40), m.index).toLowerCase();
      if (context.includes("grand")) score += 50;
      if (context.includes("subtotal")) score -= 80;
      if (PENALTY_KEYWORDS.test(context)) score -= 100;

      // Value scaling (Normalized Magnitude)
      // score += Math.min(val / 10000, 1) * 50; 
      // We don't have maxCandidateValue yet, so we'll do log-lite or relative later.
      // For now, big numbers in bills are usually totals.
      if (val > 0) score += Math.min(val / 1000, 1) * 30;
      if (val === 0) score -= 200;

      // Position (lower is better)
      score += (m.index / text.length) * 50;

      candidates.push({ val, score, index: m.index });
    }
  });

  if (candidates.length === 0) return { amount: null, amountConfidence: "low" };

  // Select the highest scored candidate
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  let confidence = "low";
  if (best.score > 120) confidence = "high";
  else if (best.score > 60) confidence = "medium";

  return { amount: best.val, amountConfidence: confidence };
}

/* ─────────────────────────────────────────────────────────────────────────
   NAME, DATE & STATUS logic
   ───────────────────────────────────────────────────────────────────────── */

function extractName(text) {
  const BIZ_TERMS = /\b(?:pvt|ltd|store|mart|pharmacy|cafe|inc|corp|services|limited|bank|hotel|restaurant)\b/i;
  const labels = /(?:invoice\s+for|bill(?:ed)?\s*to|customer(?:\s*name)?|name|billed\s*to|to)\s*[:\-]?\s*/i;
  
  const lm = text.match(new RegExp(labels.source + "([A-Za-z][A-Za-z\\s\\.]{1,40})", "i"));
  if (lm) {
    const name = lm[1].trim();
    if (name.length >= 3 && !BIZ_TERMS.test(name)) return name;
  }

  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 10)) {
    // Reject noise
    if (line.length > 30 && !line.includes(" ")) continue; // Likely ID/Hex
    if (/(.)\1{4,}/.test(line)) continue; // excessive repeated chars

    // Reject ALL-CAPS business headers (> 2 words)
    const words = line.split(/\s+/).filter(Boolean);
    if (words.length > 2 && line === line.toUpperCase()) continue;

    const cleaned = line.replace(/[^A-Za-z\s]/g, "").trim();
    if (cleaned.length >= 5 && words.length >= 2 && !BIZ_TERMS.test(cleaned)) {
      return cleaned;
    }
  }
  return null;
}

const DATE_SUB = /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})\b/;

function extractDate(text) {
  const m = text.match(DATE_SUB);
  if (!m) return { date: null, ambiguous: false };

  const raw = m[1];
  const d1 = dayjs(raw, "DD/MM/YYYY", true);
  const d2 = dayjs(raw, "MM/DD/YYYY", true);

  if (d1.isValid() && d2.isValid() && !d1.isSame(d2, 'day')) {
    return { date: null, ambiguous: true };
  }

  const final = d1.isValid() ? d1 : (d2.isValid() ? d2 : dayjs(raw));
  return { date: final.isValid() ? final.format("YYYY-MM-DD") : null, ambiguous: false };
}

function extractStatus(text) {
  const NEG = /\b(?:unpaid|failed|balance\s*due|pending\s*payment|partial\s*payment|due)\b/i;
  const POS = /\b(?:paid|success(?:ful)?|completed|cleared|settled|payment\s*received|payment\s*successful)\b/i;

  if (NEG.test(text)) return "pending";
  if (POS.test(text)) return "paid";
  return "pending";
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN EXPORTS
   ───────────────────────────────────────────────────────────────────────── */

exports.scanInvoice = async (req, res, next) => {
  let fileBuffer = null;
  let processedBuffer = null;
  
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("No image file provided.");
    }

    fileBuffer = req.file.buffer;

    // PASS 1: Clean/Soft Preprocessing
    processedBuffer = await preprocess(fileBuffer, false);
    let ocrData = await runOCRWithQueue(processedBuffer);
    
    let text = ocrData.text;
    let resAmt = extractAmount(text);

    // ADAPTIVE FALLBACK: Trigger Pass 2 if extraction failed or text is suspicious
    if (resAmt.amount === null || resAmt.amountConfidence === "low" || text.length < 50) {
      processedBuffer = null; // release references
      processedBuffer = await preprocess(fileBuffer, true);
      ocrData = await runOCRWithQueue(processedBuffer);
      text = ocrData.text;
      resAmt = extractAmount(text);
    }

    const { date, ambiguous } = extractDate(text);

    const payload = {
      customerName: extractName(text),
      customerEmail: (text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/) || [null])[0],
      dueDate: date,
      amount: resAmt.amount,
      status: extractStatus(text),
    };

    return res.json({
      success: true,
      data: payload,
      meta: {
        amountConfidence: resAmt.amountConfidence,
        dateAmbiguous: ambiguous,
        rawText: text.substring(0, 1000) // snippet for UI
      }
    });

  } catch (err) {
    console.error("OCR Controller Error:", err);
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
      success: false,
      error: "OCR_FAILED",
      message: err.message
    });
  } finally {
    // Explicit Memory Cleanup
    fileBuffer = null;
    processedBuffer = null;
    if (req.file) req.file.buffer = null;
  }
};

exports.initWorker = initWorker;
exports.upload = upload;
