import { LabShell, LabControlButton } from "@aserdargun/lab-ui";
import "@aserdargun/lab-ui/styles.css";
import { manifest, experiments, initialRoute, guidedLesson } from "./ils/catalog";
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
import { exhibitContent, evidenceStandards, type Locale, type View, type Condition } from "./data";
import { translator } from "./i18n";
import Signals from "./Signals";
import StaticExhibit from "./StaticExhibit";
const Scene = lazy(() => import("./Scene"));
class SceneBoundary extends Component<
  { children: ReactNode; onUnavailable: () => void; locale: Locale },
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
    return this.state.error ? (
      <StaticExhibit locale={this.props.locale} />
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  const [route] = useState(() => initialRoute(location.search));
  const [locale, setLocale] = useState<Locale>(route.locale);
  const t = translator(locale);
  const { components, sensors, conditions, views } = exhibitContent(locale);
  const [view, setView] = useState<View>(route.view);
  const [condition, setCondition] = useState<Condition>(route.condition);
  // `?lesson=pump-conditions` opens the guided lesson. The route flag was computed
  // by initialRoute() but never consumed, so the deep link did nothing.
  const [guided, setGuided] = useState(route.lesson);
  const guidedStep = guidedLesson.steps.findIndex((step) => step.id === condition);
  // Evidence wording comes from lab.manifest.json so the contract stays the single
  // source of truth instead of a hardcoded string that can drift from it.
  const evidenceRecord = manifest.evidence.find((record) => record.id === "signals");
  const manifestAssumptions = [
    ...manifest.assumptions.map((entry) => `${entry.title[locale]}: ${entry.description[locale]}`),
    ...(evidenceRecord?.notes
      ? [`${evidenceRecord.label[locale]}: ${evidenceRecord.notes[locale]}`]
      : []),
  ].join(" · ");
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title =
      locale === "tr"
        ? "PDT - Etkileşimli Dijital İkiz"
        : "PDT - Interactive Digital Twin";
    const url = new URL(location.href);
    url.searchParams.set("lang", locale);
    url.searchParams.set("condition", condition);
    url.searchParams.set("view", view);
    history.replaceState(history.state, "", url);
  }, [locale, condition, view]);
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [playing, setPlaying] = useState(!reduced);
  const [flow, setFlow] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [sensorId, setSensor] = useState<string | null>(null);
  const [camera, setCamera] = useState(
    route.view === "sensors"
      ? "sensors"
      : route.view === "cutaway"
        ? "cutaway"
        : "hero",
  );
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
        {t("Skip to exhibit")}
      </a>
      <header>
        <a href="https://itl.aserdargun.com" target="_blank" rel="noreferrer">
          aserdargun / Industrial Twin Lab <ArrowUpRight size={13} />
        </a>
        <div className="header-links">
          <a
            href={
              locale === "tr"
                ? "https://aserdargun.com/tr/"
                : "https://aserdargun.com/"
            }
          >
            {t("Portfolio")} <ArrowUpRight size={13} />
          </a>
          <nav
            className="language-switch"
            aria-label={locale === "tr" ? "Dil" : "Language"}
          >
            <button
              lang="tr"
              aria-label="Türkçe"
              aria-pressed={locale === "tr"}
              onClick={() => setLocale("tr")}
            >
              TR
            </button>
            <button
              lang="en"
              aria-label="English"
              aria-pressed={locale === "en"}
              onClick={() => setLocale("en")}
            >
              EN
            </button>
          </nav>
        </div>
      </header>
      <div className="title">
        <h1>
          P-101<span>{t("Interactive Digital Twin")}</span>
        </h1>
      </div>
      <p className="exhibit-intro">
        {t(
          "Explore the machine, open its casing, then connect a physical change to the evidence.",
        )}{" "}
        <span>{t("Fictional teaching model · No live telemetry")}</span>
      </p>
      <main id="exhibit" className="workspace" tabIndex={-1}>
        <section className="exhibit" aria-label={t("Interactive pump exhibit")}>
          <nav className="view-tabs" aria-label={t("Model view")}>
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
            aria-label={t(
              "3D pump. Drag to orbit and scroll to zoom; use the view and focus buttons for keyboard navigation.",
            )}
          >
            {unavailable ? (
              <StaticExhibit locale={locale} />
            ) : (
              <SceneBoundary onUnavailable={onUnavailable} locale={locale}>
                <Suspense
                  fallback={
                    <div className="loading" role="status">
                      {t("Preparing the exhibit…")}
                    </div>
                  }
                >
                  <Scene
                    {...{
                      view,
                      locale,
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
                {t("Suction → Impeller → Volute → Discharge")}
              </span>
            )}
            {ready && (
              <span className="view-caption">
                {unavailable
                  ? t("Static healthy assembly · 3D unavailable")
                  : view === "cutaway"
                    ? t("Educational section · front covers removed")
                    : view === "exploded"
                      ? t("Exploded explanation · not a service procedure")
                      : view === "sensors"
                        ? t("Select a numbered measurement point")
                        : t(
                            "Drag to orbit · pinch or scroll to zoom · keyboard arrows rotate",
                          )}
              </span>
            )}
          </div>
          <div className="toolbar">
            <div className="actions">
              <LabControlButton
                action={playing ? "pause" : "play"}
                capabilities={manifest.capabilities}
                locale={locale}
                className="primary"
                onClick={() => setPlaying((value) => !value)}
                aria-pressed={playing && view !== "exploded" && ready}
                disabled={!ready || view === "exploded"}
                aria-label={
                  view === "exploded"
                    ? t("Animation paused in exploded view")
                    : playing
                      ? t("Pause animation")
                      : t("Play animation")
                }
                title={
                  view === "exploded"
                    ? t("Animation unavailable in exploded view")
                    : playing
                      ? t("Pause animation")
                      : t("Play animation")
                }
              >
                {playing && view !== "exploded" ? (
                  <Pause size={17} />
                ) : (
                  <Play size={17} />
                )}
              </LabControlButton>
              <LabControlButton
                action="reset"
                capabilities={manifest.capabilities}
                locale={locale}
                disabled={!ready}
                aria-label={t("Reset view")}
                title={t("Reset view")}
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
              </LabControlButton>
              <button
                aria-pressed={flow && view === "cutaway" && ready}
                className={flow && view === "cutaway" ? "selected" : ""}
                disabled={!ready}
                aria-label={
                  flow && view === "cutaway" && !unavailable
                    ? t("Hide flow")
                    : t("Show flow")
                }
                title={
                  flow && view === "cutaway" && !unavailable
                    ? t("Hide flow")
                    : t("Show flow")
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
                ? t("3D unavailable · Lessons remain available")
                : view === "exploded"
                  ? t("Motion paused in exploded view")
                  : reduced && !playing
                    ? t("Reduced motion · Press Play to animate")
                    : t("Slow-motion illustration")}
            </span>
          </div>
          <div
            className="conditions"
            role="group"
            aria-label={t("Operating condition")}
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
          <Signals condition={condition} locale={locale} />
          <p className="signal-note">
            {t(
              "Geometry in meters · Sensor units describe measurement types; no live readings. Signal strips have no calibrated units. No acoustic model or dB values.",
            )}
          </p>
        </section>
        <aside className="inspector" aria-label={t("Learning inspector")}>
          <h2>
            {view === "sensors"
              ? t("A place for every signal")
              : t("The anatomy of flow")}
          </h2>
          <p className="intro">
            {view === "sensors"
              ? t(
                  "Eight measurement locations connect the physical machine to its operational evidence.",
                )
              : t(
                  "A centrifugal pump transfers rotational energy from an electric motor into fluid flow and pressure.",
                )}
          </p>
          {sensor ? (
            <div className="detail" ref={detailRef} aria-live="polite">
              <button
                className="close"
                aria-label={t("Close sensor detail")}
                title={t("Close sensor detail")}
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
                {t("Back to measurement point ↑")}
              </button>
            </div>
          ) : component ? (
            <div className="detail" ref={detailRef} aria-live="polite">
              <button
                className="close"
                aria-label={t("Close component detail")}
                title={t("Close component detail")}
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
      <section id="guided-lesson" className="guided-lesson" aria-live="polite" data-guided={guided ? "true" : "false"}>
        <div>
          <span className="section-number">{t("GUIDED LESSON")}</span>
          <h2>{guidedLesson.title[locale]}</h2>
          <p className="guided-lesson__progress">
            {guidedLesson.steps.length > 0
              ? `${Math.max(0, guidedStep) + 1} / ${guidedLesson.steps.length} · ${guidedLesson.steps[Math.max(0, guidedStep)]?.title[locale] ?? ""}`
              : ""}
          </p>
          <div className="guided-lesson__steps">
            {guidedLesson.steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                className="guided-step"
                data-active={index === guidedStep ? "true" : "false"}
                aria-current={index === guidedStep ? "step" : undefined}
                onClick={() => setCondition((experiments.find((e) => e.id === step.id)?.config.condition ?? condition) as Condition)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {step.title[locale]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3>{t("What this step shows")}</h3>
          <p>{guidedLesson.steps[Math.max(0, guidedStep)]?.explanation[locale]}</p>
          <button type="button" className="focus-button" onClick={() => setGuided((value) => !value)}>
            {guided ? t("Leave guided lesson") : t("Start guided lesson")}
          </button>
        </div>
      </section>
      <section id="condition-study" className="lesson" aria-live="polite">
        <div>
          <span className="section-number">{t("01 / CONDITION STUDY")}</span>
          <h2>{mode.title}</h2>
          {condition !== "normal" && (
            <button
              className="focus-button"
              onClick={focusFault}
              disabled={!ready}
            >
              <Focus size={16} />
              {t("Inspect this condition")}
            </button>
          )}
        </div>
        <div>
          <h3>{t("Physical change")}</h3>
          <p>{mode.physical}</p>
        </div>
        <div>
          <h3>{t("Signal response")}</h3>
          <p>{mode.signal}</p>
        </div>
        <div>
          <h3>{t("What the evidence means")}</h3>
          <p>{mode.interpretation}</p>
        </div>
      </section>
      <section id="evidence-standards" className="standards-boundary" aria-labelledby="evidence-standards-heading">
        <div>
          <span className="section-number">{t("02 / STANDARDS BOUNDARY")}</span>
          <h2 id="evidence-standards-heading">{t("Where this model meets the standards")}</h2>
          <p>{evidenceStandards.boundary[locale]}</p>
        </div>
        <ul className="standards-list">
          {evidenceStandards.references.map((reference) => (
            <li key={reference.id}>
              <h3>{reference.title}</h3>
              <p>{reference.applies[locale]}</p>
              <p>{reference.limits[locale]}</p>
            </li>
          ))}
        </ul>
        <p className="standards-checked">
          {t("Standards scope checked")} {evidenceStandards.checkedAt}
        </p>
      </section>
      <LabShell
        manifest={manifest}
        experiment={experiments.find((e) => e.id === condition)!}
        locale={locale}
      />
      <footer>
        <p>{manifestAssumptions}</p>
        <div>
          <a href="/models/p101.glb" download>
            <Download size={14} />
            {t("Healthy assembly GLB")}
          </a>
          <a href="/p101-poster.png" download>
            {t("Hero render")} <ArrowUpRight size={13} />
          </a>
          <a href="https://itl.aserdargun.com" target="_blank" rel="noreferrer">
            Industrial Twin Lab <ArrowUpRight size={13} />
          </a>
        </div>
      </footer>
    </div>
  );
}
