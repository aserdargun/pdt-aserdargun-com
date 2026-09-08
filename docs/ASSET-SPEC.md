# P-101 Interactive Digital Twin — implementation specification

## Delivered MVP

A local React/Vite/Three.js educational exhibit and a reproducible native Blender asset. The approved horizontal end-suction concept is implemented as a fictional single-stage machine. It is not a duty-rated boiler-feed design. All flow and diagnostic signals are authored illustrations, not CFD, live telemetry or calibrated alarm limits.

- Assembly, capped educational cutaway, semi-exploded explanation, sensor overlay.
- Nine selectable semantic components; separate motor/pump shafts, flexible coupling and guard, bearing races/balls, seal, six backward-curved impeller blades, volute and hollow piping.
- Eight sensor anchors, axial/radial direction indicators, accessible equivalent lists.
- Normal, vapor cavitation, bearing raceway wear/thermal overlay, worn impeller, blocked suction strainer.
- Five camera intents: hero, cutaway, sensor overview, cavitation/impeller detail, bearing detail; additional suction focus.
- Animated tracer dots and vapor pockets, pause, camera reset, flow visibility, reduced-motion default, 3D failure fallback.
- Four qualitative synthetic signal strips and physical-change → signal-response → interpretation lessons.

## Files

- `source/p101_master.blend`: editable source, meters, Blender X shaft / Z up. Default healthy assembly; optional defects hidden. Five named Blender cameras, studio lights and floor.
- `scripts/build_asset.py`: deterministic asset generator; no third-party mesh assets.
- `public/models/p101.glb`: default healthy assembled export, no duplicate fault geometry.
- `public/models/p101-teaching.glb`: all educational variants, with runtime visibility driven by `extras.role` and `extras.componentId`.
- `public/p101-poster.png`: actual Cycles render of the model; also used for WebGL/error fallback.
- `src/data.ts`: semantic component, sensor and scenario definitions.
- `src/Scene.tsx`: runtime view rules, cameras, flow, vapor and selection.
- `docs/concept.png`: generated full-screen art-direction reference, not an in-product raster UI.

## Asset hierarchy and coordinate contract

`P101_ROOT` contains `ASM_BASE`, `ASM_MOTOR`, `ASM_COUPLING`, `ASM_BEARING`, `ASM_CASING`, `ASM_IMPELLER`, `ASM_SHAFT`, `ASM_SUCTION`, `ASM_DISCHARGE` and an empty reserved `ASM_SENSORS` group. Sensor bodies and `ANCHOR_<sensorId>` nodes belong to their physical component assembly.

Blender uses meters, X along shaft, Z up. GLB uses X along shaft, Y up, positive Z towards the primary viewer. Impeller rotation is about `(0.58, 0.48, 0)` in GLB space. All variant meshes preserve authored coordinates. Meshes carry a stable `componentId`; names distinguish geometry and variants.

Roles: `always`, `rotating`, `cover`, `pipe_cover`, `guard`, `healthy`, `healthy_shroud`, `worn`, `worn_shroud`, `bearing_fault`, `restriction`. The teaching GLB is a source library: an arbitrary external viewer will show every variant unless it applies these visibility rules. Use the default GLB for generic viewers.

## Design system

Warm paper `#f1efe9`; ink `#222521`; gray rules `#c5c5ba`; rust accent `#a34422`. Georgia editorial headings, explicit Arial UI typography, thin rules, open viewport plus narrow inspector. No remote font or environment-map dependency. Native 3D studio lighting uses local procedural lightformers.

The generated screen translates the approved written scene direction. Real geometry intentionally replaces its rendered pump. Copy is edited for physical accuracy: the volute collects flow, bearings support the shaft, and the short piping installation is explicitly schematic. The selected component can expand the inspector. The required condition lessons continue below the primary screen.

## Physical interpretation

Cavitation: enlarged illustrative vapor pockets at the eye/blade inlet, collapsing downstream. No outside air injection and no immediate permanent damage. Bearing mode: magnified dark raceway wear marks plus a clearly described later-stage thermal overlay; it is not a fracture or material-removal simulation. Impeller mode: a distinct eroded blade mesh. Restriction: localized debris at the exposed upstream strainer, fewer flow tracers, no automatic cavitation.

Flow traces follow an authored path. Particle size, display speed and fault severity are visual teaching choices. The plots are qualitative normalized diagrams without time or physical-unit calibration. Pressure rise is not calculated pump head. Motor surface temperature does not imply winding temperature. Electrical power is a feeder measurement represented near the terminal box.

## MVP limits and V2

This is an educational MVP, not a manufacturer CAD replica or engineering verification. There is no backend, plant connection, CFD, acoustic simulation, real predictive model, or maintenance recommendation. Hosting is handled separately by the publication workflow. The service-inspired exploded arrangement is not a maintenance sequence. Pipe lengths are compressed and the flow meter does not represent a qualified installation.

V2: manufacturer reference dimensions and tolerances; bearing defect geometry/envelope spectra; pump/system curves and quantified operating-point assumptions; fluid temperature and NPSH teaching; CFD-derived fields; collision-aware annotation layout; continuous section plane; LOD/mesh merging; bilingual publication integration; severity progression and combined faults. Current web geometry fits the triangle/transfer budget; static small-part draw-call optimization remains a V2 opportunity.

## Engineering and export references

- KSB centrifugal pump operating principle: https://www.ksb.com/en-global/centrifugal-pump-lexicon/c
- KSB vapor cavitation: https://www.ksb.com/en-global/centrifugal-pump-lexicon/article/cavitation-1117364
- KSB operating point: https://www.ksb.com/en-global/centrifugal-pump-lexicon/o
- ifm vibration sensor mounting: https://www.ifm.com/us/en/us/learn-more/vibration/vvb3/vvb3-io-link-vibration-sensor-installation-guidelines
- SKF enveloped acceleration: https://skftechnicalsupport.zendesk.com/hc/en-us/articles/360032625814-Recommended-Alarm-Criteria-for-Bearing-Condition-Assessment-Using-Enveloped-Acceleration
- Blender glTF export: https://docs.blender.org/manual/en/4.1/addons/import_export/scene_gltf2.html

Public wording and synthetic boundaries follow the prior Industrial Twin Lab concept. No current live publication state is asserted.
