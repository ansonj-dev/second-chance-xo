import tls from 'node:tls';
import { chipnetServersWithBlockchain } from '@electrum-cash/servers';
import { binToHex,cashAddressToLockingBytecode,sha256 } from '@bitauth/libauth';
export function chipnetRpc(host: string, requests: {method:string;params:unknown[]}[]): Promise<unknown[]> {
  const server=chipnetServersWithBlockchain.find(s=>s.host===host);
  if(!server?.transports.tcp_tls) throw new Error('Only packaged Chipnet TLS servers are allowed');
  return new Promise((resolve,reject)=>{
    let buffer='',done=false; const results:unknown[]=[], received=new Set<number>();
    const socket=tls.connect({host,port:server.transports.tcp_tls,servername:host,rejectUnauthorized:true});
    const finish=(error?:Error)=>{if(done)return;done=true;socket.destroy();error?reject(error):resolve(results)};
    socket.setTimeout(15000,()=>finish(new Error('Chipnet RPC timeout')));
    socket.on('error',()=>finish(new Error(`Could not query ${host}`)));
    socket.on('secureConnect',()=>{for(const [id,request] of requests.entries())socket.write(JSON.stringify({jsonrpc:'2.0',id,...request})+'\n')});
    socket.on('data',(chunk)=>{buffer+=chunk.toString();if(buffer.length>2_000_000){finish(new Error('Oversized response'));return}let end;while((end=buffer.indexOf('\n'))!==-1){const line=buffer.slice(0,end);buffer=buffer.slice(end+1);try{const message=JSON.parse(line);if(!Number.isInteger(message.id)||message.id<0||message.id>=requests.length)continue;if(message.error){finish(new Error(`Chipnet RPC rejected ${requests[message.id].method}`));return}results[message.id]=message.result;received.add(message.id);if(received.size===requests.length){finish();return}}catch{finish(new Error('Invalid RPC response'));return}}});
    socket.on('close',()=>{if(!done)finish(new Error('Chipnet server closed early'))});
  });
}
export function addressScriptHash(address:string): string {
  const decoded=cashAddressToLockingBytecode(address);
  if(typeof decoded==='string'||decoded.prefix!=='bchtest')throw new Error('Expected a testnet-format CashAddress');
  return binToHex(sha256.hash(decoded.bytecode).reverse());
}
export async function inspectChipnetAddress(address:string) {
  const scriptHash=addressScriptHash(address);
  const snapshots=await Promise.all(chipnetServersWithBlockchain.map(async({host})=>{try{const [chain,utxos,balance]=await chipnetRpc(host,[{method:'blockchain.headers.subscribe',params:[]},{method:'blockchain.scripthash.listunspent',params:[scriptHash]},{method:'blockchain.scripthash.get_balance',params:[scriptHash]}]);return {host,chain,utxos,balance}}catch(error){return {host,error:error instanceof Error?error.message:'RPC failed'}}}));
  return {network:'chipnet',checkedAt:new Date().toISOString(),address,scriptHash,snapshots,notice:'Read-only observations from packaged Chipnet TLS servers. No key, transaction signing, broadcast, or automatic confirmation claim. Positive UTXO height indicates a server-reported mined output; height <= 0 is unconfirmed.'};
}
