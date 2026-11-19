import { readFile } from 'node:fs/promises';
import { deserializeInvitation } from '@xo-cash/utils';
import { expectedTemplateIdentifier } from './template-identity.js';
import { giftTemplate } from './template.js';
const path = process.argv[2];
if (!path) throw new Error('Usage: npm run inspect -- path/to/invitation.json');
try {
  const bytes = await readFile(path);
  if (bytes.length > 2_000_000) throw new Error('File too large.');
  const invitation = deserializeInvitation(bytes.toString('utf8'));
  if (invitation.templateIdentifier !== expectedTemplateIdentifier) throw new Error('Template does not match this project.');
  if (!(invitation.actionIdentifier in giftTemplate.actions)) throw new Error('Unknown action.');
  console.log(JSON.stringify({ invitationIdentifier: invitation.invitationIdentifier, templateIdentifier: invitation.templateIdentifier, action: invitation.actionIdentifier, commitCount: invitation.commits.length, status: 'Schema parsed; template ID matched. Cryptographic signatures, chain execution, network and transaction safety are NOT verified by this inspection.' }, null, 2));
} catch { console.error('Inspection failed: malformed, oversized, unreadable, or wrong-template invitation. No wallet was opened.'); process.exitCode = 1; }


