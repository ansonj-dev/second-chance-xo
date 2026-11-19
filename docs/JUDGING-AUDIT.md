# Judging audit — Build with XO

Reviewed November 19, 2026 against https://bchblaze.cash/bounties/build-with-xo/ and the published engine API/package declarations. Verdict: **not ready for submission**. Source and offline checks are useful progress; the mandatory executed transaction/debug-tool invitation and human feedback do not exist yet.

| Official criterion | Actual evidence | Status / remaining gate |
|---|---|---|
| Novel, well-designed, functional XO template implementing its intended contract | Original template.ts defines fund, recipient claim and delayed sender recovery; tests/policy.test.ts evaluates the actual template scripts with valid/wrong Schnorr keys and CSV/version/sequence cases | Partial. Seven VM-policy cases pass, but a complete XO engine multi-party funding/follow-up round trip remains unverified. Product concept is original work here; the underlying refundable-gift/CSV primitive is common and no research novelty is claimed. |
| Execute on Chipnet or Mainnet with an invitation inspectable in the debug tool; submit that exact invitation | Only a CLI for creating a signed UNEXECUTED coordination invitation; no funded outputs, chain transaction IDs or debug-tool execution capture | Missing, mandatory. Do not substitute a local VM test or screenshot of this workbench. |
| Showcase follow-up actions where applicable | giftLock persists public keys/delay and retains sender recovery and recipient claim actions with role-specific secrets | Partial. Defined in source; must demonstrate actual output discovery, secret retention and role-specific follow-up execution in XO. |
| Provide template, exact invitation used and reproduction instructions | Schema-validated export command, fresh coordinator-wallet setup, upstream public-only Extended JSON export, offline inspector, docs/INVITATIONS.md and public-parameter planner | Partial. Invitation reproduction path is documented; actual debug-tool import/coordination has not been validated and no final executed invitation is available. |
| Detailed personal developer feedback, approximately 500 words, including issues/improvements | Only docs/feedback-notes.md, an evidence worksheet | Missing, human-only. The participant must write the final text from their own experience. No AI feedback draft is supplied. |

## Additional official guidance

- Use Chipnet for building/testing. All local provider/server configuration is Chipnet; offline VM tests do not constitute a Chipnet demo.
- For the mainnet track, the sponsor says minimal recoverable funds only. This entry currently targets Chipnet and has no mainnet evidence.
- Use the current development engine. `npm view @xo-cash/engine dist-tags --json` on Nov 19 returned next=0.1.1-next.18029697917, latest=0.0.1. The next version is pinned. The bounty still literally says latest 0.1.0-next.xxx; record this discrepancy and recheck before final evidence capture rather than silently downgrading.
- The official stack.xo.cash homepage is accessible. Its getting-started URL was unavailable to the browser fetcher and the homepage's api.html link returned 404 during this review. The installed pinned package's declarations/implementation were therefore used for actual return shapes and serialization. This is a documentation-access observation, not participant feedback prose.
- Sponsor discussion is encouraged but no sponsor has been contacted and no feasibility/eligibility approval is implied.
- Judging is based on the best qualifying work, not earliest arrival; no win prediction is warranted.

## Material findings and changes

The pinned engine returns StoredInvitation with a shared invitation and private account fields. The CLI exports only `.invitation` using upstream serializeInvitation, excluding the stored wrapper. A disposable local coordinator wallet is exclusively created and never printed; the CLI rejects XO_MNEMONIC to avoid accidentally importing an existing seed. The coordinator takes no contract participant role so its local-only database does not accidentally become the holder of a sender/recipient contract secret needed later in a different debug-tool account.

A new strict public-parameter planner validates real compressed curve points, separate participant keys, satoshi string encoding and BIP68 block-delay range. It compiles the actual gift redeem policy as P2SH32 and returns its locking bytecode/address for comparison against the eventual XO output. Sample private keys were discarded; sample addresses must never be funded. A planner cannot prove that the supplied public keys correspond to the keys generated inside the participants' XO accounts. That check remains essential before funding.

The workbench now reports template-download failures and clarifies reproduction/evidence status. It remains a planning and export interface, not a wallet. The download is an unparameterized template; values entered in the calculator are not silently embedded into a signed invitation.

## Offline validation performed

- 20 tests passed: seven actual libauth script-policy/signature cases, ten parameter-validation/planning cases, and three network/template-identity/public-derivation regressions.
- TypeScript checks include tests and all local CLI/planning modules.
- Export parses the upstream XO template schema before serializing.
- npm audit reported zero known advisories for the pinned/overridden dependency tree during this pass.

VM tests use fixed synthetic outpoints and known fixture keys. They test script acceptance, signatures, sequence rules and transaction version. They do not establish real UTXO age, chain confirmations, debug-tool compatibility, fee adequacy or full engine lifecycle behavior. No funded transaction, deployment, external message or submission occurred.

## Next evidence, in order

1. Validate actual template/invitation import against the pinned XO debug tool and two independent participant accounts.
2. Confirm each role public key against its generated secret and compare funded locking bytecode to a reviewed plan.
3. Fund a small Chipnet gift and preserve the exact final executed invitation and independently verified transaction ID.
4. Exercise claim and recovery with separate gift outputs, including an early-recovery rejection and mature recovery. Save follow-up invitations without private account data.
5. Have the human participant write the required personal feedback. Submit no worksheet or AI prose as that feedback.


## Later local wallet-readiness check

The invitation CLI now explicitly selects network=chipnet in addition to the server set; server selection alone did not select the SDK key/storage network. The invitation inspector now hashes the parsed/normalized XO template, matching engine import behavior rather than hashing a raw TS object with undefined fields. Regression checks cover both cases.

Existing disposable A/B wallets were used privately to generate local SDK P2PKH receiving addresses. An offline state reader independently re-derived their public keys from the retained key references and verified the P2PKH scripts. Read-only TLS calls to both packaged Chipnet servers verified A's conventional faucet deposit. An unsigned conventional-to-XO sweep proposal was prepared, with no transaction signature or broadcast. The Node SDK emitted a background-monitor AggregateError during shutdown after address creation; the clean offline state check is provided separately, and the SDK network lifecycle is still an unresolved gate. Browser account state, contract funding and qualifying template execution remain unverified. See EXISTING-WALLET.md for exact observed values, commands and remaining user actions.
