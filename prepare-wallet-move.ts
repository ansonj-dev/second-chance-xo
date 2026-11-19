import { readChipnetMnemonic } from './wallet.js';
import { bip44ChipnetAddress } from './wallet-public.js';
import { inspectChipnetAddress,chipnetRpc } from './chipnet-rpc.js';
import { binToHex,cashAddressToLockingBytecode,decodeTransaction,encodeTransaction,hexToBin } from '@bitauth/libauth';
import { mkdir,writeFile } from 'node:fs/promises';
const flag=(name:string)=>{const index=process.argv.indexOf(name);return index<0?undefined:process.argv[index+1]};
try {
  const destination=flag('--to'),feeString=flag('--fee-sats')??'500';
  if(!destination||!/^[1-9][0-9]{0,3}$/.test(feeString))throw new Error('Use --to bchtest:... and --fee-sats 1..2000');
  const fee=BigInt(feeString);if(fee>2000n)throw new Error('Fee exceeds the 2000 sat local cap');
  const target=cashAddressToLockingBytecode(destination);
  if(typeof target==='string'||target.prefix!=='bchtest')throw new Error('Only testnet-format destination addresses are allowed');
  const source=bip44ChipnetAddress(await readChipnetMnemonic());
  if(source===destination)throw new Error('Source and destination match');
  const sourceScript=cashAddressToLockingBytecode(source);if(typeof sourceScript==='string')throw new Error('Invalid source');
  const snapshot=await inspectChipnetAddress(source);
  const records=snapshot.snapshots.map(record=>{
    if(!('utxos' in record)||!Array.isArray(record.utxos))throw new Error('Both packaged Chipnet servers must answer');
    return record.utxos as {height:number;tx_hash:string;tx_pos:number;value:number}[];
  });
  const canonical=(items:typeof records[number])=>JSON.stringify([...items].sort((a,b)=>`${a.tx_hash}:${a.tx_pos}`.localeCompare(`${b.tx_hash}:${b.tx_pos}`)));
  if(records.length!==2||canonical(records[0])!==canonical(records[1]))throw new Error('Chipnet servers disagree on current UTXOs');
  const chosen=records[0].filter(utxo=>utxo.height>0);
  if(!chosen.length||chosen.length>20)throw new Error('Expected 1..20 confirmed UTXOs');
  let total=0n;
  for(const utxo of chosen){
    if(!/^[0-9a-f]{64}$/.test(utxo.tx_hash)||!Number.isSafeInteger(utxo.value)||utxo.value<1||!Number.isInteger(utxo.tx_pos)||utxo.tx_pos<0)throw new Error('Invalid UTXO metadata');
    const [raw]=await chipnetRpc('chipnet.bch.ninja',[{method:'blockchain.transaction.get',params:[utxo.tx_hash,false]}]);
    if(typeof raw!=='string')throw new Error('Expected raw parent transaction');const decoded=decodeTransaction(hexToBin(raw));if(typeof decoded==='string')throw new Error('Cannot decode parent');
    const output=decoded.outputs[utxo.tx_pos];
    if(!output||output.token||output.valueSatoshis!==BigInt(utxo.value)||binToHex(output.lockingBytecode)!==binToHex(sourceScript.bytecode))throw new Error('Parent output does not match the confirmed BCH-only source');
    total+=output.valueSatoshis;
  }
  const payout=total-fee;if(payout<1000n)throw new Error('Payout would be dust or uneconomical');
  const transaction={version:2,locktime:0,inputs:chosen.map(utxo=>({outpointTransactionHash:hexToBin(utxo.tx_hash),outpointIndex:utxo.tx_pos,sequenceNumber:0xffffffff,unlockingBytecode:new Uint8Array()})),outputs:[{lockingBytecode:target.bytecode,valueSatoshis:payout}]};
  const report={status:'UNSIGNED PROPOSAL — no signing or broadcast',network:'chipnet',checkedAt:snapshot.checkedAt,sourceAddress:source,sourceDerivationPath:"m/44'/145'/0'/0/0",inputs:chosen.map(({tx_hash,tx_pos,value,height})=>({transactionId:tx_hash,outputIndex:tx_pos,satoshis:String(value),height})),outputs:[{address:destination,satoshis:payout.toString(),lockingBytecode:binToHex(target.bytecode)}],inputTotalSatoshis:total.toString(),feeSatoshis:fee.toString(),rawUnsignedTransaction:binToHex(encodeTransaction(transaction)),limitations:'Destination address ownership and browser XO state are not established by this plan. Verify destination in the actual signing/debug account first. Transaction is deliberately unsigned and cannot spend funds as exported. Testnet address prefix alone does not distinguish Chipnet from other test networks; only the packaged Chipnet TLS endpoints are queried.'};
  await mkdir('dist',{recursive:true});const path=`dist/unsigned-wallet-move-${Date.now()}.json`;await writeFile(path,JSON.stringify(report,null,2),{flag:'wx'});console.log(JSON.stringify({...report,publicReportFile:path},null,2));
} catch(error){console.error(error instanceof Error?error.message:'Could not prepare the unsigned proposal');process.exitCode=1}
