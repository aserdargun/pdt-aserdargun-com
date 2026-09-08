import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { prepareModel, visibleInState } from "../src/modelState.ts";
const buffer = fs.readFileSync("public/models/p101-teaching.glb");
const gltf = await new GLTFLoader().parseAsync(
  buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
  "",
);
const meshes = [];
prepareModel(gltf.scene).traverse((o) => {
  if (o instanceof THREE.Mesh) meshes.push(o);
});
test("Multi-material section surfaces retain their physical identity and disappear with the cover", () => {
  const covers = meshes.filter((m) => m.name.includes("BEARING_HOUSING_UPPER"));
  assert.ok(
    covers.length >= 2,
    "Fixture must retain multiple exported material primitives",
  );
  for (const mesh of covers) {
    assert.equal(mesh.userData.componentId, "bearing");
    assert.equal(mesh.userData.role, "cover");
    assert.equal(
      visibleInState(mesh.userData.role, "cutaway", "bearing"),
      false,
    );
    assert.equal(
      visibleInState(mesh.userData.role, "assembly", "normal"),
      true,
    );
  }
});
test("Every selectable physical mesh resolves a component and role after GLB import", () => {
  for (const mesh of meshes) {
    assert.ok(mesh.userData.componentId, mesh.name);
    assert.ok(mesh.userData.role, mesh.name);
  }
});
test("A fault-to-normal transition restores healthy impellers and removes all fault-only meshes across views", () => {
  for (const view of ["assembly", "cutaway", "exploded", "sensors"]) {
    for (const mesh of meshes) {
      const role = mesh.userData.role;
      if (
        ["worn", "worn_shroud", "bearing_fault", "restriction"].includes(role)
      )
        assert.equal(visibleInState(role, view, "normal"), false);
      if (role === "healthy")
        assert.equal(visibleInState(role, view, "normal"), true);
      if (role === "worn")
        assert.equal(visibleInState(role, view, "impeller"), true);
    }
  }
});
