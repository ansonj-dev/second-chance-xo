import { deriveHdPrivateNodeFromBip39Mnemonic,deriveHdPath,encodeHdPrivateKey,hdPrivateKeyToP2pkhCashAddress } from '@bitauth/libauth';
/** Public address only. This does not create an XO key or imply XO tracks the BIP44 address. */
export function bip44ChipnetAddress(mnemonic: string): string {
  const root=deriveHdPrivateNodeFromBip39Mnemonic(mnemonic);
  if(typeof root==='string') throw new Error('Could not derive wallet root');
  const account=deriveHdPath(root,"m/44'/145'/0'");
  if(typeof account==='string') throw new Error('Could not derive account');
  const encoded=encodeHdPrivateKey({node:account,network:'testnet'});
  if(typeof encoded==='string') throw new Error('Could not encode account');
  const result=hdPrivateKeyToP2pkhCashAddress({hdPrivateKey:encoded.hdPrivateKey,prefix:'bchtest',privateDerivationPath:'0',addressIndex:0,tokenSupport:false});
  if(typeof result==='string') throw new Error('Could not derive address');
  return result.address;
}
