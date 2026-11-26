# From $1 to $1 Billion

A mobile-first fictional business tycoon. Start with $1 in Maplebrook, earn your first tools and storefront, then trade, research and build a group worth $1 billion. A sustainable win requires positive operating profit and manageable debt.

Open `index.html` in a current browser or serve the repository root with any static host. The project uses relative paths and needs no build, server, sign-in, ads or purchases. On GitHub Pages, publish from the root of `main`.

## Play

- **Empire** offers jobs, trading policies, market events and customer contracts. Close a period to collect its trading result.
- **Businesses** contains 32 listings across eight industries. Region, sector, pricing, occupancy, inputs, crew, distribution and maintenance affect profit. Upgrades change the business illustration and the operating model.
- **World** shows eight markets, local strengths, competitors and regional permits.
- **Research** has 56 technologies and eight branches.
- **Finance** shows cash history, assets, loans, property and corporate projects.
- **Settings → Campaigns** provides three slots, ten challenge campaigns, three difficulties and a legacy start after winning.

## Saves

Saves stay on the browser and site origin. Each slot has one previous copy. The versioned payload is checked before it can be loaded or imported. Use Settings to export JSON or copy it between browsers and between hosting providers. When browser storage is unavailable, the current tab retains the campaign in memory, with export and import available. Automated operations earn a share of normal results for up to 24 offline periods.

## Project layout

- `data.js` defines sectors, regions, milestones and research.
- `economy.js` owns the shared game and simulation rules.
- `save.js` validates and migrates save envelopes.
- `game.js`, `style.css`, and `assets/` render the game and handle input and audio.
- `tests/` contains regression tests and seeded balance runs.

Run `node --test tests/economy.test.cjs` for regression coverage. Run `node tests/simulate.cjs 1000` for a long balance run, or pass a lower sample count and profile names for a quick comparison.

See [the balancing report](BALANCING_REPORT.md) for results and [development status](DEVELOPMENT_STATUS.md) for known limitations.
