import { mkdir,writeFile } from 'node:fs/promises';
import { parseTemplate,serializeTemplate } from '@xo-cash/utils';
import { giftTemplate } from './template.js';
const template=parseTemplate(giftTemplate);
await mkdir('dist',{recursive:true});
await writeFile('dist/second-chance.xo.json',serializeTemplate(template));
console.log('Schema-validated dist/second-chance.xo.json exported. No transaction was broadcast.');
