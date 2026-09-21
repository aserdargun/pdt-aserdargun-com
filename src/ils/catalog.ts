import {
  parseManifest,
  type ExperimentDefinition,
  type LessonDefinition,
} from "@aserdargun/lab-core";
import raw from "../../lab.manifest.json" with { type: "json" };
import {
  conditions,
  exhibitContent,
  views,
  type Condition,
  type View,
} from "../data.ts";

export const manifest = parseManifest(raw);
const tr = exhibitContent("tr").conditions;
export const experiments: (ExperimentDefinition<{ condition: Condition }> & {
  config: { condition: Condition };
})[] = Object.entries(conditions).map(([key, c]) => {
  const id = key as Condition;
  return {
    schemaVersion: "0.1",
    id,
    title: { en: c.label, tr: tr[id].label },
    guidingQuestion: {
      en: `What can the signals reveal about ${c.label.toLowerCase()}, and what remains unknown?`,
      tr: `${tr[id].label} durumunda sinyaller neyi gösterebilir, ne bilinmez kalır?`,
    },
    description: { en: c.physical, tr: tr[id].physical },
    concepts: manifest.concepts,
    learningObjectives: [{ en: c.interpretation, tr: tr[id].interpretation }],
    observations: [
      {
        id: "signal-response",
        label: { en: "Signal response", tr: "Sinyal yanıtı" },
        explanation: { en: c.signal, tr: tr[id].signal },
        evidenceRefs: ["signals"],
      },
    ],
    assumptionRefs: ["fictional-asset", "observer-signals"],
    evidenceRefs: ["signals", "selection"],
    config: { condition: id },
  };
});
export const guidedLesson: LessonDefinition = {
  schemaVersion: "0.1",
  id: "pump-conditions",
  title: manifest.lessons![0].title,
  concepts: manifest.concepts,
  steps: experiments.map((e) => ({
    id: e.id,
    title: {
      en: conditions[e.config.condition].title,
      tr: tr[e.config.condition].title,
    },
    explanation: {
      en: [
        conditions[e.config.condition].physical,
        conditions[e.config.condition].signal,
        conditions[e.config.condition].interpretation,
      ].join("\n\n"),
      tr: [
        tr[e.config.condition].physical,
        tr[e.config.condition].signal,
        tr[e.config.condition].interpretation,
      ].join("\n\n"),
    },
    experimentId: e.id,
    completion: { kind: "manual" },
  })),
};
export function initialRoute(search: string) {
  const p = new URLSearchParams(search);
  return {
    condition: (experiments.find((e) => e.id === p.get("condition"))?.id ??
      "normal") as Condition,
    view: (views.find((v) => v.id === p.get("view"))?.id ?? "assembly") as View,
    locale: p.get("lang") === "tr" ? ("tr" as const) : ("en" as const),
    lesson: p.get("lesson") === guidedLesson.id,
  };
}
