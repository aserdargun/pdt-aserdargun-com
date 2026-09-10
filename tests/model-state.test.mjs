import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  prepareModel,
  rotateImpeller,
  visibleInState,
} from "../src/modelState.ts";
const buffer = fs.readFileSync("public/models/p101-teaching.glb");
const gltf = await new GLTFLoader().parseAsync(
  buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
  "",
);
const meshes = [];
prepareModel(gltf.scene).traverse((o) => {
  if (o instanceof THREE.Mesh) meshes.push(o);
});
test("Impeller rotation preserves shaft-axis centers and is independent of previous frames", () => {
  const impellers = meshes.filter(
    (mesh) => mesh.userData.componentId === "impeller",
  );
  rotateImpeller(impellers, 0.73);
  const poses = impellers.map((mesh) => ({
    position: mesh.position.clone(),
    quaternion: mesh.quaternion.clone(),
  }));
  rotateImpeller(impellers, 2.4);
  rotateImpeller(impellers, 0.73);
  impellers.forEach((mesh, i) => {
    assert.ok(mesh.position.distanceTo(poses[i].position) < 1e-10);
    assert.ok(mesh.quaternion.angleTo(poses[i].quaternion) < 1e-7);
    assert.equal(mesh.position.x, mesh.userData.basePosition.x);
  });
  rotateImpeller(impellers, 0);
  impellers.forEach((mesh) =>
    assert.ok(mesh.position.distanceTo(mesh.userData.basePosition) < 1e-10),
  );
});

test("Preparing and highlighting an instance never mutates the cached asset", () => {
  const first = prepareModel(gltf.scene);
  const second = prepareModel(gltf.scene);
  const sourceMesh = gltf.scene.getObjectByName(meshes[0].name);
  const firstMesh = first.getObjectByName(meshes[0].name);
  const secondMesh = second.getObjectByName(meshes[0].name);
  assert.notEqual(firstMesh.material, sourceMesh.material);
  assert.notEqual(firstMesh.material, secondMesh.material);
  firstMesh.material.emissive.set("red");
  assert.notEqual(
    firstMesh.material.emissive.getHex(),
    secondMesh.material.emissive.getHex(),
  );
  assert.equal(
    secondMesh.material.emissive.getHex(),
    sourceMesh.material.emissive.getHex(),
  );
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

test("Prepared instances preserve the cached asset and own their materials", () => {
  const prepared = prepareModel(gltf.scene);
  prepared.traverse((mesh) => {
    if (!(mesh instanceof THREE.Mesh)) return;
    const original = gltf.scene.getObjectByName(mesh.name);
    assert.notEqual(mesh.material, original.material);
    assert.equal(mesh.geometry, original.geometry);
    assert.ok(mesh.quaternion.equals(mesh.userData.baseQuaternion));
  });
});

test("View changes preserve the paused shaft angle and restore exploded parts without drift", async () => {
  const { applyModelView } = await import("../src/modelState.ts");
  const model = prepareModel(gltf.scene);
  const parts = [];
  model.traverse((mesh) => {
    if (mesh instanceof THREE.Mesh) parts.push(mesh);
  });
  const angle = 0.73;
  applyModelView(parts, "cutaway", "normal", angle);
  const snapshot = parts.map((mesh) => ({
    position: mesh.position.clone(),
    quaternion: mesh.quaternion.clone(),
  }));
  for (let i = 0; i < 5; i++) {
    for (const condition of [
      "normal",
      "cavitation",
      "bearing",
      "impeller",
      "restriction",
    ]) {
      applyModelView(parts, "exploded", condition, angle);
      applyModelView(parts, "cutaway", condition, angle);
      parts.forEach((mesh, index) => {
        assert.ok(
          mesh.position.distanceTo(snapshot[index].position) < 1e-10,
          mesh.name,
        );
        assert.ok(
          mesh.quaternion.equals(snapshot[index].quaternion),
          mesh.name,
        );
      });
    }
  }
});

test("Material cleanup does not dispose shared geometry or cached source materials", async () => {
  const { disposeModelMaterials } = await import("../src/modelState.ts");
  const model = prepareModel(gltf.scene);
  let clonedDisposals = 0;
  let sourceDisposals = 0;
  let geometryDisposals = 0;
  model.traverse((mesh) => {
    if (!(mesh instanceof THREE.Mesh)) return;
    mesh.material.addEventListener("dispose", () => clonedDisposals++);
    mesh.geometry.addEventListener("dispose", () => geometryDisposals++);
    gltf.scene
      .getObjectByName(mesh.name)
      .material.addEventListener("dispose", () => sourceDisposals++);
  });
  disposeModelMaterials(model);
  assert.ok(clonedDisposals > 0);
  assert.equal(sourceDisposals, 0);
  assert.equal(geometryDisposals, 0);
});
