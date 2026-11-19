import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { State,createStorageAdapter,StorageType } from '@xo-cash/state';
import { Crypto,computeAccountHash,convertMnemonicToSeedBytes } from '@xo-cash/crypto';
import { p2pkhTemplate } from '@xo-cash/templates';
import { generateTemplateIdentifier,parseTemplate } from '@xo-cash/utils';
import { binToHex,hash160,hexToBin,lockingBytecodeToCashAddress } from '@bitauth/libauth';
import { readChipnetMnemonic } from './wallet.js';

let state:State|undefined,crypto:Crypto|undefined;
try {
  const mnemonic=await readChipnetMnemonic(),accountHash=computeAccountHash(mnemonic),databaseFilename='second-chance-chipnet';
  await access(resolve('.private',`${databaseFilename}-${accountHash}.sqlite`));
  state=new State(await createStorageAdapter({storageType:StorageType.INDEXEDDB,databasePath:'.private',databaseFilename,accountHash}));
  crypto=new Crypto(convertMnemonicToSeedBytes(mnemonic),{network:'testnet'});
  const templateIdentifier=generateTemplateIdentifier(parseTemplate(p2pkhTemplate)),records=await state.listScriptHashData({templateIdentifier}),secrets=await state.listSecretData();
  const addresses=records.filter(record=>/^76a914[0-9a-f]{40}88ac$/.test(record.lockingBytecode)).map(record=>{
    const encoded=lockingBytecodeToCashAddress({bytecode:hexToBin(record.lockingBytecode),prefix:'bchtest'});
    if(typeof encoded==='string')throw new Error('Address encoding failed');
    const associated=secrets.filter(secret=>record.secrets?.includes(secret.secretLookupKey)&&secret.isPrivate&&secret.isEntropy&&secret.templateIdentifier===templateIdentifier&&/^[0-9]+$/.test(secret.value));
    const signingKeyReferenceVerified=associated.some(secret=>{
      const pub=crypto!.derivePublicKey({templateIdentifier,derivationIndex:Number(secret.value)});
      return `76a914${binToHex(hash160(pub))}88ac`===record.lockingBytecode;
    });
    return {address:encoded.address,lockingBytecode:record.lockingBytecode,templateIdentifier,signingKeyReferenceVerified};
  });
  console.log(JSON.stringify({network:'chipnet',status:'LOCAL STATE VERIFICATION ONLY — no network, signing or broadcast',addresses,notice:'Public addresses verified against their retained local key references and the selected seed. This does not prove the browser has imported these records or that the addresses have funds. Keep the seed and local database private.'},null,2));
} catch(error){console.error(`Could not verify an existing local XO address database (${error instanceof Error?error.name:'error'}). No seed or stored-secret value was printed.`);process.exitCode=1;}
finally{crypto?.destroy();if(state)await state.close();}

