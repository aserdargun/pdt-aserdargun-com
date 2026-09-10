import {parseManifest,type ExperimentDefinition,type LessonDefinition} from '@aserdargun/lab-core';
import raw from '../../lab.manifest.json' with {type:'json'};
import rawExperiments from './experiments.json' with {type:'json'};
import {conditions,views,type Condition,type View} from '../data.ts';
export const manifest=parseManifest(raw);
export const experiments=rawExperiments as ExperimentDefinition<{condition:Condition}>[];
export const guidedLesson:LessonDefinition={schemaVersion:'0.1',id:'pump-conditions',title:manifest.lessons![0].title,concepts:manifest.concepts,steps:Object.entries(conditions).map(([id,c])=>({id,title:{en:c.title},explanation:{en:[c.physical,c.signal,c.interpretation].join('\n\n')},experimentId:id,completion:{kind:'manual'}}))};
export function initialRoute(search:string){const p=new URLSearchParams(search);return {condition:(experiments.find(e=>e.id===p.get('condition'))?.id??'normal') as Condition,view:(views.find(v=>v.id===p.get('view'))?.id??'assembly') as View,locale:p.get('lang')==='tr'?'tr' as const:'en' as const,lesson:p.get('lesson')===guidedLesson.id};}
