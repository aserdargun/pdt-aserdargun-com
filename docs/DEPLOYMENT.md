# Publication contract

- Public source: https://github.com/aserdargun/pdt-aserdargun-com
- Production: https://gray-meadow-083c04f03.3.azurestaticapps.net
- Branch: `main`
- Azure subscription: `aserdargun subscription 3` (explicitly selected; no migration of existing applications)
- Resource group: `rg-pdt-aserdargun-com`
- Static Web App: `swa-pdt-aserdargun-com`
- Region / SKU: West Europe / Free
- Production workflow: `.github/workflows/deploy-swa-pdt-aserdargun-com.yml`
- Actions secret: `AZURE_STATIC_WEB_APPS_API_TOKEN_SWA_PDT_ASERDARGUN_COM`
- Artifact: `dist/`, prebuilt on Node.js 22.23.1

The workflow is the authoritative source of the exact secret key: `AZURE_STATIC_WEB_APPS_API_TOKEN_SWA_PDT_ASERDARGUN_COM`. Credentials are stored only in GitHub Actions secrets and are never committed. Azure source integration is disabled, so it cannot generate a competing workflow. Runs serialize without cancelling active uploads.

The repository was created and pushed publicly before Azure provisioning. The new subscription required Microsoft.Web provider registration. Resource creation remained on the Free SKU throughout.

Each release must pass locked installation, model/state tests, TypeScript, Vite build and artifact checks. `/release.json` exposes the deployed commit SHA and UTC build time, enabling comparison to the successful GitHub Actions run. Complete verification also requires the Azure production environment to be Ready, live asset MIME checks, and browser interaction checks. This document specifies the release contract; it is not a substitute for a successful workflow run.

No custom domain or DNS configuration is part of this release. The separate Industrial Twin Lab publication is unchanged.
