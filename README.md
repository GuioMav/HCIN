# Recipe Finder: HCIN6222 POE prototype

Recipe Finder is a prototype website that helps IIE students living in res or shared digs decide what to cook with the food they already have, the equipment in their kitchen, the time they have and a budget per serving in Rand.

## Running the prototype

No installation is needed. Open `prototype/index.html` in any modern browser. Saved recipes, the pantry and settings are kept in the browser's local storage, so the prototype works offline.

## Pages

| Page | File | What it is for |
|---|---|---|
| Home | `index.html` | Add ingredients, pick equipment, time and budget, then search |
| Results | `results.html` | Recipe cards with the ingredient match and live filters |
| Recipe | `recipe.html` | Ingredients checked against the pantry, servings, method, reviews, share, cook together, shopping list |
| Cook mode | `cook.html` | One step at a time with built-in timers and a finish screen |
| Kitchen Helper | `helper.html` | Ask a question in your own words (rule-based, not real AI) |
| My Kitchen | `kitchen.html` | Pantry, saved recipes, recently viewed |
| Settings | `settings.html` | Text size, high contrast, reduce motion |

## Changes for the final POE

- On phones the main menu becomes a bottom tab bar that keeps its text labels.
- A "Send shopping list" button on the Recipe page sends only the missing ingredients on WhatsApp.
- Social proof reads "Cooked by 21 IIE students this week".
- Small-screen fixes for the header and the My Kitchen pantry list.

## Screenshots

`screenshots/` holds the annotated figures used in the report. They are produced by `tools/capture.js` (Playwright) and `tools/compose.py` (Pillow).

Prices are rough estimates in Rand per serving. Recipe images are simple illustrations drawn for the prototype.
