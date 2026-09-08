import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
function glb(file) {
  const data = fs.readFileSync(file);
  assert.equal(data.toString("utf8", 0, 4), "glTF");
  assert.equal(data.readUInt32LE(4), 2);
  assert.equal(data.readUInt32LE(8), data.length);
  return JSON.parse(data.toString("utf8", 20, 20 + data.readUInt32LE(12)));
}
test("Default GLB contains the complete healthy assembly without overlapping fault variants", () => {
  const j = glb("public/models/p101.glb");
  const components = new Set(j.nodes.map((n) => n.extras?.componentId));
  for (const c of [
    "motor",
    "coupling",
    "shaft",
    "bearing",
    "casing",
    "impeller",
    "suction",
    "discharge",
    "base",
  ])
    assert.ok(components.has(c), c);
  assert.equal(
    j.nodes.filter((n) =>
      ["worn", "worn_shroud", "bearing_fault", "restriction"].includes(
        n.extras?.role,
      ),
    ).length,
    0,
  );
});
test("Teaching GLB preserves fault variants, capped pipe sections and eight unique sensor anchors", () => {
  const j = glb("public/models/p101-teaching.glb");
  const roles = new Set(j.nodes.map((n) => n.extras?.role));
  for (const role of [
    "cover",
    "pipe_cover",
    "guard",
    "healthy",
    "worn",
    "bearing_fault",
    "restriction",
  ])
    assert.ok(roles.has(role), role);
  const sensors = j.nodes.filter((n) => n.extras?.sensorId);
  assert.equal(sensors.length, 8);
  assert.equal(new Set(sensors.map((n) => n.extras.sensorId)).size, 8);
  for (const n of sensors)
    assert.ok(
      j.nodes.some(
        (p) =>
          p.children?.includes(j.nodes.indexOf(n)) && p.name !== "ASM_SENSORS",
      ),
    );
});
test("Geometry is bounded for the web and all indexed mesh primitives have POSITION data", () => {
  const j = glb("public/models/p101-teaching.glb");
  let triangles = 0;
  for (const m of j.meshes)
    for (const p of m.primitives) {
      assert.notEqual(p.attributes.POSITION, undefined);
      if (p.indices !== undefined)
        triangles += j.accessors[p.indices].count / 3;
    }
  assert.ok(triangles < 150000, `${triangles} triangles`);
  assert.ok(
    fs.statSync("public/models/p101-teaching.glb").size < 5 * 1024 * 1024,
  );
  console.log({
    triangles,
    nodes: j.nodes.length,
    materials: j.materials.length,
  });
});
