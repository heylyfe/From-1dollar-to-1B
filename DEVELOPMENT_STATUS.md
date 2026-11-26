# Development status

## Implemented

- Walkable Canvas neighbourhood and eight district maps with keyboard, touch joystick, drag-anywhere, and tap-to-walk controls. Directional walking, collision, a following camera and visible inventory are integrated with the workstations.
- Three starter jobs that pay for fulfilled orders. The lemonade stand adds an express counter and a working assistant through physical expansion.
- Nine operating layouts shared by 32 listings. Restaurant table deliveries, hotel linen and reception, retail shelving and checkout, factory production and loading, shipment sorting, software development and testing, property fitting, energy exports, and lab prototypes have separate station chains.
- Animated queues, room stays, waiting cars and freight trucks. Employees pick up, prepare, move and serve stock. Remote sites use arriving demand, bounded backlogs and staffed throughput.
- Construction on the chosen lot, timed annex work, corridor travel, two workshop layouts, and an alternate Cedar Junction home in New Game Plus.
- Orders settle automatically. Shift accounting, cash history, company finance, research, rivals, contracts, challenges, achievements and portfolio progression remain available through secondary menus.
- Version 3 campaign saves preserve the financial portfolio and field state. Previous save versions migrate forward.

## Verification

- The Node regression suite covers the $1 start, movement and collision, empty stations, all starter jobs, physical construction, all nine operating templates, working staff, hotel settlement, shifts, offline limits, old-save migration, and preserved economic rules.
- An automated DOM and Canvas check exercised the keyboard, pointer joystick, inventory pickup, menus, campaign creation and save export/import. Canvas frames were inspected at desktop and portrait dimensions.
- The managed browser preview relay timed out. Interaction tests used synthetic input and a Canvas implementation. Physical-device testing in mobile Safari and Chrome remains outstanding.
- The [balancing report](BALANCING_REPORT.md) records the real-time simulation runs. Simulated time excludes human decisions and breaks.

## Known limits

- Observed businesses use individual movable NPCs. Off-screen sites use a throughput approximation with the same order pricing and operating costs. Local queues and worker positions rebuild when entering a scene.
- Business tiers share their industry's operating layout. Facility extensions and two mirrored arrangements provide variation. Freeform layout editing and vehicle driving are unfinished.
- Competitors influence regional demand and can be acquired through the district menu. They do not operate independent physical sites.
- The campaign duration targets require multi-hour human playtests. The simulation establishes financial reachability and estimates live-clock pacing.
