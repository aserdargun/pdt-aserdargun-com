# P-101 Interactive Digital Twin

An interactive centrifugal-pump teaching exhibit for Industrial Twin Lab. Includes the editable Blender asset, a default healthy GLB, educational geometry variants and a working web MVP.

## Run

Requires Node.js 22.18 or later.

```sh
npm ci
npm run dev -- --port 4317 --strictPort
```

Open http://127.0.0.1:4317. Drag to orbit, scroll to zoom, or use the view and condition-focus controls. Stop the process with Ctrl+C in its own terminal. Do not terminate unrelated port listeners.

```sh
npm run build
npm test
npm run verify:artifact
npm run preview -- --port 4318 --strictPort
```

The build creates `dist/` with Azure Static Web Apps configuration and a commit-correlated `release.json`. There is no backend, external model service or live telemetry. All condition traces are illustrative and synthetic.

## Editable asset

Open `source/p101_master.blend` in Blender 5.1+. The default scene is the healthy assembled model with cameras and lights. Optional fault meshes remain available but hidden. Geometry uses meters and a common shaft axis.

Rebuild the source asset, GLBs and hero render on this Mac:

```sh
npm run asset:build
```

On another installation, run `blender -b --python scripts/build_asset.py` from this repository. The Python script needs Blender's `bpy` and has no external Python dependencies.

See [the asset specification](docs/ASSET-SPEC.md) for hierarchy, semantic metadata, view rules, assumptions and V2 scope. See [verification](docs/VERIFICATION.md) for the current test evidence.

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
