# Real-time campaign balance

## What the clock measures

The game runs at fixed 50 ms simulation steps. Movement uses distance, speed and collision. Starter orders require pickup, processing or service, and a waiting customer. The simulator walks the same paths to open the first business, works that business for one minute, then continues with the same one-second off-screen operations and 44-second settlement clock used by the browser.

Staffed throughput depends on the workstations in the route, crew size, training, equipment, automation and wear. Site demand depends on the sector, region, price and market. Crowding reduces customer arrivals once a district contains more than six sites. A bounded backlog keeps excess demand from becoming a future windfall. Orders settle at integer-cent prices from the portfolio economy, and shifts charge wages and overhead.

The agents reinvest at shift boundaries, follow a reserve policy, and pursue the designated industry constraints. The reported clock omits menu deliberation, breaks, and offline income. A win requires $1 billion in net worth, at least two businesses, positive recent operating profit and manageable debt.

## Results

36 of 36 seeded runs reached $1 billion within a 45-hour simulated horizon. All runs used Standard difficulty and the profile’s specified challenges or portfolio rules.

| Profile | Wins | First operated shop, minutes | Median hours to $1B | Median businesses |
| --- | ---: | ---: | ---: | ---: |
| Diversified | 4/4 | 5.5 | 21.16 | 44 |
| Fast expansion | 4/4 | 2.6 | 20.43 | 44 |
| Conservative | 4/4 | 3.9 | 21.22 | 44 |
| Hospitality | 4/4 | 5.5 | 23.69 | 27 |
| Retail | 4/4 | 2.6 | 19.75 | 27 |
| Logistics | 4/4 | 2.6 | 23.07 | 27 |
| Technology | 4/4 | 3.7 | 22.10 | 27 |
| Manufacturing | 4/4 | 2.8 | 31.04 | 27 |
| Small town | 4/4 | 5.8 | 22.73 | 27 |

### Median hours to milestones

| Profile | $100 | $1K | $10K | $100K | $1M | $10M | $100M | $1B |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Diversified | 0.22 | 0.35 | 0.78 | 1.95 | 4.39 | 10.54 | 18.72 | 21.16 |
| Fast expansion | 0.24 | 0.39 | 0.79 | 1.86 | 4.18 | 10.17 | 17.94 | 20.43 |
| Conservative | 0.27 | 0.43 | 0.86 | 1.95 | 4.55 | 10.65 | 18.78 | 21.22 |
| Hospitality | 0.23 | 0.36 | 0.85 | 1.90 | 4.98 | 12.20 | 21.36 | 23.69 |
| Retail | 0.20 | 0.37 | 0.92 | 1.91 | 4.44 | 9.82 | 17.25 | 19.75 |
| Logistics | 0.25 | 0.45 | 1.13 | 2.28 | 5.30 | 11.89 | 20.67 | 23.07 |
| Technology | 0.33 | 0.55 | 1.41 | 2.78 | 5.67 | 12.32 | 20.29 | 22.10 |
| Manufacturing | 0.38 | 0.65 | 1.59 | 3.26 | 7.04 | 16.25 | 27.96 | 31.04 |
| Small town | 0.24 | 0.38 | 0.80 | 2.12 | 5.17 | 14.03 | 20.34 | 22.73 |

## Tuning and limitations

- Early iterations paid too much for high-tier contracts. The revised price scale distinguishes local service, regional work, industrial orders and global contracts. Sector adjustments support manufacturing, whose inputs are more costly. District saturation rewards opening new markets and raises the cost of concentrating an entire portfolio in one town.
- Profile medians ranged from 19.75 to 31.04 simulated hours. This run uses four seeds per profile. The 20-hour minimum and 25–35 hour normal-play targets need timed player sessions. Some simulated routes may fall below those targets, and the richness of a multi-hour campaign cannot be measured by order counts alone.
- The agent walks through the starter and first storefront. Later sites use the remote operations model. The estimates omit travel after the opening, strategic deliberation and human movement mistakes. They do not establish physical-device performance or post-game pacing.

Reproduce the run with `node tests/simulate.cjs 4 45`. See [real-time run data](tests/results/realtime-balance.json) for the aggregate order counts, financial outcomes, and milestone timings. The [legacy run](tests/results/balance-128.json) belongs to the former turn-based game.
