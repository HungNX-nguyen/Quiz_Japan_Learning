import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { grammar, questions } from './data.mjs';
import { answerQuestion, createSession, grammarForLesson, readProgress, restoreSession, reviewNeedsRefresh, STORAGE_KEY } from './engine.mjs';

const lessons=[7,8,9,10];
const themes={7:'Cuộc sống & những khởi đầu',8:'Con người & các mối quan hệ',9:'Tính chất & những giới hạn',10:'Trường học & cuộc sống'};
const ranges={7:'Mẫu 01 — 20',8:'Mẫu 21 — 40',9:'Mẫu 41 — 60',10:'Mẫu 61 — 68 ↻ 01 — 12'};
const modes=[['all','Trộn cả hai'],['vocabulary','Từ vựng'],['grammar','Ngữ pháp'],['wrong','Câu cần ôn']];
const keyFor=(lesson,mode)=>`${lesson}:${mode}`;
const sourceHref=(name,page)=>`${location.protocol==='file:'?'../':'/sources/'}${name}${page?'#page='+page:''}`;
function initialState(){
  let saved={}; try{saved=readProgress(window.localStorage);}catch{}
  const results={};
  for(const q of questions){const a=saved.results?.[q.id];if(a && q.options.includes(a.choice))results[q.id]={choice:a.choice,correct:a.choice===q.answer};}
  const sessions={};
  for(const lesson of lessons)for(const [mode] of modes){const key=keyFor(lesson,mode),s=restoreSession(saved.sessions?.[key],questions);if(s && s.lesson===lesson && s.mode===mode)sessions[key]=s;}
  const lesson=lessons.includes(saved.lesson)?saved.lesson:7;
  const mode=modes.some(m=>m[0]===saved.mode)?saved.mode:'all';
  const key=keyFor(lesson,mode);
  sessions[key]??=createSession(questions,lesson,mode,Object.keys(results).filter(id=>!results[id].correct));
  return {lesson,mode,results,sessions};
}
function Icon({name,size=20,...rest}){
  const paths={book:<><path d="M12 5c-3-2-7-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-2-1-6-1-9 1Z"/><path d="M12 5v15"/></>,arrow:<path d="M5 12h14m-5-5 5 5-5 5"/>,check:<path d="m5 12 4 4L19 6"/>,retry:<><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/></>,leaf:<><path d="M20 3C7 1 2 7 5 15c8 3 15-1 15-12Z"/><path d="m4 20 11-11"/></>,close:<path d="m6 6 12 12M6 18 18 6"/>,list:<><path d="M9 6h12M9 12h12M9 18h12M3 6h.01M3 12h.01M3 18h.01"/></>,info:<><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/></>,spark:<><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/></>};
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>{paths[name]}</svg>;
}
function App(){
  const [model,setModel]=useState(initialState);
  const [storageOk,setStorageOk]=useState(true);
  const [modal,setModal]=useState(null);
  const titleRef=useRef(null),dialogRef=useRef(null),dialogOpener=useRef(null);
  const key=keyFor(model.lesson,model.mode),session=model.sessions[key];
  const q=session.items[session.index],answer=q?session.answers[q.id]:null;
  const done=session.index>=session.items.length && session.items.length>0;
  const wrongIds=Object.keys(model.results).filter(id=>!model.results[id].correct);
  const lessonWrong=wrongIds.filter(id=>questions.find(q=>q.id===id)?.lesson===model.lesson);
  const practiced=questions.filter(q=>q.lesson===model.lesson && model.results[q.id]).length;
  const correct=Object.values(session.answers).filter(a=>a.correct).length;
  const answered=Object.keys(session.answers).length;
  const structure=q?grammar.find(g=>g.id===q.grammarId):null;
  const completed=questions.filter(q=>model.results[q.id]?.correct).length;
  const totalPracticed=Object.keys(model.results).length;

  useEffect(()=>{try{window.localStorage.setItem(STORAGE_KEY,JSON.stringify(model));setStorageOk(true);}catch{setStorageOk(false);}},[model]);
  useEffect(()=>{if(session.index>0)titleRef.current?.focus();},[key,session.index]);
  useEffect(()=>{
    if(!modal)return;
    dialogOpener.current=document.activeElement;
    dialogRef.current?.focus();
    return ()=>dialogOpener.current?.focus?.();
  },[modal]);

  function switchTo(lesson,mode=model.mode,fresh=false){
    setModel(prev=>{
      const k=keyFor(lesson,mode),wrong=Object.keys(prev.results).filter(id=>!prev.results[id].correct);
      const existing=prev.sessions[k];
      const renew=fresh || !existing || mode==='wrong' && reviewNeedsRefresh(existing,questions,lesson,wrong);
      return {...prev,lesson,mode,sessions:{...prev.sessions,[k]:renew?createSession(questions,lesson,mode,wrong):existing}};
    });
  }
  function choose(choice){
    if(!q || answer)return;
    setModel(prev=>{
      const s=answerQuestion(prev.sessions[key],q.id,choice);
      if(s===prev.sessions[key])return prev;
      return {...prev,sessions:{...prev.sessions,[key]:s},results:{...prev.results,[q.id]:s.answers[q.id]}};
    });
  }
  function next(){if(!answer)return;setModel(prev=>({...prev,sessions:{...prev.sessions,[key]:{...prev.sessions[key],index:prev.sessions[key].index+1}}}));}
  useEffect(()=>{
    function onKey(event){
      if(modal){
        if(event.key==='Escape'){setModal(null);return;}
        if(event.key==='Tab'){
          const items=dialogRef.current?.querySelectorAll('button,a[href],summary');
          if(!items?.length)return;const first=items[0],last=items[items.length-1];
          if(event.shiftKey && (document.activeElement===first || document.activeElement===dialogRef.current)){event.preventDefault();last.focus();}
          else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
        }return;
      }
      if(event.altKey || event.ctrlKey || event.metaKey)return;
      if(/^[1-4]$/.test(event.key) && q && !answer){event.preventDefault();choose(q.options[Number(event.key)-1]);}
      if(event.key==='Enter' && answer && !event.target.closest?.('[data-shortcut-control]')){event.preventDefault();next();}
    }
    window.addEventListener('keydown',onKey);return ()=>window.removeEventListener('keydown',onKey);
  },[key,q,answer,modal]);

  return <>
    <header className="site-header"><a className="brand" href="#" onClick={e=>{e.preventDefault();switchTo(7,'all');}} data-shortcut-control><span className="brand-mark" lang="ja">漢</span><span>Kanji no Niwa<span className="brand-sub">Mỗi ngày, thêm một chút nhớ.</span></span></a>
      <nav aria-label="Điều hướng" data-shortcut-control><span className="nav-active">Luyện tập</span><button onClick={()=>setModal('grammar')}>Lộ trình ngữ pháp</button><button className="help-btn" aria-label="Hướng dẫn" onClick={()=>setModal('help')}><Icon name="info" size={18}/><span>Hướng dẫn</span></button></nav>
    </header>
    <div className="page-shell">
      <aside className="sidebar" aria-label="Chọn bài học" data-shortcut-control>
        <div className="sidebar-label">SỔ TAY KANJI <span>04 bài</span></div>
        <div className="lesson-list">{lessons.map(lesson=>{
          const count=questions.filter(q=>q.lesson===lesson && model.results[q.id]).length;
          return <button key={lesson} aria-current={lesson===model.lesson?'page':undefined} className={'lesson '+(lesson===model.lesson?'selected':'')} onClick={()=>switchTo(lesson)}><span className="lesson-number">{lesson}</span><span className="lesson-copy"><strong>Kanji bài {lesson}</strong><small>{ranges[lesson]}</small><span className="mini-track"><span style={{width:`${count*5}%`}}/></span></span>{count===20?<Icon name="check" size={15}/>:<span className="lesson-count">{count}/20</span>}</button>;
        })}</div>
        <div className="sidebar-note"><span className="leaf-stamp"><Icon name="leaf" size={25}/></span><h3>Học trong ngữ cảnh</h3><p>Một từ kanji, một cấu trúc.<br/>Kết nối để nhớ lâu hơn.</p><span className="note-line"/><p className="tiny">80 câu soạn sẵn<br/>68 mẫu ngữ pháp từ tài liệu</p></div>
        <div className="local-tag"><span/> Tiến độ lưu trên trình duyệt</div>
      </aside>

      <main>
        <div className="eyebrow"><span/> GÓC ÔN TẬP CỦA ANH</div>
        <div className="intro"><div><h1>Một câu, hai điều nhớ<span>.</span></h1><p>Ôn kanji cùng ngữ pháp. Hiểu cả câu, nhớ cả cách dùng.</p></div><span className="intro-kanji" lang="ja" aria-hidden="true">学</span></div>
        {!storageOk && <div className="storage-warning" role="status">Trình duyệt đang chặn lưu dữ liệu. Anh vẫn làm bài được; tiến độ chỉ được giữ khi trang đang mở.</div>}
        <div className="workspace">
          <section className="practice">
            <div className="lesson-heading"><div><span className="section-kicker">BÀI ĐANG HỌC</span><h2>Kanji bài {model.lesson}</h2><p>{themes[model.lesson]}</p></div><button className="text-button" data-shortcut-control onClick={()=>setModal('grammar')}><Icon name="list" size={17}/> 20 cấu trúc</button></div>
            <div className="mode-tabs" role="group" aria-label="Dạng ôn tập" data-shortcut-control>{modes.map(([mode,label])=><button key={mode} aria-pressed={model.mode===mode} className={model.mode===mode?'active':''} onClick={()=>switchTo(model.lesson,mode)}>{label}{mode==='wrong' && <span>{lessonWrong.length}</span>}</button>)}</div>

            {session.items.length===0?<div className="quiz-card empty"><span className="empty-icon"><Icon name="check" size={30}/></span><h3>Chưa có câu nào cần ôn lại</h3><p>Làm bài trước nhé. Những câu trả lời sai sẽ được gom vào đây.</p><button className="primary" onClick={()=>switchTo(model.lesson,'all')}>Vào luyện tập <Icon name="arrow"/></button></div>:
            done?<div className="quiz-card results"><span className="empty-icon"><Icon name="spark" size={30}/></span><span className="section-kicker">HOÀN THÀNH LƯỢT ÔN</span><h3>Thêm một bước tiến rồi!</h3><div className="result-score">{correct}<span> / {session.items.length}</span></div><p>câu đúng trong lượt này · {Math.round(correct/session.items.length*100)}%</p><div className="result-actions"><button className="primary" onClick={()=>switchTo(model.lesson,lessonWrong.length?'wrong':model.mode,true)}>{lessonWrong.length?'Ôn '+lessonWrong.length+' câu cần nhớ':'Làm lại lượt mới'} <Icon name="retry"/></button>{model.lesson<10?<button className="secondary" onClick={()=>switchTo(model.lesson+1,'all')}>Sang bài {model.lesson+1} <Icon name="arrow"/></button>:<button className="secondary" onClick={()=>switchTo(7,'all',true)}>Quay về bài 7 <Icon name="arrow"/></button>}</div><details><summary>Xem lại câu trong lượt này</summary><div className="result-list">{session.items.map(item=><div key={item.id}><Icon name={session.answers[item.id]?.correct?'check':'retry'} size={17}/><span lang="ja">{item.sentence.replace('（　）',`【${item.answer}】`)}</span></div>)}</div></details></div>:
            <article className="quiz-card" aria-label="Câu hỏi hiện tại">
              <div className="question-meta"><span className="type-pill"><Icon name={q.type==='vocabulary'?'book':'spark'} size={14}/>{q.type==='vocabulary'?'TỪ VỰNG TRONG CÂU':'CẤU TRÚC NGỮ PHÁP'}</span><span>Câu <strong>{session.index+1}</strong> / {session.items.length}</span></div>
              <div className="question-progress" role="progressbar" aria-label="Tiến độ lượt ôn" aria-valuenow={answered} aria-valuemin={0} aria-valuemax={session.items.length}><span style={{width:`${answered/session.items.length*100}%`}}/></div>
              <p className="question-instruction">Chọn đáp án phù hợp để hoàn thành câu.</p>
              <h3 className="japanese-sentence" ref={titleRef} tabIndex={-1} lang="ja">{q.sentence.split('（　）').map((part,i)=><React.Fragment key={i}>{i>0 && <span className={'blank '+(answer?'filled':'')} aria-label={answer?'Đáp án đúng: '+q.answer:'Chỗ trống'}>{answer?q.answer:'?'}</span>}{part}</React.Fragment>)}</h3>
              <div className="options" role="group" aria-label="Bốn đáp án">{q.options.map((option,i)=>{
                const isCorrect=answer && option===q.answer,isWrong=answer && option===answer.choice && !answer.correct;
                return <button className={'option '+(isCorrect?'correct ':isWrong?'incorrect ':'')+(answer && option===answer.choice?'chosen':'')} key={option} onClick={()=>choose(option)} disabled={!!answer} aria-label={`Đáp án ${i+1}: ${option}`}><span className="option-letter">{'ABCD'[i]}</span><span lang="ja">{option}</span>{isCorrect?<Icon name="check" size={20}/>:isWrong?<Icon name="close" size={20}/>:<kbd>{i+1}</kbd>}</button>;
              })}</div>
              {!answer?<div className="question-bottom"><span><span className="small-dot"/> Chỉ có một đáp án đúng</span><span className="keyboard-hint">Phím <kbd>1</kbd> – <kbd>4</kbd> để chọn</span></div>:<section className={'feedback '+(answer.correct?'success':'needs-review')} aria-live="polite">
                <div className="feedback-heading"><span className="feedback-icon"><Icon name={answer.correct?'check':'retry'} size={20}/></span><div><h4>{answer.correct?'Đúng rồi, anh nhớ tốt đấy!':'Mình ghi nhớ lại câu này nhé.'}</h4><p>Đáp án đúng: <strong lang="ja">{q.answer}</strong>{!answer.correct && <> · Anh chọn: <span lang="ja">{answer.choice}</span></>}</p></div></div>
                <p className="translation">{q.translation}</p>
                <div className="explanation"><span className="section-kicker">VÌ SAO ĐÚNG?</span><p>{q.explanation}</p><div className="grammar-chip"><span lang="ja">{structure.title}</span><span>{structure.meaning}</span></div></div>
                <div className="vocab-row">{q.vocab.map(([word,reading,meaning])=><div key={word}><strong lang="ja">{word}</strong><span lang="ja">{reading}</span><small>{meaning}</small></div>)}</div>
                <details className="distractors"><summary>Vì sao 3 đáp án còn lại không phù hợp?</summary>{q.distractors.map(d=><p key={d.choice}><strong lang="ja">{d.choice}</strong> — {d.reason}</p>)}</details>
                <div className="source-line">Nguồn: <a href={sourceHref(`KANJI-${q.lesson}.txt`)} target="_blank" rel="noreferrer">Kanji bài {q.lesson}</a> · <a href={sourceHref('1-7.pdf',structure.page)} target="_blank" rel="noreferrer">PDF trang {structure.page}, mục {structure.sourceId}</a></div>
                <div className="next-row"><span className="keyboard-hint"><kbd>Enter</kbd> để tiếp tục</span><button className="primary" onClick={next}>{session.index===session.items.length-1?'Xem kết quả':'Câu tiếp theo'} <Icon name="arrow" size={18}/></button></div>
              </section>}
            </article>}
            <p className="under-card"><Icon name="leaf" size={15}/> Không cần vội. Hiểu lý do quan trọng hơn chọn thật nhanh.</p>
          </section>

          <aside className="insights" aria-label="Tiến độ học tập">
            <div className="progress-card"><span className="section-kicker">TỪNG CHÚT MỘT</span><h3>Vườn kiến thức của anh</h3><div className="progress-ring" style={{'--progress':`${completed/80*360}deg`}}><div><strong>{completed}<span>/80</span></strong><small>câu nhớ đúng</small></div></div><div className="stat-row"><span><i className="stat-dot purple"/> Đã thử</span><strong>{totalPracticed} câu</strong></div><div className="stat-row"><span><i className="stat-dot peach"/> Cần ôn lại</span><strong>{wrongIds.length} câu</strong></div><p className="stats-note">Tính theo lần trả lời gần nhất.<br/>Ôn đúng sẽ xóa câu khỏi danh sách cần ôn.</p></div>
            <div className="route-card"><span className="section-kicker">LỘ TRÌNH BÀI {model.lesson}</span><div className="route-numbers"><strong>{practiced}<span>/20</span></strong><span>câu đã thử</span></div><p>{ranges[model.lesson]}<br/><span>Theo thứ tự mẫu thực có trong PDF.</span></p><button className="text-button" data-shortcut-control onClick={()=>setModal('grammar')}>Xem các cấu trúc <Icon name="arrow" size={16}/></button></div>
            <div className="study-tip"><Icon name="spark" size={18}/><p><strong>Mẹo nhỏ</strong>Đọc trọn câu trước khi nhìn đáp án. Tìm dấu hiệu ngữ pháp, rồi chọn từ.</p></div>
          </aside>
        </div>
        <footer>漢字の庭 <span>·</span> Học đều một chút, nhớ thêm một chút. <span className="offline">React · Dùng được khi ngoại tuyến</span></footer>
      </main>
    </div>
    {modal && <div className="modal-backdrop" onClick={e=>{if(e.target===e.currentTarget)setModal(null);}}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} ref={dialogRef}><div className="modal-top"><div><span className="section-kicker">KANJI NO NIWA</span><h2 id="modal-title">{modal==='grammar'?`20 cấu trúc · Kanji bài ${model.lesson}`:'Một góc học thật đơn giản'}</h2></div><button className="icon-button" aria-label="Đóng" onClick={()=>setModal(null)}><Icon name="close"/></button></div>
      {modal==='grammar'?<><p className="modal-note">PDF có 68 mẫu thực có; không có mục 13, 31, 32. Lộ trình chia 20 mẫu theo thứ tự xuất hiện; bài 10 quay về đầu khi dùng hết mẫu.</p><ol className="grammar-list">{grammarForLesson(model.lesson).map((g,i)=><li key={i}><span className="grammar-index">{String(i+1).padStart(2,'0')}</span><div><strong lang="ja">{g.title}</strong><p>{g.meaning}</p><small>{g.rule}</small><a href={sourceHref('1-7.pdf',g.page)} target="_blank" rel="noreferrer">Mục gốc {g.sourceId} · PDF trang {g.page} ↗</a></div></li>)}</ol></>:<div className="help-content"><p>Mỗi bài có 20 câu soạn sẵn, kết hợp từ trong file kanji tương ứng với 20 cấu trúc được phân cho bài đó. Đây là bộ câu khởi đầu, chưa bao phủ mọi từ trong 4 file.</p><ol><li>Chọn bài 7, 8, 9 hoặc 10 ở sổ tay bên trái.</li><li>Chọn trộn cả hai, từ vựng hoặc ngữ pháp. Các lựa chọn và thứ tự câu được đảo ở mỗi lượt mới.</li><li>Chọn một đáp án để xem câu hoàn chỉnh, nghĩa tiếng Việt và lý do đúng/sai.</li><li>Vào “Câu cần ôn” để luyện lại câu trả lời sai. Trả lời đúng sẽ xóa câu đó khỏi danh sách.</li></ol><p><kbd>1</kbd>–<kbd>4</kbd> chọn đáp án · <kbd>Enter</kbd> câu tiếp theo · <kbd>Esc</kbd> đóng cửa sổ.</p><p>Tiến độ và lượt làm đang dở được lưu trên trình duyệt này. Chế độ ẩn danh, xóa dữ liệu hoặc chuyển trình duyệt có thể làm mất tiến độ. File HTML hoạt động ngoại tuyến.</p><p>Ngân hàng câu được soạn sẵn; trang không tự sinh câu mới. “Lượt mới” đảo lại các câu hiện có.</p></div>}
    </section></div>}
  </>;
}
createRoot(document.getElementById('root')).render(<App/>);
