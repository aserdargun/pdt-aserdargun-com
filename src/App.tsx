import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import {
  Pause,
  Play,
  RotateCcw,
  Waves,
  ArrowUpRight,
  Focus,
  Download,
  X,
} from "lucide-react";
import {
  components,
  sensors,
  conditions,
  views,
  type View,
  type Condition,
} from "./data";
import Signals from "./Signals";
const Scene = lazy(() => import("./Scene"));
class SceneBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="fallback">
        <img src="/p101-poster.png" alt="P-101 pump assembly" />
        <p>
          The 3D exhibit could not load. Component and sensor explanations
          remain available.{" "}
          <button onClick={() => location.reload()}>Retry</button>
        </p>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  const [view, setView] = useState<View>("assembly");
  const [condition, setCondition] = useState<Condition>("normal");
  const [reduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [playing, setPlaying] = useState(!reduced);
  const [flow, setFlow] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [sensorId, setSensor] = useState<string | null>(null);
  const [camera, setCamera] = useState("hero");
  const [reset, setReset] = useState(0);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const mode = conditions[condition];
  const component = components.find((c) => c.id === selected);
  const sensor = sensors.find((s) => s.id === sensorId);
  function changeView(next: View) {
    setView(next);
    setCamera(
      next === "sensors" ? "sensors" : next === "cutaway" ? "cutaway" : "hero",
    );
    if (next !== "sensors") setSensor(null);
    setReset((v) => v + 1);
  }
  function chooseComponent(id: string) {
    setSelected((s) => (s === id ? null : id));
    setSensor(null);
  }
  function chooseSensor(id: string) {
    setSensor(id);
    setSelected(sensors.find((s) => s.id === id)?.component || null);
  }
  function focusFault() {
    document
      .getElementById("exhibit")
      ?.scrollIntoView({ behavior: "instant", block: "start" });
    setSensor(null);
    setView("cutaway");
    setFlow(true);
    setCamera(mode.focus);
    setSelected(
      condition === "cavitation"
        ? "impeller"
        : condition === "restriction"
          ? "suction"
          : condition,
    );
    setReset((v) => v + 1);
  }
  return (
    <div className="app">
      <a href="#exhibit" className="skip">
        Skip to exhibit
      </a>
      <header>
        <a href="https://itl.aserdargun.com" target="_blank" rel="noreferrer">
          aserdargun / Industrial Twin Lab <ArrowUpRight size={13} />
        </a>
        <span>Research exhibit</span>
      </header>
      <div className="title">
        <h1>
          P-101<span>Interactive Digital Twin</span>
        </h1>
      </div>
      <main id="exhibit" className="workspace">
        <section className="exhibit" aria-label="Interactive pump exhibit">
          <nav className="view-tabs" aria-label="Model view">
            {views.map((v) => (
              <button
                key={v.id}
                aria-pressed={view === v.id}
                className={view === v.id ? "active" : ""}
                onClick={() => changeView(v.id)}
              >
                {v.label}
              </button>
            ))}
          </nav>
          <div
            className="viewport"
            data-view={view}
            data-condition={condition}
            data-ready={ready}
            aria-label="3D pump. Drag to orbit and scroll to zoom; use the view and focus buttons for keyboard navigation."
          >
            <SceneBoundary>
              <Suspense
                fallback={<div className="loading">Preparing the exhibit…</div>}
              >
                <Scene
                  {...{
                    view,
                    condition,
                    playing,
                    flow,
                    selected,
                    sensorId,
                    camera,
                    reset,
                    reduced,
                    onReady,
                  }}
                  onSelect={chooseComponent}
                  onSensor={chooseSensor}
                />
              </Suspense>
            </SceneBoundary>
            {flow && view === "cutaway" && (
              <span className="flow-legend">
                Suction → Impeller → Volute → Discharge
              </span>
            )}
            <span className="view-caption">
              {view === "cutaway"
                ? "Educational section · front covers removed"
                : view === "exploded"
                  ? "Exploded explanation · not a service procedure"
                  : view === "sensors"
                    ? "Select a numbered measurement point"
                    : "Drag to orbit · scroll to zoom"}
            </span>
          </div>
          <div className="toolbar">
            <div className="actions">
              <button
                className="primary"
                onClick={() => setPlaying(!playing)}
                aria-pressed={playing}
              >
                {playing ? <Pause size={15} /> : <Play size={15} />}{" "}
                {playing ? "Pause" : "Play"}
              </button>
              <button
                onClick={() => {
                  setCamera(
                    view === "sensors"
                      ? "sensors"
                      : view === "cutaway"
                        ? "cutaway"
                        : "hero",
                  );
                  setReset((v) => v + 1);
                }}
              >
                <RotateCcw size={15} />
                Reset view
              </button>
              <button
                aria-pressed={flow}
                className={flow ? "selected" : ""}
                disabled={view === "exploded"}
                onClick={() => setFlow(!flow)}
              >
                <Waves size={16} />
                {flow ? "Hide flow" : "Show flow"}
              </button>
            </div>
            <span>Illustrative flow · Synthetic signals</span>
          </div>
          <div
            className="conditions"
            role="group"
            aria-label="Operating condition"
          >
            {(Object.keys(conditions) as Condition[]).map((c) => (
              <button
                key={c}
                className={condition === c ? "active" : ""}
                aria-pressed={condition === c}
                onClick={() => setCondition(c)}
              >
                {conditions[c].label}
              </button>
            ))}
          </div>
          <Signals condition={condition} />
        </section>
        <aside className="inspector" aria-label="Learning inspector">
          <h2>
            {view === "sensors"
              ? "A place for every signal"
              : "The anatomy of flow"}
          </h2>
          <p className="intro">
            {view === "sensors"
              ? "Eight measurement locations connect the physical machine to its operational evidence."
              : "A centrifugal pump transfers rotational energy from an electric motor into fluid flow and pressure."}
          </p>
          {sensor ? (
            <div className="detail" aria-live="polite">
              <button
                className="close"
                aria-label="Close sensor detail"
                onClick={() => {
                  setSensor(null);
                  setSelected(null);
                }}
              >
                <X size={16} />
              </button>
              <code>{sensor.id}</code>
              <h3>{sensor.name}</h3>
              <p>{sensor.description}</p>
              <span className="detail-unit">{sensor.unit}</span>
            </div>
          ) : component ? (
            <div className="detail" aria-live="polite">
              <button
                className="close"
                aria-label="Close component detail"
                onClick={() => setSelected(null)}
              >
                <X size={16} />
              </button>
              <h3>{component.name}</h3>
              <p>{component.detail}</p>
            </div>
          ) : null}
          <ol className="component-list">
            {view === "sensors"
              ? sensors.map((s, i) => (
                  <li key={s.id}>
                    <button
                      onClick={() => chooseSensor(s.id)}
                      aria-pressed={sensorId === s.id}
                    >
                      <span className="number">{i + 1}</span>
                      <span>
                        <strong>{s.name}</strong>
                        <small>{s.id}</small>
                      </span>
                    </button>
                  </li>
                ))
              : components.map((c, i) => (
                  <li key={c.id}>
                    <button
                      onClick={() => chooseComponent(c.id)}
                      aria-pressed={selected === c.id}
                    >
                      <span className="number">{i + 1}</span>
                      <span>
                        <strong>{c.name}</strong>
                        <small>{c.short}</small>
                      </span>
                    </button>
                  </li>
                ))}
          </ol>
        </aside>
      </main>
      <section className="lesson" aria-live="polite">
        <div>
          <span className="section-number">01 / CONDITION STUDY</span>
          <h2>{mode.title}</h2>
          {condition !== "normal" && (
            <button className="focus-button" onClick={focusFault}>
              <Focus size={16} />
              Inspect this condition
            </button>
          )}
        </div>
        <div>
          <h3>Physical change</h3>
          <p>{mode.physical}</p>
        </div>
        <div>
          <h3>Signal response</h3>
          <p>{mode.signal}</p>
        </div>
        <div>
          <h3>What the evidence means</h3>
          <p>{mode.interpretation}</p>
        </div>
      </section>
      <footer>
        <p>
          Fictional asset · Simplified single-stage teaching geometry ·
          Slow-motion illustration
        </p>
        <div>
          <a href="/models/p101.glb" download>
            <Download size={14} />
            Modular GLB
          </a>
          <a href="/p101-poster.png" download>
            Hero render <ArrowUpRight size={13} />
          </a>
          <a href="https://itl.aserdargun.com" target="_blank" rel="noreferrer">
            Industrial Twin Lab <ArrowUpRight size={13} />
          </a>
        </div>
      </footer>
    </div>
  );
}
