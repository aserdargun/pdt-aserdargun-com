import { translator } from "./i18n";
import { exhibitContent, type Locale, type Condition } from "./data";
export function trace(condition: Condition, signal: number) {
  return Array.from({ length: 90 }, (_, i) => {
    let y = 27 + Math.sin(i * 0.25) * 1.5;
    if (signal === 2) {
      y = 34 + Math.sin(i * 0.7) * 2;
      if (condition === "cavitation")
        y = 28 + Math.sin(i * 2.4) * 10 + Math.sin(i * 0.8) * 6;
      if (condition === "bearing")
        y = 34 - (i % 13 === 0 ? 28 : 0) + Math.sin(i) * 2;
      if (condition === "impeller") y = 29 + Math.sin(i * 0.45) * 7;
    } else if (signal === 3) {
      y =
        condition === "bearing"
          ? 40 - i * 0.28 + Math.sin(i * 0.25)
          : 32 + Math.sin(i * 0.12);
    } else if (condition === "cavitation") {
      y = 35 + Math.sin(i * 1.1) * 4 + Math.sin(i * 0.4) * 3;
    } else if (
      condition === "impeller" ||
      (condition === "restriction" && signal === 0)
    ) {
      y = 36 + Math.sin(i * 0.25);
    }
    return `${i * 2.3},${y}`;
  }).join(" ");
}
export default function Signals({
  condition,
  locale,
}: {
  condition: Condition;
  locale: Locale;
}) {
  const t = translator(locale);
  const { conditions } = exhibitContent(locale);
  return (
    <section
      className="signal-study"
      aria-label={t("Synthetic signal comparison")}
    >
      <div className="signal-heading">
        <h2>{t("Read the evidence")}</h2>
        <span>{t("Authored diagrams · No calibrated time or units")}</span>
      </div>
      {condition !== "normal" && (
        <p className="signal-key">
          <span className="baseline-key" /> {t("Healthy baseline")}{" "}
          <span className="scenario-key" /> {t("Selected condition")}
        </p>
      )}
      <div className="signals">
        {[
          t("Flow"),
          t("Pressure rise"),
          t("Vibration"),
          t("Bearing temperature"),
        ].map((name, i) => (
          <div className="signal" key={name}>
            <div className="signal-name">{name}</div>
            <svg
              viewBox="0 0 210 52"
              role="img"
              aria-label={`${name}: ${conditions[condition].trends[i]}. ${t("Illustrative normalized trace.")}`}
            >
              <path
                d="M0 3V49H209"
                stroke="currentColor"
                opacity=".25"
                fill="none"
              />
              {condition !== "normal" && (
                <polyline
                  points={trace("normal", i)}
                  fill="none"
                  stroke="#686b63"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />
              )}
              <polyline
                points={trace(condition, i)}
                fill="none"
                stroke={condition === "normal" ? "#294853" : "#a44927"}
                strokeWidth="1.5"
              />
            </svg>
            <span>{conditions[condition].trends[i]}</span>
          </div>
        ))}
      </div>
      <p className="signal-note">
        {t(
          "Each chart uses its own qualitative scale. Compare a signal with its healthy baseline, not with another chart. These static examples do not advance with Play.",
        )}
      </p>
    </section>
  );
}
