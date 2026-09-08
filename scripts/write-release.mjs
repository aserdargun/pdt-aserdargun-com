import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
let sha = process.env.GITHUB_SHA;
if (!sha) {
  try {
    sha = execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
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
      builtAt: new Date().toISOString(),
      signals: "synthetic",
    },
    null,
    2,
  ) + "\n",
);
