/* ══════════════════════════════════════════════════════════════
   드론 제작 마스터 — 그림 모음 (그림25 · 2026-09-30)
   공용 그리기 도우미 links/fig.js 를 쓴다. 이론 6차시 · 임무장치 · 두 만들기 게임 ·
   수업 슬라이드(deck.js)가 이 파일 하나를 함께 부른다.

   한 칸의 모양
     키: { cap:'캡션 한 줄', cards:['카드 이름'…], draw:function(){ … } }
       cards — 배우기 카드의 이름(n)과 **똑같이**. 그 카드를 누르면 설명 아래에 그림이 나온다.
               (lesson.js 엔진 · 03 부품 칩 · 두 만들기 게임의 부품 도감이 모두 이 이름으로 찾는다)
     순서 = 「그림으로 먼저 보기」 격자에 나오는 순서.
     정답이 되는 글자는 ans:true — 슬라이드는 labels:false 로 불러 ? 로 가린다.

   근거 — 배우기 카드 본문 + 교과서 「드론 제작」(10_드론제작(최종)_단면.pdf) 텍스트.
     교과서에서 확인: 쿼드콥터 대각선 회전(23쪽) · 전진 = 뒤쪽 고속(23쪽) · 프레임 크기 = 대각선 모터 축간 거리(27쪽 근처) ·
     스케치 평면 X-Y 평면도 · Y-Z 정면도 · Z-X 우측면도 · GY-86 핀(87~89쪽) · 바인딩 B/VCC·CH3(114쪽) ·
     PM07 · POWER 6선 · I/O PWM OUT 1~4 · TELEM1(128~131쪽) · 프로펠러 길이=지름 · 피치=한 바퀴에 나아가는 거리(135쪽).
     카드·교재에 없는 수치는 넣지 않았다. 예시 숫자는 캡션에 「예시」라고 적었다.
   ══════════════════════════════════════════════════════════════ */
var FIGS = (function () {
  var F = window.FIG;
  if (!F) return {};
  var C = F.C;
  var t = F.t, box = F.box, line = F.line, arrow = F.arrow, callout = F.callout;

  /* ── 작은 도우미 ─────────────────────────────── */
  function rad(d) { return d * Math.PI / 180; }
  function rot(body, a, cx, cy) { return '<g transform="rotate(' + a + ' ' + cx + ' ' + cy + ')">' + body + '</g>'; }
  function ell(cx, cy, rx, ry, o) {
    o = o || {};
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + (o.fill || 'none') +
      '" stroke="' + (o.c || C.ink) + '" stroke-width="' + (o.w || 1.6) + '"' +
      (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>';
  }
  function dot(x, y, r, c) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 3) + '" fill="' + (c || C.ink) + '"/>'; }
  function divider(x, y1, y2) { return line(x, y1, x, y2, { c: C.grayM, w: 1.4, dash: '6 5' }); }
  function arcPts(cx, cy, r, a0, a1, k) {
    var p = [];
    for (var i = 0; i <= k; i++) { var a = rad(a0 + (a1 - a0) * i / k); p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return p;
  }
  /* 도는 방향 화살표 — cw:true 면 시계 방향(화면 기준) */
  function spin(cx, cy, r, cw, c, o) {
    o = o || {};
    var a0 = o.a0 == null ? -150 : o.a0, a1 = o.a1 == null ? 60 : o.a1;
    /* 화면 좌표는 y 가 아래로 커서, 각도가 커지는 쪽이 시계 방향이다 */
    var p = cw ? arcPts(cx, cy, r, a0, a1, 16) : arcPts(cx, cy, r, a1, a0, 16);
    return F.route(p, { c: c || C.ink, w: o.w || 2.2, head: o.head || 10 });
  }
  /* 위에서 본 쿼드X — 앞이 위쪽. dirs = {fl,fr,rl,rr: true(CW)/false(CCW)/null} */
  function quadTop(cx, cy, R, o) {
    o = o || {};
    var s = '', pos = { fl: [-1, -1], fr: [1, -1], rl: [-1, 1], rr: [1, 1] }, pr = o.pr || R * 0.46;
    Object.keys(pos).forEach(function (k) {
      var x = cx + pos[k][0] * R * 0.7071, y = cy + pos[k][1] * R * 0.7071;
      s += line(cx, cy, x, y, { c: C.grayM, w: o.aw || 9 });
    });
    Object.keys(pos).forEach(function (k) {
      var x = cx + pos[k][0] * R * 0.7071, y = cy + pos[k][1] * R * 0.7071;
      s += F.circle(x, y, pr, { fill: o.pfill || '#f8fafc', c: C.line, w: 1.4, dash: '5 4' });
      s += F.circle(x, y, o.mr || 9, { fill: C.grayM, c: C.ink, w: 1.4 });
      var d = o.dirs && o.dirs[k];
      if (d === true || d === false) s += spin(x, y, pr - 6, d, d ? C.blue : C.orange);
    });
    s += box(cx - (o.bw || 26), cy - (o.bh || 26), (o.bw || 26) * 2, (o.bh || 26) * 2, { fill: o.bfill || C.grayL, c: C.ink, r: 8 });
    return s;
  }
  /* 옆에서 본 쿼드 — (cx,cy)=몸체 가운데, w=모터 사이 폭 */
  function droneSide(cx, cy, w, o) {
    o = o || {};
    var h = w / 2, s = '';
    s += line(cx - h, cy, cx + h, cy, { w: 5, c: C.ink });                                   /* 암 */
    s += box(cx - 30, cy - 12, 60, 20, { fill: o.body || C.grayL, c: C.ink, r: 5 });           /* 몸체 */
    [-1, 1].forEach(function (k) {
      var x = cx + k * h;
      s += box(x - 8, cy - 16, 16, 14, { fill: C.grayM, c: C.ink, r: 3, w: 1.2 });             /* 모터 */
      s += line(x - (o.pw || 34), cy - 20, x + (o.pw || 34), cy - 20, { w: 3, c: o.pc || C.ink }); /* 프로펠러 */
    });
    if (o.skid !== false) {
      s += F.poly([[cx - 18, cy + 8], [cx - 30, cy + 30]], { w: 2 }) + F.poly([[cx + 18, cy + 8], [cx + 30, cy + 30]], { w: 2 });
      s += line(cx - 40, cy + 30, cx - 18, cy + 30, { w: 2.4 }) + line(cx + 18, cy + 30, cx + 40, cy + 30, { w: 2.4 });
    }
    return s;
  }
  function person(x, y, s, c) {
    s = s || 1; c = c || C.ink;
    return F.circle(x, y - 30 * s, 9 * s, { fill: C.paper, c: c, w: 2 }) +
      F.path('M' + (x - 14 * s) + ',' + (y + 14 * s) + ' Q' + x + ',' + (y - 34 * s) + ' ' + (x + 14 * s) + ',' + (y + 14 * s), { c: c, w: 2, fill: C.paper });
  }
  function laptop(x, y, c) {
    return box(x - 30, y - 34, 60, 38, { fill: C.blueL, c: c || C.ink, r: 3 }) +
      F.poly([[x - 40, y + 4], [x + 40, y + 4], [x + 46, y + 12], [x - 46, y + 12]], { close: 1, fill: C.grayM, w: 1.4 });
  }
  function waves(x, y, dir, c, n) { /* 전파 — dir 1 이면 오른쪽으로 퍼짐 */
    var s = '';
    for (var i = 1; i <= (n || 3); i++) {
      var r = 7 * i;
      s += F.path('M' + x + ',' + (y - r) + ' A' + r + ',' + r + ' 0 0 ' + (dir > 0 ? 1 : 0) + ' ' + x + ',' + (y + r), { c: c || C.green, w: 1.8 });
    }
    return s;
  }
  function servo(x, y, o) { /* 위에서 본 서보 몸체 + 혼. (x,y)=축 */
    o = o || {};
    var a = o.a == null ? 0 : o.a, L = o.L || 30;
    var s = box(x - 22, y - 16, 56, 32, { fill: o.fill || C.blueL, c: C.blue, r: 4 });
    s += rot(box(x - 6, y - 5, L + 6, 10, { fill: C.paper, c: C.ink, r: 5, w: 1.4 }), a, x, y);
    s += dot(x, y, 4, C.ink);
    return s;
  }
  function nozzle(x, y, s) { /* 끝점(x,y) 기준 노즐 — 3D프린터 마스터 figs.js 와 같은 모양 */
    s = s || 1;
    return F.poly([[x - 12 * s, y - 26 * s], [x + 12 * s, y - 26 * s], [x + 12 * s, y - 12 * s], [x + 5 * s, y - 12 * s],
      [x, y], [x - 5 * s, y - 12 * s], [x - 12 * s, y - 12 * s]], { close: 1, fill: C.grayM, w: 1.4 });
  }
  function bed(x, y, w) { return box(x, y, w, 7, { fill: C.grayM, r: 2, w: 1 }); }

  return {

  /* ─────────── 01 드론 개요 ─────────── */
  uavUas: { cards: ['UAV', 'UAS', 'RPAS'],
    cap: 'UAV 는 비행체만, UAS 는 지상통제소·통신·조종자까지 묶은 전체, RPAS 는 사람이 원격 조종한다는 점을 강조',
    draw: function () {
      var s = box(12, 14, 456, 236, { fill: '#f8fbff', c: C.blue, w: 2, dash: '8 5', r: 14 });
      s += t(30, 38, 'UAS', { b: 1, size: 19, c: C.blue, ans: 1 }) + t(86, 38, '무인 항공기 시스템 — 전체', { size: 14, c: C.sub });
      s += box(28, 60, 176, 172, { fill: C.orangeL, c: C.orange, r: 10 });
      s += t(116, 82, 'UAV', { a: 'm', b: 1, size: 18, c: C.orange, ans: 1 }) + t(116, 104, '비행체 그 자체', { a: 'm', size: 13.5, c: C.sub });
      s += droneSide(116, 168, 110, { pw: 26 });
      s += box(282, 62, 170, 50, { fill: C.grayL, label: '지상통제소', size: 15 });
      s += arrow(212, 120, 280, 94, { c: C.sub, w: 1.6, dash: '5 4', both: 1, head: 9 });
      s += t(246, 132, '통신 장비', { a: 'm', size: 13.5, c: C.sub });
      s += person(310, 196, 0.95);
      s += t(310, 226, '조종자', { a: 'm', size: 14 });
      s += arrow(328, 172, 348, 118, { c: C.green, w: 1.6, head: 9 });
      s += t(370, 170, 'RPAS', { b: 1, size: 17, c: C.green, ans: 1 }) + t(370, 194, '사람이', { size: 13.5, c: C.sub }) + t(370, 212, '원격 조종', { size: 13.5, c: C.sub });
      return F.svg(480, 262, s);
    } },

  fixRot: { cards: ['고정익 드론', '회전익 드론'],
    cap: '고정익은 앞으로 나아가야 날개에서 양력이 생기고, 회전익은 로터를 돌려 제자리에서 양력을 얻는다',
    draw: function () {
      var s = t(120, 26, '고정익', { a: 'm', b: 1, size: 18, c: C.blue }) + t(360, 26, '회전익', { a: 'm', b: 1, size: 18, c: C.orange }) + divider(240, 14, 262);
      /* 고정익 — 옆에서 본 비행기 */
      s += F.path('M40,128 Q60,114 150,116 L186,112 Q200,120 186,128 L60,134 Q42,134 40,128 Z', { fill: C.blueL, c: C.blue, w: 1.8 });
      s += F.poly([[58, 124], [44, 96], [60, 96], [82, 120]], { close: 1, fill: C.blueL, c: C.blue, w: 1.6 });
      s += ell(118, 126, 40, 5, { fill: C.blue, c: C.blue });
      s += arrow(118, 110, 118, 64, { c: C.green, w: 2.6 }) + t(128, 76, '양력', { b: 1, c: C.green });
      s += arrow(196, 150, 228, 150, { c: C.ink, w: 2.2 }) + t(150, 150, '앞으로', { size: 14 });
      s += t(120, 196, '멀리 · 오래 · 빠르게', { a: 'm', size: 14 });
      s += t(120, 220, '제자리에 멈출 수 없다', { a: 'm', size: 14, c: C.red, b: 1 });
      s += t(120, 242, '활주로·발사 장치 필요', { a: 'm', size: 13.5, c: C.sub });
      /* 회전익 */
      s += droneSide(360, 124, 140);
      [310, 410].forEach(function (x) { for (var k = -1; k <= 1; k++) s += arrow(x + k * 14, 112 + 10, x + k * 14, 150 + 10, { c: C.sub, w: 1.2, head: 7 }); });
      s += arrow(360, 100, 360, 56, { c: C.green, w: 2.6 }) + t(370, 66, '양력', { b: 1, c: C.green });
      s += t(360, 196, '수직 이착륙 · 호버링', { a: 'm', size: 14 });
      s += t(360, 220, '체공 시간이 짧다', { a: 'm', size: 14, c: C.red, b: 1 });
      s += t(360, 242, '공기를 아래로 밀어낸다', { a: 'm', size: 13.5, c: C.sub });
      return F.svg(480, 262, s);
    } },

  tiltHybrid: { cards: ['틸트로터 드론', '하이브리드 드론'],
    cap: '틸트로터는 로터를 세웠다 눕혔다 하고, 하이브리드는 수직 이착륙용 로터를 따로 단다',
    draw: function () {
      function plane(x, y) { /* 옆에서 본 날개 달린 몸체 */
        return F.path('M' + (x - 70) + ',' + y + ' Q' + (x - 60) + ',' + (y - 10) + ' ' + (x + 50) + ',' + (y - 8) + ' Q' + (x + 70) + ',' + y + ' ' + (x + 50) + ',' + (y + 8) + ' L' + (x - 60) + ',' + (y + 8) + ' Z', { fill: C.grayL, c: C.ink, w: 1.6 }) +
          F.poly([[x - 60, y - 4], [x - 72, y - 26], [x - 58, y - 26], [x - 42, y - 6]], { close: 1, fill: C.grayL, w: 1.4 });
      }
      var s = t(120, 24, '틸트로터', { a: 'm', b: 1, size: 18, c: C.blue, ans: 1 }) + t(360, 24, '하이브리드', { a: 'm', b: 1, size: 18, c: C.purple, ans: 1 }) + divider(240, 12, 266);
      /* 틸트로터 — 뜰 때 / 순항 */
      s += plane(120, 86) + box(120, 70, 12, 22, { fill: C.blueL, c: C.blue, r: 3, w: 1.4 }) + line(96, 66, 156, 66, { c: C.blue, w: 3.2 });
      s += arrow(126, 60, 126, 36, { c: C.green, w: 2 });
      s += t(142, 44, '뜰 때 — 세운다', { size: 14, b: 1 });
      s += F.route(arcPts(206, 124, 26, -80, 80, 10), { c: C.sub, w: 1.6, head: 9 });
      s += plane(120, 180) + box(120, 172, 22, 12, { fill: C.blueL, c: C.blue, r: 3, w: 1.4 }) + line(146, 152, 146, 208, { c: C.blue, w: 3.2 });
      s += arrow(196, 180, 226, 180, { c: C.green, w: 2 });
      s += t(40, 220, '순항 — 눕힌다', { size: 14, b: 1 });
      s += t(120, 250, '구조가 복잡하고 비싸다', { a: 'm', size: 13.5, c: C.red, b: 1 });
      /* 하이브리드 — 위에서 본 모습 */
      s += F.path('M360,52 L372,70 L372,210 L360,226 L348,210 L348,70 Z', { fill: C.grayL, c: C.ink, w: 1.6 });
      s += box(262, 104, 196, 26, { fill: C.grayL, c: C.ink, r: 6 });
      s += line(314, 70, 314, 196, { w: 4 }) + line(406, 70, 406, 196, { w: 4 });
      [[314, 76], [406, 76], [314, 190], [406, 190]].forEach(function (p) {
        s += F.circle(p[0], p[1], 20, { fill: C.purpleL, c: C.purple, w: 1.4, dash: '4 3' }) + dot(p[0], p[1], 4, C.purple);
      });
      s += line(346, 236, 374, 236, { c: C.orange, w: 3.2 }) + dot(360, 230, 3, C.ink);
      s += t(360, 44, '수직 로터(뜨고 내릴 때만)', { a: 'm', size: 13.5, c: C.sub });
      s += t(360, 258, '추진 프로펠러 — 순항', { a: 'm', size: 13.5, c: C.orange, b: 1 });
      return F.svg(480, 272, s);
    } },

  history: { cards: ['파이어비 (Firebee)', '록히드 D-21', 'RQ-4 글로벌 호크', '블랙 호넷'],
    cap: '역사에 남은 기체 — 표적에서 정찰로, 초음속에서 장시간 감시와 초소형까지',
    draw: function () {
      var s = line(28, 124, 452, 124, { c: C.grayM, w: 6 });
      s += arrow(430, 124, 466, 124, { c: C.grayM, w: 6, head: 14 });
      var P = [
        [68, '1950년대', '파이어비', '드론의 효시', '표적용 → 정찰용', '베트남전 정찰', C.blue],
        [178, '1962년', '록히드 D-21', '마하 3 이상', '초음속 정찰', 'U-2 격추(1960)가 계기', C.orange],
        [296, '', 'RQ-4 글로벌 호크', '32시간 이상 체공', '최고 1만 8,000m', '14.6t · 570km/h', C.green],
        [408, '', '블랙 호넷', '길이 16cm', '무게 18g', '약 25분 비행', C.purple]
      ];
      P.forEach(function (p, i) {
        var up = i % 2 === 0, y0 = up ? 96 : 152;
        s += F.circle(p[0], 124, 9, { fill: p[6], c: p[6] });
        if (p[1]) s += t(p[0], up ? 146 : 102, p[1], { a: 'm', size: 13.5, b: 1, c: C.sub });
        s += t(p[0], up ? 30 : 176, p[2], { a: 'm', size: 15.5, b: 1, c: p[6] });
        s += t(p[0], up ? 52 : 198, p[3], { a: 'm', size: 13.5 });
        s += t(p[0], up ? 72 : 218, p[4], { a: 'm', size: 13.5 });
        s += t(p[0], up ? 90 + 0 : 238, p[5], { a: 'm', size: 13, c: C.sub });
      });
      s += t(452, 146, '오늘날', { a: 'e', size: 13.5, b: 1, c: C.sub });
      return F.svg(480, 256, s);
    } },

  /* ─────────── 02 비행 원리 ─────────── */
  forces4: { cards: ['양력 (Lift)', '중력 (Gravity)', '추력 (Thrust)', '항력 (Drag)'],
    cap: '드론에 걸리는 네 가지 힘 — 위아래로 양력과 중력, 앞뒤로 추력과 항력',
    draw: function () {
      var s = droneSide(240, 150, 150);
      s += arrow(240, 128, 240, 50, { c: C.blue, w: 3.2, head: 14 }) + t(254, 58, '양력', { b: 1, c: C.blue }) + t(254, 78, '위로 들어 올림', { size: 13, c: C.sub });
      s += arrow(240, 184, 240, 262, { c: C.red, w: 3.2, head: 14 }) + t(254, 246, '중력', { b: 1, c: C.red }) + t(254, 266, '무게 — 지구 중심으로', { size: 13, c: C.sub });
      s += arrow(330, 150, 448, 150, { c: C.green, w: 3.2, head: 14 }) + t(440, 128, '추력', { a: 'e', b: 1, c: C.green }) + t(440, 174, '앞으로', { a: 'e', size: 13, c: C.sub });
      s += arrow(150, 150, 32, 150, { c: C.ink, w: 3.2, head: 14 }) + t(40, 128, '항력', { b: 1, ans: 1 }) + t(40, 174, '공기 저항', { size: 13, c: C.sub, ans: 1 });
      s += t(460, 30, '진행 방향 →', { a: 'e', size: 13.5, c: C.sub });
      return F.svg(480, 286, s);
    } },

  liftStates: { cards: ['양력 (Lift)', '중력 (Gravity)', '호버링 (Hovering)'],
    cap: '상승 · 호버링 · 하강 — 양력과 중력 화살표의 길이를 비교한다',
    draw: function () {
      var s = '';
      [[82, '상승', 70, 34, '양력 > 중력', 0], [240, '호버링', 50, 50, '양력 = 중력', 1], [398, '하강', 32, 68, '양력 < 중력', 0]].forEach(function (p, i) {
        if (i) s += divider(p[0] - 79, 20, 250);
        s += t(p[0], 28, p[1], { a: 'm', b: 1, size: 17 });
        s += droneSide(p[0], 136, 96, { pw: 20 });
        s += arrow(p[0], 116, p[0], 116 - p[2], { c: C.blue, w: 3, head: 12 });
        s += arrow(p[0], 168, p[0], 168 + p[3], { c: C.red, w: 3, head: 12 });
        s += t(p[0], 240, p[4], { a: 'm', b: 1, size: 15, c: i === 1 ? C.green : C.ink, ans: p[5] });
      });
      s += t(38, 62, '양력', { size: 13.5, c: C.blue, b: 1 }) + t(38, 214, '중력', { size: 13.5, c: C.red, b: 1 });
      s += t(240, 266, '스로틀 대략 절반', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 282, s);
    } },

  tiltThrust: { cards: ['추력 (Thrust)'],
    cap: '앞으로 기울이면 양력의 일부가 앞쪽 힘(추력)이 된다 — 뒤쪽 로터를 더 빠르게 돌려 기울인다',
    draw: function () {
      var cx = 230, cy = 156, a = 16;
      var s = rot(droneSide(cx, cy, 170, { skid: false }), a, cx, cy);
      var L = 104, ux = Math.sin(rad(a)), uy = -Math.cos(rad(a));
      var ex = cx + ux * L, ey = cy - 14 + uy * L;
      s += arrow(cx, cy - 14, ex, ey, { c: C.blue, w: 3.2, head: 13 }) + t(ex + 8, ey - 4, '양력', { b: 1, c: C.blue });
      s += arrow(cx, cy - 14, cx, ey, { c: C.sub, w: 1.8, dash: '6 4', head: 10 }) + t(cx - 10, ey + 6, '뜨는 힘', { a: 'e', size: 13.5, c: C.sub });
      s += arrow(cx, cy - 14, ex, cy - 14, { c: C.green, w: 2.6, head: 11 }) + t(ex + 10, cy - 12, '추력(앞으로)', { b: 1, size: 15, c: C.green });
      s += line(cx, ey, ex, ey, { c: C.grayM, w: 1, dash: '3 3' }) + line(ex, ey, ex, cy - 14, { c: C.grayM, w: 1, dash: '3 3' });
      var bx = cx - 85 * Math.cos(rad(a)), by = cy - 85 * Math.sin(rad(a)), fx = cx + 85 * Math.cos(rad(a)), fy = cy + 85 * Math.sin(rad(a));
      s += callout(bx, by - 22, 110, 84, '뒤쪽 고속', { a: 'e', b: 1, ans: 1 }) + callout(fx, fy - 22, 372, 212, '앞쪽 저속', { a: 's', b: 1, ans: 1 });
      s += arrow(300, 262, 380, 262, { c: C.ink, w: 2 }) + t(290, 262, '전진', { a: 'e', size: 14, b: 1 });
      return F.svg(480, 284, s);
    } },

  sticks: { cards: ['스로틀 (Throttle)', '엘리베이터 (Elevator)', '에일러론 (Aileron)', '러더 (Rudder)'],
    cap: '조종기 두 스틱 — 왼쪽은 높이와 방향, 오른쪽은 앞뒤와 좌우',
    draw: function () {
      function pad(x, head, up, dn, lf, rt, col, ansLR) {
        var cx = x + 100, cy = 130, s = '';
        s += t(cx, 30, head, { a: 'm', b: 1, size: 16, c: col });
        s += box(x + 40, 70, 120, 120, { fill: C.grayL, c: C.ink, r: 14 });
        s += line(cx, 80, cx, 180, { c: C.grayM, w: 1.4 }) + line(x + 50, cy, x + 150, cy, { c: C.grayM, w: 1.4 });
        s += F.circle(cx, cy, 13, { fill: col, c: C.ink, w: 1.4 });
        s += arrow(cx, cy - 18, cx, cy - 52, { c: col, w: 2, head: 9 }) + arrow(cx, cy + 18, cx, cy + 52, { c: col, w: 2, head: 9 });
        s += arrow(cx - 18, cy, cx - 52, cy, { c: C.ink, w: 2, head: 9 }) + arrow(cx + 18, cy, cx + 52, cy, { c: C.ink, w: 2, head: 9 });
        s += t(cx, 56, up, { a: 'm', size: 14.5, b: 1, c: col }) + t(cx, 206, dn, { a: 'm', size: 13.5, c: C.sub });
        s += t(cx, 230, lf, { a: 'm', size: 14.5, b: 1, ans: ansLR }) + t(cx, 250, rt, { a: 'm', size: 13.5, c: C.sub });
        return s;
      }
      var s = pad(0, '왼쪽 스틱', '스로틀 ▲▼', '상승 · 하강', '러더 ◀▶', '제자리에서 기수 돌리기', C.blue, 1) +
        pad(240, '오른쪽 스틱', '엘리베이터 ▲▼', '전진 · 후진', '에일러론 ◀▶', '왼쪽 · 오른쪽 이동', C.orange, 0);
      s += divider(240, 20, 250);
      return F.svg(480, 266, s);
    } },

  axes3: { cards: ['엘리베이터 (Elevator)', '에일러론 (Aileron)', '러더 (Rudder)'],
    cap: '피치 · 롤 · 요 — 앞뒤로 기울기 · 좌우로 기울기 · 제자리에서 돌기',
    draw: function () {
      var s = '';
      /* 피치 — 옆에서 */
      s += t(80, 26, '피치 (Pitch)', { a: 'm', b: 1, size: 16, c: C.blue }) + t(80, 46, '엘리베이터', { a: 'm', size: 13.5, c: C.sub });
      s += rot(droneSide(80, 126, 100, { pw: 20, skid: false }), 14, 80, 126) + dot(80, 124, 4, C.blue);
      s += F.route(arcPts(80, 124, 58, -130, -60, 10), { c: C.blue, w: 2.2, head: 10 });
      s += t(80, 196, '옆에서 본 모습', { a: 'm', size: 13, c: C.sub }) + t(80, 222, '앞뒤로 기운다', { a: 'm', size: 14.5, b: 1 });
      s += divider(160, 16, 240);
      /* 롤 — 앞에서 */
      s += t(240, 26, '롤 (Roll)', { a: 'm', b: 1, size: 16, c: C.orange }) + t(240, 46, '에일러론', { a: 'm', size: 13.5, c: C.sub });
      s += rot(droneSide(240, 126, 100, { pw: 20, skid: false }), -14, 240, 126) + dot(240, 124, 4, C.orange);
      s += F.route(arcPts(240, 124, 58, -60, -130, 10), { c: C.orange, w: 2.2, head: 10 });
      s += t(240, 196, '앞에서 본 모습', { a: 'm', size: 13, c: C.sub }) + t(240, 222, '좌우로 기운다', { a: 'm', size: 14.5, b: 1 });
      s += divider(320, 16, 240);
      /* 요 — 위에서 */
      s += t(400, 26, '요 (Yaw)', { a: 'm', b: 1, size: 16, c: C.green }) + t(400, 46, '러더', { a: 'm', size: 13.5, c: C.sub });
      s += quadTop(400, 124, 48, { pr: 15, mr: 5, aw: 6, bw: 13, bh: 13 });
      s += F.route(arcPts(400, 124, 62, -40, 60, 12), { c: C.green, w: 2.2, head: 10 });
      s += arrow(400, 112, 400, 90, { c: C.ink, w: 1.6, head: 8 });
      s += t(400, 196, '위에서 본 모습', { a: 'm', size: 13, c: C.sub }) + t(400, 222, '제자리에서 돈다', { a: 'm', size: 14.5, b: 1 });
      return F.svg(480, 244, s);
    } },

  torque: { cards: ['토크 상쇄', 'BLDC 모터 ×4'],
    cap: '프로펠러가 한 방향으로만 돌면 기체가 반대로 돈다 → 대각선끼리 같은 방향으로 돌려 상쇄한다',
    draw: function () {
      var s = t(96, 24, '한 방향으로만 돌면', { a: 'm', b: 1, size: 15 });
      s += F.circle(96, 132, 40, { fill: '#f8fafc', c: C.line, w: 1.4, dash: '5 4' }) + F.circle(96, 132, 10, { fill: C.grayM });
      s += spin(96, 132, 32, true, C.blue);
      s += F.route(arcPts(96, 132, 68, 200, 110, 12), { c: C.red, w: 2.6, head: 12 });
      s += t(96, 226, '기체가 반대로 돈다', { a: 'm', size: 14, b: 1, c: C.red, ans: 1 }) + t(96, 244, '(반작용)', { a: 'm', size: 13, c: C.sub });
      s += divider(196, 14, 256);
      s += t(338, 24, '대각선끼리 같은 방향', { a: 'm', b: 1, size: 15 });
      s += quadTop(338, 136, 88, { dirs: { fl: true, rr: true, fr: false, rl: false }, pr: 30 });
      s += arrow(338, 146, 338, 122, { c: C.ink, w: 1.6, head: 8 }) + t(338, 58, '앞', { a: 'm', size: 13, c: C.sub });
      s += t(338, 250, '돌리려는 힘이 서로 상쇄', { a: 'm', size: 14, b: 1, c: C.green, ans: 1 });
      s += t(250, 276, '↻ 시계(CW)', { size: 14, b: 1, c: C.blue }) + t(360, 276, '↺ 반시계(CCW)', { size: 14, b: 1, c: C.orange });
      return F.svg(480, 290, s);
    } },

  /* ─────────── 03 드론 기본 구조 ─────────── */
  parts5: { cards: ['프레임', '모터·프로펠러', '변속기(ESC)', '비행제어장치(FC)', '착륙장치'],
    cap: '드론의 다섯 부품 — 뼈대(프레임)에 모터·프로펠러, 변속기, 두뇌(FC), 다리(착륙장치)가 붙는다',
    draw: function () {
      var cx = 240, cy = 150, h = 150, s = '';
      s += line(cx - h, cy, cx + h, cy, { w: 7, c: C.ink });
      s += box(cx - 56, cy - 10, 112, 22, { fill: C.grayL, c: C.ink, r: 5 });
      s += box(cx - 30, cy - 36, 60, 26, { fill: C.blueL, c: C.blue, r: 5 });
      [-1, 1].forEach(function (k) {
        var x = cx + k * h;
        s += box(x - 12, cy - 26, 24, 20, { fill: C.grayM, c: C.ink, r: 3, w: 1.4 });
        s += line(x - 50, cy - 32, x + 50, cy - 32, { w: 3.4 });
        s += box(cx + k * 82 - 16, cy + 4, 32, 14, { fill: C.orangeL, c: C.orange, r: 3, w: 1.4 });
      });
      s += F.poly([[cx - 36, cy + 12], [cx - 60, cy + 58]], { w: 2.6 }) + F.poly([[cx + 36, cy + 12], [cx + 60, cy + 58]], { w: 2.6 });
      s += line(cx - 84, cy + 58, cx - 40, cy + 58, { w: 3 }) + line(cx + 40, cy + 58, cx + 84, cy + 58, { w: 3 });
      s += callout(cx - 10, cy - 36, 196, 34, '비행제어장치(FC)', { a: 'e', b: 1 });
      s += callout(cx + h + 30, cy - 32, 420, 52, '모터·프로펠러', { a: 'e', b: 1 });
      s += callout(cx + 82, cy + 18, 330, 228, '변속기(ESC)', { a: 's', b: 1 });
      s += callout(cx - 120, cy + 2, 40, 208, '프레임(암)', { a: 's', b: 1 });
      s += callout(cx - 62, cy + 58, 110, 256, '착륙장치', { a: 's', b: 1 });
      return F.svg(480, 276, s);
    } },

  powerSignal: { cards: ['변속기(ESC)', '비행제어장치(FC)', '모터·프로펠러'],
    cap: '전력은 배터리 → 변속기(ESC) → 모터로, 명령은 FC → 변속기로 간다',
    draw: function () {
      var s = box(20, 150, 100, 50, { fill: C.grayL, label: '배터리', size: 15 });
      s += box(190, 150, 100, 50, { fill: C.orangeL, c: C.orange, label: '변속기(ESC)', size: 15 });
      s += box(360, 150, 100, 50, { fill: C.grayL, label: '모터', size: 15 });
      s += box(190, 40, 100, 50, { fill: C.blueL, c: C.blue, label: 'FC', size: 16 });
      s += box(20, 40, 100, 50, { fill: C.grayL, label: '수신기 · 센서', size: 13.5 });
      s += arrow(122, 175, 186, 175, { c: C.red, w: 5, head: 14 }) + arrow(292, 175, 356, 175, { c: C.red, w: 5, head: 14 });
      s += t(154, 214, '전력', { a: 'm', size: 14, b: 1, c: C.red }) + t(324, 214, '삼선', { a: 'm', size: 14, b: 1, c: C.red });
      s += arrow(240, 92, 240, 146, { c: C.blue, w: 2, dash: '6 4', head: 11 }) + t(250, 120, '회전 속도 명령(신호)', { size: 14, b: 1, c: C.blue });
      s += arrow(122, 65, 186, 65, { c: C.blue, w: 2, dash: '6 4', head: 11 });
      s += t(240, 248, '모터를 돌리라고 명령하는 것은 FC, 속도를 만드는 것은 ESC', { a: 'm', size: 13.5, c: C.sub });
      return F.svg(480, 266, s);
    } },

  /* ─────────── 04 항공안전법 ─────────── */
  ultralight: { cards: ['초경량비행장치'],
    cap: '초경량비행장치 — 우리 드론은 그중 무인비행장치, 그 안의 무인멀티콥터다',
    draw: function () {
      var s = box(140, 18, 200, 40, { fill: C.grayL, label: '초경량비행장치', size: 16 });
      var K = ['동력비행장치', '행글라이더', '패러글라이더', '기구류', '무인비행장치', '회전익비행장치', '동력패러글라이더', '낙하산류'];
      K.forEach(function (k, i) {
        var col = i % 4, row = Math.floor(i / 4), x = 16 + col * 114, y = 88 + row * 54, me = k === '무인비행장치';
        s += line(240, 58, x + 52, y, { c: C.grayM, w: 1 });
        s += box(x, y, 104, 38, { fill: me ? C.blueL : C.paper, c: me ? C.blue : C.line, w: me ? 2.4 : 1.2, label: k, size: k.length > 6 ? 12.5 : 13.5, lc: me ? C.blue : C.ink });
      });
      s += arrow(68, 180, 68, 214, { c: C.blue, w: 2.4 });
      s += box(20, 218, 196, 40, { fill: C.orangeL, c: C.orange, w: 2, label: '무인멀티콥터', size: 16, lc: C.orange, ans: 1 });
      s += t(230, 238, '← 우리가 만드는 드론', { size: 14, b: 1 });
      return F.svg(480, 272, s);
    } },

  weightScale: { cards: ['기체 신고', '1종 (25kg 초과)', '2종 (7kg 초과 25kg 이하)', '3종 (2kg 초과 7kg 이하)', '4종 (250g 초과 2kg 이하)', '첫 자리 — 무게 등급'],
    cap: '최대이륙중량 경계 250g · 2kg · 7kg · 25kg — 조종자 증명 종 구분과 신고 대상',
    draw: function () {
      var X = [24, 110, 206, 302, 398, 462], y = 130, s = '';
      var seg = [[C.grayL, '증명 필요\n없음', '비행경력 →'], [C.blueL, '4종', '온라인 교육'], [C.greenL, '3종', '6시간'], [C.orangeL, '2종', '10시간'], [C.redL, '1종', '20시간']];
      seg.forEach(function (g, i) {
        s += box(X[i], y - 22, X[i + 1] - X[i], 44, { fill: g[0], c: C.line, r: 0, w: 1 });
        s += t((X[i] + X[i + 1]) / 2, y, g[1], { a: 'm', b: 1, size: i ? 17 : 13, ans: 1 });
        s += t((X[i] + X[i + 1]) / 2, y + 40, g[2], { a: 'm', size: 13, c: C.sub });
      });
      ['250g', '2kg', '7kg', '25kg'].forEach(function (w, i) {
        s += line(X[i + 1], y - 30, X[i + 1], y + 26, { w: 2.4 }) + t(X[i + 1], y - 42, w, { a: 'm', b: 1, size: 15 });
      });
      s += arrow(110, 64, 462, 64, { c: C.red, w: 2, head: 10 }) + line(110, 56, 110, 72, { c: C.red, w: 2 });
      s += t(286, 50, '기체 신고 대상 (250g 초과)', { a: 'm', size: 14.5, b: 1, c: C.red });
      s += t(24, 30, '가벼움', { size: 13, c: C.sub }) + t(462, 30, '무거움', { a: 'e', size: 13, c: C.sub });
      s += t(240, 226, '무거울수록 종 숫자가 작다', { a: 'm', size: 14.5, b: 1, ans: 1 });
      s += t(240, 250, '사업용은 무게와 관계없이 신고 · 250g 이하도 증명 필요', { a: 'm', size: 13.5, c: C.sub });
      return F.svg(480, 266, s);
    } },

  nightSight: { cards: ['야간 · 육안 비행'],
    cap: '일몰 후부터 일출 전까지는 비행 금지, 날 때도 조종자 눈에 보이는 범위 안에서만',
    draw: function () {
      var s = t(116, 26, '하루', { a: 'm', b: 1, size: 16 });
      s += box(16, 54, 50, 40, { fill: '#cbd5e1', c: C.ink, r: 0, w: 1 }) + box(66, 54, 100, 40, { fill: C.yellowL, c: C.ink, r: 0, w: 1 }) + box(166, 54, 50, 40, { fill: '#cbd5e1', c: C.ink, r: 0, w: 1 });
      s += t(116, 74, '비행 가능', { a: 'm', size: 14, b: 1, c: C.green });
      s += t(41, 74, '금지', { a: 'm', size: 13.5, b: 1, c: C.red }) + t(191, 74, '금지', { a: 'm', size: 13.5, b: 1, c: C.red });
      s += t(66, 108, '일출', { a: 'm', size: 13.5 }) + t(166, 108, '일몰', { a: 'm', size: 13.5 });
      s += t(116, 146, '특별비행승인을 받으면', { a: 'm', size: 13.5, c: C.sub }) + t(116, 166, '야간에도 가능', { a: 'm', size: 13.5, c: C.sub });
      s += divider(236, 14, 236);
      s += t(360, 26, '육안 범위', { a: 'm', b: 1, size: 16 });
      s += F.circle(318, 170, 104, { fill: C.greenL, c: C.green, w: 1.6, dash: '6 4' });
      s += person(318, 196, 0.9);
      s += droneSide(300, 104, 54, { pw: 12, skid: false });
      s += t(300, 132, '보인다 ○', { a: 'm', size: 13.5, b: 1, c: C.green });
      s += droneSide(446, 74, 40, { pw: 9, skid: false });
      s += t(448, 102, '✕', { a: 'm', size: 18, b: 1, c: C.red });
      s += t(400, 226, '조종자', { a: 'm', size: 13.5 });
      return F.svg(480, 244, s);
    } },

  altitude150: { cards: ['비행 고도', '비행 승인', '승인 신청'],
    cap: '지표면·수면 또는 물건의 상단에서 150m 미만 — 그 위로 올리려면 비행 승인',
    draw: function () {
      /* 150m 를 세로 120 으로 — 지면 y250 → 한계 y130, 건물 위(y190) → 한계 y70 */
      var G = 250, lim = [[12, 130], [290, 130], [290, 70], [400, 70], [400, 130], [468, 130]];
      var s = F.poly([[12, 12]].concat(lim).concat([[468, 12]]), { close: 1, fill: C.redL, c: 'none', w: 0 });
      s += F.poly(lim, { c: C.red, w: 2, dash: '8 5' });
      s += t(150, 34, '150m 이상 — 비행 승인이 있어야 한다', { a: 'm', b: 1, size: 15, c: C.red });
      s += line(12, G, 468, G, { w: 2.6 }) + F.hatch(12, G, 456, 12, { gap: 10, c: C.grayM });
      s += box(290, 190, 110, G - 190, { fill: C.grayL, c: C.ink, r: 2 });
      s += t(345, 214, '물건', { a: 'm', size: 14 }) + t(345, 232, '(건물)', { a: 'm', size: 13, c: C.sub });
      s += F.dim(60, G, 60, 130, '150m 미만', { size: 14.5 });
      s += F.dim(440, 190, 440, 70, '150m 미만', { size: 14.5, side: -1 });
      s += line(400, 190, 450, 190, { c: C.sub, w: 1, dash: '3 3' });
      s += droneSide(170, 190, 60, { pw: 13 });
      s += droneSide(345, 140, 60, { pw: 13 });
      s += t(170, 236, '지표면·수면에서', { a: 'm', size: 13.5, c: C.sub });
      s += t(24, 276, '관제권·비행금지구역은 고도와 관계없이 승인', { size: 13.5, c: C.sub });
      return F.svg(480, 290, s);
    } },

  yield: { cards: ['진로 양보'],
    cap: '초경량비행장치는 우선권이 없다 — 항공기를 보면 드론이 비켜 난다',
    draw: function () {
      var s = F.path('M40,90 Q60,76 170,78 L206,74 Q220,82 206,90 L60,98 Q42,98 40,90 Z', { fill: C.blueL, c: C.blue, w: 1.8 });
      s += F.poly([[58, 86], [44, 58], [60, 58], [82, 82]], { close: 1, fill: C.blueL, c: C.blue, w: 1.6 });
      s += ell(130, 88, 44, 6, { fill: C.blue, c: C.blue });
      s += t(126, 124, '사람이 탄 항공기', { a: 'm', size: 14, b: 1, c: C.blue });
      s += arrow(222, 86, 440, 86, { c: C.blue, w: 2.4, dash: '8 5' }) + t(440, 64, '항공기 진로', { a: 'e', size: 13.5, c: C.sub });
      s += droneSide(330, 104, 50, { pw: 11, skid: false, body: C.orangeL });
      s += F.route([[330, 120], [322, 160], [296, 196]], { c: C.orange, w: 2.6, head: 12 });
      s += droneSide(282, 210, 50, { pw: 11, skid: false, body: C.orangeL });
      s += t(40, 182, '진로를 양보', { size: 16, b: 1, c: C.orange, ans: 1 });
      s += t(40, 206, '드론에는 우선권이 없다', { size: 13.5, c: C.sub });
      return F.svg(480, 240, s);
    } },

  /* ─────────── 05 배터리 · 센서 · 검사 ─────────── */
  lipoScale: { cards: ['리포 배터리 전압', '배터리 안전', '리포 배터리'],
    cap: '리포 배터리 1셀의 전압 — 최소 3.0V · 저전압 경고 3.5V · 정격 3.7V · 보관 3.8V · 만충 4.2V',
    draw: function () {
      var v0 = 2.8, v1 = 4.4, x0 = 30, x1 = 450, y = 130;
      function X(v) { return x0 + (v - v0) / (v1 - v0) * (x1 - x0); }
      var s = t(240, 26, '리튬 폴리머(Li-Po) 1셀', { a: 'm', b: 1, size: 16 });
      s += box(x0, y - 16, X(3.0) - x0, 32, { fill: C.redL, c: C.redL, r: 0 }) + F.hatch(x0, y - 16, X(3.0) - x0, 32, { c: C.red, gap: 8 });
      s += box(X(3.0), y - 16, X(4.2) - X(3.0), 32, { fill: C.greenL, c: C.greenL, r: 0 });
      s += box(X(4.2), y - 16, x1 - X(4.2), 32, { fill: C.redL, c: C.redL, r: 0 }) + F.hatch(X(4.2), y - 16, x1 - X(4.2), 32, { c: C.red, gap: 8 });
      s += box(x0, y - 16, x1 - x0, 32, { fill: 'none', c: C.ink, r: 0, w: 1.4 });
      var M = [[3.0, '3.0V', '최소', C.red, -1], [3.5, '3.5V', 'Fail Safe', C.orange, 1], [3.7, '3.7V', '정격', C.ink, -1], [3.8, '3.8V', '보관', C.ink, 1], [4.2, '4.2V', '만충', C.green, -1]];
      M.forEach(function (m) {
        var x = X(m[0]), up = m[4] < 0;
        s += line(x, y - 24, x, y + 24, { c: m[3], w: 2.6 });
        s += t(x, up ? y - 54 : y + 40, m[1], { a: 'm', b: 1, size: 15, c: m[3] });
        s += t(x, up ? y - 34 : y + 60, m[2], { a: 'm', size: 13.5, c: m[3] === C.ink ? C.sub : m[3] });
      });
      s += t(X(2.9), y + 44, '과방전', { a: 'm', size: 13, c: C.red, b: 1 }) + t(X(2.9), y + 62, '망가진다', { a: 'm', size: 13, c: C.red });
      s += t(X(4.3), y + 44, '과충전', { a: 'm', size: 13, c: C.red, b: 1 });
      s += t(240, 226, '부풀거나(스웰링) 찌그러진 배터리는 쓰지 않는다', { a: 'm', size: 13.5, c: C.sub });
      return F.svg(480, 244, s);
    } },

  series3s: { cards: ['리포 배터리 전압', '3셀 리포 배터리'],
    cap: '셀 3개를 이어 붙인 3셀(3S) — 전압은 셀 수만큼 더한다',
    draw: function () {
      var s = '';
      [0, 1, 2].forEach(function (i) {
        var x = 46 + i * 136;
        s += box(x, 70, 112, 60, { fill: C.blueL, c: C.blue, r: 6 });
        s += t(x + 56, 92, '셀 ' + (i + 1), { a: 'm', size: 13.5, c: C.sub }) + t(x + 56, 114, '3.7V', { a: 'm', b: 1, size: 17, c: C.blue });
        s += t(x + 10, 60, '−', { size: 16, b: 1 }) + t(x + 102, 60, '+', { a: 'e', size: 16, b: 1 });
        if (i < 2) s += line(x + 112, 100, x + 136, 100, { w: 3 });
      });
      s += F.path('M46,146 Q46,160 60,160 L218,160 Q240,160 240,174 Q240,160 262,160 L420,160 Q434,160 434,146', { c: C.ink, w: 1.6 });
      s += t(240, 196, '3.7 × 3 = 11.1V', { a: 'm', b: 1, size: 19, c: C.blue, ans: 1 });
      s += t(240, 226, 'Fail Safe 저전압 = 3.5V × 3 = 10.5V', { a: 'm', size: 14, c: C.orange, b: 1 });
      s += t(240, 32, '3셀(3S) 리포 배터리', { a: 'm', b: 1, size: 16 });
      return F.svg(480, 246, s);
    } },

  gyroAccel: { cards: ['자이로 센서', '가속도 센서', 'GY-86 10축 센서'],
    cap: '자이로는 얼마나 빨리 도는지(회전), 가속도 센서는 어느 쪽으로 움직이고 얼마나 기울었는지를 잰다',
    draw: function () {
      var s = t(120, 26, '자이로 센서', { a: 'm', b: 1, size: 16, c: C.blue }) + t(360, 26, '가속도 센서', { a: 'm', b: 1, size: 16, c: C.orange }) + divider(240, 14, 250);
      s += quadTop(120, 132, 70, { pr: 22, mr: 6, aw: 7, bw: 18, bh: 18 });
      s += F.route(arcPts(120, 132, 82, -60, 50, 12), { c: C.blue, w: 3, head: 12 });
      s += F.route(arcPts(120, 132, 82, 120, 230, 12), { c: C.blue, w: 3, head: 12 });
      s += t(120, 232, '회전(각속도) → 자세 제어', { a: 'm', size: 14, b: 1 });
      s += line(276, 110, 444, 110, { c: C.grayM, w: 1.2, dash: '4 3' });
      s += rot(droneSide(360, 110, 110, { pw: 22, skid: false }), -16, 360, 110);
      s += F.route(arcPts(360, 110, 82, 180, 165, 6), { c: C.ink, w: 1.6, head: 8 }) + t(268, 146, '기울기', { size: 14, b: 1 });
      s += arrow(300, 186, 440, 186, { c: C.orange, w: 3, head: 12 }) + t(370, 170, '움직임 · 빠르기', { a: 'm', size: 13.5, b: 1, c: C.orange });
      s += t(360, 232, '움직임 · 기울기 → 자세 안정', { a: 'm', size: 14, b: 1 });
      return F.svg(480, 252, s);
    } },

  baro: { cards: ['기압계 센서'],
    cap: '높이 올라갈수록 기압이 낮아진다 — 기압계는 이것으로 고도를 알아낸다',
    draw: function () {
      var s = line(20, 240, 300, 240, { w: 2.6 });
      for (var i = 0; i < 90; i++) {
        var yy = 240 - Math.pow(((i * 37) % 97) / 97, 1.9) * 214, xx = 30 + ((i * 53) % 101) / 101 * 260;
        s += dot(Math.round(xx), Math.round(yy), 2.2, C.grayM);
      }
      s += droneSide(110, 64, 60, { pw: 13, skid: false });
      s += droneSide(200, 196, 60, { pw: 13, skid: false });
      s += box(314, 40, 150, 56, { fill: C.blueL, c: C.blue, r: 8 }) + t(389, 60, '높은 곳', { a: 'm', size: 14, b: 1 }) + t(389, 80, '공기가 적다 → 기압 낮음', { a: 'm', size: 12.5, c: C.blue });
      s += box(314, 172, 150, 56, { fill: C.orangeL, c: C.orange, r: 8 }) + t(389, 192, '낮은 곳', { a: 'm', size: 14, b: 1 }) + t(389, 212, '공기가 많다 → 기압 높음', { a: 'm', size: 12.5, c: C.orange });
      s += line(144, 64, 312, 66, { c: C.grayM, w: 1, dash: '4 3' }) + line(234, 196, 312, 198, { c: C.grayM, w: 1, dash: '4 3' });
      s += arrow(300, 226, 300, 110, { c: C.ink, w: 1.8, head: 10 }) + t(292, 150, '고도↑', { a: 'e', size: 13.5, b: 1 });
      s += t(24, 262, 'Alt Hold(고도 유지) 모드가 이 센서를 쓴다', { size: 13.5, c: C.sub });
      return F.svg(480, 276, s);
    } },

  magMast: { cards: ['지자기 센서', 'GPS · 나침반'],
    cap: 'GPS·나침반은 모터·전선의 자기장 간섭을 피해 마스트 위에 올린다',
    draw: function () {
      var cx = 200, cy = 190, s = '';
      s += droneSide(cx, cy, 250);
      [cx - 125, cx + 125, cx].forEach(function (x, i) {
        var ry = i === 2 ? 20 : 26;
        s += ell(x, cy - 6, 34, ry, { c: C.red, w: 1.2, dash: '4 4' }) + ell(x, cy - 6, 52, ry + 14, { c: C.red, w: 1, dash: '4 4' });
      });
      s += line(cx, cy - 12, cx, 70, { w: 3 });
      s += box(cx - 30, 44, 60, 26, { fill: C.greenL, c: C.green, r: 13 });
      s += arrow(cx - 14, 57, cx + 18, 57, { c: C.green, w: 2, head: 8 });
      s += callout(cx + 30, 56, 290, 40, 'GPS · 나침반', { b: 1 });
      s += t(296, 64, '마스트 위로', { size: 13.5, c: C.sub });
      s += callout(cx + 162, cy - 30, 380, 118, '자기장 간섭', { a: 's', b: 1, ans: 1 });
      s += t(386, 140, '모터 · 전선', { size: 13.5, c: C.sub });
      s += t(24, 30, 'GPS 화살표 = FC 화살표와 같은 방향', { size: 13.5, c: C.sub });
      return F.svg(480, 250, s);
    } },

  sonar: { cards: ['초음파 · 레이더 센서'],
    cap: '초음파·레이더 센서 — 신호를 쏘아 되돌아오는 것으로 지면·장애물까지 거리를 잰다',
    draw: function () {
      var s = line(20, 236, 460, 236, { w: 2.6 }) + F.hatch(20, 236, 440, 12, { gap: 10, c: C.grayM });
      s += box(380, 60, 30, 176, { fill: C.grayL, c: C.ink, r: 2 }) + t(395, 50, '장애물', { a: 'm', size: 13.5 });
      s += droneSide(150, 86, 110, { pw: 24, skid: false });
      s += box(142, 100, 16, 10, { fill: C.orange, c: C.orange, r: 2, w: 1 });
      for (var i = 1; i <= 4; i++) s += F.path('M' + (150 - 12 * i) + ',' + (112 + 22 * i) + ' Q150,' + (120 + 22 * i + 8) + ' ' + (150 + 12 * i) + ',' + (112 + 22 * i), { c: C.orange, w: 1.8 });
      s += arrow(186, 118, 186, 228, { c: C.orange, w: 1.8, head: 9 }) + arrow(200, 228, 200, 118, { c: C.green, w: 1.8, head: 9, dash: '5 4' });
      s += t(210, 150, '쏜다', { size: 13.5, b: 1, c: C.orange }) + t(210, 196, '되돌아온다', { size: 13.5, b: 1, c: C.green });
      s += F.dim(96, 110, 96, 236, '거리', { size: 14 });
      s += arrow(216, 86, 374, 86, { c: C.orange, w: 1.6, head: 9, dash: '5 4' }) + t(296, 70, '장애물 회피', { a: 'm', size: 13.5, b: 1 });
      s += t(24, 30, '낮은 고도에서 기압계보다 정확 · 정밀 착륙', { size: 13.5, c: C.sub });
      return F.svg(480, 256, s);
    } },

  certFlow: { cards: ['안전성인증검사', '검사의 종류 4가지'],
    cap: '안전성인증검사 네 가지 — 처음 받을 때, 기간이 끝났을 때, 고쳤을 때, 떨어졌을 때',
    draw: function () {
      var s = t(240, 24, '대상: 최대이륙중량 25kg 초과 · 검사기관: 항공안전기술원', { a: 'm', size: 13.5, c: C.sub });
      s += box(20, 96, 110, 48, { fill: C.blueL, c: C.blue, w: 2, label: '초도검사', lc: C.blue, ans: 1 });
      s += t(75, 82, '처음', { a: 'm', size: 13.5, c: C.sub });
      s += box(186, 92, 108, 56, { fill: C.greenL, c: C.green, r: 6 }) + t(240, 112, '인증서', { a: 'm', b: 1 }) + t(240, 132, '유효 2년', { a: 'm', size: 14, c: C.green, b: 1, ans: 1 });
      s += arrow(132, 120, 182, 120, { c: C.ink, w: 2 }) + t(158, 106, '합격', { a: 'm', size: 13 });
      s += box(350, 96, 110, 48, { fill: C.blueL, c: C.blue, w: 2, label: '정기검사', lc: C.blue, ans: 1 });
      s += arrow(296, 120, 346, 120, { c: C.ink, w: 2 }) + t(322, 82, '기간 만료', { a: 'm', size: 13 });
      s += F.route([[405, 94], [405, 60], [240, 60], [240, 88]], { c: C.sub, w: 1.4, head: 9, dash: '5 4' });
      s += box(186, 200, 108, 48, { fill: C.orangeL, c: C.orange, w: 2, label: '수시검사', lc: C.orange, ans: 1 });
      s += arrow(240, 150, 240, 196, { c: C.orange, w: 2 }) + t(252, 174, '개조 · 수리', { size: 13.5, b: 1, c: C.orange });
      s += box(20, 200, 110, 48, { fill: C.redL, c: C.red, w: 2, label: '재검사', lc: C.red, ans: 1 });
      s += arrow(75, 146, 75, 196, { c: C.red, w: 2 }) + t(86, 166, '불합격', { size: 13.5, b: 1, c: C.red }) + t(86, 184, '→ 정비', { size: 13, c: C.sub });
      return F.svg(480, 262, s);
    } },

  /* ─────────── 06 신고번호 · 공역 ─────────── */
  regno: { cards: ['신고번호의 구조', '둘째 자리 — C / N', '셋째 자리 — 기체 종류'],
    cap: '신고번호 3-N-M-0001 — 무게 등급 · 사업 여부 · 기체 종류 · 일련번호',
    draw: function () {
      var s = '', X = [26, 126, 226, 326], W = [80, 80, 80, 128];
      ['3', 'N', 'M', '0001'].forEach(function (ch, i) {
        var col = [C.orange, C.green, C.blue, C.sub][i];
        s += box(X[i], 30, W[i], 64, { fill: C.paper, c: col, w: 2.4, r: 8 });
        s += t(X[i] + W[i] / 2, 64, ch, { a: 'm', b: 1, size: 30, c: col });
        if (i < 3) s += t(X[i] + W[i] + 10, 62, '-', { a: 'm', size: 22, b: 1 });
      });
      s += t(66, 116, '무게 등급', { a: 'm', b: 1, size: 14.5 }) + t(66, 136, '3종 무게', { a: 'm', size: 13.5, c: C.sub });
      s += t(166, 116, '사업 여부', { a: 'm', b: 1, size: 14.5 }) + t(166, 136, 'N 비사업용', { a: 'm', size: 13.5, c: C.green, ans: 1 }) + t(166, 156, 'C 사업용', { a: 'm', size: 13.5, c: C.sub });
      s += t(266, 116, '기체 종류', { a: 'm', b: 1, size: 14.5 });
      s += t(390, 116, '일련번호', { a: 'm', b: 1, size: 14.5 });
      s += box(170, 176, 290, 76, { fill: C.blueL, c: C.blue, r: 8 });
      s += line(266, 144, 266, 176, { c: C.blue, w: 1.2 });
      [['M', '무인멀티콥터'], ['H', '무인헬리콥터'], ['P', '무인동력패러글라이더'], ['S', '무인비행선']].forEach(function (k, i) {
        var x = 180 + (i % 2) * 160, y = 198 + Math.floor(i / 2) * 32;
        s += t(x, y, k[0], { b: 1, size: 15, c: C.blue }) + t(x + 18, y, k[1], { size: k[1].length > 7 ? 12.5 : 13.5, ans: 1 });
      });
      s += t(24, 196, '번호를 받으면', { size: 13.5, c: C.sub }) + t(24, 216, '기체에 표시한다', { size: 13.5, c: C.sub });
      return F.svg(480, 266, s);
    } },

  airspace4: { cards: ['공역이란', '통제공역', '주의공역'],
    cap: '공역은 넷으로 나뉜다 — 관제 · 비관제 · 통제 · 주의',
    draw: function () {
      var s = box(180, 16, 120, 38, { fill: C.grayL, label: '공역', size: 17 });
      var K = [['관제공역', 'A · B · C · D · E', '관제를 한다', C.blue, C.blueL], ['비관제공역', 'F · G', '정보만 준다', C.green, C.greenL],
               ['통제공역', '비행금지\n비행제한', '반드시 승인', C.red, C.redL], ['주의공역', '훈련·군작전\n위험·경계', '승인 필요할 수도', C.orange, C.orangeL]];
      K.forEach(function (k, i) {
        var x = 12 + i * 117;
        s += F.route([[240, 54], [240, 72], [x + 55, 72], [x + 55, 90]], { c: C.grayM, w: 1.4, head: 8 });
        s += box(x, 94, 110, 42, { fill: k[4], c: k[3], w: 2, label: k[0], size: 15, lc: k[3], ans: 1 });
        s += t(x + 55, 164, k[1], { a: 'm', size: 13.5 });
        s += t(x + 55, 200, k[2], { a: 'm', size: 13.5, b: 1, c: k[3], ans: i === 2 ? 1 : 0 });
      });
      s += t(240, 226, '어디를 나는지에 따라 승인이 필요한지가 달라진다', { a: 'm', size: 13.5, c: C.sub });
      return F.svg(480, 244, s);
    } },

  gradeLadder: { cards: ['A등급 공역', 'B등급 공역', 'C등급 공역', 'D등급 공역', 'E등급 공역', 'F등급 공역', 'G등급 공역'],
    cap: 'A → G 로 갈수록 관제가 느슨해진다 — A~E 는 관제공역, F·G 는 비관제공역 (막대 길이는 순서만 나타냄)',
    draw: function () {
      var R = [['A', '모두 계기비행(IFR)'], ['B', '모두 관제 · 분리까지'], ['C', '시계끼리는 교통정보만'], ['D', '계기↔시계도 교통정보'],
               ['E', '계기비행에만 관제'], ['F', '비행정보 + 조언'], ['G', '비행정보만']];
      var s = '';
      R.forEach(function (r, i) {
        var y = 22 + i * 32, ctl = i < 5, len = 190 - i * 24, col = ctl ? C.blue : C.green;
        s += t(24, y + 13, r[0], { b: 1, size: 17, c: col });
        s += box(48, y + 1, len, 24, { fill: ctl ? C.blueL : C.greenL, c: col, r: 4, w: 1.2 });
        s += t(254, y + 13, r[1], { size: 13.5, ans: 1 });
      });
      s += line(20, 22 + 5 * 32 - 3, 460, 22 + 5 * 32 - 3, { c: C.ink, w: 1.4, dash: '6 4' });
      s += t(460, 30, '관제공역', { a: 'e', b: 1, size: 14, c: C.blue });
      s += t(460, 232, '비관제공역', { a: 'e', b: 1, size: 14, c: C.green, ans: 1 });
      s += t(48, 256, '엄격 ◀────── 느슨', { size: 13, c: C.sub });
      return F.svg(480, 270, s);
    } },

  /* ─────────── 임무장치 (에어 드롭 · 짐벌) ─────────── */
  airdrop: { cards: ['에어 드롭 장치'],
    cap: '에어 드롭 — 서보모터가 걸쇠를 움직이면 매달린 물건이 떨어진다',
    draw: function () {
      function unit(x, open) {
        var s = box(x - 70, 40, 140, 16, { fill: C.grayM, c: C.ink, r: 3 }) + t(x, 32, '드론 몸체 아래', { a: 'm', size: 13, c: C.sub });
        s += servo(x - 30, 84, { a: open ? -70 : 0, L: 40 });
        if (!open) {
          s += F.circle(x + 16, 84, 8, { fill: 'none', c: C.orange, w: 2.4 });
          s += line(x + 16, 92, x + 16, 140, { c: C.orange, w: 2 });
          s += box(x - 20, 140, 72, 52, { fill: C.orangeL, c: C.orange, r: 4, label: '물건', size: 15, lc: C.orange });
        } else {
          s += F.circle(x + 16, 150, 8, { fill: 'none', c: C.orange, w: 2.4 }) + line(x + 16, 158, x + 16, 184, { c: C.orange, w: 2 });
          s += box(x - 20, 184, 72, 52, { fill: C.orangeL, c: C.orange, r: 4, label: '물건', size: 15, lc: C.orange });
          s += arrow(x + 70, 150, x + 70, 226, { c: C.red, w: 2.4 });
        }
        return s;
      }
      var s = unit(120, false) + unit(360, true) + divider(240, 14, 250);
      s += callout(122, 84, 190, 116, '걸쇠', { a: 's', size: 14 });
      s += t(120, 222, '잡고 있을 때', { a: 'm', b: 1, size: 15 });
      s += t(360, 258, '서보가 돌면 떨어진다', { a: 'm', b: 1, size: 15, c: C.red });
      s += t(30, 100, '서보', { size: 13.5, c: C.blue, b: 1 });
      return F.svg(480, 274, s);
    } },

  gimbal2: { cards: ['2축 카메라 짐벌'],
    cap: '2축 짐벌 — 롤축·피치축 서보 두 개가 흔들림을 반대로 잡아 카메라를 수평으로 둔다',
    draw: function () {
      var s = box(150, 18, 180, 16, { fill: C.grayM, c: C.ink, r: 3 }) + t(142, 26, '드론', { a: 'e', size: 13, c: C.sub });
      s += line(240, 34, 240, 64, { w: 3 });
      s += box(206, 64, 68, 40, { fill: C.blueL, c: C.blue, r: 6, label: '롤 서보', size: 13.5, lc: C.blue });
      s += F.route(arcPts(240, 84, 48, 200, 340, 12), { c: C.blue, w: 2.2, head: 10 });
      s += F.path('M150,112 L150,210 L330,210 L330,112', { w: 3 }) + line(150, 112, 330, 112, { w: 3 }) + line(240, 104, 240, 112, { w: 3 });
      s += box(330, 140, 60, 44, { fill: C.orangeL, c: C.orange, r: 6, label: '피치\n서보', size: 13, lc: C.orange });
      s += box(186, 136, 108, 52, { fill: C.grayL, c: C.ink, r: 8 }) + F.circle(262, 162, 16, { fill: '#e2e8f0', c: C.ink }) + F.circle(262, 162, 7, { fill: C.ink });
      s += t(214, 162, '카메라', { a: 'm', size: 14, b: 1 });
      s += line(294, 162, 330, 162, { c: C.orange, w: 1.6, dash: '5 3' });
      s += F.route(arcPts(410, 162, 26, -70, 70, 10), { c: C.orange, w: 2.2, head: 9 });
      s += t(40, 84, '롤축', { size: 15, b: 1, c: C.blue }) + t(40, 104, '좌우 기울기', { size: 13.5, c: C.sub });
      s += t(424, 210, '피치축', { a: 'e', size: 15, b: 1, c: C.orange }) + t(424, 230, '앞뒤 기울기', { a: 'e', size: 13.5, c: C.sub });
      s += t(24, 246, '서보모터 2개 = 2축', { size: 14, b: 1 });
      return F.svg(480, 262, s);
    } },

  servoAngle: { cards: ['서보모터란', '마이크로 서보모터', '스탠다드 서보모터', '360도 회전 서보모터'],
    cap: '보통 서보는 0~180° 사이의 정해진 각도로, 360도 회전 서보는 끝없이 돈다',
    draw: function () {
      var s = t(120, 24, '보통 서보 (0~180°)', { a: 'm', b: 1, size: 15.5, c: C.blue }) + t(360, 24, '360도 회전 서보', { a: 'm', b: 1, size: 15.5, c: C.orange }) + divider(240, 12, 246);
      var cx = 120, cy = 170, R = 86;
      s += F.path('M' + (cx - R) + ',' + cy + ' A' + R + ',' + R + ' 0 0 1 ' + (cx + R) + ',' + cy + ' Z', { fill: C.blueL, c: C.blue, w: 1.6 });
      [0, 45, 90, 135, 180].forEach(function (d) {
        var a = rad(180 + d), x1 = cx + (R - 10) * Math.cos(a), y1 = cy + (R - 10) * Math.sin(a), x2 = cx + R * Math.cos(a), y2 = cy + R * Math.sin(a);
        s += line(x1, y1, x2, y2, { c: C.blue, w: 1.6 });
      });
      s += t(cx - R - 4, cy + 18, '0°', { a: 'm', size: 14, b: 1 }) + t(cx, cy - R - 10, '90°', { a: 'm', size: 14, b: 1 }) + t(cx + R + 4, cy + 18, '180°', { a: 'm', size: 14, b: 1 });
      s += rot(box(cx - 6, cy - 6, 70, 12, { fill: C.paper, c: C.ink, r: 6, w: 1.6 }), -45 - 90, cx, cy) + dot(cx, cy, 5);
      s += t(cx, 214, '각도를 주면 그 자리로', { a: 'm', size: 13.5 }) + t(cx, 234, '위치 제어', { a: 'm', size: 14, b: 1 });
      s += F.circle(360, 122, 64, { fill: C.orangeL, c: C.orange, w: 1.6 }) + dot(360, 122, 5);
      s += rot(box(354, 116, 58, 12, { fill: C.paper, c: C.ink, r: 6, w: 1.6 }), 30, 360, 122);
      s += F.route(arcPts(360, 122, 80, -120, 200, 24), { c: C.orange, w: 2.4, head: 11 });
      s += t(360, 214, 'DC 모터처럼 무한 회전', { a: 'm', size: 13.5 }) + t(360, 234, '속도 · 방향 제어', { a: 'm', size: 14, b: 1 });
      return F.svg(480, 250, s);
    } },

  servoPower: { cards: ['마이크로 서보모터', '스탠다드 서보모터'],
    cap: '마이크로 서보 한두 개는 아두이노 전원으로, 스탠다드 서보 2개 이상은 외부 전원으로',
    draw: function () {
      var s = t(120, 24, '마이크로 서보 1~2개', { a: 'm', b: 1, size: 15.5, c: C.blue }) + t(360, 24, '스탠다드 서보 2개 이상', { a: 'm', b: 1, size: 15.5, c: C.orange }) + divider(240, 12, 246);
      s += box(40, 60, 160, 50, { fill: '#e0f2fe', c: C.ink, r: 6, label: '아두이노', size: 15 });
      s += box(60, 170, 50, 32, { fill: C.blueL, c: C.blue, r: 4, label: '서보', size: 13, lc: C.blue }) + box(130, 170, 50, 32, { fill: C.blueL, c: C.blue, r: 4, label: '서보', size: 13, lc: C.blue });
      s += line(85, 110, 85, 170, { c: C.red, w: 2.2 }) + line(155, 110, 155, 170, { c: C.red, w: 2.2 });
      s += t(120, 146, '전원 + 신호', { a: 'm', size: 13.5, b: 1, c: C.red });
      s += t(120, 230, '아두이노 전원으로 충분', { a: 'm', size: 13.5, c: C.sub });
      s += box(270, 60, 110, 50, { fill: '#e0f2fe', c: C.ink, r: 6, label: '아두이노', size: 15 });
      s += box(392, 60, 76, 50, { fill: C.orangeL, c: C.orange, r: 6, label: '외부\n전원', size: 13.5, lc: C.orange });
      s += box(282, 170, 60, 36, { fill: C.orangeL, c: C.orange, r: 4, label: '서보', size: 13.5, lc: C.orange }) + box(366, 170, 60, 36, { fill: C.orangeL, c: C.orange, r: 4, label: '서보', size: 13.5, lc: C.orange });
      s += line(300, 110, 300, 170, { c: C.blue, w: 1.6, dash: '5 3' }) + line(330, 110, 384, 170, { c: C.blue, w: 1.6, dash: '5 3' });
      s += F.route([[430, 110], [430, 140], [324, 140], [324, 170]], { c: C.red, w: 2.2, head: 8 }) + line(430, 140, 408, 170, { c: C.red, w: 2.2 });
      s += t(292, 150, '신호', { a: 'e', size: 13, c: C.blue, b: 1 }) + t(446, 132, '전원', { a: 'e', size: 13, c: C.red, b: 1 });
      s += t(360, 230, '토크를 많이 쓰면 외부 전원', { a: 'm', size: 13.5, c: C.sub });
      return F.svg(480, 250, s);
    } },

  servoCode: { cards: ['서보 제어 명령어'],
    cap: 'Servo.h 로 서보를 다룬다 — attach(핀)으로 연결, write(각도)로 돌린다 (핀 번호·각도는 예시)',
    draw: function () {
      var s = '';
      [['#include <Servo.h>', '라이브러리 — 함수 묶음'], ['servo.attach(9);', '9번 핀에 연결 · 동작 시작'], ['servo.write(90);', '90° 로 돌아라']].forEach(function (c, i) {
        var y = 24 + i * 70;
        s += box(20, y, 210, 42, { fill: '#0f172a', c: '#0f172a', r: 6 }) + t(34, y + 21, c[0], { size: 15, c: '#e2e8f0', halo: false, b: 1 });
        s += t(34, y + 56, c[1], { size: 13.5, c: C.sub });
      });
      s += box(300, 90, 140, 44, { fill: '#e0f2fe', c: C.ink, r: 6, label: '아두이노', size: 14 });
      s += arrow(232, 115, 296, 112, { c: C.blue, w: 1.6, head: 9, dash: '5 3' });
      s += line(370, 134, 370, 170, { c: C.orange, w: 2.2 }) + t(380, 152, '9번 핀', { size: 13, c: C.orange, b: 1 });
      s += servo(360, 196, { a: -90, L: 38 });
      s += t(420, 236, '90°', { a: 'm', size: 15, b: 1, c: C.blue });
      return F.svg(480, 250, s);
    } },

  planes3: { cards: ['모델링 준비'],
    cap: '인벤터의 스케치 평면 — X-Y 평면(평면도) · Y-Z 평면(정면도) · Z-X 평면(우측면도)',
    draw: function () {
      var O = [230, 170], ax = [-120, 56], ay = [120, 56], az = [0, -130];
      function P(u, v, w) { return [O[0] + ax[0] * u + ay[0] * v, O[1] + ax[1] * u + ay[1] * v + az[1] * w]; }
      var s = '';
      s += F.poly([P(0, 0, 0), P(1, 0, 0), P(1, 1, 0), P(0, 1, 0)], { close: 1, fill: C.blueL, c: C.blue, w: 1.4 });
      s += F.poly([P(0, 0, 0), P(0, 1, 0), P(0, 1, 1), P(0, 0, 1)], { close: 1, fill: C.orangeL, c: C.orange, w: 1.4, op: 0.95 });
      s += F.poly([P(0, 0, 0), P(1, 0, 0), P(1, 0, 1), P(0, 0, 1)], { close: 1, fill: C.greenL, c: C.green, w: 1.4, op: 0.95 });
      var X = P(1.25, 0, 0), Y = P(0, 1.25, 0), Z = P(0, 0, 1.25);
      s += arrow(O[0], O[1], X[0], X[1], { w: 2 }) + t(X[0] - 8, X[1] + 8, 'X', { a: 'e', b: 1, size: 17 });
      s += arrow(O[0], O[1], Y[0], Y[1], { w: 2 }) + t(Y[0] + 8, Y[1] + 8, 'Y', { b: 1, size: 17 });
      s += arrow(O[0], O[1], Z[0], Z[1], { w: 2 }) + t(Z[0] + 10, Z[1] + 6, 'Z', { b: 1, size: 17 });
      var a = P(0.5, 0.5, 0), b = P(0, 0.5, 0.5), c = P(0.5, 0, 0.5);
      s += t(a[0], a[1] + 4, 'X-Y 평면', { a: 'm', b: 1, size: 14.5, c: C.blue }) + t(a[0], a[1] + 22, '평면도', { a: 'm', size: 13.5 });
      s += t(b[0] + 6, b[1], 'Y-Z 평면', { a: 'm', b: 1, size: 14.5, c: C.orange }) + t(b[0] + 6, b[1] + 18, '정면도', { a: 'm', size: 13.5 });
      s += t(c[0] - 6, c[1], 'Z-X 평면', { a: 'm', b: 1, size: 14.5, c: C.green }) + t(c[0] - 6, c[1] + 18, '우측면도', { a: 'm', size: 13.5 });
      return F.svg(480, 290, s);
    } },

  printFlow: { cards: ['출력용 파일 (STL)', '슬라이싱', '후가공'],
    cap: '모델에서 출력물까지 — 인벤터 모델 → STL → 슬라이싱(G코드) → 3D 프린터 → 후가공',
    draw: function () {
      var S = [['인벤터', '모델링', C.grayL, C.ink], ['STL', '출력용 파일', C.blueL, C.blue], ['슬라이싱', '→ G코드', C.orangeL, C.orange],
               ['3D 프린터', 'FDM 출력', C.grayL, C.ink], ['후가공', '니퍼·사포', C.greenL, C.green]];
      var s = '';
      S.forEach(function (k, i) {
        var row = i < 3 ? 0 : 1, col = row ? 4 - i : i, x = 20 + col * 156, y = row ? 150 : 40;
        if (row) x = 20 + (i - 3) * 156 + 78;
        s += box(x, y, 128, 62, { fill: k[2], c: k[3], w: 1.8, r: 8 });
        s += t(x + 64, y + 22, k[0], { a: 'm', b: 1, size: 16, c: k[3] }) + t(x + 64, y + 44, k[1], { a: 'm', size: 13.5 });
      });
      s += arrow(150, 71, 174, 71, { w: 2 }) + arrow(306, 71, 330, 71, { w: 2 });
      s += F.route([[396, 104], [396, 128], [162, 128], [162, 146]], { w: 2, head: 10 });
      s += arrow(228, 181, 252, 181, { w: 2 });
      s += t(240, 238, 'STL — 단위 밀리미터 · 해상도 높음으로 내보낸다', { a: 'm', size: 13.5, c: C.sub });
      return F.svg(480, 254, s);
    } },

  fdm: { cards: ['FDM 방식'],
    cap: 'FDM — 필라멘트를 노즐에서 녹여 짜내며 한 층씩 쌓는다 (3D프린터 마스터 그림)',
    draw: function () {
      var s = F.circle(75, 80, 42, { fill: C.orangeL, c: C.orange }) + F.circle(75, 80, 12, { fill: C.paper, c: C.orange });
      s += t(75, 140, '필라멘트', { a: 'm', b: 1 }) + t(75, 160, '(실 모양 재료)', { a: 'm', size: 13, c: C.sub });
      s += F.path('M112,62 Q180,30 240,48 L240,120', { c: C.orange, w: 3 });
      s += F.circle(226, 84, 12, { fill: C.grayM }) + F.circle(254, 84, 12, { fill: C.grayM });
      s += box(214, 118, 52, 34, { fill: C.redL, c: C.red, label: '가열', size: 13, lc: C.red });
      s += F.poly([[228, 152], [252, 152], [240, 170]], { close: 1, fill: C.grayM, w: 1.4 });
      s += line(240, 170, 240, 186, { c: C.orange, w: 5 });
      s += box(150, 186, 90, 12, { fill: C.orangeL, c: C.orange, r: 2, w: 1.2 });
      for (var i = 0; i < 3; i++) s += box(150, 198 + 12 * i, 180, 12, { fill: C.blueL, c: C.blue, r: 2, w: 1.2 });
      s += bed(60, 234, 360);
      s += arrow(256, 178, 298, 178, { c: C.blue, w: 1.8, head: 9 });
      s += callout(266, 132, 318, 110, '고열로 녹인다') + callout(250, 162, 318, 148, '노즐') + callout(330, 216, 356, 216, '한 층씩 쌓임') + callout(400, 241, 416, 266, '베드');
      return F.svg(480, 286, s);
    } },

  retraction: { cards: ['리트랙션'],
    cap: '거미줄 현상 — 이동하는 사이 흘러나온 필라멘트. 리트랙션(역회전)으로 막는다 (3D프린터 마스터 그림)',
    draw: function () {
      var s = box(50, 90, 40, 100, { fill: C.blueL, c: C.blue, r: 2 }) + box(190, 90, 40, 100, { fill: C.blueL, c: C.blue, r: 2 }) + bed(30, 190, 220);
      for (var k = 0; k < 5; k++) { var y = 104 + k * 17; s += F.path('M90,' + y + ' Q140,' + (y + 16) + ' 190,' + (y + 4), { c: C.red, w: 1 }); }
      s += nozzle(140, 52) + arrow(96, 66, 184, 66, { c: C.blue, w: 1.6, dash: '5 4', head: 9 });
      s += t(140, 214, '흘러내려 거미줄', { a: 'm', size: 13.5, c: C.red, b: 1 }) + divider(270, 14, 222);
      s += t(380, 24, '리트랙션', { a: 'm', b: 1 });
      s += line(365, 42, 365, 92, { c: C.orange, w: 4 }) + box(340, 92, 50, 34, { fill: C.redL, c: C.red, label: '가열', size: 12, lc: C.red }) +
        F.poly([[353, 126], [377, 126], [365, 144]], { close: 1, fill: C.grayM, w: 1.4 });
      s += arrow(396, 88, 396, 46, { c: C.blue, w: 2.2, head: 10 }) + t(404, 66, '역회전으로\n뒤로 당김', { size: 13.5, c: C.blue, b: 1 });
      s += t(380, 172, '압출을 잠깐 멈춘다', { a: 'm', size: 13.5 }) + t(380, 196, '너무 짧거나 길면 문제', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 228, s);
    } },

  /* ─────────── 만들기 게임 — 부품 도감 ─────────── */
  frameParts: { cards: ['프레임 · 암'],
    cap: '프레임 분해 — 상판 · 암(붐대) · 하판 · 랜딩 스키드를 나사로 결합한다',
    draw: function () {
      var cx = 230, s = '';
      s += box(cx - 70, 30, 140, 14, { fill: C.grayL, c: C.ink, r: 3 });
      s += line(cx - 190, 104, cx + 190, 104, { w: 8, c: C.blue }) + box(cx - 190, 94, 24, 20, { fill: C.grayM, r: 3, w: 1.2 }) + box(cx + 166, 94, 24, 20, { fill: C.grayM, r: 3, w: 1.2 });
      s += box(cx - 70, 150, 140, 14, { fill: C.grayL, c: C.ink, r: 3 });
      s += F.poly([[cx - 40, 204], [cx - 60, 244]], { w: 2.6 }) + F.poly([[cx + 40, 204], [cx + 60, 244]], { w: 2.6 }) + line(cx - 84, 244, cx - 40, 244, { w: 3 }) + line(cx + 40, 244, cx + 84, 244, { w: 3 }) + line(cx - 44, 204, cx + 44, 204, { w: 3 });
      [cx - 50, cx + 50].forEach(function (x) { s += line(x, 48, x, 90, { c: C.sub, w: 1, dash: '4 3' }) + line(x, 118, x, 146, { c: C.sub, w: 1, dash: '4 3' }) + line(x, 168, x, 200, { c: C.sub, w: 1, dash: '4 3' }); });
      s += callout(cx + 70, 37, 330, 30, '상판', { b: 1 });
      s += callout(cx + 150, 104, 420, 72, '암(Arm) · 붐대', { a: 'e', b: 1 });
      s += t(420, 136, '모터가 끝에 붙는다', { a: 'e', size: 13, c: C.sub });
      s += callout(cx + 70, 157, 330, 172, '하판', { b: 1 });
      s += callout(cx + 70, 244, 330, 250, '랜딩 스키드', { b: 1 });
      return F.svg(480, 266, s);
    } },

  frameSize: { cards: ['프레임 (3D 출력)'],
    cap: '프레임 크기 = 대각선 모터 축 사이 거리(mm) — 예: 250 사이즈',
    draw: function () {
      var s = quadTop(210, 140, 120, { pr: 38, mr: 7 });
      var a = 120 * 0.7071;
      s += F.dim(210 - a, 140 + a, 210 + a, 140 - a, '', { off: 0 });
      s += dot(210 - a, 140 + a, 4, C.red) + dot(210 + a, 140 - a, 4, C.red);
      s += t(360, 100, '대각선 모터 축', { size: 15, b: 1, c: C.red }) + t(360, 122, '사이 거리', { size: 15, b: 1, c: C.red });
      s += t(360, 160, '= 프레임 크기', { size: 15, b: 1 }) + t(360, 184, '(mm)', { size: 13.5, c: C.sub });
      s += t(360, 226, 'mini 250~280', { size: 14, c: C.sub }) + t(360, 248, '250 사이즈 = 250mm', { size: 13.5, c: C.sub });
      return F.svg(480, 280, s);
    } },

  /* only — 이 페이지(window.FIG_PAGE)에서만. 모터 번호는 FC 마다 달라(MultiWii 는 1·3 CW) 아두이노 게임에는 안 띄운다 */
  pixQuadX: { cards: ['BLDC 모터 ×4', '픽스호크 FC', '프로펠러'], only: 'pixhawk',
    cap: '픽스호크(ArduPilot) 쿼드X — 모터 번호와 도는 방향, FC 화살표는 기체 앞으로',
    draw: function () {
      var s = quadTop(220, 150, 150, { dirs: { fr: false, rl: false, fl: true, rr: true }, pr: 44, mr: 10, bw: 34, bh: 34, bfill: C.blueL });
      s += arrow(220, 172, 220, 124, { c: C.blue, w: 3, head: 12 }) + t(220, 204, 'FC', { a: 'm', size: 13, b: 1, c: C.blue });
      s += arrow(220, 52, 220, 20, { c: C.ink, w: 1.8, head: 9 }) + t(220, 68, '기체 앞', { a: 'm', size: 14, b: 1 });
      var a = 150 * 0.7071;
      [['fr', 1, 1, -1], ['rl', 2, -1, 1], ['fl', 3, -1, -1], ['rr', 4, 1, 1]].forEach(function (m) {
        var x = 220 + m[2] * a, y = 150 + m[3] * a;
        s += F.num(x, y, String(m[1]), { c: C.ink, r: 12 });
      });
      s += t(440, 70, '↻ CW', { a: 'e', size: 15, b: 1, c: C.blue }) + t(440, 92, '3번 · 4번', { a: 'e', size: 13.5, ans: 1 });
      s += t(440, 214, '↺ CCW', { a: 'e', size: 15, b: 1, c: C.orange }) + t(440, 236, '1번 · 2번', { a: 'e', size: 13.5, ans: 1 });
      return F.svg(480, 300, s);
    } },

  escSwap: { cards: ['ESC (변속기)', 'ESC ×4 (12A)', 'BLDC 모터 ×4'],
    cap: 'ESC 와 모터를 잇는 삼선 중 두 선을 바꿔 끼우면 모터가 반대로 돈다',
    draw: function () {
      function part(y, cross) {
        var s = box(30, y, 90, 80, { fill: C.orangeL, c: C.orange, r: 6, label: 'ESC', size: 15, lc: C.orange });
        s += F.circle(390, y + 40, 38, { fill: C.grayL, c: C.ink, w: 1.6 }) + t(390, y + 40, '모터', { a: 'm', size: 14, b: 1 });
        var ys = [y + 18, y + 40, y + 62], cols = [C.ink, C.red, C.blue];
        ys.forEach(function (yy, i) {
          var j = cross ? [2, 1, 0][i] : i;
          s += F.path('M120,' + yy + ' L210,' + yy + ' L290,' + ys[j] + ' L352,' + ys[j], { c: cols[i], w: 3 });
        });
        s += spin(390, y + 40, 50, !cross, cross ? C.orange : C.blue, { a0: -60, a1: 40 });
        return s;
      }
      var s = t(24, 24, '그대로 연결', { b: 1, size: 15 }) + part(36, false);
      s += t(24, 150, '두 선을 바꿔 연결', { b: 1, size: 15, c: C.orange }) + part(162, true);
      s += t(390, 132, '한 방향', { a: 'm', size: 13.5, b: 1, c: C.blue }) + t(390, 258, '반대 방향', { a: 'm', size: 13.5, b: 1, c: C.orange });
      return F.svg(480, 272, s);
    } },

  pixWiring: { cards: ['ESC (변속기)', '픽스호크 FC', 'PM07 전원 모듈', '텔레메트리', 'GPS · 나침반', '수신기 (RX)'],
    cap: '픽스호크 결선 — 배터리 → PM07 → ESC 전원 · POWER, ESC 신호 → I/O PWM OUT, 텔레메트리 → TELEM1',
    draw: function () {
      var s = box(160, 110, 170, 130, { fill: C.blueL, c: C.blue, w: 2, r: 10 });
      s += t(245, 128, '픽스호크', { a: 'm', b: 1, size: 16, c: C.blue });
      s += t(168, 150, 'POWER', { size: 13, b: 1 }) + t(168, 176, 'I/O PWM OUT', { size: 13, b: 1 }) + t(322, 150, 'GPS', { a: 'e', size: 13, b: 1 }) + t(322, 176, 'RC IN', { a: 'e', size: 13, b: 1 }) + t(322, 202, 'TELEM1', { a: 'e', size: 13, b: 1 });
      s += box(14, 16, 96, 40, { fill: C.grayL, label: '리포 배터리', size: 13.5 });
      s += box(14, 90, 96, 40, { fill: C.orangeL, c: C.orange, label: 'PM07', size: 15, lc: C.orange });
      s += box(14, 186, 96, 44, { fill: C.grayL, label: 'ESC ×4', size: 15 });
      s += box(14, 262, 96, 30, { fill: C.grayL, label: '모터 ×4', size: 13.5 });
      s += arrow(62, 58, 62, 86, { c: C.red, w: 3 });
      s += arrow(62, 132, 62, 182, { c: C.red, w: 3 }) + t(70, 158, '전원', { size: 13, c: C.red, b: 1 });
      s += F.route([[112, 110], [136, 110], [136, 150], [160, 150]], { c: C.red, w: 2, head: 9 }) + t(122, 96, '6선', { size: 13, c: C.red });
      s += F.route([[160, 176], [140, 176], [140, 208], [114, 208]], { c: C.blue, w: 2, dash: '5 4', head: 9 }) + t(118, 226, '신호 1~4', { size: 13, c: C.blue, b: 1 });
      s += arrow(62, 232, 62, 258, { c: C.ink, w: 2 });
      s += box(370, 26, 96, 36, { fill: C.greenL, c: C.green, label: 'GPS·나침반', size: 13, lc: C.green });
      s += box(370, 92, 96, 36, { fill: C.grayL, label: '수신기', size: 14 });
      s += box(370, 196, 96, 36, { fill: C.grayL, label: '텔레메트리', size: 13.5 });
      s += F.route([[368, 44], [346, 44], [346, 150], [332, 150]], { c: C.ink, w: 1.6, head: 8 });
      s += F.route([[368, 110], [354, 110], [354, 176], [332, 176]], { c: C.ink, w: 1.6, head: 8 });
      s += F.route([[368, 214], [350, 214], [350, 202], [332, 202]], { c: C.ink, w: 1.6, head: 8 });
      s += waves(418, 238, 1, C.green, 2) + t(470, 276, '~ 노트북(미션 플래너)', { a: 'e', size: 13, c: C.sub });
      return F.svg(480, 300, s);
    } },

  telemetry: { cards: ['텔레메트리'],
    cap: '텔레메트리 두 개 — 같은 NET ID 로 기체와 미션 플래너가 무선으로 주고받는다',
    draw: function () {
      var s = droneSide(90, 110, 120, { pw: 26 });
      s += box(70, 64, 40, 22, { fill: C.greenL, c: C.green, r: 4 }) + line(104, 64, 110, 40, { c: C.green, w: 2 });
      s += t(90, 176, '기체용', { a: 'm', size: 14, b: 1 }) + t(90, 196, 'TELEM1 에 꽂는다', { a: 'm', size: 13, c: C.sub });
      s += laptop(390, 120) + box(426, 110, 34, 18, { fill: C.greenL, c: C.green, r: 3 }) + line(454, 110, 460, 88, { c: C.green, w: 2 });
      s += t(390, 176, '노트북용', { a: 'm', size: 14, b: 1 }) + t(390, 196, '미션 플래너', { a: 'm', size: 13, c: C.sub });
      s += arrow(140, 56, 340, 56, { c: C.green, w: 2.2, dash: '7 5', both: 1 });
      s += t(240, 40, '무선 57600bps', { a: 'm', size: 14, b: 1, c: C.green });
      s += t(240, 80, '같은 NET ID', { a: 'm', size: 15, b: 1 });
      s += F.route([[150, 150], [240, 226], [360, 150]], { c: C.sub, w: 1.4, dash: '3 3', head: 8 });
      s += t(240, 244, 'USB 유선 연결은 115200bps', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 260, s);
    } },

  pwmSbus: { cards: ['수신기 (RX)'],
    cap: 'PWM 은 채널마다 선이 따로, SBUS 는 선 하나로 여러 채널을 보낸다',
    draw: function () {
      var s = t(120, 24, 'PWM', { a: 'm', b: 1, size: 17, c: C.orange }) + t(360, 24, 'SBUS', { a: 'm', b: 1, size: 17, c: C.blue }) + divider(240, 12, 240);
      s += box(20, 56, 76, 150, { fill: C.grayL, label: '수신기', size: 14 }) + box(160, 56, 60, 150, { fill: C.blueL, c: C.blue, label: 'FC', size: 15, lc: C.blue });
      for (var i = 0; i < 6; i++) s += line(96, 72 + i * 24, 160, 72 + i * 24, { c: C.orange, w: 2.2 }) + t(128, 64 + i * 24, 'CH' + (i + 1), { a: 'm', size: 11.5, c: C.sub, halo: false });
      s += t(120, 228, '배선이 복잡하다', { a: 'm', size: 13.5, b: 1, c: C.orange });
      s += box(260, 56, 76, 150, { fill: C.grayL, label: '수신기', size: 14 }) + box(400, 56, 60, 150, { fill: C.blueL, c: C.blue, label: 'FC', size: 15, lc: C.blue });
      s += line(336, 130, 400, 130, { c: C.blue, w: 3.4 });
      s += t(368, 112, '선 1개', { a: 'm', size: 13, b: 1, c: C.blue });
      s += t(360, 228, '빠르고 정확하다', { a: 'm', size: 13.5, b: 1, c: C.blue });
      return F.svg(480, 248, s);
    } },

  propSpec: { cards: ['프로펠러'],
    cap: '프로펠러 5030 — 길이 5인치(도는 원의 지름) · 피치 3인치(한 바퀴 돌 때 나아가는 거리)',
    draw: function () {
      var s = t(240, 24, '5030 = 길이 5인치 · 피치 3인치', { a: 'm', b: 1, size: 15 });
      s += F.circle(120, 144, 86, { fill: '#f8fafc', c: C.line, w: 1.4, dash: '5 4' });
      s += F.path('M120,144 Q150,128 204,140 Q150,152 120,144 Z', { fill: C.blueL, c: C.blue, w: 1.6 }) + F.path('M120,144 Q90,160 36,148 Q90,136 120,144 Z', { fill: C.blueL, c: C.blue, w: 1.6 });
      s += dot(120, 144, 6);
      s += F.dim(34, 244, 206, 244, '길이 5인치 (지름)', { size: 14 });
      s += line(34, 150, 34, 250, { c: C.sub, w: 1 }) + line(206, 150, 206, 250, { c: C.sub, w: 1 });
      s += divider(250, 40, 262);
      /* 옆에서 본 프로펠러 날개 끝이 한 바퀴 돌며 그리는 나선 */
      var hx = 340, y0 = 210, y1 = 80, pts = [];
      for (var i = 0; i <= 48; i++) { var th = i / 48 * Math.PI * 2; pts.push([hx + 44 * Math.sin(th), y0 - (y0 - y1) * i / 48 + 8 * Math.cos(th) - 8]); }
      s += line(hx, y0 + 16, hx, y1 - 18, { c: C.grayM, w: 1.2, dash: 'center' });
      s += ell(hx, y0, 46, 10, { fill: C.blueL, c: C.blue, w: 1.6 }) + ell(hx, y1, 46, 10, { c: C.blue, w: 1.4, dash: '4 3' });
      s += F.poly(pts, { c: C.blue, w: 2 });
      s += arrow(hx, y1 - 10, hx, 42, { c: C.green, w: 2.2, head: 10 }) + t(hx + 10, 50, '나아가는 쪽', { size: 13, c: C.green, b: 1 });
      s += line(hx + 50, y0, 436, y0, { c: C.sub, w: 1 }) + line(hx + 50, y1, 436, y1, { c: C.sub, w: 1 });
      s += F.dim(430, y0, 430, y1, '피치 3인치', { size: 14, side: -1 });
      s += t(hx, 238, '한 바퀴 돌 때', { a: 'm', size: 13.5 }) + t(hx, 256, '나아가는 거리', { a: 'm', size: 13.5 });
      return F.svg(480, 270, s);
    } },

  nanoI2C: { cards: ['아두이노 나노', 'GY-86 10축 센서'],
    cap: '아두이노 나노 ↔ GY-86 — 전원 2줄 + I2C 2줄(A4 = SDA · A5 = SCL)',
    draw: function () {
      var s = box(24, 40, 150, 200, { fill: '#e0f2fe', c: C.ink, r: 8 }) + t(99, 62, '아두이노 나노', { a: 'm', b: 1, size: 15 });
      s += box(320, 70, 136, 140, { fill: C.purpleL, c: C.purple, r: 8 }) + t(388, 92, 'GY-86', { a: 'm', b: 1, size: 16, c: C.purple });
      var L = [['5V (또는 3.3V)', 'VCC', C.red], ['GND', 'GND', C.ink], ['A4', 'SDA', C.blue], ['A5', 'SCL', C.green]];
      L.forEach(function (p, i) {
        var y = 110 + i * 28;
        s += t(164, y, p[0], { a: 'e', size: 14, b: 1 }) + dot(174, y, 4, p[2]);
        s += t(330, y, p[1], { size: 14, b: 1 }) + dot(320, y, 4, p[2]);
        s += line(178, y, 316, y, { c: p[2], w: 2.6 });
      });
      s += t(247, 238, 'I2C 통신 — SDA · SCL', { a: 'm', size: 13.5, c: C.sub });
      return F.svg(480, 256, s);
    } },

  imu10: { cards: ['GY-86 10축 센서'],
    cap: 'GY-86 10축 = 자이로 3축 + 가속도 3축 + 지자계 3축 + 기압 1',
    draw: function () {
      var K = [['자이로', '3', '회전', C.blue], ['가속도', '3', '움직임·기울기', C.orange], ['지자계', '3', '방위(나침반)', C.green], ['기압', '1', '고도', C.purple]];
      var s = '';
      K.forEach(function (k, i) {
        var x = 16 + i * 116;
        s += box(x, 40, 100, 110, { fill: C.paper, c: k[3], w: 2, r: 10 });
        s += t(x + 50, 64, k[0], { a: 'm', b: 1, size: 15.5, c: k[3] });
        s += t(x + 50, 102, k[1], { a: 'm', b: 1, size: 30, c: k[3] });
        s += t(x + 50, 134, k[2], { a: 'm', size: 12.5, c: C.sub });
        if (i < 3) s += t(x + 108, 95, '+', { a: 'm', b: 1, size: 20 });
      });
      s += t(240, 190, '3 + 3 + 3 + 1 = 10축', { a: 'm', b: 1, size: 20 });
      s += t(240, 220, '한 기판에 네 센서 — I2C 로 아두이노와 통신', { a: 'm', size: 13.5, c: C.sub });
      return F.svg(480, 240, s);
    } },

  rxBind: { cards: ['수신기 · 조종기'],
    cap: '바인딩 — 바인딩 키는 B/VCC 에, 배터리는 CH3 에 꽂고 조종기 바인딩 키를 누르며 전원을 켠다',
    draw: function () {
      var s = box(40, 60, 250, 150, { fill: C.grayL, c: C.ink, r: 10 }) + t(64, 84, '수신기', { b: 1, size: 15 });
      var P = ['B/VCC', 'CH6', 'CH5', 'CH4', 'CH3', 'CH2', 'CH1'];
      P.forEach(function (p, i) {
        var y = 102 + i * 15;
        s += t(150, y, p, { a: 'e', size: 12.5, b: p === 'B/VCC' || p === 'CH3' ? 1 : 0, halo: false });
        [170, 192, 214].forEach(function (x) { s += box(x - 5, y - 5, 10, 10, { fill: C.ink, c: C.ink, r: 1, w: 1 }); });
      });
      s += box(158, 95, 66, 14, { fill: C.orange, c: C.orange, r: 3, w: 1 });
      s += line(224, 102, 330, 76, { c: C.orange, w: 2 }) + t(338, 72, '바인딩 키', { size: 15, b: 1, c: C.orange }) + t(338, 92, 'B/VCC 에', { size: 13.5, c: C.sub });
      s += line(222, 162, 330, 170, { c: C.red, w: 2.4 }) + box(330, 152, 120, 40, { fill: C.redL, c: C.red, r: 6, label: '배터리', size: 14, lc: C.red });
      s += t(390, 212, 'CH3 에', { a: 'm', size: 13.5, c: C.sub });
      s += t(40, 240, '조종기 5채널 이상 — 스로틀·롤·피치·요 + AUX(비행 모드)', { size: 13.5, c: C.sub });
      return F.svg(480, 258, s);
    } }

  };
})();

/* ── 카드 ↔ 그림 잇기 — lesson.js · 03 · 두 만들기 게임이 함께 쓴다 ──
   DroneFigs.keysFor(['카드 이름'…]) → 그 카드들에 붙은 그림 키(FIGS 순서, 중복 없이)
   DroneFigs.card('카드 이름')        → 카드 설명 아래에 넣을 그림 HTML (없으면 '')
   DroneFigs.first(['카드 이름'…])     → 배우기 맨 위 「🖼️ 그림으로 먼저 보기」 접는 칸 (없으면 '') */
window.DroneFigs = (function () {
  function ok() { return !!(window.FIG && window.FIG.gallery && window.FIGS); }
  function keysFor(names) {
    if (!ok()) return [];
    var page = window.FIG_PAGE || '';
    return Object.keys(FIGS).filter(function (k) {
      var e = FIGS[k];
      if (e.only && e.only !== page) return false;
      return (e.cards || []).some(function (c) { return names.indexOf(c) >= 0; });
    });
  }
  function card(name) {
    var k = keysFor([name]);
    return k.length ? '<div class="dfig-card">' + FIG.gallery(k) + '</div>' : '';
  }
  function first(names) {
    var k = keysFor(names);
    if (!k.length) return '';
    return '<details class="dfig-first"><summary>🖼️ 그림으로 먼저 보기 <span>(' + k.length + '장 · 누르면 크게)</span></summary>' +
      FIG.gallery(k) + '</details>';
  }
  if (!document.getElementById('dfig-css')) {
    var st = document.createElement('style'); st.id = 'dfig-css';
    st.textContent =
      '.dfig-first{margin:10px 0 12px;border:1px solid rgba(148,163,184,.35);border-radius:14px;padding:0 12px}' +
      '.dfig-first>summary{cursor:pointer;padding:11px 2px;font-weight:900;font-size:15px;list-style-position:inside}' +
      '.dfig-first>summary span{font-weight:600;font-size:13px;opacity:.75}' +
      '.dfig-first[open]>summary{margin-bottom:6px}' +
      '.dfig-first .fig-gallery{padding-bottom:12px}' +
      '.dfig-card{margin-top:12px}' +
      '.dfig-card .fig-gallery{grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr))}' +
      '.has-fig .dfig-mark{font-size:12px;margin-left:3px;opacity:.85}';
    (document.head || document.documentElement).appendChild(st);
  }
  return { keysFor: keysFor, card: card, first: first };
})();
