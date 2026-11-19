import { readChipnetMnemonic } from './wallet.js';
import { bip44ChipnetAddress } from './wallet-public.js';
import { inspectChipnetAddress } from './chipnet-rpc.js';
try { const mnemonic=await readChipnetMnemonic();console.log(JSON.stringify(await inspectChipnetAddress(bip44ChipnetAddress(mnemonic)),null,2)); }
catch {console.error('Could not inspect selected Chipnet wallet. No seed was printed and no transaction was sent.');process.exitCode=1;}
