import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { decodeBip39Mnemonic, encodeBip39Mnemonic } from '@bitauth/libauth';

const walletPath = resolve('.private/chipnet-wallet.json');
export function selectedWalletPath(): string {
  const index=process.argv.indexOf('--wallet-file');
  if(index===-1) return walletPath;
  const value=process.argv[index+1];
  if(!value || value.startsWith('--')) throw new Error('Provide the path after --wallet-file');
  return resolve(value);
}
export async function initializeWallet(): Promise<void> {
  if(process.argv.includes('--wallet-file')) throw new Error('wallet:init always creates a separate local file; --wallet-file is only for reading an existing Chipnet wallet.');
  if (!process.argv.includes('--chipnet-only')) throw new Error('Pass --chipnet-only to acknowledge this is a disposable Chipnet wallet.');
  const encoded = encodeBip39Mnemonic(randomBytes(32));
  if (typeof encoded === 'string') throw new Error('Mnemonic generation failed.');
  await mkdir(resolve('.private'), { recursive: true, mode: 0o700 });
  // Exclusive creation prevents replacing a wallet that might already have test funds.
  await writeFile(walletPath, JSON.stringify({ version: 1, network: 'chipnet', purpose: 'BCH BLAZE development only', createdAt: new Date().toISOString(), mnemonic: encoded.phrase }, null, 2), { flag: 'wx', mode: 0o600 });
  console.log('Created a new disposable Chipnet wallet in .private/chipnet-wallet.json.');
  console.log('The recovery phrase is in that private file; it was not printed. Protect this folder with your Windows account permissions.');
}
export async function readChipnetMnemonic(): Promise<string> {
  if (!process.argv.includes('--chipnet-only')) throw new Error('Pass --chipnet-only. Only Chipnet servers are supported by this CLI.');
  if (process.env.XO_MNEMONIC) throw new Error('Unset XO_MNEMONIC. This CLI uses only its separately initialized Chipnet wallet file.');
  const record: unknown = JSON.parse(await readFile(selectedWalletPath(), 'utf8'));
  if (!record || typeof record !== 'object' || !('version' in record) || record.version !== 1 || !('network' in record) || record.network !== 'chipnet' || !('mnemonic' in record) || typeof record.mnemonic !== 'string') throw new Error('Invalid local Chipnet wallet metadata.');
  const entropy = decodeBip39Mnemonic(record.mnemonic);
  if (typeof entropy === 'string') throw new Error('Invalid local wallet recovery phrase.');
  return record.mnemonic;
}

