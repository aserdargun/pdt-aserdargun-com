import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

// Include tracked and new source files; Git ignores build output and dependencies.
export function sourceIdentity() {
  const paths = execFileSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    { encoding: "utf8" },
  )
    .split("\0")
    .filter(Boolean)
    .sort();
  const hash = createHash("sha256");
  for (const path of paths) {
    hash.update(path).update("\0");
    hash
      .update(
        existsSync(path)
          ? createHash("sha256").update(readFileSync(path)).digest("hex")
          : "deleted",
      )
      .update("\0");
  }
  return {
    sha: execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim(),
    sourceHash: hash.digest("hex"),
  };
}
