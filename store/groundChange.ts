/* BrF style modifications: 
 * - Replace top‑down map with linear dungeon stages.
 * - 'zone' becomes 'stage' (1‑N). each stage has `waves`, `boss`. 
 * - Hero positioned left of screen, monster right.
 * - Keep existing combat logic.
 * - Add a `stageMap` in state and update startEncounter to decide stage.
 */
