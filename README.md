# Bọt PvP

## Chạy
    npm install
    npm start
Mở http://localhost:3000 trên 2 tab / 2 máy cùng mạng.

## Triển khai (Render / Railway / Fly.io)
- Build command: `npm install`
- Start command: `npm start`
- Server tự đọc biến môi trường `PORT`; kiểm tra sống tại `/health`.

## Luật
- Người tạo phòng là người chơi 1 (Thảo Nhi), người vào phòng là người chơi 2 (Thành Lợi); nhân vật của mình là cấp cao nhất trong hộp của mình.
- Mỗi người một hộp, cùng seed nên cùng chuỗi con vật.
- Có con vật nằm trên vạch đứt > 2 giây thì thua.
- Chế độ giới hạn thời gian: hết giờ ai điểm cao hơn thắng. Không giới hạn: chơi đến khi cả hai thua.
- Chế độ tấn công: combo x3 trở lên gửi 1–3 con chuột sang hộp đối thủ.
