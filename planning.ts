import { bigIntToVmNumber, binToHex, createCompilerBch, hexToBin, lockingBytecodeToCashAddress, secp256k1 } from '@bitauth/libauth';
import { giftTemplate } from './template.js';
export type GiftParameters = { senderPublicKey: string; recipientPublicKey: string; delayBlocks: number; giftSatoshis: string };
export function validateGiftParameters(value: unknown): GiftParameters {
  if(!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected a parameter object');
  const p=value as Record<string,unknown>;
  const names=['senderPublicKey','recipientPublicKey','delayBlocks','giftSatoshis'];
  if(Object.keys(p).some(k=>!names.includes(k))||names.some(k=>!(k in p))) throw new Error('Expected exactly senderPublicKey, recipientPublicKey, delayBlocks, giftSatoshis. Do not include private keys.');
  for(const field of ['senderPublicKey','recipientPublicKey']) if(typeof p[field]!=='string'||!/^(02|03)[0-9a-f]{64}$/i.test(p[field] as string)||!secp256k1.validatePublicKey(hexToBin(p[field] as string))) throw new Error(`Invalid compressed ${field}`);
  if((p.senderPublicKey as string).toLowerCase()===(p.recipientPublicKey as string).toLowerCase()) throw new Error('Sender and recipient must use independent keys');
  if(!Number.isInteger(p.delayBlocks)||Number(p.delayBlocks)<1||Number(p.delayBlocks)>65535) throw new Error('delayBlocks must be an integer from 1 through 65535, without BIP68 flags');
  if(typeof p.giftSatoshis!=='string'||!/^[1-9][0-9]{0,15}$/.test(p.giftSatoshis)||BigInt(p.giftSatoshis)<1000n||BigInt(p.giftSatoshis)>2100000000000000n) throw new Error('giftSatoshis must be an integer decimal string from 1000 through 2100000000000000');
  return {senderPublicKey:(p.senderPublicKey as string).toLowerCase(),recipientPublicKey:(p.recipientPublicKey as string).toLowerCase(),delayBlocks:p.delayBlocks as number,giftSatoshis:p.giftSatoshis};
}
export function planGift(value: unknown) {
  const parameters=validateGiftParameters(value);
  const compiler=createCompilerBch({scripts:giftTemplate.scripts,variables:{senderPublicKey:{type:'WalletData'},recipientPublicKey:{type:'WalletData'},delayBlocks:{type:'WalletData'}},lockingScriptTypes:{giftRedeem:'p2sh32'}});
  const locking=compiler.generateBytecode({scriptId:'giftRedeem',data:{bytecode:{senderPublicKey:hexToBin(parameters.senderPublicKey),recipientPublicKey:hexToBin(parameters.recipientPublicKey),delayBlocks:bigIntToVmNumber(BigInt(parameters.delayBlocks))}}});
  if(!locking.success) throw new Error('Template locking script failed to compile');
  const address=lockingBytecodeToCashAddress({bytecode:locking.bytecode,prefix:'bchtest'});
  if(typeof address==='string') throw new Error('Address encoding failed');
  return {status:'LOCAL PLAN ONLY — no invitation, funds, chain checks or execution',parameters,lockingBytecode:binToHex(locking.bytecode),chipnetAddress:address.address,warning:'Compare this bytecode with the actual XO funding output. Verify both role public keys match participant-held private keys before any funding. Testnet addresses are not specific to Chipnet.'};
}
