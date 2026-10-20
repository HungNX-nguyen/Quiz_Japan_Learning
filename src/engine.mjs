import { grammar } from './grammar.mjs';
export const STORAGE_KEY = 'kanji-no-niwa-v1';
export function grammarForLesson(lesson) {
  if (![7,8,9,10].includes(lesson)) return [];
  return Array.from({length:20}, (_,i) => grammar[((lesson-7)*20+i)%grammar.length]);
}
export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i=result.length-1;i>0;i--) { const j=Math.floor(random()*(i+1)); [result[i],result[j]]=[result[j],result[i]]; }
  return result;
}
export function createSession(bank, lesson, mode = 'all', wrongIds = [], random = Math.random) {
  const eligible = bank.filter(q => q.lesson===lesson && (mode==='all' || (mode==='wrong' ? wrongIds.includes(q.id) : q.type===mode)));
  return { lesson, mode, index:0, answers:{}, items:shuffle(eligible,random).map(q => ({...q, options:shuffle(q.options,random)})) };
}
export function answerQuestion(session,id,choice) {
  const q=session.items[session.index];
  if (!q || q.id!==id || session.answers[id] || !q.options.includes(choice)) return session;
  return {...session,answers:{...session.answers,[id]:{choice,correct:choice===q.answer}}};
}
export function getWrongIds(session) { return Object.keys(session.answers).filter(id=>!session.answers[id].correct); }
export function reviewNeedsRefresh(session, bank, lesson, wrongIds) {
  if(!session)return true;
  const expected=bank.filter(q=>q.lesson===lesson && wrongIds.includes(q.id)).map(q=>q.id);
  return expected.length!==session.items.length || expected.some(id=>!session.items.some(q=>q.id===id));
}
export function restoreSession(value,bank) {
  if (!value || ![7,8,9,10].includes(value.lesson) || !['all','grammar','vocabulary','wrong'].includes(value.mode) || !Array.isArray(value.items) || !value.items.length || value.items.length>20 || !Number.isInteger(value.index) || value.index<0 || value.index>value.items.length || !value.answers || typeof value.answers!=='object' || Array.isArray(value.answers)) return null;
  const used=new Set();
  const items=[];
  for(const item of value.items) {
    const source=bank.find(q=>q.id===item?.id && q.lesson===value.lesson);
    if(!source || used.has(item.id) || !Array.isArray(item.options) || item.options.length!==4 || new Set(item.options).size!==4 || item.options.some(o=>!source.options.includes(o))) return null;
    if (['grammar','vocabulary'].includes(value.mode) && source.type!==value.mode) return null;
    used.add(item.id); items.push({...source,options:item.options});
  }
  const answers={};
  for(const [id,a] of Object.entries(value.answers)) {
    const q=items.find(q=>q.id===id);
    if(!q || !a || !q.options.includes(a.choice)) return null;
    answers[id]={choice:a.choice,correct:a.choice===q.answer};
  }
  if(items.slice(0,value.index).some(q=>!answers[q.id]) || items.slice(value.index+1).some(q=>answers[q.id])) return null;
  return {...value,items,answers};
}
export function readProgress(storage) {
  try {
    const value=JSON.parse(storage.getItem(STORAGE_KEY)||'{}');
    return value && typeof value==='object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}
