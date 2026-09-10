import { RotateCcw } from "lucide-react";

export default function StaticExhibit() {
  return (
    <div className="fallback" role="status">
      <img
        src="/p101-poster.png"
        alt="Static healthy P-101 motor and centrifugal pump assembly"
      />
      <p>
        The 3D exhibit is unavailable. This image shows the healthy assembly.
        Component, sensor and condition lessons remain available.
      </p>
      <button onClick={() => location.reload()}>
        <RotateCcw size={16} /> Retry 3D exhibit
      </button>
    </div>
  );
}
