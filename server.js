const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
// Chỉ phục vụ các file của game (thư mục phẳng, không có public/)
const path = require("path");
["index.html", "gallery.html", "animals.js", "bg.svg"].forEach((f) => {
  app.get("/" + (f === "index.html" ? "" : f), (_, res) => res.sendFile(path.join(__dirname, f)));
});
app.get("/health", (_, res) => res.send("ok"));

const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 1e5 });

/*
rooms[code] = {
  players: [{ id, name }], state: "waiting" | "playing" | "finished",
  duration: seconds (0 = đến khi cả hai thua), attack: bool,
  over: { id: score }, scores: { id: lastScore }, rematch: { id: true },
  lastState: { id: timestamp }, timer
}
*/
const rooms = {};

const clean = (n) => String(n || "").replace(/[<>&"'`]/g, "").trim().slice(0, 12) || "Người chơi";
const roomOf = (socket) => rooms[socket.data.room];

function newCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code;
  do {
    code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  } while (rooms[code]);
  return code;
}

function startMatch(code) {
  const room = rooms[code];
  if (!room || room.players.length < 2) return;
  clearTimeout(room.timer);
  room.state = "playing";
  room.over = {};
  room.scores = {};
  room.rematch = {};
  room.lastState = {};
  const players = {};
  room.players.forEach((p) => (players[p.id] = p.name));
  io.to(code).emit("start", {
    seed: Math.floor(Math.random() * 2 ** 31),
    duration: room.duration,
    attack: room.attack,
    players,
    p1: room.players[0].id, // người tạo phòng = người chơi 1
  });
  // Chốt an toàn: nếu client nào đó bị treo thì vẫn có kết quả.
  if (room.duration > 0) {
    room.timer = setTimeout(() => finish(code), (room.duration + 15) * 1000);
  }
}

function finish(code) {
  const room = rooms[code];
  if (!room || room.state !== "playing") return;
  clearTimeout(room.timer);
  room.state = "finished";
  const res = {};
  room.players.forEach((p) => {
    res[p.id] = { name: p.name, score: room.over[p.id] ?? room.scores[p.id] ?? 0 };
  });
  const [a, b] = room.players;
  const sa = res[a.id].score, sb = res[b.id].score;
  io.to(code).emit("result", { players: res, winner: sa === sb ? null : sa > sb ? a.id : b.id });
}

function bothOver(room) {
  return room.players.length === 2 && room.players.every((p) => room.over[p.id] !== undefined);
}

io.on("connection", (socket) => {
  socket.on("create", (opts = {}) => {
    if (socket.data.room) return;
    const code = newCode();
    const duration = [0, 120, 180].includes(Number(opts.duration)) ? Number(opts.duration) : 0;
    rooms[code] = {
      players: [{ id: socket.id, name: clean(opts.name) }],
      state: "waiting",
      duration,
      attack: !!opts.attack,
      over: {}, scores: {}, rematch: {}, lastState: {},
    };
    socket.data.room = code;
    socket.join(code);
    socket.emit("created", { code, duration, attack: !!opts.attack });
  });

  socket.on("join", ({ code, name } = {}) => {
    if (socket.data.room) return;
    code = String(code || "").trim().toUpperCase();
    const room = rooms[code];
    if (!room) return socket.emit("joinError", "Không tìm thấy phòng.");
    if (room.state !== "waiting" || room.players.length >= 2) return socket.emit("joinError", "Phòng đã đủ người hoặc đang chơi.");
    room.players.push({ id: socket.id, name: clean(name) });
    socket.data.room = code;
    socket.join(code);
    startMatch(code);
  });

  // Chuyển điểm + ảnh chụp hộp sang đối thủ (giới hạn tần suất)
  socket.on("state", (p = {}) => {
    const room = roomOf(socket);
    if (!room || room.state !== "playing") return;
    const now = Date.now();
    if (now - (room.lastState[socket.id] || 0) < 100) return;
    room.lastState[socket.id] = now;
    const score = Number(p.score);
    if (!Number.isFinite(score) || score < 0 || score > 1e6) return;
    room.scores[socket.id] = score;
    const bodies = Array.isArray(p.bodies) ? p.bodies.slice(0, 150) : [];
    socket.to(socket.data.room).emit("opponentState", { score, bodies });
  });

  socket.on("attack", (n) => {
    const room = roomOf(socket);
    if (!room || room.state !== "playing" || !room.attack) return;
    n = Math.max(1, Math.min(3, Math.floor(Number(n) || 0)));
    socket.to(socket.data.room).emit("attack", n);
  });

  socket.on("gameover", (score) => {
    const room = roomOf(socket);
    if (!room || room.state !== "playing" || room.over[socket.id] !== undefined) return;
    score = Number(score);
    if (!Number.isFinite(score) || score < 0 || score > 1e6) score = room.scores[socket.id] || 0;
    room.over[socket.id] = score;
    room.scores[socket.id] = score;
    socket.to(socket.data.room).emit("opponentOver", score);
    if (bothOver(room)) finish(socket.data.room);
  });

  socket.on("rematch", () => {
    const code = socket.data.room;
    const room = rooms[code];
    if (!room || room.state !== "finished" || room.players.length < 2) return;
    room.rematch[socket.id] = true;
    socket.to(code).emit("rematchWanted");
    if (room.players.every((p) => room.rematch[p.id])) startMatch(code);
  });

  socket.on("disconnect", () => {
    const code = socket.data.room;
    const room = rooms[code];
    if (!room) return;
    clearTimeout(room.timer);
    socket.to(code).emit("opponentLeft");
    delete rooms[code];
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Bọt PvP chạy tại http://localhost:" + PORT));
