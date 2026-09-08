# PDT working contract

- Build the interactive centrifugal-pump teaching exhibit (P-101) for the Industrial Twin Lab, with an editable Blender source asset, a healthy GLB, educational geometry variants, and a working web MVP.
- Keep asset truth in `source/p101_master.blend` and `public/models/`; no live telemetry, CFD, remote meshes, or undeclared dependencies. The teaching GLB is a source library — a generic viewer will show every variant unless it applies the role visibility rules.
- Component, sensor, scenario, role, and condition state are authored inputs in `src/data.ts`. Camera intents, condition traces, and signal strips are illustrative observer outputs, never decision inputs.
- Component, sensor, scenario, role, and export schema versions are explicit. Update affected versions when semantics change.
- Every condition change is tick stamped; the built `dist/` ships a commit-correlated `release.json`. Reject mismatched or stale builds; `npm run verify:artifact` is the artifact gate.
- Keep Turkish and English controls and explanations equivalent. Label model assumptions, units (meters, °C, dB) and which traces are synthetic.
- Verify `npm test` and `npm run verify:artifact`, then review `git diff --check` before handoff.
- Local work only unless the user authorizes external publication. Preserve unrelated work and processes.
