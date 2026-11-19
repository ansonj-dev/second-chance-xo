import { Engine } from '@xo-cash/engine';
import { p2pkhTemplate } from '@xo-cash/templates';
import { hexToBin,lockingBytecodeToCashAddress } from '@bitauth/libauth';
import { mkdir,writeFile } from 'node:fs/promises';
import { chipnetEngineOptions } from './engine-options.js';
import { readChipnetMnemonic,selectedWalletPath } from './wallet.js';
import { waitForChipnetConnection } from './engine-ready.js';

process.on('unhandledRejection',()=>{console.error('The XO SDK background monitor failed during shutdown. Verify any saved receive address with wallet:xo-addresses before using it. No transaction was sent.');process.exitCode=1;});
let engine: Engine|undefined;
try {
  if(!process.argv.includes('--new-address'))throw new Error('Use --new-address for generation; wallet:xo-addresses inspects existing addresses.');
  const mnemonic=await readChipnetMnemonic();
  engine=await Engine.create(mnemonic,chipnetEngineOptions('second-chance'));
  if(engine.network!=='chipnet') throw new Error('Engine did not select Chipnet');
  await waitForChipnetConnection(engine);
  const {templateIdentifier}=await engine.importTemplate(p2pkhTemplate);
  await engine.setDefaultPolicies({address:{templateIdentifier},receive:{templateIdentifier},change:{templateIdentifier}});
  const lockingBytecode=await engine.generateLockingBytecodeFromDefaultPolicy('address');
  const encoded=lockingBytecodeToCashAddress({bytecode:hexToBin(lockingBytecode),prefix:'bchtest'});
  if(typeof encoded==='string') throw new Error('Could not encode receive address');
  const report={network:'chipnet',walletFile:selectedWalletPath(),createdAt:new Date().toISOString(),source:'XO engine default P2PKH address policy',templateIdentifier,address:encoded.address,lockingBytecode,notice:'A public SDK receive address. The corresponding private key/state remains in this local XO account database. No funds moved. This does not import prior BIP44 faucet funds.'};
  await mkdir('dist',{recursive:true});
  const path=`dist/xo-receive-${Date.now()}.json`;
  await writeFile(path,JSON.stringify(report,null,2),{flag:'wx'});
  console.log(JSON.stringify({...report,publicReportFile:path},null,2));
} catch(error) {console.error(`Could not prepare the XO receive address (${error instanceof Error?error.name:'error'}). No mnemonic was printed or transaction broadcast.`);process.exitCode=1;}
finally {if(engine)try{await engine.stop()}catch{console.error('The XO SDK could not close cleanly. No transaction was sent; verify saved state offline.');process.exitCode=1;}}


