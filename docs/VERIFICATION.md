# Verification — 2026-09-08

## Build and asset checks

- `npm run build`: passed (TypeScript + Vite production build).
- `npm test`: 6 passed, 0 failed.
- Actual GLB import regression: multi-material primitive children inherit semantic metadata; bearing covers disappear in cutaway; normal mode restores healthy geometry and removes defects.
- Teaching asset: 59,588 triangles, 258 nodes, 10 materials, approximately 1.5 MB. Default healthy GLB: 1,417,812 bytes.
- Healthy GLB has no overlapping worn impeller, bearing-fault or strainer-debris variants.
- Eight distinct sensor anchors are parented to their physical assemblies.
- Local production server: GLB HTTP 200 `model/gltf-binary`; poster HTTP 200 `image/png`.
- npm dependency audit at installation: 0 vulnerabilities.
- Vite reports a large lazy 3D chunk (~1.05 MB raw / 289 KB gzip). The app shell is separate (~68 KB gzip); finer engine splitting and mesh draw-call optimization remain performance follow-ups, not claimed complete.

## Browser verification

Used the Codex in-app browser against the production build at `http://127.0.0.1:4318`. No Playwright fallback browser was necessary.

- 20 view/condition combinations: correct view, condition, lesson and loaded canvas.
- All 8 sensor marker selections: correct sensor ID, title and inspector content.
- Play/Pause toggle, flow toggle, reset camera, fault focus, exploded view and restoration to normal.
- Desktop 1536 × 1024, mobile 390 × 844: no horizontal overflow.
- Mobile: keyboard Enter activates sensor view; radial sensor selection opens VA-101R details.
- Fresh production tab console: no errors or warnings.
- Detailed visual inspection of assembled, cutaway, sensor, cavitation and bearing views. The final assembly and fault close-ups were recaptured after fixes.
- Reduced-motion defaults and fallback paths are implemented; OS reduced-motion emulation and deliberate GPU failure were not separately exercised.

Structured browser results: `docs/browser-checks.json`.

## Fidelity review

Reference: `docs/concept.png`, generated with the built-in image tool from the approved written scene plan. Browser captures: `docs/screenshots/desktop.png`, `mobile.png`, `cutaway.png`, `bearing.png`, `cavitation.png`.

The reference and final desktop/mobile screenshots were opened with `view_image` for direct comparison. The desktop was checked at the reference's native 1536 × 1024 size. The approved written concept is implemented, with the following deliberate MVP adaptations; this is not a claim of pixel-identical reproduction of the generated pump render.

| Comparison  | Evidence and disposition                                                                                                                                                                                                                                                                      |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout      | Open 3D viewport, narrow right inspector, four view controls, condition row and signal strip follow the reference. The required condition lesson continues below the primary screen.                                                                                                          |
| Typography  | Large serif P-101 title/subtitle, serif inspector heading, deliberately sized sans-serif controls; no browser-default controls.                                                                                                                                                               |
| Palette     | Warm paper, dark ink, thin gray rules, rust active controls, graphite motor and teal casing retained.                                                                                                                                                                                         |
| Asset       | Actual modular Blender geometry replaces the reference's raster pump. Geometry is intentionally simplified for educational web use; source supports editing and five cameras.                                                                                                                 |
| Framing     | Initial small-model framing and subsequent cropping were corrected. All assembly parts fit; close-ups intentionally crop surrounding machinery.                                                                                                                                               |
| Copy        | Header/title, four view labels, five condition labels, nine component labels and eight sensors match the approved information architecture. An unneeded tagline was removed. Engineering descriptions and healthy signal traces were corrected rather than copying inaccurate mockup wording. |
| Interaction | Real selection, material highlighting, section variants, defect variants, cameras, flow and vapor replace static screenshot controls.                                                                                                                                                         |
| Mobile      | Controls wrap intentionally, signals use two columns, inspector moves below the model; equivalent sensor/component lists remain available.                                                                                                                                                    |

Material fixes completed: distorted ring shading, oversized camera framing, multi-material cover visibility, inherited mesh selection metadata, floating bearing-cover sensors in cutaway, radial sensor orientation, and overlapping flow-caption text. Heat coloring is localized to bearing housing/races; selection uses a different tint.

The MVP is faithful to the approved scene direction and documented interaction plan. Remaining differences from the raster reference are the deliberately simplified real-time model, explanatory copy corrections, and additional required teaching content—not unreported implementation substitutions.

## Initial MVP delivery boundary (before publication)

Editable Blender master, procedural build script, default/teaching GLBs, actual hero render, web app and documentation are local deliverables. No GitHub push, Azure release, DNS change, or modification to the existing Industrial Twin Lab publication was performed.
