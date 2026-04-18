"use strict";

// Verification of the isolated FIFO queue logic
let queue = Promise.resolve();

function queueTask(id, task) {
  const result = queue.then(() => task());
  
  queue = result.catch(err => {
    console.error(`[${id}] Task Failed:`, err);
    return Promise.resolve(); // chain continues
  });

  return result;
}

async function simulateOCR(id, delay) {
  console.log(`[${id}] Starting... (will take ${delay}ms)`);
  await new Promise(r => setTimeout(r, delay));
  if (id === "Task-2") throw new Error("Simulated Failure");
  console.log(`[${id}] Finished.`);
  return `Result of ${id}`;
}

console.log("--- Concurrency Queue Test ---");

const tasks = [
  { id: "Task-1", delay: 1000 },
  { id: "Task-2", delay: 500 },  // This one will fail
  { id: "Task-3", delay: 1200 },
  { id: "Task-4", delay: 300 },
  { id: "Task-5", delay: 800 }
];

// Launch all at once
const results = tasks.map(t => {
  return queueTask(t.id, () => simulateOCR(t.id, t.delay))
    .then(res => console.log(`[${t.id}] Response received: ${res}`))
    .catch(err => console.log(`[${t.id}] Caught local response error: ${err.message}`));
});

Promise.allSettled(results).then(() => {
  console.log("\n--- All tasks completed. ---");
  console.log("Check if finished logs are sequential and no overlap occurred.");
});
