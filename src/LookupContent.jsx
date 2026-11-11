import React from 'react';
import { lookupText } from './lookup.mjs';
const sourceLabel=e=>[e.sources.includes('kanji')?'file KANJI':null,e.sources.includes('quiz')?'từ vựng quiz':null].filter(Boolean).join(' + ');
function Entry({e}){
 return <section className="lookup-entry">
  <h3 lang="ja">{e.word}{e.hanviet && <span className="lookup-hanviet">{e.hanviet}</span>}</h3>
  {e.reading && <p className="lookup-reading" lang="ja">{e.reading}</p>}
  {e.meaning && <p className="lookup-meaning">{e.meaning}</p>}
  {e.notes?.length>0 && <ul className="lookup-notes">{e.notes.map((n,i)=><li key={i} lang="ja">{n}</li>)}</ul>}
  <small>Nguồn: {sourceLabel(e)} · Bài {e.lessons.join(', ')}</small>
 </section>;
}
export function LookupContent({text}){
 const result=lookupText(text);
 return <div className="lookup-content">
  <div className="lookup-term" lang="ja">{result.text}</div>
  {result.kind==='word' && result.base!==result.text && <p className="lookup-note">Dạng gốc: <strong lang="ja">{result.base}</strong></p>}
  {result.kind==='components' && <p className="lookup-note">Chưa có giải thích riêng cho cả cụm. Các từ nhận diện được trong cụm:</p>}
  {result.kind==='unknown' && <p className="lookup-note">Từ hoặc cụm này chưa có trong từ điển bài học (file KANJI 7–10 và từ vựng quiz).{result.related.length>0?' Các từ có cùng chữ Hán:':' Anh có thể mở liên kết bên dưới để tra thêm.'}</p>}
  {result.entries.map((e,i)=><Entry key={e.word+i} e={e}/>)}
  {result.related.map((e,i)=><Entry key={'r'+e.word+i} e={e}/>)}
  {result.structures.map(g=><section className="lookup-entry" key={g.id}><h3 lang="ja">{g.title}</h3><p className="lookup-meaning">{g.meaning}</p><p>{g.rule}</p><small>Nguồn: tài liệu ngữ pháp · Mục {g.sourceId}, PDF trang {g.page}</small></section>)}
  <a className="secondary lookup-external" href={'https://jisho.org/search/'+encodeURIComponent(result.base||result.text)} target="_blank" rel="noreferrer">Tra thêm trên Jisho ↗</a>
  <p className="lookup-footnote">Nghĩa tiếng Việt lấy từ file KANJI 7–10 và từ vựng trong bài. Liên kết Jisho mở trang ngoài và cần mạng.</p>
 </div>;
}
