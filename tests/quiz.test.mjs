import test from 'node:test';
import assert from 'node:assert/strict';
import { grammarForLesson, createSession, answerQuestion, getWrongIds, readProgress, restoreSession } from '../src/engine.mjs';
import { grammar, questions } from '../src/data.mjs';

test('20 actual grammar entries per lesson, wrapping after the final entry', () => {
  assert.equal(grammar.length, 68);
  assert.deepEqual(grammarForLesson(7).map(g => g.sourceId), [1,2,3,4,5,6,7,8,9,10,11,12,14,15,16,17,18,19,20,21]);
  assert.deepEqual(grammarForLesson(10).map(g => g.sourceId), [64,65,66,67,68,69,70,71,1,2,3,4,5,6,7,8,9,10,11,12]);
});

test('question bank covers every assigned structure with four choices and one blank', () => {
  assert.equal(questions.length, 80);
  assert.equal(new Set(questions.map(q => q.id)).size, 80);
  for (const lesson of [7,8,9,10]) {
    const bank = questions.filter(q => q.lesson === lesson);
    assert.equal(bank.length, 20);
    assert.deepEqual(bank.map(q => q.grammarId), grammarForLesson(lesson).map(g => g.id));
    for (const q of bank) {
      assert.equal((q.sentence.match(/（　）/g) || []).length, 1, q.id);
      assert.equal(q.options.length, 4, q.id);
      assert.equal(new Set(q.options).size, 4, q.id);
      assert.ok(q.options.includes(q.answer), q.id);
      assert.ok(q.translation && q.explanation && q.vocab.length && q.distractors.length === 3, q.id);
      assert.ok(q.vocab.some(v => (q.sentence+q.answer).includes(v[0].replace(/[ぁ-ゖ]+$/u,''))), q.id);
      assert.ok(q.vocab.every(v => v.length === 3 && v.every(Boolean)), q.id);
    }
  }
});

test('shuffling keeps answers valid and grading cannot be repeated', () => {
  const s = createSession(questions, 7, 'all', [], () => 0.25);
  assert.equal(s.items.length, 20);
  const q = s.items[0];
  assert.deepEqual(new Set(q.options), new Set(questions.find(item => item.id === q.id).options));
  const graded = answerQuestion(s, q.id, q.answer);
  assert.equal(Object.keys(graded.answers).length, 1);
  assert.equal(graded.answers[q.id].correct, true);
  assert.deepEqual(answerQuestion(graded, q.id, 'bad'), graded);
  assert.deepEqual(answerQuestion(s, q.id, 'bad'), s);
  assert.deepEqual(answerQuestion(s, s.items[1].id, s.items[1].answer), s);
});

test('review includes only wrong questions, and filters may be empty', () => {
  const s = createSession(questions, 8, 'all', [], () => 0.5);
  const first = s.items[0];
  const g = answerQuestion(s, first.id, first.options.find(x => x !== first.answer));
  assert.deepEqual(getWrongIds(g), [first.id]);
  assert.equal(createSession(questions, 8, 'wrong', [first.id]).items.length, 1);
  assert.equal(createSession(questions, 7, 'wrong', [first.id]).items.length, 0);
  for (const kind of ['vocabulary','grammar']) {
    assert.ok(createSession(questions, 7, kind).items.every(q => q.type === kind));
  }
});

test('storage corruption, blocked storage and stale sessions fall back safely', () => {
  assert.deepEqual(readProgress({ getItem: () => '{bad' }), {});
  assert.deepEqual(readProgress({ getItem: () => { throw Error('blocked'); } }), {});
  assert.deepEqual(readProgress({ getItem: () => '[]' }), {});
  assert.equal(restoreSession({ items: [{ id: 'missing' }] }, questions), null);
  const s = createSession(questions, 10, 'all');
  assert.deepEqual(restoreSession(JSON.parse(JSON.stringify(s)), questions), s);
  assert.equal(restoreSession({ ...s, index: -1 }, questions), null);
});

test('review notices added or resolved mistakes when entering the mode again', async () => {
  const { reviewNeedsRefresh } = await import('../src/engine.mjs');
  const a=questions.find(q=>q.lesson===7),b=questions.filter(q=>q.lesson===7)[1];
  const session=createSession(questions,7,'wrong',[a.id]);
  assert.equal(reviewNeedsRefresh(session,questions,7,[a.id]),false);
  assert.equal(reviewNeedsRefresh(session,questions,7,[a.id,b.id]),true);
  assert.equal(reviewNeedsRefresh(session,questions,7,[]),true);
  assert.equal(reviewNeedsRefresh(session,questions,7,[a.id,'8-01']),false);
});

test('the formerly ambiguous 未定な distractor is absent', () => {
  const q=questions.find(q=>q.id==='9-04');
  assert.ok(!q.options.includes('未定な'));
});
