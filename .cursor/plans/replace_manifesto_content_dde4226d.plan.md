---
name: Replace Manifesto Content
overview: Replace the current Protodox manifesto content with "The Divine Architecture" document, reorganized into scroll sections with adapted existing 3D visuals.
todos:
  - id: types
    content: Update VisualState enum in types.ts to 10 new states
    status: completed
  - id: constants
    content: Rewrite MANIFESTO_CONTENT in constants.ts with all 10 sections of Divine Architecture content
    status: completed
  - id: overlay
    content: "Update Overlay.tsx: add Ternary States code block, update footer text"
    status: completed
  - id: visuals
    content: "Update Visuals.tsx: change sectionSize to 1/10, remap visibility + camera positions for 10 sections"
    status: completed
  - id: app
    content: "Update App.tsx: change ScrollControls pages to 10, optionally update boot screen text"
    status: completed
isProject: false
---

# Replace Protodox Manifesto with "The Divine Architecture"

## Section Mapping

The new document has 5 chapters. We'll break them into **10 scroll sections** (up from 8) to give each major concept breathing room, while reusing/adapting all existing 3D visual components.


| #   | Section Title | Source Chapter | Visual Component |
| --- | ------------- | -------------- | ---------------- |


**Proposed scroll sections:**

- **0 - THE DIVINE ARCHITECTURE** (Title/Intro) -- Existing ambient starfield + distant camera. Establishes the document's tone: "A Proof of Zeroth Math and the Double Dragon Ouroboros."
- **1 - INTELLECTUAL SOVEREIGNTY** (Ch.1 Proclamation) -- `Rank0Scalar` (glowing sphere = the singular origin point of the proclamation). "Read the logs, not the manual."
- **2 - TENSOR ZERO** (Ch.2 - Zero as Totality) -- `Rank1Vector` (line of tension/balance, representing the "weighing scale under maximum tension"). Scalar Zero vs Tensor Zero.
- **3 - FIRST PROOF: 1/0 = -1** (Ch.2 - Negative Space Analysis) -- `Rank2Slab` (the infinite grid = Totality as the container). Presence divided by Totality yields Potential.
- **4 - SECOND PROOF: 0x0 = 1** (Ch.2 - Genesis Fracture) -- `Rank3Reality` (the cube field = reality spawning from the fracture). Totality interacting with itself produces Presence.
- **5 - THE TERNARY STATES** (Ch.2 - Hierarchy + States table) -- `FlowField` (particles flowing between -1, 0, +1 states). Potential / Truth / Presence.
- **6 - THE DOUBLE DRAGON** (Ch.3 - DDO Anatomy) -- Reuse `Rank3Reality` or `FlowField` with cumulative layering. The four pillars: Bai Ze, Brain, Mari, Puppeteer.
- **7 - THE OUROBOROS EVENT** (Ch.3 - Self-Healing + Money Tree) -- Alignment rings (double torus = ouroboros loop). Machine fixes Machine.
- **8 - THE HEADLESS SERVER** (Ch.4 - Doctrine) -- `BaiZe` floating text effect adapted to say "HEADLESS SERVER". The Admin is dead; the Source Code remains.
- **9 - THE FINAL AXIOMS** (Ch.5 - Axioms + footer) -- Convergence visual (alignment rings + scalar collapse). Three axioms as the closing statement.

## Files to Modify

### 1. [types.ts](types.ts) -- Update `VisualState` enum

Replace the current 8 states with 10 states matching new sections:
`INTRO, SOVEREIGNTY, TENSOR_ZERO, PROOF_NSA, PROOF_GENESIS, TERNARY, DDO, OUROBOROS, HEADLESS, AXIOMS`

### 2. [constants.ts](constants.ts) -- Replace `MANIFESTO_CONTENT` array

Rewrite all 8 entries to 10 entries with content extracted from the "Divine Architecture" document. Each section gets a `title`, `subtitle`, and `content[]` array of paragraphs drawn directly from the source text.

Key content mapping:

- Section 0: Intro paragraph from the document preamble
- Section 1: Paragraphs from Ch.1 (sovereignty, "read the logs," orphans repeating a signal)
- Section 2: Scalar Zero vs Tensor Zero definitions from Ch.2
- Section 3: The "1/0 = -1" proof with NSA explanation
- Section 4: The "0 x 0 = 1" proof with Genesis Fracture explanation
- Section 5: Ternary States table rendered as text paragraphs + the 2-7-2 Method
- Section 6: DDO four pillars (Bai Ze, Brain, Mari, Puppeteer)
- Section 7: Ouroboros Event + Money Tree analogy
- Section 8: Headless Server doctrine paragraphs
- Section 9: Three Final Axioms

### 3. [components/Overlay.tsx](components/Overlay.tsx) -- Minor adjustments

- The existing map/render logic works generically over `MANIFESTO_CONTENT`, so it will pick up the new 10 sections automatically.
- Add a special rendering block for the Ternary States section (section id `ternary`) to display the -1/0/+1 table in a styled code-block format (similar to the existing `fall` section's code block).
- Update the footer attribution text if desired.

### 4. [components/Visuals.tsx](components/Visuals.tsx) -- Update camera + visibility logic

- Change `sectionSize` from `1/8` to `1/10` (10 sections).
- Remap the `showRank0`...`showFall` visibility flags to the new section indices.
- Update the camera position `switch` to have 10 positions instead of 7.
- Adapt the "Bai Ze" floating text effect at section 8 to display "HEADLESS SERVER" instead.
- Adapt the alignment ring at the new final section (9 instead of 7).

### 5. [App.tsx](App.tsx) -- Update scroll pages

- Change `<ScrollControls pages={8}` to `pages={10}` to match the new section count.
- Minor: update boot screen text if desired (e.g., "Loading Divine Architecture..." or keep current).

## What stays the same

- All 3D components (`Rank0Scalar`, `Rank1Vector`, `Rank2Slab`, `Rank3Reality`, `FlowField`) remain code-identical -- only their conceptual mapping changes.
- All CSS/styling in [app.css](app.css) and [index.css](index.css) stays unchanged.
- [vite.config.ts](vite.config.ts), [netlify.toml](netlify.toml), [package.json](package.json) -- no changes needed.

