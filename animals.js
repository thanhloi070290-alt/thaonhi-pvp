"use strict";
/* Vẽ 11 con vật kiểu "3D bóng" bằng canvas. Toạ độ theo đơn vị bán kính: đầu tròn bán kính 1 ở tâm (0,0). */
(function () {
  const TAU = Math.PI * 2;

  function shade(hex, a) {
    const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = (v) => Math.round(a < 0 ? v * (1 + a) : v + (255 - v) * a);
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  }

  // Khối tròn có đổ sáng (sáng góc trên-trái, tối góc dưới-phải), viền và điểm bóng
  function blob(c, x, y, rx, ry, col, o = {}) {
    c.save();
    const g = c.createRadialGradient(x - rx * 0.35, y - ry * 0.4, Math.min(rx, ry) * 0.1, x, y, Math.max(rx, ry) * 1.05);
    g.addColorStop(0, shade(col, 0.42));
    g.addColorStop(0.45, col);
    g.addColorStop(1, shade(col, -0.3));
    c.beginPath(); c.ellipse(x, y, rx, ry, o.rot || 0, 0, TAU);
    c.fillStyle = g; c.fill();
    c.lineWidth = o.lw || 0.055; c.strokeStyle = o.line || shade(col, -0.62); c.stroke();
    if (o.gloss !== false) {
      c.beginPath(); c.ellipse(x - rx * 0.38, y - ry * 0.52, rx * 0.27, ry * 0.15, -0.6, 0, TAU);
      c.fillStyle = "rgba(255,255,255,.55)"; c.fill();
    }
    c.restore();
  }
  const head = (c, col, rx = 1, ry = 0.95, y = 0.03) => blob(c, 0, y, rx, ry, col);

  function eye(c, x, y, s = 0.1, col = "#1d1a1a") {
    c.save();
    c.beginPath(); c.ellipse(x, y, s, s * 1.25, 0, 0, TAU); c.fillStyle = col; c.fill();
    c.fillStyle = "#fff";
    c.beginPath(); c.arc(x - s * 0.32, y - s * 0.45, s * 0.38, 0, TAU); c.fill();
    c.beginPath(); c.arc(x + s * 0.36, y + s * 0.4, s * 0.17, 0, TAU); c.fill();
    c.restore();
  }
  function blush(c, x, y, s = 0.2) {
    c.save();
    const g = c.createRadialGradient(x, y, 0, x, y, s);
    g.addColorStop(0, "rgba(255,110,140,.6)"); g.addColorStop(1, "rgba(255,110,140,0)");
    c.fillStyle = g; c.beginPath(); c.ellipse(x, y, s, s * 0.7, 0, 0, TAU); c.fill();
    c.restore();
  }
  function mouth(c, x, y, w, col = "#5a2d1c") {
    c.save(); c.strokeStyle = col; c.lineWidth = 0.05; c.lineCap = "round";
    c.beginPath(); c.moveTo(x - w, y); c.quadraticCurveTo(x - w / 2, y + w * 0.9, x, y);
    c.quadraticCurveTo(x + w / 2, y + w * 0.9, x + w, y); c.stroke(); c.restore();
  }
  function nose(c, x, y, rx, ry, col) {
    blob(c, x, y, rx, ry, col, { lw: 0.03, gloss: false });
    c.save(); c.fillStyle = "rgba(255,255,255,.7)";
    c.beginPath(); c.ellipse(x - rx * 0.3, y - ry * 0.35, rx * 0.28, ry * 0.2, 0, 0, TAU); c.fill(); c.restore();
  }
  function whisk(c, s) {
    c.save(); c.strokeStyle = "rgba(90,50,30,.55)"; c.lineWidth = 0.022; c.lineCap = "round";
    for (const d of [-0.06, 0.06]) { c.beginPath(); c.moveTo(s * 0.62, 0.27 + d); c.lineTo(s * 1.08, 0.2 + d * 2.4); c.stroke(); }
    c.restore();
  }
  function tri(c, p, col, inner) {
    c.save(); c.lineJoin = "round";
    c.beginPath(); c.moveTo(p[0][0], p[0][1]); c.lineTo(p[1][0], p[1][1]); c.lineTo(p[2][0], p[2][1]); c.closePath();
    c.fillStyle = col; c.fill(); c.lineWidth = 0.055; c.strokeStyle = shade(col, -0.62); c.stroke();
    const cx = (p[0][0] + p[1][0] + p[2][0]) / 3, cy = (p[0][1] + p[1][1] + p[2][1]) / 3;
    c.beginPath();
    p.forEach((q, i) => { const X = cx + (q[0] - cx) * 0.55, Y = cy + (q[1] - cy) * 0.55; i ? c.lineTo(X, Y) : c.moveTo(X, Y); });
    c.closePath(); c.fillStyle = inner; c.fill();
    c.restore();
  }
  const sides = [-1, 1];

  const ART = [
    // 0 Chuột
    (c) => { const col = "#9fb3ff";
      for (const s of sides) { blob(c, s * 0.74, -0.72, 0.42, 0.42, col, { gloss: false }); blob(c, s * 0.74, -0.72, 0.26, 0.26, "#ffb8cc", { gloss: false, lw: 0.02 }); }
      head(c, col);
      for (const s of sides) { eye(c, s * 0.37, -0.02); blush(c, s * 0.62, 0.2); }
      nose(c, 0, 0.16, 0.1, 0.075, "#ff7a9a"); mouth(c, 0, 0.27, 0.13); },
    // 1 Ếch
    (c) => { const col = "#8fe05a";
      head(c, col, 1, 0.9, 0.1);
      for (const s of sides) {
        blob(c, s * 0.5, -0.7, 0.34, 0.34, col);
        c.save(); c.fillStyle = "#fff"; c.beginPath(); c.arc(s * 0.5, -0.7, 0.21, 0, TAU); c.fill();
        c.fillStyle = "#1d1a1a"; c.beginPath(); c.arc(s * 0.52, -0.69, 0.11, 0, TAU); c.fill();
        c.fillStyle = "#fff"; c.beginPath(); c.arc(s * 0.48, -0.74, 0.04, 0, TAU); c.fill(); c.restore();
        blush(c, s * 0.62, 0.3);
      }
      mouth(c, 0, 0.28, 0.4); },
    // 2 Mèo
    (c) => { const col = "#ffd27a";
      for (const s of sides) tri(c, [[s * 0.96, -0.15], [s * 0.8, -1.0], [s * 0.2, -0.8]], col, "#ffb3c7");
      head(c, col, 1, 0.92, 0.05);
      c.save(); c.strokeStyle = "#e0902e"; c.lineWidth = 0.07; c.lineCap = "round";
      for (const x of [-0.2, 0, 0.2]) { c.beginPath(); c.moveTo(x, -0.86 + Math.abs(x) * 0.5); c.lineTo(x, x ? -0.62 : -0.54); c.stroke(); }
      c.restore();
      for (const s of sides) { eye(c, s * 0.38, -0.03); blush(c, s * 0.64, 0.22); whisk(c, s); }
      nose(c, 0, 0.14, 0.09, 0.065, "#ff7a9a");
      mouth(c, -0.1, 0.25, 0.1); mouth(c, 0.1, 0.25, 0.1); },
    // 3 Thỏ
    (c) => { const col = "#ffb35a";
      for (const s of sides) { blob(c, s * 0.42, -1.0, 0.2, 0.58, col, { rot: s * 0.22, gloss: false }); blob(c, s * 0.42, -1.0, 0.11, 0.42, "#ffc9d6", { rot: s * 0.22, gloss: false, lw: 0.015 }); }
      head(c, col, 1, 0.93, 0.05);
      for (const s of sides) { eye(c, s * 0.36, -0.03); blush(c, s * 0.6, 0.2); }
      nose(c, 0, 0.15, 0.09, 0.07, "#ff6f8f"); mouth(c, 0, 0.27, 0.12);
      c.save(); c.fillStyle = "#fff"; c.strokeStyle = "#5a2d1c"; c.lineWidth = 0.025; c.fillRect(-0.06, 0.3, 0.12, 0.1); c.strokeRect(-0.06, 0.3, 0.12, 0.1); c.restore(); },
    // 4 Chó
    (c) => { const col = "#c59cff";
      for (const s of sides) blob(c, s * 0.93, 0.0, 0.3, 0.58, "#a57de6", { rot: -s * 0.25, gloss: false });
      head(c, col, 1, 0.95, 0.03);
      blob(c, 0.42, -0.2, 0.28, 0.26, "#a57de6", { gloss: false, line: "rgba(0,0,0,0)" });
      blob(c, 0, 0.32, 0.46, 0.34, "#ead9ff", { gloss: false, lw: 0.03 });
      for (const s of sides) { eye(c, s * 0.4, -0.12); blush(c, s * 0.72, 0.14); }
      nose(c, 0, 0.2, 0.15, 0.1, "#2a2230"); mouth(c, 0, 0.36, 0.13);
      blob(c, 0, 0.53, 0.09, 0.11, "#ff7f9f", { gloss: false, lw: 0.02 }); },
    // 5 Cừu
    (c) => { const col = "#ffb3c7";
      for (const s of sides) blob(c, s * 0.98, -0.08, 0.32, 0.18, "#ff93b0", { rot: s * 0.4, gloss: false });
      head(c, col, 0.98, 0.92, 0.08);
      for (const [x, y, r] of [[-0.66, -0.52, 0.34], [0.66, -0.52, 0.34], [-0.28, -0.8, 0.34], [0.28, -0.8, 0.34], [0, -0.55, 0.4]])
        blob(c, x, y, r, r, "#fff6fb");
      for (const s of sides) { eye(c, s * 0.37, 0.14); blush(c, s * 0.62, 0.34); }
      nose(c, 0, 0.3, 0.08, 0.06, "#ff7a9a"); mouth(c, 0, 0.4, 0.11); },
    // 6 Koala
    (c) => { const col = "#86b394";
      for (const s of sides) { blob(c, s * 0.86, -0.55, 0.5, 0.5, col, { gloss: false }); blob(c, s * 0.86, -0.55, 0.3, 0.3, "#eef6ef", { gloss: false, lw: 0.02 }); }
      head(c, col, 0.97, 0.93, 0.06);
      for (const s of sides) { eye(c, s * 0.42, -0.1, 0.085); blush(c, s * 0.64, 0.3); }
      nose(c, 0, 0.14, 0.2, 0.27, "#27342b"); mouth(c, 0, 0.5, 0.1); },
    // 7 Gấu trúc
    (c) => {
      for (const s of sides) blob(c, s * 0.72, -0.76, 0.36, 0.36, "#272b27", { gloss: false });
      head(c, "#f7f8f2", 1, 0.95, 0.04);
      for (const s of sides) { blob(c, s * 0.4, -0.04, 0.24, 0.3, "#232723", { rot: -s * 0.4, gloss: false, lw: 0.03 }); eye(c, s * 0.4, -0.04, 0.095, "#555c55"); blush(c, s * 0.7, 0.32); }
      nose(c, 0, 0.2, 0.13, 0.09, "#232723"); mouth(c, 0, 0.33, 0.11); },
    // 8 Hổ
    (c) => { const col = "#ffa63d";
      for (const s of sides) { blob(c, s * 0.72, -0.74, 0.32, 0.32, col, { gloss: false }); blob(c, s * 0.72, -0.74, 0.18, 0.18, "#fff0d0", { gloss: false, lw: 0.015 }); }
      head(c, col, 1, 0.93, 0.05);
      c.save(); c.strokeStyle = "#6e3510"; c.lineWidth = 0.075; c.lineCap = "round";
      for (const x of [-0.2, 0, 0.2]) { c.beginPath(); c.moveTo(x, -0.88 + Math.abs(x) * 0.5); c.lineTo(x, x ? -0.62 : -0.52); c.stroke(); }
      for (const s of sides) for (const y of [0.0, 0.2]) { c.beginPath(); c.moveTo(s * 0.86, y); c.lineTo(s * 0.64, y + 0.03); c.stroke(); }
      c.restore();
      blob(c, 0, 0.3, 0.42, 0.3, "#fff3df", { gloss: false, lw: 0.03 });
      for (const s of sides) { eye(c, s * 0.4, -0.05); blush(c, s * 0.68, 0.3); }
      nose(c, 0, 0.2, 0.11, 0.08, "#ff7a8a"); mouth(c, 0, 0.32, 0.12); },
    // 9 Gấu
    (c) => { const col = "#b5794a";
      for (const s of sides) { blob(c, s * 0.76, -0.72, 0.34, 0.34, col, { gloss: false }); blob(c, s * 0.76, -0.72, 0.19, 0.19, "#dca877", { gloss: false, lw: 0.015 }); }
      head(c, col, 1, 0.94, 0.05);
      blob(c, 0, 0.3, 0.42, 0.32, "#e6bc8c", { gloss: false, lw: 0.03 });
      for (const s of sides) { eye(c, s * 0.42, -0.1); blush(c, s * 0.7, 0.24); }
      nose(c, 0, 0.2, 0.13, 0.09, "#3b2415"); mouth(c, 0, 0.34, 0.12, "#3b2415"); },
    // 10 Sư tử
    (c) => { const mane = "#e0872e";
      for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU; blob(c, Math.cos(a) * 0.8, Math.sin(a) * 0.8 + 0.02, 0.32, 0.32, i % 2 ? mane : shade(mane, 0.14), { gloss: false }); }
      head(c, "#ffd25a", 0.82, 0.79, 0.05);
      for (const s of sides) { blob(c, s * 0.52, -0.6, 0.19, 0.19, "#ffd25a", { gloss: false }); blob(c, s * 0.52, -0.6, 0.1, 0.1, "#ffb3a0", { gloss: false, lw: 0.012 }); }
      blob(c, 0, 0.28, 0.36, 0.26, "#fff1c4", { gloss: false, lw: 0.03 });
      for (const s of sides) { eye(c, s * 0.34, -0.08, 0.085); blush(c, s * 0.56, 0.2); }
      nose(c, 0, 0.17, 0.1, 0.07, "#c4553a"); mouth(c, 0, 0.29, 0.1); },
    // 11 Thành Lợi (nhân vật đặc biệt, cấp cao nhất)
    (c) => {
      const skin = "#f2c79c", hair = "#23232b";
      for (const s of sides) blob(c, s * 0.97, 0.12, 0.13, 0.2, skin, { gloss: false, lw: 0.04 });
      blob(c, 0, 0.05, 0.96, 0.93, skin);
      // tóc: khối chính + phần bồng phía trên, vuốt sang một bên
      blob(c, 0, -0.62, 1.02, 0.6, hair);
      blob(c, 0.12, -1.1, 0.58, 0.3, hair, { rot: -0.18 });
      blob(c, -0.55, -0.2, 0.2, 0.3, hair, { rot: 0.3, gloss: false });
      blob(c, 0.55, -0.2, 0.2, 0.3, hair, { rot: -0.3, gloss: false });
      // lông mày dày + mắt
      c.save(); c.strokeStyle = "#15151a"; c.lineWidth = 0.075; c.lineCap = "round";
      for (const s of sides) { c.beginPath(); c.moveTo(s * 0.16, 0.12); c.lineTo(s * 0.5, 0.09 - s * 0.01); c.stroke(); }
      c.restore();
      for (const s of sides) { eye(c, s * 0.34, 0.26, 0.082); blush(c, s * 0.62, 0.46, 0.2); }
      // mũi + miệng cười
      c.save(); c.strokeStyle = "rgba(120,70,40,.6)"; c.lineWidth = 0.035; c.lineCap = "round";
      c.beginPath(); c.moveTo(-0.05, 0.4); c.quadraticCurveTo(0, 0.46, 0.06, 0.4); c.stroke(); c.restore();
      mouth(c, 0, 0.56, 0.2);
      // dải tên
      c.save();
      c.fillStyle = "#1c1c22"; c.strokeStyle = "#0c0c10"; c.lineWidth = 0.04;
      c.beginPath(); c.roundRect ? c.roundRect(-0.66, 0.72, 1.32, 0.26, 0.12) : c.rect(-0.66, 0.72, 1.32, 0.26);
      c.fill(); c.stroke();
      c.translate(0, 0.85); c.scale(0.01, 0.01);
      c.fillStyle = "#fff"; c.font = "700 19px Fredoka, 'Trebuchet MS', sans-serif";
      c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("Thành Lợi", 0, 1);
      c.restore();
    },
    // 12 Thảo Nhi (nhân vật người chơi 1)
    (c) => {
      const skin = "#f8d9c0", hair = "#1f1f27";
      // tóc dài phía sau
      blob(c, 0, 0.2, 1.08, 0.98, hair, { gloss: false });
      for (const s of sides) blob(c, s * 0.86, 0.5, 0.3, 0.72, hair, { rot: s * 0.08, gloss: false });
      blob(c, 0, 0.06, 0.9, 0.88, skin);
      // tóc mái rẽ giữa
      blob(c, 0, -0.7, 0.96, 0.36, hair);
      for (const s of sides) blob(c, s * 0.46, -0.42, 0.52, 0.5, hair, { rot: s * 0.5, gloss: false });
      // lông mày + mắt + mi
      c.save(); c.strokeStyle = "#2b2b33"; c.lineWidth = 0.04; c.lineCap = "round";
      for (const s of sides) { c.beginPath(); c.moveTo(s * 0.2, 0.0); c.quadraticCurveTo(s * 0.36, -0.07, s * 0.52, 0.0); c.stroke(); }
      c.lineWidth = 0.05;
      for (const s of sides) { c.beginPath(); c.moveTo(s * 0.5, 0.16); c.lineTo(s * 0.58, 0.1); c.stroke(); }
      c.restore();
      for (const s of sides) { eye(c, s * 0.34, 0.2, 0.095); blush(c, s * 0.58, 0.4, 0.2); }
      // mũi + môi hồng
      blob(c, 0, 0.36, 0.035, 0.03, "#eaa88c", { gloss: false, lw: 0.01, line: "rgba(0,0,0,0)" });
      mouth(c, 0, 0.5, 0.11, "#c4506a");
      // kẹp tóc ngôi sao
      c.save(); c.translate(0.6, -0.5); c.rotate(0.3);
      c.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.07 : 0.17; i ? c.lineTo(Math.cos(a) * r, Math.sin(a) * r) : c.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
      c.closePath(); c.fillStyle = "#ffd54a"; c.fill(); c.lineWidth = 0.03; c.strokeStyle = "#a8761a"; c.stroke();
      c.restore();
      // dải tên
      c.save();
      c.fillStyle = "#e8628c"; c.strokeStyle = "#8a2447"; c.lineWidth = 0.04;
      c.beginPath(); c.roundRect ? c.roundRect(-0.66, 0.72, 1.32, 0.26, 0.12) : c.rect(-0.66, 0.72, 1.32, 0.26);
      c.fill(); c.stroke();
      c.translate(0, 0.85); c.scale(0.01, 0.01);
      c.fillStyle = "#fff"; c.font = "700 19px Fredoka, 'Trebuchet MS', sans-serif";
      c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("Thảo Nhi", 0, 1);
      c.restore();
    },
  ];

  // Tạo sprite (canvas ẩn) cho từng cấp. LV[i].r là bán kính vật lý.
  const SC = 2; // siêu mẫu để nét khi thu nhỏ
  window.makeSprites = function (LV) {
    return LV.map((l, i) => {
      const size = Math.ceil(l.r * 3.4 * SC), cn = document.createElement("canvas");
      cn.width = cn.height = size;
      const c = cn.getContext("2d");
      c.translate(size / 2, size / 2); c.scale(l.r * SC, l.r * SC);
      c.lineJoin = "round"; c.lineCap = "round";
      ART[i](c);
      return { cn, half: size / SC / 2 };
    });
  };
})();
