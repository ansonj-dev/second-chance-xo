import { readChipnetMnemonic } from './wallet.js';
import { bip44ChipnetAddress } from './wallet-public.js';
try {
  const mnemonic=await readChipnetMnemonic();
  console.log(JSON.stringify({network:'chipnet',bip44Path:"m/44'/145'/0'/0/0",bip44FaucetAddress:bip44ChipnetAddress(mnemonic),xoPurposePath:"m/42415' (testnet purpose, with further template/account derivation)",warning:'Same mnemonic does not mean same receive address. The XO database does not automatically discover ordinary BIP44 funds. No seed, private key or extended private key is exported. No network request or transaction occurred.'},null,2));
} catch { console.error('Could not read/validate the selected local Chipnet wallet. Supply --chipnet-only and an optional --wallet-file path. No seed was printed.');process.exitCode=1; }
