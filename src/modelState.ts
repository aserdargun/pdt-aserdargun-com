import * as THREE from "three";

const shaftAxis = new THREE.Vector3(1, 0, 0);

export function rotateImpeller(meshes: THREE.Mesh[], angle: number) {
  for (const mesh of meshes) placeImpeller(mesh, angle);
}

// glTF nodes with multiple materials become Groups with primitive Mesh children.
// Extras belong to the node, so resolve the nearest owner before interaction/state updates.
export function prepareModel(source: THREE.Object3D) {
  const model = source.clone(true);
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    let ancestor: THREE.Object3D | null = object.parent;
    while (ancestor) {
      for (const key of ["componentId", "role"]) {
        if (
          object.userData[key] === undefined &&
          ancestor.userData[key] !== undefined
        )
          object.userData[key] = ancestor.userData[key];
      }
      ancestor = ancestor.parent;
    }
    object.material = Array.isArray(object.material)
      ? object.material.map((material) => material.clone())
      : object.material.clone();
    object.castShadow = true;
    object.receiveShadow = true;
    object.userData.basePosition = object.position.clone();
    object.userData.baseQuaternion = object.quaternion.clone();
  });
  return model;
}

export function visibleInState(role: string, view: string, condition: string) {
  if (["cover", "guard", "pipe_cover"].includes(role))
    return view !== "cutaway";
  if (role === "healthy") return condition !== "impeller";
  if (role === "worn") return condition === "impeller";
  if (role === "healthy_shroud")
    return condition !== "impeller" && view !== "cutaway";
  if (role === "worn_shroud")
    return condition === "impeller" && view !== "cutaway";
  if (role === "bearing_fault") return condition === "bearing";
  if (role === "restriction") return condition === "restriction";
  return true;
}

const impellerPivot = new THREE.Vector3(0.58, 0.48, 0);
const turn = new THREE.Quaternion();

export function placeImpeller(mesh: THREE.Mesh, angle: number) {
  mesh.position
    .copy(mesh.userData.basePosition)
    .sub(impellerPivot)
    .applyAxisAngle(shaftAxis, angle)
    .add(impellerPivot);
  mesh.quaternion
    .copy(mesh.userData.baseQuaternion)
    .premultiply(turn.setFromAxisAngle(shaftAxis, angle));
}

export function applyModelView(
  meshes: THREE.Mesh[],
  view: string,
  condition: string,
  angle: number,
) {
  for (const mesh of meshes) {
    const {
      role,
      componentId: c,
      basePosition,
      baseQuaternion,
    } = mesh.userData;
    mesh.visible = visibleInState(role, view, condition);
    mesh.position.copy(basePosition);
    mesh.quaternion.copy(baseQuaternion);
    if (view === "exploded") {
      if (c === "motor") mesh.position.x -= 0.35;
      if (role === "guard") mesh.position.y += 0.4;
      if (role === "cover") {
        if (c === "bearing") mesh.position.y += 0.35;
        else mesh.position.x += 0.36;
      }
      if (c === "suction") mesh.position.x += 0.6;
      if (c === "impeller")
        mesh.position.x += role.endsWith("_shroud") ? 0.28 : 0.12;
    } else if (c === "impeller") placeImpeller(mesh, angle);
  }
}

// Only cloned materials are owned by a prepared instance; geometry belongs to the GLTF cache.
export function disposeModelMaterials(model: THREE.Object3D) {
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    materials.forEach((material) => material.dispose());
  });
}
