import { grammarForLesson } from './engine.mjs';
export function makeLesson(lesson, rows) {
  const structures=grammarForLesson(lesson);
  return rows.map(([type,sentence,options,translation,vocabulary,explanation,notes],i) => ({
    id:`${lesson}-${String(i+1).padStart(2,'0')}`, lesson, grammarId:structures[i].id,
    type:type==='v'?'vocabulary':'grammar', sentence, options, answer:options[0], translation,
    vocab:vocabulary.split(';').map(v=>v.split('|')), explanation,
    distractors:options.slice(1).map((choice,j)=>({choice,reason:notes.split('|')[j]})),
  }));
}
