import { setTimeout } from 'node:timers/promises';
import type { Engine } from '@xo-cash/engine';
/** Avoid immediately stopping the SDK while it is still starting network monitors. */
export async function waitForChipnetConnection(engine: Engine): Promise<void> {
  const deadline=Date.now()+15000;
  while(Date.now()<deadline){if(engine.listElectrumConnections().some(c=>c.status==='connected'&&typeof c.chainHeight==='number'&&c.chainHeight>0))return;await setTimeout(100)}
  throw new Error('No ready Chipnet connection within 15 seconds');
}
