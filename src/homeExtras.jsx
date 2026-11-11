import React, { useMemo, useState } from 'react';
import { shuffle } from './engine.mjs';

export const DAYS_KEY = 'kanji-no-niwa-days';
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function readStudyDays() {
  try { const v = JSON.parse(window.localStorage.getItem(DAYS_KEY) || '[]'); return Array.isArray(v) ? v.filter(x => typeof x === 'string') : []; } catch { return []; }
}
export function addStudyDay(days, today = dayKey()) {
  if (days.includes(today)) return days;
  return [...days, today].slice(-400);
}
/** Consecutive study days ending today (or yesterday, so the streak survives until you study today). */
export function streakOf(days, now = new Date()) {
  const set = new Set(days);
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
export function lastSevenDays(days, now = new Date()) {
  const set = new Set(days);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + i);
    return { label: WEEKDAYS[d.getDay()], key: dayKey(d), done: set.has(dayKey(d)), today: i === 6 };
  });
}

export function StreakWeek({ days }) {
  const week = lastSevenDays(days), streak = streakOf(days);
  return (
    <div className="streak">
      <div className="streak-head"><span>Chuỗi ngày học</span><strong>{streak} ngày</strong></div>
      <ol className="streak-week" aria-label={`Bảy ngày gần nhất, đã học ${week.filter(d => d.done).length} ngày`}>
        {week.map(d => (
          <li key={d.key} className={(d.done ? 'done' : '') + (d.today ? ' today' : '')} title={d.key}>
            <span className="streak-dot" aria-hidden="true" />
            <small>{d.label}</small>
            <span className="sr-only">{d.done ? 'đã học' : 'chưa học'}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** One vocabulary word per calendar day, taken from the quiz bank with its example sentence. */
export function DailyKanji({ Icon, questions, onStart }) {
  const entry = useMemo(() => {
    const words = [];
    const seen = new Set();
    for (const q of questions) for (const [word, reading, meaning] of q.vocab) {
      if (!word || seen.has(word) || !/[一-龯]/.test(word)) continue;
      seen.add(word); words.push({ word, reading, meaning, q });
    }
    const now = new Date();
    const dayNumber = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 864e5);
    return words[dayNumber % words.length];
  }, [questions]);
  if (!entry) return null;
  const { word, reading, meaning, q } = entry;
  const sentence = q.sentence.replace('（　）', q.answer);
  const parts = sentence.split(word);
  return (
    <article className="daily-card">
      <div className="daily-top">
        <span className="section-kicker">KANJI CỦA NGÀY</span>
        <span className="daily-date">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}</span>
      </div>
      <div className="daily-word">
        <span className="daily-kanji" lang="ja">{word}</span>
        <div>
          <span className="daily-reading" lang="ja">{reading}</span>
          <strong className="daily-meaning">{meaning}</strong>
        </div>
      </div>
      <p className="daily-example" lang="ja">{parts.map((p, i) => <React.Fragment key={i}>{i > 0 && <mark>{word}</mark>}{p}</React.Fragment>)}</p>
      <p className="daily-translation">{q.translation}</p>
      <button className="text-button" onClick={() => onStart(q.lesson)}>Luyện bài {q.lesson} có từ này <Icon name="arrow" size={16} /></button>
    </article>
  );
}

/** A taste of the quiz right on the home page. Not saved to progress. */
export function TryQuestion({ Icon, questions, onStart }) {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * questions.length));
  const [choice, setChoice] = useState(null);
  const q = questions[seed % questions.length];
  const options = useMemo(() => shuffle(q.options), [q]);
  const parts = q.sentence.split('（　）');
  const correct = choice === q.answer;
  function another() { setChoice(null); setSeed(s => s + 1 + Math.floor(Math.random() * (questions.length - 1))); }
  return (
    <article className="try-card" aria-labelledby="try-title">
      <div className="daily-top">
        <span className="section-kicker" id="try-title">THỬ NGAY MỘT CÂU</span>
        <span className="try-tag">Bài {q.lesson} · {q.type === 'vocabulary' ? 'Từ vựng' : 'Ngữ pháp'}</span>
      </div>
      <p className="try-sentence" lang="ja">{parts.map((p, i) => <React.Fragment key={i}>{i > 0 && <span className={'blank' + (choice ? ' filled' : '')}>{choice ? q.answer : '?'}</span>}{p}</React.Fragment>)}</p>
      <div className="try-options" role="group" aria-label="Chọn đáp án">
        {options.map(o => {
          const state = choice ? (o === q.answer ? ' correct' : o === choice ? ' incorrect' : '') : '';
          return <button key={o} lang="ja" className={'try-option' + state} disabled={!!choice} onClick={() => setChoice(o)}>{o}{state === ' correct' && <Icon name="check" size={16} />}{state === ' incorrect' && <Icon name="close" size={16} />}</button>;
        })}
      </div>
      <div className="try-result" aria-live="polite">
        {choice && <>
          <p className={'try-verdict ' + (correct ? 'ok' : 'bad')}>{correct ? 'Chính xác!' : <>Chưa đúng — đáp án là <strong lang="ja">{q.answer}</strong>.</>}</p>
          <p className="try-translation">{q.translation}</p>
        </>}
      </div>
      <div className="try-actions">
        <button className="secondary" onClick={another}><Icon name="retry" size={16} /> Câu khác</button>
        <button className="primary" onClick={() => onStart(q.lesson)}>Luyện bài {q.lesson} <Icon name="arrow" size={16} /></button>
      </div>
      <small className="try-note">Câu thử không tính vào tiến độ.</small>
    </article>
  );
}
