import * as THREE from "three";

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
    object.material = (object.material as THREE.MeshStandardMaterial).clone();
    object.castShadow = true;
    object.receiveShadow = true;
    object.userData.basePosition = object.position.clone();
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
