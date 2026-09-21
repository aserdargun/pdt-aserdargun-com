import test from "node:test";
import assert from "node:assert/strict";
import { validateCatalog } from "@aserdargun/lab-core";
import {
  manifest,
  experiments,
  guidedLesson,
  initialRoute,
} from "../src/ils/catalog.ts";
import concepts from "../src/ils/concepts.json" with { type: "json" };
import { conditions } from "../src/data.ts";
test("ILS condition studies preserve authored explanations and synthetic evidence", () => {
  assert.deepEqual(
    validateCatalog(
      manifest,
      experiments,
      [guidedLesson],
      concepts.map((c) => c.id),
    ),
    [],
  );
  assert.deepEqual(
    experiments.map((e) => e.id),
    Object.keys(conditions),
  );
  assert.deepEqual(
    guidedLesson.steps.map((s) => s.explanation.en),
    Object.values(conditions).map((c) =>
      [c.physical, c.signal, c.interpretation].join("\n\n"),
    ),
  );
  assert.equal(manifest.evidence[0].kind, "simulated");
});
test("only authored conditions and views can initialize the exhibit", () => {
  assert.equal(
    initialRoute("?condition=bearing&view=cutaway").condition,
    "bearing",
  );
  assert.equal(
    initialRoute("?condition=constructor&view=prototype&ils=bad").condition,
    "normal",
  );
  assert.equal(
    initialRoute("?condition=constructor&view=prototype&ils=bad").view,
    "assembly",
  );
});

test("Turkish lessons retain every authored physical change, observation and interpretation", async () => {
  const { exhibitContent } = await import("../src/data.ts");
  const tr = exhibitContent("tr");
  for (const experiment of experiments) {
    const c = tr.conditions[experiment.id];
    assert.equal(experiment.description.tr, c.physical);
    assert.equal(experiment.observations[0].explanation.tr, c.signal);
    assert.equal(experiment.learningObjectives[0].tr, c.interpretation);
    assert.equal(
      guidedLesson.steps.find((s) => s.id === experiment.id).explanation.tr,
      [c.physical, c.signal, c.interpretation].join("\n\n"),
    );
  }
  assert.deepEqual(
    tr.sensors.map((s) => [s.id, s.component, s.point]),
    exhibitContent("en").sensors.map((s) => [s.id, s.component, s.point]),
  );
  for (const item of [...tr.components, ...tr.sensors])
    assert.ok(item.name && (item.detail || item.description));
  assert.equal(
    initialRoute("?lang=tr&condition=restriction&view=sensors").locale,
    "tr",
  );
});
