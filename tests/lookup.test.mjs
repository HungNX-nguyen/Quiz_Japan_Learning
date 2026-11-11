import test from 'node:test';
import assert from 'node:assert/strict';
import { lookupText, normalizeSelection } from '../src/lookup.mjs';
test('selection accepts Japanese words, strips surrounding punctuation, ignores unrelated/long text',()=>{
 assert.equal(normalizeSelection(' 「花束」 '),'花束');
 assert.equal(normalizeSelection('hello world'),'');
 assert.equal(normalizeSelection('あ'.repeat(121)),'');
});
test('exact vocabulary includes reading and Vietnamese meaning',()=>{
 const r=lookupText('花束'); assert.equal(r.kind,'word'); assert.equal(r.entries[0].reading,'はなたば'); assert.match(r.entries[0].meaning,/hoa/);
});
test('common conjugations point to the dictionary form',()=>{
 const r=lookupText('守り');assert.equal(r.entries[0].word,'守る');assert.equal(r.kind,'word');
});
test('grammar phrase explains the matching structure',()=>{
 const r=lookupText('とたんに'); assert.equal(r.kind,'grammar'); assert.match(r.structures[0].meaning,/Ngay/);
});
test('a phrase lists components without inventing a combined translation',()=>{
 const r=lookupText('美しい花束'); assert.equal(r.kind,'components'); assert.equal(r.entries[0].word,'花束');
});
test('unknown selection has explicit fallback rather than fabricated definition',()=>{
 const r=lookupText('宇宙飛行士'); assert.equal(r.kind,'unknown'); assert.deepEqual(r.entries,[]);
});
test('words from the KANJI-7..10 files are in the dictionary with reading, meaning and Hán Việt',()=>{
 const r=lookupText('創業'); assert.equal(r.kind,'word'); assert.equal(r.entries[0].reading,'そうぎょう'); assert.match(r.entries[0].meaning,/thành lập/); assert.equal(r.entries[0].hanviet,'SANG NGHIỆP');
 assert.equal(lookupText('仲間').entries[0].reading,'なかま');
});
test('conjugated selections resolve to their dictionary form',()=>{
 assert.equal(lookupText('付き合っている').base,'付き合う');
 assert.equal(lookupText('短縮した').base,'短縮する');
 assert.equal(lookupText('幼かった').base,'幼い');
 assert.equal(lookupText('担いで').base,'担ぐ');
});
test('a sentence is segmented into the longest known words, including conjugated ones',()=>{
 const r=lookupText('彼と付き合っています'); assert.equal(r.kind,'components'); assert.deepEqual([...new Set(r.entries.map(e=>e.word))],['彼','付き合う']);
});
test('unknown words suggest dictionary words sharing a kanji, and sources are not duplicated',()=>{
 assert.ok(lookupText('結婚して').related.some(e=>e.word==='結婚届'));
 assert.equal(lookupText('花束').entries.length,1);
});
