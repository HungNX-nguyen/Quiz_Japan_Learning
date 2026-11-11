// Đọc các file KANJI-*.txt (thư mục cha của dự án) và sinh src/kanjiDict.mjs cho chức năng tra cứu.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const LESSONS=[7,8,9,10];
const JP=/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
const HEAD=/^\s*([～~]?\s*[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー々〆・·～~](?:[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー々〆・·～~ ]*[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー々〆・·～~])?)\s*[-－]\s*(.*)$/u;
const KANA_RUN=/[\p{Script=Hiragana}\p{Script=Katakana}ー～~][\p{Script=Hiragana}\p{Script=Katakana}ー～~・/／\s]*/u;

const unwrapUpper=s=>s.replace(/\(([^()]*)\)/g,(m,inner)=>inner.trim() && inner===inner.toLocaleUpperCase('vi') && /\p{Lu}/u.test(inner)?' '+inner+' ':m);
const clean=s=>unwrapUpper(s).replace(/[「」\[\]【】◆]/g,' ').replace(/\s+/g,' ').trim();
// Hán Việt trong file luôn viết HOA (vd. "KẾT QUẢ", "ĐƠN, ĐAN VỊ").
const isUpperWord=w=>/\p{Lu}/u.test(w) && w===w.toLocaleUpperCase('vi') && !JP.test(w);

export function parseEntryText(rest){
  let reading='',text=rest;
  const m=text.match(KANA_RUN);
  if(m){reading=m[0].trim().replace(/\s*[/／]\s*/g,'・').replace(/\s+/g,'').replace(/~/g,'～');text=(text.slice(0,m.index)+' '+text.slice(m.index+m[0].length));}
  text=text.replace(/[\p{Script=Han}]+/gu,' ');               // "以前 いぜん" lặp lại chữ Hán
  const words=clean(text).replace(/^[-_.\s]+|[-_.\s]+$/g,'').split(' ').filter(Boolean);
  const hv=[],meaning=[];
  for(const w of words){
    const bare=w.replace(/[(),.;:_-]/g,'');
    if(bare && isUpperWord(bare))hv.push(w.replace(/[()]/g,''));
    else meaning.push(w);
  }
  return {reading,hanviet:hv.join(' ').replace(/\s*,\s*/g,', ').replace(/[,\s]+$/,''),meaning:meaning.join(' ').replace(/^[-_\s]+|[-_\s.]+$/g,'').replace(/\s+([,;])/g,'$1')};
}

export function parseKanjiFile(source,lesson){
  const entries=[];let cur=null;
  for(const raw of source.replace(/^﻿/,'').split(/\r?\n/)){
    const line=raw.trim();if(!line)continue;
    const head=line.match(HEAD);
    if(head){
      const word=head[1].replace(/\s+/g,'').replace(/[·・]+$/,'').replace(/~/g,'～');
      cur={word,lesson,...parseEntryText(head[2]),notes:[]};
      entries.push(cur);continue;
    }
    if(!cur)continue;
    const extra=parseEntryText(line);
    if(JP.test(line.replace(/[～~]/g,'')) && /[\p{Script=Han}]/u.test(line) || /[:：]/.test(line)){  // ví dụ / cụm từ
      const lead=line.match(/^[^\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+(?=[\p{Script=Han}])/u);
      if(!cur.meaning && lead && /\p{Ll}/u.test(lead[0]) && !/[:：]/.test(lead[0])){cur.meaning=clean(lead[0]).replace(/[,\s]+$/,'');cur.notes.push(clean(line.slice(lead[0].length)));}
      else cur.notes.push(clean(line));
    }
    else{
      if(!cur.reading && extra.reading)cur.reading=extra.reading;
      if(extra.hanviet && !cur.hanviet)cur.hanviet=extra.hanviet;
      else if(extra.hanviet)cur.meaning=[cur.meaning,extra.hanviet].filter(Boolean).join('; ');
      if(extra.meaning)cur.meaning=[cur.meaning,extra.meaning].filter(Boolean).join('; ');
    }
  }
  return entries.filter(e=>e.reading||e.meaning||e.hanviet).map(e=>{if(!e.notes.length)delete e.notes;return e;});
}

if(process.argv[1] && fileURLToPath(import.meta.url)===process.argv[1]){
  const all=[];
  for(const lesson of LESSONS){
    const file=new URL(`../../KANJI-${lesson}.txt`,import.meta.url);
    let text;try{text=await readFile(file,'utf8');}catch{console.warn(`Bỏ qua: không tìm thấy ${fileURLToPath(file)}`);continue;}
    all.push(...parseKanjiFile(text,lesson));
  }
  if(!all.length){console.warn('Không đọc được file KANJI nào, giữ nguyên src/kanjiDict.mjs.');process.exit(0);}
  const out=`// Tự sinh bởi scripts/gen-dict.mjs từ KANJI-7..10.txt. Không sửa tay.\nexport const kanjiEntries=${JSON.stringify(all)};\n`;
  await writeFile(new URL('../src/kanjiDict.mjs',import.meta.url),out);
  console.log(`Generated src/kanjiDict.mjs (${all.length} entries).`);
}
