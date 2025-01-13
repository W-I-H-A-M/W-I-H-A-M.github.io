<div style="display: flex; align-items: center;">
  <img src="assets/logo.png" alt="WIHAM Logo" style="width: 50px; margin-right: 10px;">
  <h1>WIHAM? - What Is Happening Around Me?</h1>
</div>


WIHAM? is an interactive platform for planning and managing pen-and-paper adventures. The application offers numerous features to easily create, edit, and export scenarios, characters (NPCs), objects, locations, and timelines.

## Features

- **Scenario Management:** Import and export scenarios as ZIP files.
- **NPC Editor:** Create and manage non-player characters (including attributes, appearance, schedules).
- **Object Editor:** Edit objects, including positioning them on maps.
- **Location Editor:** Manage locations with grid size and background images.
- **Timeline Editor:** Dynamic timelines with drag-and-drop support.
- **Event Editor:** Add events with conditions.
- **Multilingual Support:** Support for multiple languages (e.g., English, German).

## Installation

### Prerequisites
- A modern browser with JavaScript support.
- Browse to [w-i-h-a-m.github.io](https://w-i-h-a-m.github.io/).

### Steps
1. Download or clone the repository:
2. Start a local server in the application's root directory.
3. Open `index.html` in your browser.

## Directory Structure

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

## ZIP File Structure

When exporting a scenario, the following structure is used:

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

## Usage

### Importing/Exporting Scenarios
- Import a scenario using the **"Import Scenario"** button.
- Export a scenario to save or share it.

### Creating Content
- **NPCs:** Create characters, add attributes, and manage their schedules.
- **Objects:** Add new items and assign them to locations or characters.
- **Locations:** Define maps with grid sizes and background images.
- **Timelines:** Organize events chronologically.

### Events and Conditions
- Create events that can be triggered by conditions (e.g., time, location, NPC interactions).

## Development

### Local Development
1. Modify the code in the relevant JavaScript or CSS files.
2. Use Live Server to see changes directly in the browser.

### Contributions
Pull requests are welcome! Please ensure that you add tests for new features.

## License
This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)** license. See the [LICENSE](https://creativecommons.org/licenses/by-nc-sa/4.0/) file for details.