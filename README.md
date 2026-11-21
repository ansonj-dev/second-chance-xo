# Second Chance

## Bounty readiness

**Status: not submission-ready.** The template, planner, and public invitation export are present, but no invitation has been executed through the XO debug tool on Chipnet or Mainnet. There is no final invitation to inspect or submit, and no follow-up transaction evidence. The bounty also requires development feedback written personally by the participant after hands-on use; this repository contains only an evidence worksheet.

The [Build with XO bounty](https://bchblaze.cash/bounties/build-with-xo/) also requires a functional template, a debug-inspectable executed transaction, reproduction instructions, and feedback on the development experience. See the [criterion audit](docs/JUDGING-AUDIT.md) and [invitation guide](docs/INVITATIONS.md) for exact evidence requirements. The public source is at [github.com/ansonj-dev/second-chance-xo](https://github.com/ansonj-dev/second-chance-xo); the executed invitation and hosted demo remain outstanding.

Recoverable BCH gifts as a fresh XO template. The recipient may claim with their own key; after a relative block delay the sender may recover an unspent gift. The claim is still valid after recovery matures: whichever spend confirms first wins. There is no precise calendar expiry.

## Run

Use Node 24+, `npm install`, `npm run check`, `npm run export`, `npm run dev`. Open http://127.0.0.1:4202.

> Prerequisite: the XO engine pulls a native dependency (`better-sqlite3`) that compiles during install. On a machine without a C/C++ build toolchain (e.g. Visual Studio "Desktop development with C++" on Windows), `npm install`/`npm ci` will fail at the native build step. The offline checks here (`check`, `test`, `export`, `plan`, `inspect`) do not need that binary — run `npm install --ignore-scripts` to set up. The engine-backed wallet/invitation CLIs do need the native build. The workbench plans amounts and delay and exports the template. It creates no keys or transaction. The template is in `template.ts`; exported JSON is in `dist/second-chance.xo.json`.

## Create a real invitation

Read [docs/INVITATIONS.md](docs/INVITATIONS.md) for fresh Chipnet wallet setup, public-only invitation export, offline inspection, debug-tool coordination and the relative-lock lifecycle. The CLI creates a signed coordination invitation; funded execution remains a manual participant-wallet step.

## Evidence required before submission

Save the exact executed funding invitation, claim or recovery follow-up invitation, Chipnet transaction IDs, and debug-tool screenshots in `evidence/`. Include steps to reproduce from fresh wallets. These artifacts do not exist yet. Do not present the unexecuted invitation as an on-chain transaction.

## Architecture and status

The P2SH32 redeem policy is `IF recipient CHECKSIG ELSE delay CHECKSEQUENCEVERIFY DROP sender CHECKSIG ENDIF`. Both public keys and delay persist on the funded output; each participant retains only their own signing secret. Follow-up actions preserve the appropriate role. This is a gift with recovery, not a service escrow or dispute mechanism. There is no trusted arbiter.

TypeScript compilation, XO schema parsing and JSON export completed. Twenty focused offline planner and libauth VM-policy tests now pass; funded execution and full XO-engine lifecycle verification remain pending. No blockchain results are claimed. Dependency override pins follow upstream's current tar/minimatch overrides to remove known vulnerable transitive versions; any remaining upstream dependency advisories need review before public deployment.

## Research and originality

- Official bounty and requirements: https://bchblaze.cash/bounties/
- XO engine implementation/API: https://gitlab.com/GeneralProtocols/xo/engine
- XO schema and examples: https://gitlab.com/GeneralProtocols/xo/templates
- XO docs: https://stack.xo.cash/getting-started.html
- Debug tool: https://blaze.xo.cash/

The template, product concept and local UI were authored here. Upstream template examples were read for the schema; this project does not rebrand them. The `reference-*` checkouts are ignored research dependencies and are not submission sources. npm `next` was 0.1.1-next.18029697917 on November 19, 2026, newer than the 0.1.0-next wording in the bounty; that version is pinned.

## Personal feedback requirement

The XO bounty explicitly requires personally written feedback and rejects AI-written submissions. `docs/feedback-notes.md` is an evidence worksheet, not a submission draft. Fill it from your own hands-on use and write your own feedback before entering.



## Public parameter preflight and offline checks

Run `npm run plan -- docs/public-parameters.EXAMPLE.json` to see the parameter format and compiled Chipnet-address plan. The EXAMPLE public keys were generated solely as an unusable sample; their private keys were discarded. **Never fund an example address.** Replace both public keys with independent keys held by the participants, then confirm each matches the intended role key in XO. The planner rejects invalid curve points, reused keys, out-of-range delay flags and noninteger amounts. It does not query the chain or execute an invitation.

`npm test` runs 20 offline checks, including real libauth P2SH32 signature and CSV-policy evaluation. It covers recipient claim, wrong keys, disabled sequence flags, insufficient sequence delay and transaction version. This establishes script-policy behavior for synthetic transactions, not actual BIP68 UTXO age on Chipnet. See [docs/JUDGING-AUDIT.md](docs/JUDGING-AUDIT.md) for criterion status and remaining evidence.



## Existing development wallets

Use [docs/EXISTING-WALLET.md](docs/EXISTING-WALLET.md) for read-only balance/address checks, correct Chipnet account import, the BIP44 versus XO derivation distinction, an exact unsigned transfer proposal and remaining participant actions. No helper broadcasts a transaction. Both invitation CLIs explicitly select the SDK's Chipnet network as well as Chipnet servers. A network-shutdown issue in the current SDK remains documented; offline saved-address ownership checks succeed.

