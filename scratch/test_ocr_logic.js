"use strict";

// Mocking logic from scan.controller.js to verify parsing
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
  s = s.replace(/[.,]$/, ""); // Trim trailing separators

  const hasComma = s.includes(",");
  const hasDot = s.includes(".");

  let finalValue;
  if (hasComma && hasDot) {
    const lastComma = s.lastIndexOf(",");
    const lastDot = s.lastIndexOf(".");
    if (lastComma > lastDot) {
      finalValue = parseFloat(s.replace(/\./g, "").replace(",", "."));
    } else {
      finalValue = parseFloat(s.replace(/,/g, ""));
    }
  } else if (hasComma || hasDot) {
    const sep = hasComma ? "," : ".";
    const parts = s.split(sep);
    const lastPart = parts[parts.length - 1];
    if (lastPart.length === 2) {
      finalValue = parseFloat(s.replace(new RegExp(`\\${sep}`, "g"), (match, offset) => {
        return offset === s.length - 3 ? "." : "";
      }));
    } else {
      finalValue = parseFloat(s.replace(new RegExp(`\\${sep}`, "g"), ""));
    }
  } else {
    finalValue = parseFloat(s);
  }
  return finalValue;
}

const testCases = [
  { input: "100,00", expected: 100 },
  { input: "1,200.50", expected: 1200.5 },
  { input: "1.200,50", expected: 1200.5 },
  { input: "1200.", expected: 1200 },
  { input: "Rs. 450.00", expected: 450 },
  { input: "Total: 1,500", expected: 1500 }
];

console.log("--- OCR Financial Parsing Test ---");
testCases.forEach(tc => {
  const result = parsePrice(tc.input);
  const status = result === tc.expected ? "✅ PASS" : `❌ FAIL (Got ${result})`;
  console.log(`Input: ${tc.input.padEnd(15)} | Expected: ${tc.expected.toString().padEnd(8)} | Result: ${status}`);
});

function extractStatus(text) {
  const NEG = /\b(?:unpaid|failed|balance\s*due|pending\s*payment|partial\s*payment|due)\b/i;
  const POS = /\b(?:paid|success|completed|cleared|settled|payment\s*received)\b/i;
  if (NEG.test(text)) return "pending";
  if (POS.test(text)) return "paid";
  return "pending";
}

console.log("\n--- OCR Status logic Test ---");
const statusCases = [
  { text: "Bill is due on tomorrow", expected: "pending" },
  { text: "Payment Successful", expected: "paid" },
  { text: "Status: Unpaid", expected: "pending" }
];
statusCases.forEach(sc => {
  const result = extractStatus(sc.text);
  const status = result === sc.expected ? "✅ PASS" : `❌ FAIL (Got ${result})`;
  console.log(`Text: ${sc.text.padEnd(25)} | Expected: ${sc.expected.padEnd(8)} | Status: ${status}`);
});
