# Development status

## Implemented

- Buildless browser game with a $1 start, three interactive jobs, illustrated town and animated business scenes.
- 32 business listings across eight industries, 56 research technologies, ten challenges, three difficulties and 84 achievements.
- Seeded market events, trading policies, regional permits, research, crew, managers, pricing, upgrades, supply links, partnerships and rival stake acquisitions.
- Debt, property, contracts, corporate projects and a sustainable $1 billion objective. The same campaign continues to $10 billion and $100 billion, with legacy starts available after a win.
- Three save slots with versioning, checksums, backup recovery, text and JSON export, import and offline automation.
- Original Web Audio music and sound effects, independent volume controls, reduced motion and portrait-oriented navigation.

## Verification

- All 11 automated regression tests passed. The suite exercises the opening balance, asset sales, loan and property arithmetic, duplicate purchases, reproducible markets, the win conditions, offline rules and save recovery.
- The [balancing report](BALANCING_REPORT.md) documents 1,536 simulated campaigns. The time estimates depend on the assumed decision pace.
- A DOM integration check passed for job shifts, acquisitions, hiring, closing a trading period, navigation, reload, export/import and campaign selection.
- The owner-private ChatGPT Site deployed successfully. The integrated browser launch failed in this environment, and the standalone file navigation was blocked by managed Chromium policy.
- GitHub accepted the game source. GitHub's Pages API returned HTTP 403 for this integration, so the configured branch can be published by a repository owner through **Settings → Pages → Deploy from a branch → main → / (root)**.

## Known limits

- Campaign pacing and the 20-hour minimum, 25–35-hour average and 60-hour replay targets remain unverified in real play. Several modelled profiles finish below 20 hours. The current game allows successive trading periods without a real-time timer.
- Business variants share a sector and portfolio model. Industry-specific controls, cost sensitivity, regional fit and supply dependencies vary within that model. Detailed stock ledgers, individual employee simulation and independently managed subsidiaries are outside the current implementation.
- Rivals use regional influence and seeded reactions. Their individual budgets, acquisitions and internal decisions are simplified.
- Screen layout and interaction in Chrome and mobile Safari, accessibility on actual devices and extended late-game performance need device testing.
