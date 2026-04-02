# PoE Siphoner Survival Calculator

This repository contains a Path of Exile ward-loop calculator focused on one question: if a siphoner rare breaks the loop and the final Heartbound Loop self-hit lands without ward, does the character die immediately or survive with enough life to run away and restart?

## Files

- `index.html` contains the calculator inputs, verdict card, and breakdown panel.
- `styles.css` contains the dark theme, responsive layout, and result states.
- `script.js` contains the ward-loop survivability logic.
- `.nojekyll` keeps GitHub Pages from processing the site with Jekyll.

## What the calculator uses

- Life pool
- Armour
- Summon Skeletons gem level, with an optional manual skeleton-count override
- Heartbound damage taken per skeleton death
- General additional physical damage reduction
- Endurance charges at 4% additional physical damage reduction each
- Optional Ascendant Berserker toggle, enabled by default, for 5% increased damage taken
- Optional Mind Over Matter and Progenesis toggles

## Formula summary

1. Skeleton count is derived from Summon Skeletons gem level by breakpoint:
	- Levels 1-10 summon 2 skeletons.
	- Levels 11-20 summon 3 skeletons.
	- Levels 21-30 summon 4 skeletons.
	- Levels 31+ summon 5 skeletons.
2. Total incoming Heartbound damage = skeleton count multiplied by Heartbound damage per skeleton.
3. Armour reduction is calculated against one Heartbound hit, not the summed total damage: `armour / (armour + 5 * damagePerHit)`.
4. Additional physical damage reduction = general physical damage reduction percent + `4% * endurance charges`.
5. Each Heartbound hit uses total reduction of `min(90%, armourReductionPerHit + additionalReduction)`.
6. Total post-mitigation damage = mitigated damage per hit multiplied by the number of skeleton deaths.
7. Optional Ascendant Berserker applies 5% increased damage taken to that post-mitigation total and is enabled by default.
8. Optional Mind Over Matter treats 40% of the resulting total as mana loss instead of life loss.
9. Optional Progenesis treats 25% of the remaining life loss as delayed instead of immediate.
10. The character survives only if immediate life remaining is greater than 0.

## Local preview

Open `index.html` in a browser to preview the page locally.

## GitHub Pages

1. Push this repository to GitHub.
2. Open the repository settings.
3. Under Pages, set the source to deploy from the `main` branch root.
4. Wait for the Pages build to complete and open the generated site URL.

## Current scope

Version one is intentionally focused on the final unwarded Heartbound hit only.

## Assumptions and exclusions

- Ward is intentionally not modeled because this tool is specifically for the hit that gets through after the loop has already broken.
- Mind Over Matter assumes enough available mana to absorb its full 40% share.
- Progenesis is treated only as reduced immediate life loss plus delayed loss display.
- The calculator does not yet model other effects such as physical damage taken as another damage type, recoup, Fortify, Black Scythe Training, or special defensive edge cases.