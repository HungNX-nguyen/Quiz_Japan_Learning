# Kanji no Niwa

Trang quiz React chạy cục bộ, giao diện tiếng Việt, kết hợp kanji với ngữ pháp trong từng câu.

## Mở ngay

Mở **quiz.html** bằng Chrome/Edge, hoặc nhấp đúp **Mo-quiz.bat**. Không cần cài Node.js hay kết nối mạng. React và CSS đã được gói sẵn trong HTML. Khi chép riêng file HTML sang máy khác vẫn làm quiz được; liên kết xem tài liệu gốc cần các file nguồn trong thư mục cha.

## Nội dung bản đầu

80 câu soạn sẵn: mỗi bài 20 câu (10 câu chọn từ + 10 câu chọn ngữ pháp). Mỗi câu có một chỗ trống, bốn đáp án, nghĩa tiếng Việt, cách đọc từ chính, giải thích và liên kết nguồn. Bộ khởi đầu này chưa bao phủ tất cả từ trong bốn file kanji. Trang không dùng AI/API và không tự tạo câu mới.

PDF có 68 mục thực có, đánh số tới 71 nhưng bỏ qua 13, 31, 32. Đếm theo thứ tự xuất hiện để mỗi bài đủ 20 mẫu:

| Bài kanji | Thứ tự trong danh mục | Số mục in trong PDF |
| --- | --- | --- |
| 7 | 1–20 | 1–12, 14–21 |
| 8 | 21–40 | 22–30, 33–43 |
| 9 | 41–60 | 44–63 |
| 10 | 61–68 rồi 1–12 | 64–71 rồi 1–12 |

Số trang nguồn là số trang vật lý của PDF (1-based), có thể khác số in ở chân trang. Không tự bổ sung các mục không có trong tài liệu. Một số lỗi đánh máy ở phần giải thích nguồn đã được sửa trong mô tả cấu trúc, ví dụ かわりに và する→せずに. Câu hỏi là câu soạn mới, không chép nguyên ví dụ trong PDF.

## Sử dụng

- Chọn bài và dạng ôn. Mỗi lượt đảo thứ tự câu và các lựa chọn.
- Phím 1–4 chọn đáp án; Enter sang câu tiếp theo; Esc đóng hướng dẫn/lộ trình.
- Giải thích chỉ hiện sau khi trả lời. Mỗi câu chỉ chấm một lần trong một lượt.
- Câu trả lời sai được đưa vào “Câu cần ôn”; trả lời đúng ở lượt ôn sẽ xóa khỏi danh sách đó.
- Có thể chuyển bài rồi quay lại, hoặc tải lại trang, để tiếp tục lượt đang dở.
- Thống kê tính theo câu trả lời gần nhất, không cộng dồn số lần làm.
- Lưu dữ liệu trong localStorage của trình duyệt hiện tại. file:// và http:// là hai vùng lưu riêng; hãy dùng cùng cách mở để giữ tiến độ. Nếu trình duyệt chặn lưu, trang hiển thị thông báo và vẫn cho làm bài trong phiên đang mở.

## Chỉnh sửa source

```powershell
npm install
npm test
npm run build
npm run dev
```

Mở http://127.0.0.1:4173. Sau khi sửa source chạy lại `npm run build`, rồi refresh trình duyệt. File `quiz.html` là bản xuất để mở trực tiếp.

- `src/grammar.mjs`: danh mục cấu trúc và trang gốc.
- `src/lesson7.mjs` đến `src/lesson10.mjs`: nội dung câu hỏi, đáp án và giải thích.
- `src/engine.mjs`: phân cấu trúc, trộn câu, chấm đáp án, khôi phục lượt học.
- `src/App.jsx`, `src/styles.css`: giao diện React.
- `tests/quiz.test.mjs`: kiểm tra dữ liệu và logic.

Trong source câu hỏi, lựa chọn đầu tiên là đáp án đúng; giao diện đảo vị trí trước khi hiển thị. Không thêm dữ liệu vào HTML đã build: sửa source rồi build lại.
