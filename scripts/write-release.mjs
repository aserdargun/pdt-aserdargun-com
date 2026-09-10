import { execFileSync } from "node:child_process";
import { writeFileSync,copyFileSync,readFileSync,readdirSync } from "node:fs";
import {createHash} from "node:crypto";
copyFileSync("lab.manifest.json","dist/lab.manifest.json");
const assets=Object.fromEntries(readdirSync("dist",{recursive:true,withFileTypes:true}).filter(e=>e.isFile()&&!["release.json","staticwebapp.config.json"].includes(e.name)).map(e=>{const p=e.parentPath+"/"+e.name;return [p.replace(/^dist\//,""),createHash("sha256").update(readFileSync(p)).digest("hex")]}));
let sha = process.env.GITHUB_SHA;
let dirty = false;
if (!sha) {
  try {
    sha = execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    dirty =
      execFileSync("git", ["status", "--porcelain"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim().length > 0;
  } catch {
    sha = "uncommitted";
  }
}
writeFileSync(
  "dist/release.json",
  JSON.stringify(
    {
      application: "pdt-aserdargun-com",
      sha,
      dirty,
      builtAt: new Date().toISOString(),
      signals: "synthetic",
      assets,
    },
    null,
    2,
  ) + "\n",
);
