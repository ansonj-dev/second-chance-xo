import { chipnetServersWithBlockchain } from '@electrum-cash/servers';
import type { XOEngineOptions } from '@xo-cash/engine';
/** Server choice alone does not select the SDK key/storage network. Keep both explicit. */
export function chipnetEngineOptions(databaseFilename: string): XOEngineOptions {
  return { network: 'chipnet',databasePath:'.private',databaseFilename,electrumServers:chipnetServersWithBlockchain,remoteEncryptedStateServers:[] };
}
