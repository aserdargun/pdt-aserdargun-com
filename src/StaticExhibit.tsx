import type { Locale } from "./data";
import { translator } from "./i18n";
import { RotateCcw } from "lucide-react";

export default function StaticExhibit({ locale }: { locale: Locale }) {
  const t = translator(locale);
  return (
    <div className="fallback" role="status">
      <img
        src="/p101-poster.png"
        alt={t("Static healthy P-101 motor and centrifugal pump assembly")}
      />
      <p>
        {t(
          "The 3D exhibit is unavailable. This image shows the healthy assembly. Component, sensor and condition lessons remain available.",
        )}
      </p>
      <button onClick={() => location.reload()}>
        <RotateCcw size={16} /> {t("Retry 3D exhibit")}
      </button>
    </div>
  );
}
