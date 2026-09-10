import test from 'node:test';import assert from 'node:assert/strict';
import {validateCatalog} from '@aserdargun/lab-core';
import {manifest,experiments,guidedLesson,initialRoute} from '../src/ils/catalog.ts';
import concepts from '../src/ils/concepts.json' with {type:'json'};
import {conditions} from '../src/data.ts';
test('ILS condition studies preserve authored explanations and synthetic evidence',()=>{
 assert.deepEqual(validateCatalog(manifest,experiments,[guidedLesson],concepts.map(c=>c.id)),[]);
 assert.deepEqual(experiments.map(e=>e.id),Object.keys(conditions));
 assert.deepEqual(guidedLesson.steps.map(s=>s.explanation.en),Object.values(conditions).map(c=>[c.physical,c.signal,c.interpretation].join('\n\n')));
 assert.equal(manifest.evidence[0].kind,'simulated');
});
test('only authored conditions and views can initialize the exhibit',()=>{
 assert.equal(initialRoute('?condition=bearing&view=cutaway').condition,'bearing');
 assert.equal(initialRoute('?condition=constructor&view=prototype&ils=bad').condition,'normal');
 assert.equal(initialRoute('?condition=constructor&view=prototype&ils=bad').view,'assembly');
});
