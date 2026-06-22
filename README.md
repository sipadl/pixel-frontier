# 🎮 Pixel Saga

> **Browser RPG turn-based pixel game** — Jelajahi peta, lawan monster, kumpulkan senjata legendary!

🔗 **[Mainkan Sekarang!](https://pixel-saga.vercel.app)**

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-blue)
![Zustand](https://img.shields.io/badge/Zustand-State%20Mgmt-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

---

## 🎯 Fitur Utama

| Feature | Detail |
|---------|--------|
| 🗺️ **3 Maps** | Village → Dark Forest → Shadow Cave |
| ⚔️ **Turn-Based Battle** | Attack, Skill, Item, Flee |
| 🎲 **Gacha System** | Common, Rare, Epic, Legendary weapons |
| 📦 **Inventory** | Equip weapon → ganti skill set |
| 👾 **6 Monster** | 6 regular + 2 Boss |
| 💾 **Auto Save** | localStorage |
| 📱 **Responsive** | Desktop & Mobile |

---

## 🗺️ Maps

| Map | Monsters | Encounter Rate | Boss |
|-----|----------|----------------|------|
| 🏘️ Village | Green Slime, Angry Chicken | 8% | — |
| 🌲 Forest | Wild Wolf, Treant | 15% | Forest Guardian |
| ⛰️ Cave | Dark Bat, Stone Golem | 20% | Cave King |

---

## ⚔️ Gacha Rarity

| Rarity | Drop Rate | Skill Slots | Example |
|--------|-----------|-------------|---------|
| ⬜ Common | 60% | 1 | Wooden Sword |
| 🟦 Rare | 30% | 2 | Flame Katana |
| 🟪 Epic | 9% | 3 | Shadow Blade |
| 🌟 Legendary | 1% | 4 | Storm Breaker |

---

## 🎮 Controls

| Key | Action |
|-----|--------|
| WASD / Arrow Keys | Move |
| E | Interact NPC |
| I | Open Inventory |
| ESC | Close Menu |

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **State:** Zustand
- **Font:** Press Start 2P (Pixel Font)
- **Deploy:** Vercel

---

## 🚀 Quick Start

```bash
git clone https://github.com/sipadl/pixel-saga.git
cd pixel-saga
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 📁 Structure

```
pixel-saga/
├─ app/                    # Next.js pages
│  ├─ page.tsx             # Main game page
│  └─ globals.css          # Pixel styles + animations
├─ components/             # React components
│  ├─ MainMenu.tsx         # Title screen
│  ├─ GameMap.tsx           # Tilemap renderer + player movement
│  ├─ BattleUI.tsx          # Turn-based combat UI
│  ├─ GachaPopup.tsx        # Weapon gacha animation
│  ├─ Inventory.tsx         # Weapon list + equip
│  ├─ HUD.tsx               # HP/MP/EXP bars + stats
│  ├─ DialogueBox.tsx       # NPC dialogue
│  └─ GameOver.tsx          # Game over screen
├─ store/
│  └─ gameStore.ts          # Zustand state management
├─ game/
│  ├─ data/                 # JSON game data
│  │  ├─ monsters.json
│  │  ├─ weapons.json
│  │  ├─ maps.json
│  │  └─ items.json
│  └─ systems/
│     ├─ GameSystems.ts     # Gacha, combat, encounter logic
│     └─ SaveSystem.ts      # localStorage save/load
└─ public/assets/           # Sprites, tilesets, audio
```

---

## 📸 Screenshots

### Main Menu
![Menu](https://img.shields.io/badge/Press_Start_Game-blue?style=for-the-badge)

### Map Exploration
- 3 unique tilemap worlds
- Random encounter system
- NPC interactions
- Treasure chests with gacha weapons

### Battle System
- Turn-based combat
- Monster skills
- Weapon skill system
- HP/MP management

---

## 👨‍💻 Author

**Fadel Muhammad**
- GitHub: [@sipadl](https://github.com/sipadl)
- LinkedIn: [fadelmuhammad](https://linkedin.com/in/fadelmuhammad-7300ab170)

---

## 📄 License

MIT © 2024
