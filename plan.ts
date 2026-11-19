import { readFile } from 'node:fs/promises';
import { planGift } from './planning.js';
if(!process.argv[2]) throw new Error('Usage: npm run plan -- public-parameters.json');
try { console.log(JSON.stringify(planGift(JSON.parse(await readFile(process.argv[2],'utf8'))),null,2)); }
catch(error) { console.error(error instanceof Error?error.message:'Planning failed');process.exitCode=1; }
