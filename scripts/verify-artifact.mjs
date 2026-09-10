import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";
for (const file of [
  "index.html",
  "lab.manifest.json",
  "staticwebapp.config.json",
  "release.json",
  "models/p101.glb",
  "models/p101-teaching.glb",
  "p101-poster.png",
])
  assert.ok(fs.statSync(`dist/${file}`).size > 0, `Missing/empty ${file}`);
const html = fs.readFileSync("dist/index.html", "utf8");
for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g))
  assert.ok(fs.existsSync(`dist${match[1]}`), match[1]);
const release = JSON.parse(fs.readFileSync("dist/release.json", "utf8"));
assert.equal(release.application, "pdt-aserdargun-com");
assert.equal(release.signals, "synthetic");
for(const [path,digest] of Object.entries(release.assets)) assert.equal(createHash("sha256").update(fs.readFileSync(`dist/${path}`)).digest("hex"),digest,path);
assert.equal(typeof release.dirty, "boolean");
if (process.env.GITHUB_SHA) assert.equal(release.sha, process.env.GITHUB_SHA);
assert.equal(
  JSON.parse(fs.readFileSync("dist/staticwebapp.config.json", "utf8"))
    .mimeTypes[".glb"],
  "model/gltf-binary",
);
console.log(
  "Verified static artifact, asset paths, model MIME and release identity.",
);
