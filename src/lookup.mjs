import { questions, grammar } from './data.mjs';
import { kanjiEntries } from './kanjiDict.mjs';

// word -> danh sách nghĩa (một từ có thể có nhiều nghĩa / nhiều cách đọc).
// Nguồn: từ vựng trong ngân hàng câu hỏi + toàn bộ file KANJI-7..10.txt (sinh bởi scripts/gen-dict.mjs).
const dictionary=new Map();
function addEntry(word,data,lesson,source){
 if(!word)return;
 const list=dictionary.get(word)||[];
 const key=s=>String(s||'').toLocaleLowerCase('vi').replace(/[\s.,;]+/g,' ').trim();
 let entry=list.find(e=>e.reading===(data.reading||'') && key(e.meaning)===key(data.meaning));
 if(entry){if(!entry.hanviet && data.hanviet)entry.hanviet=data.hanviet;if(data.notes?.length)entry.notes=[...entry.notes,...data.notes];}
 else{entry={word,reading:data.reading||'',meaning:data.meaning||'',hanviet:data.hanviet||'',notes:data.notes||[],lessons:[],sources:[]};list.push(entry);}
 if(!entry.lessons.includes(lesson))entry.lessons.push(lesson);
 if(!entry.sources.includes(source))entry.sources.push(source);
 dictionary.set(word,list);
}
for(const q of questions)for(const [word,reading,meaning] of q.vocab)addEntry(word,{reading,meaning},q.lesson,'quiz');
for(const e of kanjiEntries){
 addEntry(e.word,e,e.lesson,'kanji');
 if(e.word.startsWith('～'))addEntry(e.word.slice(1),e,e.lesson,'kanji');
}

const wordForms={'守り':'守る','守って':'守る','守った':'守る','守ります':'守る','守らない':'守る','願い':'願う','願った':'願う','願います':'願う','祝った':'祝う','祝います':'祝う','借りた':'借りる','借りて':'借りる','借ります':'借りる','座り':'座る','座った':'座る','座って':'座る','組み立てた':'組み立てる','組み立てて':'組み立てる'};
const iToU={'い':'う','き':'く','ぎ':'ぐ','し':'す','ち':'つ','に':'ぬ','び':'ぶ','み':'む','り':'る'};
const aToU={'わ':'う','か':'く','が':'ぐ','さ':'す','た':'つ','な':'ぬ','ば':'ぶ','ま':'む','ら':'る'};
const politeTails=['ませんでした','ましょう','ました','ません','ます','たくない','たかった','たい','ながら','なさい','そう'];
const teTaTails=[['って',['う','つ','る']],['った',['う','つ','る']],['んで',['む','ぶ','ぬ']],['んだ',['む','ぶ','ぬ']],['いて',['く']],['いた',['く']],['いで',['ぐ']],['いだ',['ぐ']],['して',['す']],['した',['す']]];
const auxTails=['ていました','ています','ている','ていた','てしまった','てしまう','ておく','てある','てくる','ていく'];
const suruTails=['しました','しません','します','する','した','して','しない','される','させる','しよう'];

/** Các dạng gốc có thể có của một từ đã chia (động từ nhóm 1/2, danh động từ する, tính từ い/な). */
export function baseForms(text){
 const out=new Set([text]);
 const add=s=>{if(s)out.add(s);};
 const cut=(t,tail)=>t.endsWith(tail)&&t.length>tail.length?t.slice(0,-tail.length):null;
 if(wordForms[text])add(wordForms[text]);
 add(text.startsWith('～')?text.slice(1):'～'+text);
 const stems=[text];
 for(const tail of auxTails){const s=cut(text,tail);if(s!==null)stems.push(s+tail[0]);} // 付き合っている -> 付き合って
 const stemToBase=stem=>{const last=stem.at(-1);if(iToU[last])add(stem.slice(0,-1)+iToU[last]);add(stem+'る');};
 for(const t of stems){
  for(const tail of suruTails){const s=cut(t,tail);if(s!==null){add(s);add(s+'する');}}
  for(const tail of politeTails){const s=cut(t,tail);if(s!==null)stemToBase(s);}
  stemToBase(t);                                                       // 守り -> 守る, 借り -> 借りる
  for(const [tail,ends] of teTaTails){const s=cut(t,tail);if(s!==null)for(const e of ends)add(s+e);}
  for(const tail of ['て','た','ない','なかった','なくて','られる','られた','させる','よう','れば','ろ']){const s=cut(t,tail);if(s!==null)add(s+'る');}
  for(const tail of ['ない','なかった','なくて','れる','れた','せる','ば']){const s=cut(t,tail);if(s!==null&&aToU[s.at(-1)])add(s.slice(0,-1)+aToU[s.at(-1)]);}
  for(const tail of ['かった','くない','くなかった','くて','く','さ','すぎる','そう','ければ']){const s=cut(t,tail);if(s!==null)add(s+'い');}
  for(const tail of ['な','に','だ','です','でした','だった','じゃない','ではない','の']){const s=cut(t,tail);if(s!==null)add(s);}
 }
 return [...out];
}
/** Trả về [dạng tìm thấy, danh sách nghĩa] hoặc null. */
function resolve(text){
 for(const form of baseForms(text))if(dictionary.has(form))return [form,dictionary.get(form)];
 return null;
}
const HAN=/\p{Script=Han}/u,KATA=/\p{Script=Katakana}/u;

const aliases={
 1:['始める','終わる'],2:['ように言う','ように言われる','ように言われました'],3:['ということ'],4:['だろうと思う','だろう'],5:['なさそう'],
 8:['てくる','ていく'],9:['続ける'],10:['なら'],11:['っていう'],12:['させてもらう','させてくれる'],14:['たがる'],15:['とたん','とたんに'],16:['出す'],17:['とする'],18:['ことがある','こともある'],19:['させておく'],20:['られてしまう'],
 21:['によって'],22:['に対して','に対する'],23:['ために'],24:['につき'],25:['とおり','とおりに'],26:['を通して','を通じて'],27:['のような','のように'],28:['によると','によれば'],29:['とのこと'],30:['について'],33:['っけ'],34:['たりして'],35:['たって'],36:['に決まっている'],37:['じゃない'],39:['みたい'],40:['ばよかった'],41:['ばかり'],42:['ようだ','ような','ように'],43:['はもちろん'],44:['ほど'],45:['かわりに'],46:['ずに'],47:['まま'],49:['ところ'],50:['きる','きれない'],51:['おかげ'],52:['を通して','を通じて'],53:['じゃないですか'],54:['といえば'],55:['べき'],56:['にとって'],58:['による'],59:['ばかりでなく'],60:['たびに'],61:['はず'],62:['ますと','ですと'],63:['ようなら','ようだったら'],64:['てきた','てくる'],65:['ものですから','もので'],66:['なんか'],67:['かと思う','かと思います'],68:['うちに'],69:['たばかり'],70:['いいのに'],71:['もらってもいいですか']
};
export function normalizeSelection(text){
 const value=String(text||'').normalize('NFKC').trim().replace(/^[\s「『（(【]+|[\s」』）)】。、！？!?]+$/gu,'');
 return value.length>0 && value.length<=120 && /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(value)?value:'';
}
export function lookupText(raw){
 const text=normalizeSelection(raw);
 const structures=grammar.filter(g=>(aliases[g.sourceId]||[]).includes(text));
 // Mẫu ngữ pháp được ưu tiên hơn việc "đoán" dạng gốc cho cụm toàn hiragana (vd. とたんに).
 const found=text && (HAN.test(text)||KATA.test(text)||!structures.length)?resolve(text):null;
 if(found)return {text,kind:'word',base:found[0],entries:found[1],structures,related:[]};
 if(structures.length)return {text,kind:'grammar',entries:[],structures,related:[]};
 // Tách cụm: tại mỗi vị trí lấy đoạn dài nhất tra được (kể cả dạng đã chia).
 const entries=[],seen=new Set();
 for(let i=0;i<text.length;){
  let hit=null;
  for(let j=Math.min(text.length,i+12);j>i;j--){
   const part=text.slice(i,j);
   if(!HAN.test(part) && !(KATA.test(part)&&part.length>1) && part.length<3)continue; // bỏ trợ từ に, を, と...
   const r=resolve(part);if(r){hit=[j,r];break;}
  }
  if(hit){const [j,[word,list]]=hit;if(!seen.has(word)){seen.add(word);entries.push(...list);}i=j;}else i++;
 }
 if(entries.length)return {text,kind:'components',entries:entries.slice(0,8),structures:[],related:[]};
 return {text,kind:'unknown',entries:[],structures:[],related:relatedEntries(text)};
}
/** Các từ có chung chữ Hán với đoạn đã chọn — gợi ý khi không tra được. */
export function relatedEntries(text,limit=8){
 const chars=[...new Set([...text].filter(c=>HAN.test(c)))];
 if(!chars.length)return [];
 const scored=[];
 for(const [word,list] of dictionary){
  const score=chars.filter(c=>word.includes(c)).length;
  if(score)scored.push([score,word.length,list[0]]);
 }
 return scored.sort((a,b)=>b[0]-a[0]||a[1]-b[1]).slice(0,limit).map(x=>x[2]);
}
export const dictionarySize=()=>dictionary.size;
