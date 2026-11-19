import assert from 'node:assert/strict';
import test from 'node:test';
import { chipnetEngineOptions } from '../engine-options.js';
import { bip44ChipnetAddress } from '../wallet-public.js';
test('pins the engine network as well as Chipnet servers',()=>{const options=chipnetEngineOptions('test');assert.equal(options.network,'chipnet');assert.ok(options.electrumServers?.length);assert.deepEqual(options.remoteEncryptedStateServers,[]);assert.ok(options.electrumServers?.every(s=>s.host.includes('chipnet')))});
test('derives an ordinary BIP44 test address from a public test-vector phrase',()=>assert.match(bip44ChipnetAddress('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'),/^bchtest:q/));
