import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
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
    },
    null,
    2,
  ) + "\n",
);
