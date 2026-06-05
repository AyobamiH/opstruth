#!/usr/bin/env node
import { runCli } from '../src/cli.js';

await runCli(process.argv.slice(2), process.cwd()).catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
});
