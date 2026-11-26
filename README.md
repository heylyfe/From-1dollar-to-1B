# From $1 to $1 Billion

Start with $1 in a walkable neighbourhood. Mix lemonade, wash cars or deliver parcels, then use the proceeds to build a shop. Work the floor yourself, hire staff who carry and serve orders, and expand into larger districts and industries.

[Play the current version](https://from-one-to-one-billion.biggptmogger.chatgpt.site/)

## Controls

| Action | Keyboard and mouse | Touch |
| --- | --- | --- |
| Walk | WASD, arrow keys, or click a destination | Drag the joystick, drag on the world, or tap a destination |
| Pick up, produce and deliver | Stand near the workstation | Stand near the workstation |
| Open a door, build site or office | Approach and press **E** | Approach and tap the contextual button |
| Find the next station | Select **Show me where** or **Next workstation** | Select **Show me where** or **Next workstation** |

Move from supplies to processing to the customer in the opening lemonade job. Once you own a storefront, you can hire workers in its office or through **Businesses**. An expansion pad builds a visible annex and opens a second service position. The bus stop connects unlocked districts. Fast travel is available after two purchases.

## Real-time operations

Orders are paid when fulfilled. Local customers walk and queue, and employees carry inventory along collision-aware paths. Hotel guests need clean room stock at check-in and pay when their stay ends. Staffed businesses continue fulfilling orders elsewhere through a lightweight arrival and throughput model. Material costs settle with each sale, and wages, upkeep and interest settle automatically every 44 simulated seconds.

The bottom menus open the portfolio, district economy, research and finance controls. The game retains 32 business listings, 56 technologies, eight regions, three difficulties, ten challenges, corporate projects, and post-game goals. Business listings use nine sector-specific interior templates. A completed campaign can start New Game Plus in Cedar Junction or Maplebrook.

## Browser and saves

Open `index.html` or publish the repository root on a static host. The game is static HTML, CSS, JavaScript and Canvas 2D. It requires no server, installation or account when hosted on an open static host. The linked ChatGPT Site retains its private access settings.

Browser storage keeps three save slots with a previous copy per slot. Version 3 adds the field position, carried items, stock, construction, and queued hotel stays to the existing campaign state. Versions 1 and 2 are accepted. Use **Settings → Export save** to move a campaign between compatible origins. Automated sites receive reduced offline orders, capped at two hours per absence.

## Development

- `field-data.js` defines maps, items and industry workstations.
- `operations.js` runs collision, pathfinding, fixed-step movement, customer and worker tasks, order settlement, and remote sites.
- `renderer.js` renders the camera, scenery, actors, and construction.
- `game.js` and `style.css` implement controls and menus.
- `economy.js`, `data.js`, and `save.js` supply the portfolio economy and campaign persistence.

Run `node --test tests/*.test.cjs` for regression coverage and `node tests/simulate.cjs 4 45` for the seeded real-time balance run. Use profile names after the duration to run a subset. The [balancing report](BALANCING_REPORT.md) describes the simulation and its limits. See [development status](DEVELOPMENT_STATUS.md) for verification and remaining work. The previous trading-period game remains available in [Git history](https://github.com/heylyfe/From-1dollar-to-1B/tree/00e50cd748ec7d56003966cc7b798d5702581515).
