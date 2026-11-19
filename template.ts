import type { XOTemplate } from '@xo-cash/types';

/** A gift can be claimed by its recipient, or recovered by its sender after a relative delay. */
export const giftTemplate: XOTemplate = {
  $schema: 'https://libauth.org/schemas/wallet-template-v0.schema.json',
  name: 'Second Chance — recoverable gifts', version: '1',
  description: 'A recipient-signed gift with sender recovery after a block delay. The claim remains available after recovery matures; first confirmed spend wins.',
  supported: ['BCH_2025_05', 'BCH_2026_05'],
  roles: {
    sender: { name: 'Sender', description: 'Funds the gift and retains the recovery key.' },
    recipient: { name: 'Recipient', description: 'Claims with an independent key.' },
  },
  start: [{ action: 'fund', role: 'sender', generate: ['senderKey'] }],
  actions: {
    fund: {
      name: 'Make a gift', description: 'Agree on both public keys, delay and amount before funding.',
      roles: {
        sender: { generate: ['senderKey'], requirements: { variables: ['senderPublicKey', 'delayBlocks', 'giftSatoshis'] } },
        recipient: { generate: ['recipientKey'], requirements: { variables: ['recipientPublicKey'] } },
      },
      requirements: { participants: [{ role: 'sender', slots: { min: 1, max: 1 } }, { role: 'recipient', slots: { min: 1, max: 1 } }] },
      transaction: 'fundTransaction',
    },
    claim: { name: 'Claim gift', description: 'Recipient signs a spend of the gift.', roles: { recipient: { requirements: { secrets: ['recipientKey'] } } }, requirements: { variables: ['payoutScript', 'payoutSatoshis'], participants: [{ role: 'recipient', slots: { min: 1, max: 1 } }] }, transaction: 'claimTransaction' },
    recover: { name: 'Recover gift', description: 'Sender signs after the relative block delay. Recipient can still claim until recovery confirms.', roles: { sender: { requirements: { secrets: ['senderKey'] } } }, requirements: { variables: ['payoutScript', 'payoutSatoshis'], participants: [{ role: 'sender', slots: { min: 1, max: 1 } }] }, transaction: 'recoverTransaction' },
  },
  transactions: {
    fundTransaction: { name: 'Gift funded', description: 'The gift is ready to claim.', inputs: [], outputs: [{ output: 'gift', outputIndex: undefined }], version: 2, locktime: 0, composable: true },
    claimTransaction: { name: 'Gift claimed', description: 'Recipient accepted the gift.', inputs: [{ input: 'claimInput', inputIndex: undefined }], outputs: [{ output: 'payout', outputIndex: undefined }], version: 2, locktime: 0 },
    recoverTransaction: { name: 'Gift recovered', description: 'Sender recovered the unspent gift.', inputs: [{ input: 'recoverInput', inputIndex: undefined }], outputs: [{ output: 'payout', outputIndex: undefined }], version: 2, locktime: 0 },
  },
  inputs: {
    claimInput: { name: 'Gift', description: 'Gift spent by its recipient.', unlockingScript: 'claimUnlock', token: null },
    recoverInput: { name: 'Gift', description: 'Gift spent by its sender.', unlockingScript: 'recoverUnlock', sequenceNumber: '$(<delayBlocks>)', token: null },
  },
  outputs: {
    gift: { name: 'Recoverable gift', description: 'Recipient can claim; sender can recover after the delay.', lockingScript: 'giftLock', valueSatoshis: '$(<giftSatoshis>)', token: null, selectable: false },
    payout: { name: 'Payout', description: 'Destination chosen and signed by the authorized key.', lockingScript: '$(<payoutScript>)', valueSatoshis: '$(<payoutSatoshis>)', token: null },
  },
  lockingScripts: {
    giftLock: {
      name: 'Gift contract', description: 'Two independent spending branches.', lockingType: 'p2sh', lockingBytecode: 'giftRedeem', selectable: false,
      state: { variables: ['senderPublicKey', 'recipientPublicKey', 'delayBlocks'] },
      roles: {
        sender: { state: { secrets: ['senderKey'] }, actions: [{ action: 'recover', role: 'sender', secrets: [{ senderKey: null }] }] },
        recipient: { state: { secrets: ['recipientKey'] }, actions: [{ action: 'claim', role: 'recipient', secrets: [{ recipientKey: null }] }] },
      },
    },
  },
  scripts: {
    giftRedeem: 'OP_IF <recipientPublicKey> OP_CHECKSIG OP_ELSE <delayBlocks> OP_CHECKSEQUENCEVERIFY OP_DROP <senderPublicKey> OP_CHECKSIG OP_ENDIF',
    claimUnlock: '<recipientKey.schnorr_signature.all_outputs> OP_1',
    recoverUnlock: '<senderKey.schnorr_signature.all_outputs> OP_0',
  },
  variables: {
    senderKey: { name: 'Recovery key', description: 'Kept private by sender.', type: 'private_key' },
    recipientKey: { name: 'Claim key', description: 'Kept private by recipient.', type: 'private_key' },
    senderPublicKey: { name: 'Recovery public key', description: 'Must match senderKey.public_key.', type: 'public_key' },
    recipientPublicKey: { name: 'Claim public key', description: 'Must match recipientKey.public_key.', type: 'public_key' },
    delayBlocks: { name: 'Recovery delay', description: 'Integer block count from 1 to 65535, without time or disable flags.', type: 'integer' },
    giftSatoshis: { name: 'Gift amount', description: 'Amount locked in the gift, in satoshis.', type: 'satoshis' },
    payoutScript: { name: 'Destination', description: 'Recipient locking script.', type: 'locking_script' },
    payoutSatoshis: { name: 'Payout amount', description: 'Gift value less a reviewed miner fee.', type: 'satoshis' },
  },
};
