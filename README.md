# Neon Tower Defense

A browser tower defense game. Place towers along the path, upgrade them, and stop waves of enemies before they leak through. Every fifth wave ends with a boss.

**[Play it live](https://bumair.github.io/neon-tower-defense/)** · made with plain HTML, CSS and JavaScript, no libraries.

![Gameplay](screenshot.png)

## Towers

| Tower | Cost | What it does |
| --- | --- | --- |
| Pulse Laser | $100 | Fast single-target laser. Tier 3 fires at 3 foes. |
| Plasma Cannon | $250 | Slow shells with splash damage. |
| Stasis Beam | $175 | Weak beam that slows enemies. |
| Sniper Monkey | $240 | Long range, big hits on the foe furthest along the path. |
| Tack Shooter | $210 | Short range, hits up to 6 foes at once. |

## Enemies

Scouts, soldiers, tanks, armored foes (half damage per hit) and behemoths. Each enemy shows a letter (S, G, T, A, B) and bosses show a K. Every fifth wave ends with a boss.

## How to play

1. Pick a tower from the **Build** panel (or press `1`–`5`), then click the field to place it. Hold `Shift` to place several.
2. Click a placed tower to upgrade, retarget or sell it.
3. Click a gold **READY** pylon to fire a stun shockwave. It recharges over time.
4. Press **Start wave** (or `Enter`). Clearing a wave pays a bonus and interest on unspent money.

| Key | Action |
| --- | --- |
| `Space` | Pause |
| `Enter` | Start wave |
| `S` | Change speed |
| `M` | Sound on/off |
| `U` | Upgrade selected tower |
| `1`–`5` | Pick a tower |
| `Esc` / right-click | Cancel placing |

Best wave, top runs and your settings are saved in your browser.

## Run it locally

No install needed. Open `index.html` in a browser. Keep `style.css` and `game.js` in the same folder.

## Files

- `index.html`: page layout
- `style.css`: styling
- `game.js`: all game logic and drawing
