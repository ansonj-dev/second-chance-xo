import assert from 'node:assert/strict';
import test from 'node:test';
import { bigIntToVmNumber, createCompilerBch, createVirtualMachineBCH, generateTransaction, secp256k1 } from '@bitauth/libauth';
import { giftTemplate } from '../template.js';
const key = (last: number) => Uint8Array.from([...new Uint8Array(31),last]);
function publicKeyFor(n: number): Uint8Array { const p=secp256k1.derivePublicKeyCompressed(key(n)); if(typeof p==='string') throw new Error(p); return p; }
const compiler = createCompilerBch({scripts: giftTemplate.scripts,variables:{senderPublicKey:{type:'WalletData'},recipientPublicKey:{type:'WalletData'},delayBlocks:{type:'WalletData'},senderKey:{type:'Key'},recipientKey:{type:'Key'}},lockingScriptTypes:{giftRedeem:'p2sh32'},unlockingScripts:{claimUnlock:'giftRedeem',recoverUnlock:'giftRedeem'}});
const vm = createVirtualMachineBCH(false);
function spend({ branch = 'claimUnlock', sequence = 0, version = 2, signingKey = branch === 'claimUnlock' ? key(2) : key(1) }: {branch?:string;sequence?:number;version?:number;signingKey?:Uint8Array} = {}) {
  const data = {bytecode:{senderPublicKey:publicKeyFor(1),recipientPublicKey:publicKeyFor(2),delayBlocks:bigIntToVmNumber(144n)},keys:{privateKeys:{senderKey:signingKey,recipientKey:signingKey}}};
  const locking = compiler.generateBytecode({scriptId:'giftRedeem',data});
  assert.equal(locking.success,true,JSON.stringify(locking));
  if (!locking.success) throw new Error('Compile failed');
  const attempt = generateTransaction({version,locktime:0,inputs:[{outpointIndex:0,outpointTransactionHash:new Uint8Array(32).fill(3),sequenceNumber:sequence,unlockingBytecode:{compiler,script:branch,data,valueSatoshis:10000n}}],outputs:[{lockingBytecode:Uint8Array.of(0x51),valueSatoshis:9000n}]});
  assert.equal(attempt.success,true,JSON.stringify(attempt,(_k,v)=>typeof v==='bigint'?v.toString():v));
  if (!attempt.success) throw new Error('Transaction generation failed');
  return vm.verify({transaction:attempt.transaction,sourceOutputs:[{lockingBytecode:locking.bytecode,valueSatoshis:10000n}]});
}
test('recipient can claim without waiting',()=>assert.equal(spend(),true));
test('wrong recipient key cannot spend',()=>assert.notEqual(spend({signingKey:key(7)}),true));
test('sender recovery rejects a below-delay sequence',()=>assert.notEqual(spend({branch:'recoverUnlock',sequence:143}),true));
test('sender recovery accepts exact relative sequence policy',()=>assert.equal(spend({branch:'recoverUnlock',sequence:144}),true));
test('sender recovery rejects disabled BIP68 sequence',()=>assert.notEqual(spend({branch:'recoverUnlock',sequence:0x80000090}),true));
test('sender recovery rejects version one',()=>assert.notEqual(spend({branch:'recoverUnlock',sequence:144,version:1}),true));
test('wrong recovery key cannot spend',()=>assert.notEqual(spend({branch:'recoverUnlock',sequence:144,signingKey:key(7)}),true));

