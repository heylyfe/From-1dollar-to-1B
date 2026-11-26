# Balancing report

## Model

All currency is stored in integer cents. Each trading period uses the same formulas in the game and in the simulation.

- Actual sales are the smaller of effective capacity and effective demand. Equipment, floor space, crew, maintenance and automation determine capacity. Region, season, competition, marketing, price and reputation determine demand.
- Revenue comes from units sold and their price. Costs include materials, payroll, overhead and interest. Suppliers, clean energy and research reduce selected costs.
- Net worth is cash plus property book value and 76–95% of capital invested in each business, less debt. A business sells for 87% of its quoted valuation, so a buy-and-sell cycle destroys value.
- A campaign win requires $1 billion in net worth, at least two businesses, positive trading profit and debt at or below 20% of net worth. Challenges may add conditions.
- Offline income applies to automated sites only. The return is a fraction of a regular period for each five minutes away, capped at 24 credited periods.

## Seeded results

The run used 128 campaigns per profile, for 1,536 total. Profiles use Standard difficulty with different cash reserves, sectors and investment policies. Automated agents review investments every fourth period, research periodically and choose trading plans by estimated operating profit. Offline income was excluded from estimated hours.

Estimated hours assume one minute per closed period and four seconds per shift. The game uses turn-based trading, and players control how quickly they close periods. These estimates do not establish real session duration or enjoyment.

| Profile | Wins | Median periods to win | Estimated hours | Median ending net worth |
| --- | ---: | ---: | ---: | ---: |
| Casual | 128/128 | 1,719 | 28.7 | $1,002,162,085 |
| Aggressive | 128/128 | 1,005 | 16.8 | $1,014,808,232 |
| Conservative | 128/128 | 2,127 | 35.5 | $1,001,511,836 |
| Optimised | 128/128 | 1,013 | 16.9 | $1,017,494,150 |
| Hospitality | 128/128 | 1,221 | 20.4 | $1,012,340,052 |
| Technology | 128/128 | 1,001 | 16.7 | $1,014,909,837 |
| Manufacturing | 128/128 | 1,445 | 24.1 | $1,011,442,458 |
| Retail | 128/128 | 1,445 | 24.1 | $1,010,750,075 |
| Diversified | 128/128 | 1,113 | 18.6 | $1,014,630,814 |
| Offline reliant | 128/128 | 1,727 | 28.8 | $1,001,909,812 |
| Poor decisions | 0/128 | — | — | $67,506 |
| Resale loop | 0/128 | — | — | $154,616 |

Median milestone periods are shown below for representative profiles.

| Profile | $100 | $1K | $10K | $100K | $1M | $10M | $100M | $1B |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Casual | 28 | 93 | 188 | 402 | 610 | 855 | 1,210 | 1,719 |
| Conservative | 35 | 100 | 190 | 455 | 695 | 1,016 | 1,456 | 2,127 |
| Optimised | 25 | 89 | 175 | 264 | 412 | 598 | 853 | 1,013 |
| Technology | 32 | 77 | 152 | 260 | 400 | 579 | 842 | 1,001 |
| Diversified | 25 | 89 | 176 | 270 | 419 | 630 | 909 | 1,113 |

## Adjustments and remaining evidence

- Initial trials exposed a stalled jump into the third business tier and a slow path to $100. Stronger local profits, revised tier gates and smaller endgame operating payouts shifted growth toward early ownership and a longer late game.
- Ten policy profiles won all their runs. The poor-decisions profile triggered emergency borrowing in 16 runs and had zero wins. The resale stress test lost a median $776,732 through sales and reacquisitions and had zero wins.
- The successful profile medians range from 16.7 to 35.5 modelled hours. Several routes fall below the 20-hour target at the assumed pace, and passive repetition can further reduce actual play time.
- The agents exercise operating plans, acquisitions, upgrades, research and contracts. They do not measure human reactions, satisfaction, device performance, all difficulty combinations or post-game engagement. A larger seeded sweep and timed human playtests are outstanding.

The [aggregated run data](tests/results/balance-128.json) includes median revenue, operating profit, upgrades, loss periods, recoveries and milestone rounds. Reproduce it with `node tests/simulate.cjs 128`. The runner also supports 1,000 or more seeds per profile.
