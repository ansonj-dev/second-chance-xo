# Existing Chipnet wallet and XO workflow

These are development wallets already present locally. Do not run wallet:init again for them, replace their files, post their phrases in chat, or commit .private. The helper commands below print only public information. No helper in this project broadcasts a transaction.

## Current public addresses

| Account | Conventional BIP44 address | XO SDK P2PKH receive address |
|---|---|---|
| Participant A | bchtest:qzztl4waz9uqcj4pr5a592y54lnlh4ysscgmzg222e | bchtest:qrxtdx2hkwmc45ltvd3xwrc7ag7m43wxrst2my8g58 |
| Participant B | bchtest:qrakuf0v2del8l2qegu9tgd03lnyzmq8mc2v7cxsfq | bchtest:qqfjfrtn2fzth2q9yw4tm04rfwegan7hvs24mq72cs |

The conventional address uses m/44'/145'/0'/0/0. The SDK uses its testnet purpose m/42415' and template-specific stored derivation references. Same mnemonic does not mean the same addresses or automatically shared local databases. Both SDK addresses above were generated with the explicit Chipnet network and then independently checked offline against the retained local key references and selected wallet's seed; both checks passed. That verifies the local account controls the keys. It does not import those records into the browser.

The SDK p2pkhTemplate identifier used was a31eb85891dbf248f1709a92b0fa7e3e6fdc518e6b34e376b197ed7f12dbc672. A different template version, network, generated-key index or browser account state may produce a different receive address. Preserve both .private wallet files and the XO databases.

## Inspect without moving funds

From 02-xo-template:

```powershell
npm run wallet:info -- --chipnet-only
npm run wallet:utxos -- --chipnet-only
npm run wallet:xo-addresses -- --chipnet-only
npm run wallet:xo-addresses -- --chipnet-only --wallet-file .private/participant-b-chipnet-wallet.json
```

wallet:info is local and returns the conventional public address. wallet:utxos makes read-only TLS calls to the two packaged Chipnet servers and reports server heights, UTXOs and confirmed/unconfirmed balances. wallet:xo-addresses opens the already existing local SDK database without starting its network monitor and verifies P2PKH address ownership from the local key references; it prints no stored-secret values or seed. A missing database causes an error rather than silently claiming browser state is present.

As observed at 2026-11-19 08:22 UTC, both Chipnet servers agreed that A's conventional address had one confirmed BCH-only UTXO: transaction 4ad2f9fd69cf0348a9d8f480f84b9860527d8c35459933a850c307903ddea863, output 0, 1,017,000 satoshis, height 337862. Both server tips were 337927. The raw parent output's script matches A's conventional address and has no CashTokens. This is an observation, not a permanent balance promise. Requery before any signing. The separately mentioned 10,000-satoshi Ninja drip was not visible in the queried address history or unconfirmed balance; without its txid, its status is unverified rather than assumed pending or confirmed.

## Import the disposable account into the official debug tool

1. Manually open https://blaze.xo.cash/ and verify that exact domain. Its public app bundle currently exposes an account action named Use existing mnemonic.
2. Open the relevant local private JSON file in a local editor yourself. Copy only its mnemonic value into the debug tool's Mnemonic phrase field. Do not send the phrase to this chat, put it in a screenshot, or paste it into a parameter file. This third-party developer wallet stores account phrases on the device; use only the disposable development seed.
3. Select Network = chipnet before saving. Name the account Participant A or Participant B as appropriate, choose Save and use account, then Connect. The observed app accepts BIP39 phrases of 12, 15, 18, 21 or 24 words; an account is tied to its selected network.
4. Repeat for the other participant using the other seed. Use separate named accounts for sender and recipient; the public invitation coordinates them. Do not assume two role names under one account are independent key holders.
5. Import the project's exported XO template and unexecuted public invitation. Complete the roles with their own generated keys/public-key resolutions, retaining their private state in the corresponding account. Use the planner to compare agreed public parameters with the actual funding output.
6. Before transferring faucet funds, use the receive/address action for the debug account's standard P2PKH template and compare its address and template identifier. If it does not match the locally generated SDK address above, use the address actually controlled and tracked by the intended debug account, and rebuild the unsigned proposal for that address. Do not assume that importing the phrase moved the Node database into the browser.

These UI action labels were read from the public debug-tool bundle on Nov 19; actual browser import/click-through has not been performed. Do not treat this guide as proof of an executed debug workflow.

## Moving the conventional faucet balance into a tracked XO address

The generated seed can authorize its conventional BIP44 address; the SDK does not automatically track/spend that address under its own derivation policy. A normal Chipnet transfer can move funds into an address actually controlled and tracked by the intended XO account. This requires source-wallet signing. This project only prepares an unsigned plan and has no broadcast command.

An unsigned proposal was prepared with one confirmed input (the 1,017,000-sat output above), one output of 1,016,500 satoshis to A's locally verified SDK address qrxtdx2hkwmc45ltvd3xwrc7ag7m43wxrst2my8g58, and a 500-sat fee. It is saved in dist/unsigned-wallet-move-1795073647935.json. No signature or broadcast occurred. This is a possible sweep of all currently observed conventional funds, not an instruction to execute it. Verify the destination in the actual debug account and review the exact current inputs/outputs first. A normal source wallet must support Chipnet and the exact BIP44 path; importing the phrase into an unrelated default path is insufficient.

```powershell
npm run wallet:move-plan -- --chipnet-only --to bchtest:YOUR_VERIFIED_XO_ADDRESS --fee-sats 500
```

This rechecks agreement between the packaged Chipnet servers, requires confirmed UTXOs, fetches and validates each BCH-only parent output against the source script, caps fees, and emits only a deliberately unsigned transaction proposal. The destination's bchtest prefix alone does not prove it is Chipnet; the endpoint/network restrictions and actual account selection matter. Obtain explicit reviewed signing/broadcast authorization separately; no tool here will broadcast it.

## Using the existing wallet from the other project

From 03-xo-migration you may point read helpers at A's existing file instead of copying a seed:

```powershell
npm run wallet:info -- --chipnet-only --wallet-file ../02-xo-template/.private/chipnet-wallet.json
npm run wallet:utxos -- --chipnet-only --wallet-file ../02-xo-template/.private/chipnet-wallet.json
```

03's local XO database is named open-grant-chipnet rather than second-chance-chipnet. The same seed file does not automatically share Node SDK state between folders, either. Prefer completing both templates in the same correctly configured named browser accounts if that is the intended demo; preserve each account's state.

## Generating another local SDK receive address

Only if needed, run wallet:xo-address with --chipnet-only --new-address and optionally --wallet-file. It creates and persists another local SDK key/address; it does not move funds. During this pass the pinned SDK reported an empty AggregateError from background monitor shutdown after saving the generated address. The CLI reports failure honestly, and wallet:xo-addresses can verify the saved key/address offline without triggering that network lifecycle. Treat this as an unresolved SDK lifecycle issue, not a completed clean end-to-end check. Do not regenerate addresses repeatedly just to work around it.

## Exact remaining participant work

No immediate account action is needed to preserve the existing funds. Before the funded demo: import/select the correct disposable Chipnet accounts; verify the receiving account actually tracks the intended destination; review and separately authorize any conventional-to-XO transfer; complete the template roles; review/fund/execute on Chipnet; save the exact executed and follow-up invitations and independently checked transaction IDs. For Second Chance, demonstrate claim and recovery using separate gift outputs. For Open Grant, resolve migration eligibility and publish real baseline/port links. The required approximately 500-word personal XO feedback must be written by the human participant from their own hands-on experience; no feedback prose is supplied here.
