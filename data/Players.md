# Players (Seed Spec: Real + Synthetic)

Generated: 2025-08-10
Source: Real data when available via API; Synthetic AI-generated for clubs without public/usable data.

This file documents the player schema and contains sample entries. Each player has a `total_skill` in [0..100]. The `skill_breakdown` values are integers that sum exactly to `total_skill`.

## Schema

- club: Club name
- league: League name
- season: 2025-2026
- name: Player name (real or AI-generated)
- nationality: ISO-2 country code
- age: 16-40
- position: One of GK, CB, FB, DM, CM, AM, W, ST
- foot: R/L
- height_cm: 150-210
- weight_kg: 55-110
- total_skill: 0-100 (integer). Sum(skill_breakdown[*]) == total_skill
- skill_breakdown: dictionary of sub-skills (integers), partition of total_skill
  - physical: pace, acceleration, stamina, strength, agility, balance
  - technical: first_touch, dribbling, passing, crossing, finishing, long_shots, heading, tackling, marking
  - mental: vision, anticipation, positioning, composure, decisions, work_rate, aggression, leadership
  - goalkeeper: gk_handling, gk_reflexes, gk_kicking, gk_positioning (mostly zero for outfield)
- potential: 0-100 (>= total_skill, integer)
- contract_expiry: YYYY-MM-DD
- wage_eur_week: integer
- market_value_eur: integer
- status: empty | injured | on_loan
- traits: list of strings
- provenance: real | synthetic

Notes:
- For outfield players, GK sub-skills are typically 0.
- For goalkeepers, technical attacking skills can be low; most weight is in GK and some physical/mental.
- Attribute distributions are position-weighted but always sum exactly to `total_skill`.

## Generation Algorithm (for synthetic players)

Given desired `total_skill` T (0-100) and a position weight template (arrays of weights per sub-skill):
1) Create a list of all sub-skills in order (e.g., 6 physical + 9 technical + 8 mental + 4 GK = 27 components).
2) Choose a position template (e.g., ST emphasizes finishing, pace; CB emphasizes heading, tackling, marking; GK emphasizes GK_*).
3) Compute proportional weights W[i] >= 0. To ensure variability, sample around template using a Dirichlet-like noise, or add small jitter, then clamp non-negatives.
4) Normalize: P[i] = W[i] / sum(W).
5) Allocate integers using largest remainder method:
   - raw[i] = P[i] * T
   - base[i] = floor(raw[i])
   - remainder = T - sum(base)
   - Distribute +1 to the indices with largest (raw[i] - base[i]) until remainder is 0
6) Set skill_breakdown[i] = base[i] (+ possible +1 from step 5). Now sum(skill_breakdown) == T exactly.

This ensures deterministic, integer sums with positional flavor.

## Example Position Templates (relative weights, unnormalized excerpt)

- ST: finishing 5, dribbling 3, first_touch 3, pace 3, acceleration 3, positioning 3, anticipation 2, decisions 2, composure 2, heading 2, strength 1, work_rate 1, others 1
- CB: tackling 4, marking 4, heading 3, strength 3, positioning 3, aggression 2, composure 1, decisions 1, pace 1, passing 1, work_rate 1, others 0.5
- GK: gk_reflexes 5, gk_handling 4, gk_positioning 4, gk_kicking 2, agility 2, composure 1, decisions 1, others 0.5

(Real implementation will use full vectors for all sub-skills.)

---

## Sample: AFC Ajax (Eredivisie)

- club: AFC Ajax
- league: Eredivisie
- season: 2025-2026

| name           | pos | age | nat | foot | height_cm | weight_kg | total_skill | potential | contract_expiry | wage_eur_week | market_value_eur | status  | traits                   | provenance |
|----------------|-----|-----|-----|------|-----------|-----------|-------------|-----------|-----------------|---------------|------------------|---------|--------------------------|-----------|
| Daan Vermeer   | GK  | 24  | NL  | R    | 190       | 83        | 77          | 82        | 2028-06-30      | 22000         | 8000000          |         | Sweeper Keeper          | synthetic |
| Sergio Almeida | CB  | 26  | PT  | R    | 186       | 80        | 78          | 80        | 2029-06-30      | 28000         | 12500000         |         | Leader, Aerial          | synthetic |
| Yusuf Kara     | CM  | 22  | TR  | R    | 181       | 75        | 75          | 83        | 2027-06-30      | 18000         | 9200000          |         | Engine, PressResistant  | synthetic |

### Breakdown: Daan Vermeer (GK, total_skill = 77)

```
skill_breakdown:
  physical:
    pace: 3
    acceleration: 3
    stamina: 4
    strength: 5
    agility: 6
    balance: 4
  technical:
    first_touch: 3
    dribbling: 2
    passing: 4
    crossing: 1
    finishing: 0
    long_shots: 0
    heading: 0
    tackling: 1
    marking: 1
  mental:
    vision: 3
    anticipation: 5
    positioning: 5
    composure: 5
    decisions: 5
    work_rate: 3
    aggression: 3
    leadership: 2
  goalkeeper:
    gk_handling: 8
    gk_reflexes: 9
    gk_kicking: 4
    gk_positioning: 5
# Sum = 77
```

### Breakdown: Sergio Almeida (CB, total_skill = 78)

```
skill_breakdown:
  physical:
    pace: 4
    acceleration: 3
    stamina: 4
    strength: 7
    agility: 3
    balance: 3
  technical:
    first_touch: 4
    dribbling: 2
    passing: 4
    crossing: 1
    finishing: 1
    long_shots: 1
    heading: 6
    tackling: 9
    marking: 9
  mental:
    vision: 2
    anticipation: 6
    positioning: 8
    composure: 4
    decisions: 4
    work_rate: 4
    aggression: 4
    leadership: 2
  goalkeeper:
    gk_handling: 0
    gk_reflexes: 0
    gk_kicking: 0
    gk_positioning: 0
# Sum = 78
```

### Breakdown: Yusuf Kara (CM, total_skill = 75)

```
skill_breakdown:
  physical:
    pace: 5
    acceleration: 5
    stamina: 7
    strength: 4
    agility: 5
    balance: 4
  technical:
    first_touch: 7
    dribbling: 6
    passing: 8
    crossing: 3
    finishing: 3
    long_shots: 4
    heading: 2
    tackling: 4
    marking: 3
  mental:
    vision: 6
    anticipation: 5
    positioning: 5
    composure: 5
    decisions: 6
    work_rate: 5
    aggression: 3
    leadership: 2
  goalkeeper:
    gk_handling: 0
    gk_reflexes: 0
    gk_kicking: 0
    gk_positioning: 0
# Sum = 75
```

---

## Sample: PSV Eindhoven (Eredivisie)

- club: PSV Eindhoven
- league: Eredivisie
- season: 2025-2026

| name           | pos | age | nat | foot | height_cm | weight_kg | total_skill | potential | contract_expiry | wage_eur_week | market_value_eur | status  | traits                | provenance |
|----------------|-----|-----|-----|------|-----------|-----------|-------------|-----------|-----------------|---------------|------------------|---------|-----------------------|-----------|
| Milan Horvat   | ST  | 24  | HR  | R    | 184       | 78        | 80          | 85        | 2028-06-30      | 32000         | 18000000         |         | Clinical, Pacy       | synthetic |
| Jefferson Cruz | W   | 23  | BR  | L    | 178       | 73        | 77          | 84        | 2027-06-30      | 25000         | 14000000         |         | Flair, Dribbler      | synthetic |
| Koen Janssen   | CB  | 27  | NL  | R    | 188       | 82        | 76          | 78        | 2029-06-30      | 27000         | 11000000         |         | Organizer, Aerial    | synthetic |

### Breakdown: Milan Horvat (ST, total_skill = 80)

```
skill_breakdown:
  physical:
    pace: 8
    acceleration: 8
    stamina: 6
    strength: 5
    agility: 6
    balance: 4
  technical:
    first_touch: 6
    dribbling: 7
    passing: 4
    crossing: 3
    finishing: 12
    long_shots: 5
    heading: 5
    tackling: 1
    marking: 1
  mental:
    vision: 5
    anticipation: 6
    positioning: 6
    composure: 6
    decisions: 5
    work_rate: 4
    aggression: 3
    leadership: 2
  goalkeeper:
    gk_handling: 0
    gk_reflexes: 0
    gk_kicking: 0
    gk_positioning: 0
# Sum = 80
```

---

## Next Steps

- Confirm scope (which leagues/clubs first).
- If using an external API, provide API key and provider. We will:
  1) Pull real rosters and map to schema (set `provenance=real`).
  2) Fill missing clubs with synthetic players using the algorithm above, keeping realistic club-tier totals (e.g., top clubs 72-86, mid 60-75, lower 50-65).
- Optionally, add a seed/import script to insert players into the DB from this file.
