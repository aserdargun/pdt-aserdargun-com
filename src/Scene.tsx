import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  Lightformer,
  OrbitControls,
  useGLTF,
  Line,
} from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { sensors, type View, type Condition } from "./data";
import { prepareModel, visibleInState } from "./modelState";

type Props = {
  view: View;
  condition: Condition;
  playing: boolean;
  flow: boolean;
  selected: string | null;
  sensorId: string | null;
  onSelect: (id: string) => void;
  onSensor: (id: string) => void;
  camera: string;
  reset: number;
  reduced: boolean;
  onReady: () => void;
};
const presets: Record<
  string,
  { position: [number, number, number]; target: [number, number, number] }
> = {
  hero: { position: [2.6, 1.8, 4.1], target: [0.19, 0.58, 0] },
  cutaway: { position: [2.7, 1.85, 3.6], target: [0.1, 0.56, 0] },
  sensors: { position: [2.5, 2.7, 4.1], target: [0.05, 0.65, 0] },
  cavitation: { position: [1.35, 0.95, 1.06], target: [0.59, 0.51, 0] },
  bearing: { position: [0.46, 0.86, 0.75], target: [0.05, 0.48, 0] },
  suction: { position: [2.15, 1.0, 1.3], target: [1.2, 0.48, 0] },
};
function CameraRig({
  camera,
  reset,
  view,
  reduced,
}: {
  camera: string;
  reset: number;
  view: View;
  reduced: boolean;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera: cam, size } = useThree();
  useEffect(() => {
    const p = presets[camera] || presets.hero;
    const t = new THREE.Vector3(...p.target);
    const dir = new THREE.Vector3(...p.position).sub(t);
    const overview = ["hero", "cutaway", "sensors"].includes(camera);
    const distance = overview
      ? Math.max(
          1.48 / (2 * Math.tan(Math.PI / 10)),
          3.05 / (2 * Math.tan(Math.PI / 10) * (size.width / size.height)),
        ) * (view === "exploded" ? 1.52 : size.width < 600 ? 1.04 : 1.2)
      : dir.length() * (size.width < 600 ? 1.18 : 1);
    cam.position.copy(t.clone().add(dir.normalize().multiplyScalar(distance)));
    controls.current?.target.copy(t);
    controls.current?.update();
  }, [cam, camera, reset, view, size.width]);
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping={!reduced}
      minDistance={0.65}
      maxDistance={8}
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI / 2.05}
      enablePan={false}
    />
  );
}
function Pump(props: Props) {
  const { scene: source } = useGLTF("/models/p101-teaching.glb");
  const model = useMemo(() => prepareModel(source), [source]);
  const rotation = useRef(0);
  useEffect(() => {
    props.onReady();
  }, [props.onReady]);
  useEffect(() => {
    model.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      const role = o.userData.role;
      const c = o.userData.componentId;
      const open = props.view === "cutaway";
      const exploded = props.view === "exploded";
      o.visible = visibleInState(role, props.view, props.condition);
      const base = o.userData.basePosition as THREE.Vector3;
      o.position.copy(base);
      if (c === "impeller") {
        o.rotation.x = 0;
        rotation.current = 0;
      }
      if (exploded) {
        if (c === "motor") o.position.x -= 0.35;
        if (role === "guard") o.position.y += 0.4;
        if (role === "cover") {
          if (c === "bearing") o.position.y += 0.35;
          else o.position.x += 0.36;
        }
        if (c === "suction") o.position.x += 0.6;
        if (c === "impeller")
          o.position.x += role.endsWith("_shroud") ? 0.28 : 0.12;
      }
      const m = o.material as THREE.MeshStandardMaterial;
      m.emissive.set(props.selected === c ? "#537681" : "#000000");
      m.emissiveIntensity = props.selected === c ? 0.25 : 0;
      if (
        props.condition === "bearing" &&
        c === "bearing" &&
        /HOUSING|RACE/.test(o.name) &&
        role !== "cover"
      ) {
        m.emissive.set("#ad4218");
        m.emissiveIntensity = 0.18;
      }
    });
  }, [model, props.view, props.condition, props.selected]);
  // Rotate each impeller mesh about the common shaft center, preserving its authored coordinates.
  const pivot = useMemo(() => new THREE.Vector3(0.58, 0.48, 0), []);
  useFrame((_, dt) => {
    if (!props.playing || props.view === "exploded") return;
    rotation.current += Math.min(dt, 0.05) * 0.55;
    model.traverse((o) => {
      if (!(o instanceof THREE.Mesh) || o.userData.componentId !== "impeller")
        return;
      const base = o.userData.basePosition as THREE.Vector3;
      o.position
        .copy(base)
        .sub(pivot)
        .applyAxisAngle(new THREE.Vector3(1, 0, 0), rotation.current)
        .add(pivot);
      o.rotation.x = rotation.current;
    });
  });
  useEffect(() => {
    if (props.view === "exploded") {
      model.traverse((o) => {
        if (o instanceof THREE.Mesh && o.userData.componentId === "impeller")
          o.rotation.x = 0;
      });
    }
  }, [model, props.view]);
  return (
    <primitive
      object={model}
      onClick={(e: { stopPropagation: () => void; object: THREE.Object3D }) => {
        e.stopPropagation();
        const id = e.object.userData.componentId;
        if (id && id !== "sensors") props.onSelect(id);
      }}
    />
  );
}
function Flow({
  condition,
  playing,
  view,
}: {
  condition: Condition;
  playing: boolean;
  view: View;
}) {
  const group = useRef<THREE.Group>(null);
  const time = useRef(0);
  const paths = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        let a = (i * Math.PI) / 3;
        return new THREE.CatmullRomCurve3([
          new THREE.Vector3(
            1.48,
            0.48 + 0.025 * Math.cos(a),
            0.025 * Math.sin(a),
          ),
          new THREE.Vector3(
            0.82,
            0.48 + 0.025 * Math.cos(a),
            0.025 * Math.sin(a),
          ),
          new THREE.Vector3(
            0.62,
            0.48 + 0.06 * Math.cos(a),
            0.06 * Math.sin(a),
          ),
          new THREE.Vector3(
            0.6,
            0.48 + 0.19 * Math.cos(a - 0.6),
            0.19 * Math.sin(a - 0.6),
          ),
          new THREE.Vector3(
            0.58,
            0.48 + 0.275 * Math.cos(a - 0.9),
            0.275 * Math.sin(a - 0.9),
          ),
          new THREE.Vector3(0.58, 0.69, -0.263),
          new THREE.Vector3(0.58, 1.34, -0.263),
        ]);
      }),
    [],
  );
  useFrame((_, dt) => {
    if (playing)
      time.current +=
        Math.min(dt, 0.05) * (condition === "restriction" ? 0.12 : 0.22);
    group.current?.children.forEach((m, i) => {
      const p = paths[i % 6].getPoint((time.current + i / 48) % 1);
      m.position.copy(p);
    });
  });
  if (view === "exploded") return null;
  return (
    <group ref={group}>
      {Array.from({ length: condition === "restriction" ? 18 : 48 }, (_, i) => (
        <mesh key={i} position={paths[i % 6].getPoint(i / 48)}>
          <sphereGeometry args={[0.009, 8, 6]} />
          <meshBasicMaterial color="#087f98" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}
function Bubbles({ playing, view }: { playing: boolean; view: View }) {
  const group = useRef<THREE.Group>(null);
  const time = useRef(0);
  useFrame((_, dt) => {
    if (playing) time.current += Math.min(dt, 0.05);
    group.current?.children.forEach((m, i) => {
      const t = (time.current * 0.8 + i / 30) % 1;
      const a = i * 2.4;
      m.position.set(
        0.64 - t * 0.06,
        0.48 + (0.035 + t * 0.12) * Math.cos(a),
        (0.035 + t * 0.12) * Math.sin(a),
      );
      m.scale.setScalar(0.3 + Math.sin(t * Math.PI) * 1.0);
    });
  });
  if (view === "exploded") return null;
  return (
    <group ref={group}>
      {Array.from({ length: 30 }, (_, i) => (
        <mesh key={i} position={[0.65, 0.48, 0]}>
          <sphereGeometry args={[0.012, 10, 8]} />
          <meshStandardMaterial
            color="#dcecf0"
            emissive="#a1d1d7"
            emissiveIntensity={0.25}
            transparent
            opacity={0.74}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}
function SensorMarkers({
  sensorId,
  onSensor,
}: {
  sensorId: string | null;
  onSensor: (id: string) => void;
}) {
  const { scene } = useGLTF("/models/p101-teaching.glb");
  scene.updateMatrixWorld(true);
  return (
    <group>
      {sensors.map((s, i) => (
        <Html
          key={s.id}
          position={
            scene
              .getObjectByName("ANCHOR_" + s.id)
              ?.getWorldPosition(new THREE.Vector3()) ||
            new THREE.Vector3(...s.point)
          }
          center
          zIndexRange={[10, 0]}
        >
          <button
            className={`sensor-marker ${sensorId === s.id ? "active" : ""}`}
            onClick={() => onSensor(s.id)}
            title={`${s.id} · ${s.name}`}
            aria-label={`Inspect ${s.name}`}
            aria-pressed={sensorId === s.id}
          >
            {i + 1}
          </button>
        </Html>
      ))}
      {sensorId === "VA-101A" && (
        <Line
          points={[
            [-0.25, 0.62, 0.13],
            [0.12, 0.62, 0.13],
          ]}
          color="#a6421c"
          lineWidth={3}
        />
      )}
      {sensorId === "VA-101R" && (
        <Line
          points={[
            [0.16, 0.48, 0.06],
            [0.16, 0.77, 0.06],
          ]}
          color="#a6421c"
          lineWidth={3}
        />
      )}
    </group>
  );
}
export default function Scene(props: Props) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [2.6, 1.8, 4.1], fov: 36, near: 0.05, far: 50 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      fallback={
        <div className="fallback">
          <img
            src="/p101-poster.png"
            alt="P-101 motor and centrifugal pump assembly"
          />
          <p>
            Static alternative. The component and sensor lessons remain
            available below.
          </p>
        </div>
      }
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[-2, 4, 3]} intensity={2.7} />
      <directionalLight position={[3, 2, -2]} intensity={2} />
      <Environment resolution={128}>
        <Lightformer intensity={3} position={[0, 4, -2]} scale={[8, 4, 1]} />
        <Lightformer intensity={2} position={[-3, 2, 3]} scale={[5, 3, 1]} />
      </Environment>
      <Suspense
        fallback={
          <Html center>
            <span className="loading">Preparing the exhibit…</span>
          </Html>
        }
      >
        <Pump {...props} />
        {props.view === "exploded" && (
          <Line
            points={[
              [-1.4, 0.48, 0],
              [2.05, 0.48, 0],
            ]}
            color="#8e968b"
            lineWidth={1}
            dashed
            dashSize={0.025}
            gapSize={0.025}
          />
        )}
        {props.flow && <Flow {...props} />}
        {props.condition === "cavitation" && <Bubbles {...props} />}
        {props.view === "sensors" && <SensorMarkers {...props} />}
        <ContactShadows
          key={props.view}
          position={[0, 0.01, 0]}
          opacity={0.38}
          scale={7}
          blur={2.7}
          far={3}
          resolution={512}
          frames={props.view === "exploded" ? Infinity : 1}
        />
      </Suspense>
      <CameraRig {...props} />
    </Canvas>
  );
}
