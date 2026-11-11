import React from 'react';
import { grammarForLesson } from './engine.mjs';
import { DailyKanji, TryQuestion, StreakWeek } from './homeExtras.jsx';

const lessonKanji = { 7: '始', 8: '友', 9: '限', 10: '校' };

function BlossomBranch({ className }) {
  // Hand-drawn sakura branch used as hero decoration (decorative).
  const flower = (x, y, r, rot = 0) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {[0, 72, 144, 216, 288].map(a => (
        <path key={a} transform={`rotate(${a})`} d={`M0 0C${-r * .55} ${-r * .3} ${-r * .55} ${-r * .95} ${-r * .14} ${-r * 1.05}L0 ${-r * .84}L${r * .14} ${-r * 1.05}C${r * .55} ${-r * .95} ${r * .55} ${-r * .3} 0 0Z`} fill="url(#petalGrad)" />
      ))}
      <circle r={r * .18} fill="#e05286" />
      {[0, 72, 144, 216, 288].map(a => <circle key={a} transform={`rotate(${a + 36})`} cy={-r * .38} r={r * .05} fill="#c2185b" />)}
    </g>
  );
  return (
    <svg className={className} viewBox="0 0 420 320" aria-hidden="true">
      <defs>
        <linearGradient id="petalGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff1f6" />
          <stop offset="1" stopColor="#f8a5c2" />
        </linearGradient>
      </defs>
      <path d="M420 40C330 60 270 90 220 140S120 230 20 300" stroke="#7a4a3a" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M300 78C300 40 330 22 352 16M232 128C210 96 214 70 230 50M150 200C170 222 200 228 226 224" stroke="#7a4a3a" strokeWidth="4" fill="none" strokeLinecap="round" />
      {flower(352, 18, 30, 10)}{flower(300, 80, 36, -20)}{flower(232, 50, 26, 30)}
      {flower(226, 226, 28, 5)}{flower(180, 168, 34, 40)}{flower(96, 246, 30, -10)}
      {flower(392, 56, 22, 60)}{flower(268, 128, 20, 15)}
      <circle cx="330" cy="104" r="6" fill="#f8a5c2" /><circle cx="140" cy="216" r="5" fill="#f8a5c2" /><circle cx="60" cy="282" r="5" fill="#f48fb1" />
    </svg>
  );
}

export function HomePage({ Icon, lessons, themes, ranges, questions, results, onStart, go, studyDays }) {
  const completed = questions.filter(q => results[q.id]?.correct).length;
  const tried = Object.keys(results).length;
  const wrong = Object.values(results).filter(r => !r.correct).length;
  const pct = Math.round(completed / questions.length * 100);
  const features = [
    ['book', 'Một câu, hai điều nhớ', 'Mỗi câu kết hợp một từ kanji với một cấu trúc ngữ pháp, giúp anh nhớ từ trong đúng ngữ cảnh.'],
    ['spark', 'Giải thích bằng tiếng Việt', 'Sau mỗi lựa chọn là bản dịch, lý do đúng và vì sao 3 đáp án còn lại không phù hợp.'],
    ['search', 'Bôi đen để tra cứu', 'Chọn bất kỳ từ hoặc cụm tiếng Nhật để xem cách đọc, âm Hán Việt và nghĩa ngay tại chỗ.'],
    ['retry', 'Ôn lại câu sai', 'Câu trả lời sai được gom vào “Câu cần ôn”. Trả lời đúng sẽ tự động xóa khỏi danh sách.'],
  ];
  return (
    <main className="home" id="main" tabIndex={-1}>
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-badge"><Icon name="flower" size={16} /> 漢字の庭 · Vườn kanji mùa hoa</span>
          <h1>Học kanji nhẹ nhàng<br />như <em>hoa anh đào</em> rơi.</h1>
          <p>80 câu luyện tập kết hợp từ vựng kanji bài 7–10 với 68 mẫu ngữ pháp. Giải thích tiếng Việt, lưu tiến độ ngay trên trình duyệt và dùng được cả khi ngoại tuyến.</p>
          <div className="hero-actions">
            <button className="primary big" onClick={() => onStart()}>{tried ? 'Tiếp tục luyện tập' : 'Bắt đầu luyện tập'} <Icon name="arrow" size={18} /></button>
            <button className="secondary big" onClick={() => go('roadmap')}><Icon name="list" size={18} /> Xem lộ trình ngữ pháp</button>
          </div>
          <dl className="hero-stats">
            <div><dt>Câu luyện tập</dt><dd>80</dd></div>
            <div><dt>Bài kanji</dt><dd>04</dd></div>
            <div><dt>Mẫu ngữ pháp</dt><dd>68</dd></div>
          </dl>
        </div>
        <div className="hero-art">
          <BlossomBranch className="branch" />
          <div className="hero-card">
            <span className="section-kicker">VƯỜN CỦA ANH</span>
            <div className="hero-ring" style={{ '--progress': `${pct * 3.6}deg` }}><div><strong>{pct}<span>%</span></strong><small>{completed}/80 câu nhớ đúng</small></div></div>
            <div className="hero-card-row"><span>Đã thử</span><strong>{tried} câu</strong></div>
            <div className="hero-card-row"><span>Cần ôn lại</span><strong>{wrong} câu</strong></div>
            <StreakWeek days={studyDays} />
          </div>
          <span className="hero-kanji" lang="ja">桜</span>
        </div>
      </section>

      <section className="home-section today-section" aria-labelledby="today-title">
        <div className="section-head">
          <span className="section-kicker">HÔM NAY</span>
          <h2 id="today-title">Một từ mới, một câu thử</h2>
          <p>Mỗi ngày một từ kanji lấy từ ngân hàng câu, kèm câu ví dụ. Thử sức với một câu ngẫu nhiên trước khi vào bài.</p>
        </div>
        <div className="today-grid">
          <DailyKanji Icon={Icon} questions={questions} onStart={onStart} />
          <TryQuestion Icon={Icon} questions={questions} onStart={onStart} />
        </div>
      </section>

      <section className="home-section" aria-labelledby="lessons-title">
        <div className="section-head">
          <span className="section-kicker">SỔ TAY KANJI</span>
          <h2 id="lessons-title">Chọn một bài để bắt đầu</h2>
          <p>Mỗi bài có 20 câu, đi kèm 20 cấu trúc theo đúng thứ tự trong tài liệu gốc.</p>
        </div>
        <div className="lesson-cards">
          {lessons.map(lesson => {
            const count = questions.filter(q => q.lesson === lesson && results[q.id]).length;
            const right = questions.filter(q => q.lesson === lesson && results[q.id]?.correct).length;
            return (
              <button key={lesson} className="lesson-card" onClick={() => onStart(lesson)}>
                <span className="lesson-card-kanji" lang="ja" aria-hidden="true">{lessonKanji[lesson]}</span>
                <span className="lesson-card-num">Bài {lesson}</span>
                <strong>{themes[lesson]}</strong>
                <small>{ranges[lesson]}</small>
                <span className="lesson-card-track" aria-hidden="true"><span style={{ width: `${count * 5}%` }} /></span>
                <span className="lesson-card-foot"><span>{count}/20 đã thử · {right} đúng</span><Icon name="arrow" size={18} /></span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="home-section" aria-labelledby="features-title">
        <div className="section-head">
          <span className="section-kicker">VÌ SAO HỌC Ở ĐÂY</span>
          <h2 id="features-title">Hiểu cả câu, nhớ cả cách dùng</h2>
        </div>
        <div className="feature-grid">
          {features.map(([icon, title, text]) => (
            <article key={title} className="feature">
              <span className="feature-icon"><Icon name={icon} size={22} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section steps-section" aria-labelledby="steps-title">
        <div className="section-head">
          <span className="section-kicker">BA BƯỚC MỖI NGÀY</span>
          <h2 id="steps-title">Một nhịp học thật đơn giản</h2>
        </div>
        <ol className="steps">
          <li><span className="step-num">01</span><h3>Chọn bài & dạng ôn</h3><p>Trộn cả hai, chỉ từ vựng, chỉ ngữ pháp hoặc các câu cần ôn.</p></li>
          <li><span className="step-num">02</span><h3>Đọc trọn câu rồi chọn</h3><p>Dùng chuột hoặc phím <kbd>1</kbd>–<kbd>4</kbd>. Đọc giải thích sau mỗi câu.</p></li>
          <li><span className="step-num">03</span><h3>Ôn lại câu sai</h3><p>Quay lại “Câu cần ôn” cho đến khi vườn kiến thức nở kín hoa.</p></li>
        </ol>
      </section>

      <section className="quote-band" aria-label="Lời nhắn">
        <p lang="ja" className="quote-ja">花より団子、でも今日は漢字。</p>
        <p className="quote-vi">“Bánh hơn hoa” — nhưng hôm nay, mình chọn kanji. Học đều một chút, nhớ thêm một chút.</p>
        <button className="primary big" onClick={() => onStart()}>Vào luyện tập ngay <Icon name="arrow" size={18} /></button>
      </section>
    </main>
  );
}

export function RoadmapPage({ Icon, lessons, themes, ranges, lesson, setLesson, onStart, sourceHref }) {
  const items = grammarForLesson(lesson);
  return (
    <main className="subpage" id="main" tabIndex={-1}>
      <div className="subpage-head">
        <span className="section-kicker">LỘ TRÌNH NGỮ PHÁP</span>
        <h1>20 cấu trúc cho mỗi bài kanji</h1>
        <p>PDF có 68 mẫu thực có; không có mục 13, 31, 32. Lộ trình chia 20 mẫu theo thứ tự xuất hiện; bài 10 quay về đầu khi dùng hết mẫu.</p>
      </div>
      <div className="roadmap-tabs" role="tablist" aria-label="Chọn bài">
        {lessons.map(l => (
          <button key={l} role="tab" aria-selected={l === lesson} className={l === lesson ? 'active' : ''} onClick={() => setLesson(l)}>
            <strong>Bài {l}</strong><small>{ranges[l]}</small>
          </button>
        ))}
      </div>
      <div className="roadmap-panel" role="tabpanel">
        <div className="roadmap-panel-head">
          <div><h2>Kanji bài {lesson}</h2><p>{themes[lesson]}</p></div>
          <button className="primary" onClick={() => onStart(lesson)}>Luyện bài {lesson} <Icon name="arrow" size={18} /></button>
        </div>
        <ol className="roadmap-list">
          {items.map((g, i) => (
            <li key={i}>
              <span className="grammar-index">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <strong lang="ja">{g.title}</strong>
                <p>{g.meaning}</p>
                <small>{g.rule}</small>
                <a href={sourceHref('1-7.pdf', g.page)} target="_blank" rel="noreferrer">Mục gốc {g.sourceId} · PDF trang {g.page} ↗</a>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}

export function GuidePage({ Icon, onStart }) {
  return (
    <main className="subpage" id="main" tabIndex={-1}>
      <div className="subpage-head">
        <span className="section-kicker">HƯỚNG DẪN</span>
        <h1>Một góc học thật đơn giản</h1>
        <p>Mỗi bài có 20 câu soạn sẵn, kết hợp từ trong file kanji tương ứng với 20 cấu trúc được phân cho bài đó. Đây là bộ câu khởi đầu, chưa bao phủ mọi từ trong 4 file.</p>
      </div>
      <div className="guide-grid">
        <section className="guide-card">
          <h2><Icon name="list" size={20} /> Cách làm bài</h2>
          <ol>
            <li>Chọn bài 7, 8, 9 hoặc 10 ở sổ tay bên trái trang Luyện tập.</li>
            <li>Chọn trộn cả hai, từ vựng hoặc ngữ pháp. Các lựa chọn và thứ tự câu được đảo ở mỗi lượt mới.</li>
            <li>Chọn một đáp án để xem câu hoàn chỉnh, nghĩa tiếng Việt và lý do đúng/sai.</li>
            <li>Vào “Câu cần ôn” để luyện lại câu trả lời sai. Trả lời đúng sẽ xóa câu đó khỏi danh sách.</li>
          </ol>
        </section>
        <section className="guide-card">
          <h2><Icon name="spark" size={20} /> Phím tắt</h2>
          <ul className="shortcut-list">
            <li><span><kbd>1</kbd>–<kbd>4</kbd></span> Chọn đáp án</li>
            <li><span><kbd>Enter</kbd></span> Câu tiếp theo</li>
            <li><span><kbd>Esc</kbd></span> Đóng cửa sổ</li>
          </ul>
          <h2><Icon name="search" size={20} /> Tra cứu</h2>
          <p>Bôi đen từ hoặc cụm tiếng Nhật trong câu để mở bảng tra cứu nghĩa, cách đọc và âm Hán Việt.</p>
        </section>
        <section className="guide-card">
          <h2><Icon name="leaf" size={20} /> Lưu tiến độ</h2>
          <p>Tiến độ và lượt làm đang dở được lưu trên trình duyệt này. Chế độ ẩn danh, xóa dữ liệu hoặc chuyển trình duyệt có thể làm mất tiến độ. File HTML hoạt động ngoại tuyến.</p>
          <p>Ngân hàng câu được soạn sẵn; trang không tự sinh câu mới. “Lượt mới” đảo lại các câu hiện có.</p>
          <p>Hoa anh đào rơi có thể tắt bằng nút <Icon name="flower" size={15} /> trên thanh điều hướng.</p>
        </section>
      </div>
      <div className="guide-cta"><button className="primary big" onClick={() => onStart()}>Bắt đầu luyện tập <Icon name="arrow" size={18} /></button></div>
    </main>
  );
}
