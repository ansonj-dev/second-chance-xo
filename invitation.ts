import { Engine } from '@xo-cash/engine';
import { chipnetEngineOptions } from './engine-options.js';
import { mkdir, writeFile } from 'node:fs/promises';
import { serializeInvitation } from '@xo-cash/utils';
import { giftTemplate } from './template.js';
import { readChipnetMnemonic } from './wallet.js';

const mnemonic = await readChipnetMnemonic();
const engine = await Engine.create(mnemonic, chipnetEngineOptions('second-chance'));
try {
  const { templateIdentifier } = await engine.importTemplate(giftTemplate);
  const { invitation } = await engine.createInvitation({ templateIdentifier, actionIdentifier: 'fund' });
  await mkdir('dist', { recursive: true });
  // Use upstream's Extended JSON serialization to retain byte and bigint types on import.
  const path = `dist/fund-${invitation.invitationIdentifier}.invitation.json`;
  await writeFile(path, serializeInvitation(invitation), { flag: 'wx' });
  console.log(`Created signed, UNEXECUTED invitation: ${path}`);
  console.log('Import alongside the exported template in https://blaze.xo.cash/. No funds moved. Never share the .private folder.');
} finally { await engine.stop(); }




