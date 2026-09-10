import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
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
import StaticExhibit from "./StaticExhibit";
const Scene = lazy(() => import("./Scene"));
class SceneBoundary extends Component<
  { children: ReactNode; onUnavailable: () => void },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidCatch() {
    this.props.onUnavailable();
  }
  render() {
    return this.state.error ? <StaticExhibit /> : this.props.children;
  }
}
export default function App() {
  const [view, setView] = useState<View>("assembly");
  const [condition, setCondition] = useState<Condition>("normal");
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [playing, setPlaying] = useState(!reduced);
  const [flow, setFlow] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [sensorId, setSensor] = useState<string | null>(null);
  const [camera, setCamera] = useState("hero");
  const [reset, setReset] = useState(0);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [visible, setVisible] = useState(() => !document.hidden);
  const detailRef = useRef<HTMLDivElement>(null);
  const onUnavailable = useCallback(() => {
    setUnavailable(true);
    setReady(false);
  }, []);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduced(preference.matches);
      if (preference.matches) setPlaying(false);
    };
    const visibility = () => setVisible(!document.hidden);
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      preference.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    if (sensorId && matchMedia("(max-width: 780px)").matches) {
      detailRef.current?.scrollIntoView({
        behavior: "instant",
        block: "center",
      });
    }
  }, [sensorId]);
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
    if (view === "sensors") return;
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
  function changeCondition(next: Condition) {
    setCondition(next);
    setSelected(null);
    setSensor(null);
    setCamera(
      view === "sensors" ? "sensors" : view === "cutaway" ? "cutaway" : "hero",
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
      <p className="exhibit-intro">
        Explore the machine, open its casing, then connect a physical change to
        the evidence. <span>Fictional teaching model · No live telemetry</span>
      </p>
      <main id="exhibit" className="workspace" tabIndex={-1}>
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
            data-status={
              unavailable ? "unavailable" : ready ? "ready" : "loading"
            }
            data-playing={
              playing && visible && view !== "exploded" && !unavailable
            }
            aria-label="3D pump. Drag to orbit and scroll to zoom; use the view and focus buttons for keyboard navigation."
          >
            {unavailable ? (
              <StaticExhibit />
            ) : (
              <SceneBoundary onUnavailable={onUnavailable}>
                <Suspense
                  fallback={
                    <div className="loading" role="status">
                      Preparing the exhibit…
                    </div>
                  }
                >
                  <Scene
                    {...{
                      view,
                      condition,
                      playing: playing && visible,
                      flow,
                      selected,
                      sensorId,
                      camera,
                      reset,
                      reduced,
                      onReady,
                      onUnavailable,
                    }}
                    active={visible}
                    onSelect={chooseComponent}
                    onSensor={chooseSensor}
                  />
                </Suspense>
              </SceneBoundary>
            )}
            {ready && flow && view === "cutaway" && (
              <span className="flow-legend">
                Suction → Impeller → Volute → Discharge
              </span>
            )}
            {ready && (
              <span className="view-caption">
                {unavailable
                  ? "Static healthy assembly · 3D unavailable"
                  : view === "cutaway"
                    ? "Educational section · front covers removed"
                    : view === "exploded"
                      ? "Exploded explanation · not a service procedure"
                      : view === "sensors"
                        ? "Select a numbered measurement point"
                        : "Drag to orbit · pinch or scroll to zoom · keyboard arrows rotate"}
              </span>
            )}
          </div>
          <div className="toolbar">
            <div className="actions">
              <button
                className="primary"
                onClick={() => setPlaying((value) => !value)}
                aria-pressed={playing && view !== "exploded" && ready}
                disabled={!ready || view === "exploded"}
                aria-label={
                  view === "exploded"
                    ? "Animation paused in exploded view"
                    : playing
                      ? "Pause animation"
                      : "Play animation"
                }
                title={
                  view === "exploded"
                    ? "Animation unavailable in exploded view"
                    : playing
                      ? "Pause animation"
                      : "Play animation"
                }
              >
                {playing && view !== "exploded" ? (
                  <Pause size={17} />
                ) : (
                  <Play size={17} />
                )}
              </button>
              <button
                disabled={!ready}
                aria-label="Reset view"
                title="Reset view"
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
              </button>
              <button
                aria-pressed={flow && view === "cutaway" && ready}
                className={flow && view === "cutaway" ? "selected" : ""}
                disabled={!ready}
                aria-label={
                  flow && view === "cutaway" && !unavailable
                    ? "Hide flow"
                    : "Show flow"
                }
                title={
                  flow && view === "cutaway" && !unavailable
                    ? "Hide flow"
                    : "Show flow"
                }
                onClick={() => {
                  if (flow && view === "cutaway") setFlow(false);
                  else {
                    changeView("cutaway");
                    setFlow(true);
                  }
                }}
              >
                <Waves size={16} />
              </button>
            </div>
            <span>
              {unavailable
                ? "3D unavailable · Lessons remain available"
                : view === "exploded"
                  ? "Motion paused in exploded view"
                  : reduced && !playing
                    ? "Reduced motion · Press Play to animate"
                    : "Slow-motion illustration"}
            </span>
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
                onClick={() => changeCondition(c)}
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
            <div className="detail" ref={detailRef} aria-live="polite">
              <button
                className="close"
                aria-label="Close sensor detail"
                title="Close sensor detail"
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
              <button
                disabled={!ready}
                className="return-model"
                onClick={() => {
                  document
                    .querySelector<HTMLButtonElement>(
                      `.sensor-marker[aria-pressed="true"]`,
                    )
                    ?.focus();
                }}
              >
                Back to measurement point ↑
              </button>
            </div>
          ) : component ? (
            <div className="detail" ref={detailRef} aria-live="polite">
              <button
                className="close"
                aria-label="Close component detail"
                title="Close component detail"
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
            <button
              className="focus-button"
              onClick={focusFault}
              disabled={!ready}
            >
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
          Slow-motion illustration · Separate from Industrial Twin Lab
          experiment data
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
