<div style="display: flex; align-items: center;">
  <img src="assets/logo.png" alt="WIHAM Logo" style="width: 50px; margin-right: 10px;">
  <h1>WIHAM? — What Is Happening Around Me?</h1>
</div>

<p align="center">
  <b>An interactive platform to create, manage, and explore your pen-and-paper adventures!</b>
</p>

---

## ✨ Overview
**WIHAM?** is your all-in-one solution for designing immersive pen-and-paper role-playing scenarios. Use it to craft intricate worlds, manage characters, plan events, and keep track of your game universe—all from the comfort of your browser.

<details>
<summary><strong>Why WIHAM?</strong></summary>

- **Collaborative & Flexible**: Perfect for GMs who want to build worlds together or just keep everything organized in one place.
- **Intuitive UI**: With drag-and-drop editing for timelines, locations, and events, you'll be up and running in no time.
- **Export & Import**: Share your unique creations with others or keep them safe in a tidy ZIP file.
- **Multilingual**: Customize language settings for players around the globe.
</details>

---

## 🚀 Features

1. **Scenario Management**  
   \- Seamlessly **import** and **export** entire scenarios as ZIP files.

2. **NPC Editor**  
   \- Create detailed NPC profiles including schedules, stats, and visuals.

3. **Object Editor**  
   \- Position and describe objects; place them on maps or assign them to NPCs.

4. **Location Editor**  
   \- Customize backgrounds, grids, and default images for your in-game locations.

5. **Timeline Editor**  
   \- Organize and reorder events chronologically with drag-and-drop simplicity.

6. **Event Editor**  
   \- Define events with specific trigger conditions (time, location, NPC status).

7. **Multilingual Support**  
   \- Easily switch between languages such as English and German.

---

## 🛠 Installation

### Prerequisites
- A modern browser with JavaScript enabled (Chrome, Firefox, Edge, Safari).
- Navigate to [w-i-h-a-m.github.io](https://w-i-h-a-m.github.io/) in your browser.

You’re good to go! No extra steps needed.

---

## 📁 Directory Structure

```
WIHAM/
│
├── css/                 # Styles for the user interface
│   └── style.css
├── js/                  # Java Script code
├── assets/              # Default images and icons
├── locales.json         # Language files
└── index.html           # Main application file
```

## 📦 ZIP File Structure

When **exporting** a scenario, you'll get a `.zip` file containing all data:

```
scenario.zip
│
├── meta.json        # Metadata of the scenario (e.g., name, ruleset, creator, plot)
├── npcs.json        # List of non-player characters and their attributes
├── objects.json     # List of objects and their details
├── places.json      # List of locations with grid size and background information
├── timeline.json    # Chronological timeline entries
├── events.json      # List of events with conditions and triggers
└── images/          # Folder containing all images used in the scenario
    ├── npc_<id>.png  # Images for NPCs
    ├── object_<id>.png # Images for objects
    └── place_<id>.png  # Background images for places
```

## 🎮 Usage

### Importing & Exporting
- **Import** scenarios with the **"Import Scenario"** button.
- **Export** scenarios to share them with fellow GMs or back them up.

### Creating Content
- **NPCs**: Give them stats, images, and schedules that govern their behavior.
- **Objects**: Flesh out the world by placing interactive items on the map or assigning them to NPC inventories.
- **Locations**: Define visual settings and grid sizes for your adventure’s maps.
- **Timelines**: Keep events in logical order; re-arrange them as you see fit.
- **Events**: Connect in-game actions to triggers like time, place, or NPC interactions.

---

## 🛠 Development

### Local Development
1. Clone or download the WIHAM? repository.
2. Make changes to the `.js` or `.css` files.
3. Use a local server (e.g., Live Server) to see real-time updates.

### Contributions
Pull requests are welcome! Make sure to include tests for any new features to ensure stability.

---

## 📜 License
This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)** license.  
Please refer to the official [LICENSE](https://creativecommons.org/licenses/by-nc-sa/4.0/) for full details.

---

<p align="center">
  Made with 💖 for passionate GMs and storytellers. Enjoy building your worlds with WIHAM!
</p>