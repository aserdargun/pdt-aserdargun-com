# P-101 Interactive Digital Twin

An interactive centrifugal-pump teaching exhibit for Industrial Twin Lab. Includes the editable Blender asset, a default healthy GLB, educational geometry variants and a working web MVP.

## Run

Requires Node.js 22.18 or later.

```sh
npm ci
npm run dev -- --port 4317 --strictPort
```

Open http://127.0.0.1:4317. Drag to orbit, pinch or scroll to zoom, or focus the canvas and use the arrow keys to orbit and +/− to zoom. Show flow opens the cutaway automatically. Sensor markers have leader lines and equivalent inspector controls. Reduced-motion preferences pause animation; Play explicitly resumes it. Stop the process with Ctrl+C in its own terminal. Do not terminate unrelated port listeners.

```sh
npm run build
npm test
npm run verify:artifact
npm run test:e2e
npm run preview -- --port 4318 --strictPort
```

Run `npm run validate` for the complete model, build, artifact and Chromium interaction suite. The browser suite starts an isolated production preview on port 4319 and writes failure evidence to the operating system temporary directory. Install the matching Chromium once with `npx playwright install chromium` if it is not already available.

To run the same interaction suite against a deployed build, set `PDT_BASE_URL` to its HTTPS origin when running `npm run test:e2e`; this disables the local preview server.

The build creates `dist/` with Azure Static Web Apps configuration and a commit-correlated `release.json` that also marks uncommitted local builds with `dirty: true`. There is no backend, external model service or live telemetry. All condition traces are illustrative and synthetic.

## Editable asset

Open `source/p101_master.blend` in Blender 5.1+. The default scene is the healthy assembled model with cameras and lights. Optional fault meshes remain available but hidden. Geometry uses meters and a common shaft axis.

Rebuild the source asset, GLBs and hero render on this Mac:

```sh
npm run asset:build
```

On another installation, run `blender -b --python scripts/build_asset.py` from this repository. The Python script needs Blender's `bpy` and has no external Python dependencies.

See [the asset specification](docs/ASSET-SPEC.md) for hierarchy, semantic metadata, view rules, assumptions and V2 scope. See [verification](docs/VERIFICATION.md) for the historical initial-release evidence; use the validation commands above for the current checkout.

## Files for reuse

- `public/models/p101.glb`: healthy assembly for any GLB viewer.
- `public/models/p101-teaching.glb`: complete variant library for an application implementing the documented visibility rules.
- `public/p101-poster.png`: actual Blender hero render.
- `source/p101_master.blend`: editable master with five cameras.

## Scope

This implements the approved educational MVP. It is simplified teaching geometry, not certified industrial CAD. The existing Industrial Twin Lab site has not been modified or deployed by this work.

## Publication

Production URL: [P-101 Interactive Digital Twin](https://gray-meadow-083c04f03.3.azurestaticapps.net).

Source repository: [aserdargun/pdt-aserdargun-com](https://github.com/aserdargun/pdt-aserdargun-com).

Azure target: `swa-pdt-aserdargun-com`, resource group `rg-pdt-aserdargun-com`, Free SKU in West Europe, explicitly under `aserdargun subscription 3`. Existing portfolio resources remain in their own subscriptions. Deployment uses prebuilt `dist/` and one GitHub Actions production workflow.
