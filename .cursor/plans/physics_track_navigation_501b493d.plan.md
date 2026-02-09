---
name: Physics Track Navigation
overview: Replace ScrollControls with a custom physics-based navigation system where the user is a floating entity on a cyclical track, gravitationally held to the nearest section, cycling through orbiting sections within ternary arcs, with escape velocity to break between arcs.
todos:
  - id: types-arc
    content: Add ArcType enum (THEORY=0, MATH=1, FAITH=2), arc color constants, and TrackPhysicsState interface to types.ts
    status: pending
  - id: physics-hook-state
    content: "Create useTrackPhysics.ts: define physics state ref (t, velocity, nearestSection, currentArc) and constants (GRAVITY, FRICTION, ESCAPE_THRESHOLD, ARC_BARRIER)"
    status: pending
  - id: physics-hook-input
    content: "useTrackPhysics: add wheel event listener that accumulates deltaY into velocity, and touch start/move/end handlers for mobile swipe-to-velocity"
    status: pending
  - id: physics-hook-tick
    content: "useTrackPhysics: implement per-frame physics tick -- friction decay, nearest-section gravity, arc-barrier resistance, escape velocity bypass, position wrap-around"
    status: pending
  - id: physics-hook-arc
    content: "useTrackPhysics: derive currentArc from t position (0-0.417=theory, 0.417-0.583=math, 0.583-1.0=faith), expose arc color via interpolation"
    status: pending
  - id: track-geometry
    content: "Visuals.tsx: create CatmullRomCurve3 closed loop with 12 station points at radius 100, compute station positions + perpendicular side offsets"
    status: pending
  - id: camera-follows-t
    content: "Visuals.tsx: replace old camera system -- camera.position = track.getPointAt(t), camera.lookAt = track.getPointAt(t+0.008), no lerp or section switching"
    status: pending
  - id: orbiting-sections
    content: "Visuals.tsx: each exhibit orbits its station point -- small sin/cos offset that drifts over time, giving sections a floating/alive feel within their arc"
    status: pending
  - id: proximity-visibility
    content: "Visuals.tsx: each exhibit visible only when camera distance < 60 units, replacing all section-index visibility flags"
    status: pending
  - id: ternary-atmosphere
    content: "Visuals.tsx: ambient light color + fog color interpolate based on current arc (cyan/white/magenta), distributed arc-tinted point lights along track"
    status: pending
  - id: app-remove-scroll
    content: "App.tsx: remove ScrollControls and SceneWrapper, render SceneContent directly in Canvas receiving physics state, render Overlay as fixed div outside Canvas"
    status: pending
  - id: overlay-fixed-hud
    content: "Overlay.tsx: replace Scroll html with fixed positioned div showing current section title/subtitle/tagline + arc indicator, CSS fade transitions between sections"
    status: pending
  - id: stars-expansion
    content: "App.tsx: increase Stars radius to 300+, depth to 100, count to 5000 to fill the larger cosmic space"
    status: pending
  - id: verify-flight
    content: "Verify: gentle scroll cycles sections within arc, hard scroll escapes to next arc, track loops cyclically, all 12 exhibits render and orbit, atmosphere shifts per arc"
    status: pending
isProject: false
---

# Physics-Based Cosmic Track Navigation

## Core Concept

The user is a floating entity on a closed-loop cosmic track. They have momentum from scroll/swipe input. They are gravitationally attracted to the nearest **section** (which orbits within its **arc**). Gentle scrolls cycle between sections within the current arc. Hard scrolls break the arc boundary and fling the user into the next arc. The three arcs correspond to the Ternary States: +1 Theory (cyan), 0 Math (white), -1 Faith (magenta).

```mermaid
stateDiagram-v2
    state "+1 THEORY ARC (Cyan)" as theory {
        S0: ZerothTheory
        S1: Rank0
        S2: Rank1
        S3: Rank2
        S4: Rank3
        S0 --> S1: gentle scroll
        S1 --> S2: gentle scroll
        S2 --> S3: gentle scroll
        S3 --> S4: gentle scroll
    }
    state "0 MATH ARC (White)" as math {
        S5: Proofs
        S6: Fall
        S5 --> S6: gentle scroll
    }
    state "-1 FAITH ARC (Magenta)" as faith {
        S7: DDO
        S8: Ouroboros
        S9: BaiZe
        S10: Headless
        S11: Alignment
        S7 --> S8: gentle scroll
        S8 --> S9: gentle scroll
        S9 --> S10: gentle scroll
        S10 --> S11: gentle scroll
    }
    theory --> math: hard scroll / escape velocity
    math --> faith: hard scroll / escape velocity
    faith --> theory: hard scroll / escape velocity (cycle closes)
```



## Architecture -- Three Layers

### Layer 1: Physics Engine (new file `useTrackPhysics.ts`)

A custom React hook that owns all navigation state and physics simulation. No drei ScrollControls.

**State (in a `useRef`):**

- `t` -- position on the track (0.0 to 1.0, wrapping)
- `velocity` -- current momentum from scroll input
- `nearestSection` -- index 0-11 of gravitationally locked section
- `currentArc` -- 0 (theory), 1 (math), 2 (faith)

**Physics constants:**

- `SECTION_GRAVITY = 0.03` -- pull toward nearest section center
- `ARC_BARRIER = 0.06` -- extra pull at arc boundaries (resist crossing)
- `FRICTION = 0.92` -- velocity decay per frame
- `SCROLL_SENSITIVITY = 0.00015` -- wheel deltaY to velocity
- `ESCAPE_THRESHOLD = 0.008` -- velocity needed to break arc barrier

**Per-frame tick (called from `useFrame`):**

1. Apply friction: `velocity *= FRICTION`
2. Find nearest section: `round(t * 12) % 12`
3. Compute gravity pull toward nearest section center: `sectionT = nearestSection / 12`
4. If `|velocity| < ESCAPE_THRESHOLD`: apply section gravity + arc barrier gravity
5. If `|velocity| >= ESCAPE_THRESHOLD`: free flight, no gravity (escaping)
6. Update position: `t = (t + velocity + 1) % 1`
7. Derive `currentArc` from `t` (0-0.417 = theory, 0.417-0.583 = math, 0.583-1.0 = faith)

**Input capture:**

- `wheel` event: `velocity += deltaY * SCROLL_SENSITIVITY`
- Touch: track touch start Y, compute swipe velocity on touchmove/touchend

### Layer 2: Track Geometry + Camera (rewrite `SceneContent` in [components/Visuals.tsx](components/Visuals.tsx))

**Cosmic ring** -- `THREE.CatmullRomCurve3` closed loop with 12 control points at radius ~100.

**Camera follows physics `t`:**

```typescript
const pos = track.getPointAt(physics.t);
const lookTarget = track.getPointAt((physics.t + 0.008) % 1);
camera.position.copy(pos);
camera.lookAt(lookTarget);
```

**Orbiting sections** -- Each section exhibit orbits slowly around its station point within its arc:

```typescript
const baseT = i / 12;
const basePos = track.getPointAt(baseT);
const orbitAngle = clock.elapsedTime * 0.15 + (i * 0.5);
const orbitR = 3;
const orbitOffset = new THREE.Vector3(
    Math.cos(orbitAngle) * orbitR,
    Math.sin(orbitAngle * 0.7) * 1.5,
    Math.sin(orbitAngle) * orbitR
);
exhibitPos = basePos.clone().add(sideOffset).add(orbitOffset);
```

The `sideOffset` (15 units perpendicular to track) keeps exhibits beside the track. The `orbitOffset` makes them gently drift/bob.

**Proximity visibility** -- exhibits visible when camera within 60 units.

### Layer 3: HUD Overlay (rewrite [components/Overlay.tsx](components/Overlay.tsx))

Since we remove `ScrollControls`, the overlay cannot use `<Scroll html>`. It becomes a **fixed HTML overlay** outside the Canvas, receiving the current section index from the physics engine.

- Shows title + subtitle + tagline for the **nearest section**
- CSS transition between sections (fade out old, fade in new)
- Arc indicator showing which ternary state the user is in (with arc color)
- Positioned at bottom-left or bottom-right (alternating by section)

### Ternary Atmosphere

**Ambient light color** interpolates based on `t`:

- `t` in theory range: cyan `#00ffff`
- `t` in math range: white `#ffffff`
- `t` in faith range: magenta `#ff00c1`
- Smooth blend at arc boundaries (lerp over ~0.03 of t)

**Fog** color matches current arc for depth atmosphere.

## Files Modified


| File                                              | Change                                                                                                                                                                        |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **NEW: [useTrackPhysics.ts**](useTrackPhysics.ts) | Custom hook: physics state, wheel/touch input, gravity, arc barriers, escape velocity                                                                                         |
| [components/Visuals.tsx](components/Visuals.tsx)  | Complete rewrite of SceneContent: track curve, camera-follows-t, orbiting exhibits, proximity visibility, ternary atmosphere                                                  |
| [components/Overlay.tsx](components/Overlay.tsx)  | Replace Scroll-based overlay with fixed HUD driven by current section index prop                                                                                              |
| [App.tsx](App.tsx)                                | Remove ScrollControls/SceneWrapper. Render Canvas with SceneContent directly. Render Overlay as sibling div outside Canvas. Wire physics hook to both. Increase Stars radius. |
| [types.ts](types.ts)                              | Add `ArcType` enum and `TrackPhysicsState` interface                                                                                                                          |


Files NOT modified: [constants.ts](constants.ts), [index.css](index.css)