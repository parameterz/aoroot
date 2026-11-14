// Node runner: `node tests/run.js` (or `npm test`). Exit code 1 on any failure.
import { runAll } from "./cases.js";

const results = runAll();
for (const r of results) console.log(`${r.pass ? "✓" : "✗"} ${r.name}${r.pass ? "" : `\n    ${r.detail}`}`);
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
