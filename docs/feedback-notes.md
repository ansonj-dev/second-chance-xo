# Developer feedback evidence worksheet

The bounty requires about 500 words of personally written feedback and rejects AI-written feedback. Do not submit this worksheet as feedback.

Facts observed during implementation:
- npm latest is 0.0.1; npm next is 0.1.1-next.18029697917 as retrieved Nov 19, 2026. Selecting latest silently chooses an older API.
- The checked-out engine README describes an earlier create signature than the installed engine type declarations. Installed types require Engine.create(mnemonic, options).
- The installed engine's server option requires servers including their blockchain metadata; chipnetServersWithBlockchain supplies that.
- A signed invitation is distinct from a funded/executed invitation. This project has only prepared the creation path so far.

Record your own experience:
1. Exact version, platform and debug tool URL.
2. Time required to import the template and finish both roles.
3. What action/state transitions were clear or confusing?
4. What happened when recovering too early? Include exact error and reproduction.
5. Were exported invitations independently inspectable without secrets?
6. What missing functionality or diagnostics would have saved you time?
7. A short concrete suggestion tied to each observation.

Do not describe an action as performed until you have performed it. Add screenshots, invocation and error text as supporting evidence.
