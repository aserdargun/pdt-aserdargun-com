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

The build creates `dist/` with Azure Static Web Apps configuration and a commit-correlated `release.json` that also marks uncommitted local builds with `dirty: true`. A source fingerprint covers tracked and new non-ignored files; artifact verification rejects a different commit or source changed after the build. There is no backend, external model service or live telemetry. All condition traces are illustrative and synthetic.

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

This implements the approved educational MVP. It is simplified teaching geometry, not certified industrial CAD. PDT is the pump teaching companion of Industrial Twin Lab (ITL) in the [aserdargun portfolio](https://aserdargun.com/). The relationship is educational: the two applications do not share telemetry or experiment state.

## Publication

Production URL: [P-101 Interactive Digital Twin](https://pdt.aserdargun.com/). The Azure fallback hostname is `gray-meadow-083c04f03.3.azurestaticapps.net`; this is configuration documentation, not a fresh live-release check.

Source repository: [aserdargun/pdt-aserdargun-com](https://github.com/aserdargun/pdt-aserdargun-com).

Azure target: `swa-pdt-aserdargun-com`, resource group `rg-pdt-aserdargun-com`, Free SKU in West Europe, explicitly under `aserdargun subscription 3`. Existing portfolio resources remain in their own subscriptions. Deployment uses prebuilt `dist/` and one GitHub Actions production workflow.

## ILS v0.1

The same canonical content-addressed ILS packages in `vendor/` expose the five authored condition studies, assumptions and synthetic evidence. The lesson adapter derives English and Turkish studies directly from `src/data.ts`, keeping physical changes, signal responses and interpretations consistent across the exhibit and ILS. `?condition=…&view=…` accepts authored values; `?lesson=pump-conditions#condition-study` opens the study. Use `?lang=tr` or the TR/EN controls for the complete localized exhibit, including sensor markers, keyboard instructions, fallback messages and ILS. Switching language preserves the selected condition, view and inspector selection; the URL keeps the condition and view for reloads. Cross-lab links provide learning context, not exact state transfer. Unsupported `ils` payloads are ignored. Existing animation, camera-reset semantics, geometry, signal generation and fallback behavior remain application-owned.

## Content and units

`src/data.ts` owns both languages of the component, sensor and condition lessons; `src/i18n.ts` contains shared interface translations. `contentVersion` identifies this copy revision and does not change the geometry or ILS schemas. Geometry is in meters. Sensor labels give representative measurement units (Pa/bar, m³/h, A/kW, °C, m/s²) but supply no readings. Signal strips remain qualitative, without calibrated time or amplitude. No acoustic model or dB values are provided.
