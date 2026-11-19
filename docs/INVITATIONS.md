# Working with invitations

The CLI creates a signed coordination invitation. It does not take the sender or recipient role, generate a gift signing key, select coins, sign a transaction, or broadcast. Assign participant roles in the XO debug tool using accounts that retain their own secrets. Importing a public invitation does not import private keys or transfer wallet ownership.

## First local setup for a new coordinator only

Existing A/B wallets are already available: skip wallet:init and follow EXISTING-WALLET.md. The commands below are only for a separate new coordinator wallet, never for replacing the existing files. From this project folder, with Node 24 or later:

```powershell
npm install
npm run check
npm run export
npm run wallet:init -- --chipnet-only
npm run invitation -- --chipnet-only
```

The wallet initializer uses 256 bits from Node's cryptographic RNG and BIP39, writes a disposable Chipnet seed to `.private/chipnet-wallet.json`, and refuses to replace an existing file. It never prints the recovery phrase. File mode 0600 is requested; on Windows, also rely on your user-profile ACLs and keep `.private` out of sync/shared folders. The CLI rejects `XO_MNEMONIC` so an existing mainnet mnemonic cannot be accidentally selected from an environment variable. A mnemonic itself has no network: the Chipnet restriction comes from this tool's server configuration and workflow. Do not reuse this seed with mainnet funds.

Keep the complete `.private` folder private. The engine database can contain participant/account secrets as well as the seed file. Deleting or replacing this folder may lose access to test funds or keys introduced later through the same account. Use a separate project copy to start another coordinator wallet.

`dist/fund-<invitation-id>.invitation.json` contains ONLY the upstream shared `invitation` object, serialized with XO Extended JSON. It deliberately excludes the `StoredInvitation` wrapper and private account fields. Exclusive writes avoid silently overwriting an export. The output message says UNEXECUTED; a signed invitation is not a transaction receipt.

## Offline inspection and import

```powershell
npm run inspect -- dist/fund-REPLACE_WITH_ID.invitation.json
```

Inspection parses the upstream schema, checks the template identifier against this project and displays only IDs, action and commit count. It does not open a wallet or contact the network. Schema success does not verify signatures, chain/network, balances, or output safety. An invitation can disclose participant metadata, public keys, transaction inputs and output amounts even without private keys. Share deliberately.

1. Open https://blaze.xo.cash/ and import `dist/second-chance.xo.json` using the tool's template-import interface. Labels may change with upstream releases.
2. Import the matching invitation. Select Chipnet and confirm the identifier reported by the inspector. If the tool rejects the schema, keep both files and record the exact version/error before changing encodings.
3. Participants join `sender` and `recipient` in separate accounts and complete the missing requirements shown by XO. Each generates their own role key and supplies the matching compressed public key. Confirm the public keys and recovery delay out of band before providing funds.
4. Review the actual transaction, including every output, fee, delay and script. Fund only with disposable Chipnet BCH. Execute through the participant wallet/tool when ready.
5. Keep the exact executed invitation returned by XO. An earlier exported invitation may not contain the final commits. Record the Chipnet transaction ID separately and independently look it up. Then inspect the role-specific follow-up action on the resulting output.

The CLI does not presently complete role requirements, import/accept updated commits into the local coordinator account, or execute actions. Its `inspect` command is a read-only schema inspection, not a wallet import command. Use the debug tool's coordination flow for those steps. Do not edit commit JSON manually: commitments and signatures cover that data.

## Recovery timing

`delayBlocks` is a BIP68 relative block count, restricted to 1–65535 with no time/disable flags. A recovery uses transaction version 2 and the corresponding input sequence. The delay is measured from the gift output's chain age, not the invitation creation timestamp. A normal expected interval of about ten minutes per block gives only an estimate. Chipnet scheduling, confirmation conventions and reorgs require checking the actual spend's validity near the boundary.

Both the recipient branch and a matured sender branch can be valid simultaneously. Recovery never revokes an already confirmed claim, and maturity never disables the recipient branch. The first confirmed spend consumes the gift UTXO. A claimant must use the correct branch signature and a payout/fee appropriate to that input's value.

## Evidence still needed

Disposable A/B wallet files and their local SDK address state now exist. A qualifying template invitation/funding/follow-up lifecycle remains unexecuted. Twenty focused offline tests, TypeScript compilation and template export/schema parsing now pass, with the limits stated in JUDGING-AUDIT.md. Capture a funded and executed Chipnet lifecycle, current debug-tool import behavior, follow-up invitation and personal XO feedback before submission.

## Public-parameter preflight

`npm run plan -- your-public-parameters.json` accepts exactly the fields shown in public-parameters.EXAMPLE.json. Replace the sample public keys: their private keys were discarded and nobody should fund the sample address. This command validates compressed curve points, independent recipient/sender identities, integer satoshi strings and BIP68-safe delays, then compiles the template's actual locking bytecode and returns a testnet-format address. It never generates keys or queries chain state. Compare its bytecode with the reviewed XO funding output; a successful plan cannot prove that a participant controls the matching private key.


## Existing wallet path

An existing disposable wallet is already available; do not run wallet:init for it again. Read EXISTING-WALLET.md for public address inspection, correct browser account import, network selection, derivation differences, the unsigned conventional-to-XO proposal and the unresolved SDK network-shutdown observation. Read commands accept --wallet-file for an explicitly selected existing Chipnet wallet. They validate its metadata and never print a seed.


