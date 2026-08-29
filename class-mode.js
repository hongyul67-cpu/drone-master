/* ══════════════════════════════════════════════════════════════
   class-mode.js — 수업 모드(교사가 교실 앞 화면에 띄우는 슬라이드)
   fx.js처럼 CSS를 스스로 주입하므로 <script> 한 줄만 넣으면 된다.

   쓰는 법 ① lesson.js 차시 — 자동. ?mode=class 면 lesson.js가 호출한다.
   쓰는 법 ② 독립형 페이지 —
     ClassMode.start({
       tag:"드론 제작 · 3차시", name:"드론의 기본구조", logo:"🔧",
       exitLabel:"🎮 학생 화면",
       slides:[
         {t:"section", ico:"📖", title:"배우기", sub:"설명"},
         {t:"card",    ico:"🔲", title:"프레임", lines:["설명1","설명2"]},
         {t:"rows",    ico:"🎯", title:"센서", sub:"", rows:[{k:"기압",v:"고도"}]},
         {t:"quiz",    n:1, q:"문제", a:["보기1","보기2"], c:0, x:"해설"}
       ]
     })
   조작: → / Space 다음(가려진 답이 있으면 먼저 공개) · ← 이전
        T 타이머 · F 전체화면 · Esc 학생 화면으로
   ══════════════════════════════════════════════════════════════ */
(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function el(tag,cls,html){var e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e}

var CSS = `
.cls{--brand:#38bdf8;--brand2:#22d3ee;--good:#34d399;--bad:#fb7185;--gold:#fbbf24;
  --ink:#eaf1ff;--sub:#9db0d6;--muted:#6f83ac}
.cls-timer{--brand:#38bdf8;--brand2:#22d3ee;--good:#34d399;--bad:#fb7185;--gold:#fbbf24;
  --ink:#eaf1ff;--sub:#9db0d6;--muted:#6f83ac}
/* ══════════ 수업 모드(?mode=class) — 교사가 앞에 띄우는 큰 화면 ══════════ */
body.classmode{overflow:hidden}
/* 학생 화면이 정적 HTML인 페이지(03차시 등)에서는 뒤에 남지 않도록 숨긴다 */
body.classmode > .wrap,body.classmode > .toast,body.classmode > .savedtip{display:none !important}
/* 학생 화면용으로 떠 있는 위젯은 수업 화면에서 숨긴다.
   전부 position:fixed 라 그냥 두면 아래쪽 슬라이드 조작줄 위를 덮는다.
     · #fxSnd(소리)  — 1280 에서 「다음 →」 넓이의 86% 를 가림
     · #rk-badge(계급) — 「다음 →」·「← 이전」 글자 위에 덧찍힘
     · .tr-btn(기록 초기화) — 390 에서 슬라이드 번호를 100% 덮고 「← 이전」 29% 를 가림
   교실 앞 화면에서는 셋 다 쓸 일이 없고, 특히 기록 초기화는 눌리면 위험하다. */
body.classmode #rk-badge,body.classmode #fxSnd,body.classmode .tr-btn{display:none !important}
.cls{position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;
  background:radial-gradient(1400px 700px at 50% -20%,#16305e 0%,#0a1020 60%)}
/* 상단 바 */
.cls-top{display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid #22345c;flex:none}
.cls-top .ct1{font-size:clamp(13px,1.4vw,17px);font-weight:900;color:var(--brand2)}
.cls-top .ct2{font-size:clamp(11px,1.1vw,14px);color:var(--sub)}
.cls-top .sp{flex:1}
.cls-btn{background:#16233f;border:1px solid #2c4370;color:var(--ink);border-radius:11px;
  padding:9px 14px;font-size:clamp(12px,1.2vw,15px);font-weight:800;cursor:pointer;font-family:inherit}
.cls-btn:hover{border-color:var(--brand)}
.cls-btn.on{background:linear-gradient(135deg,#0ea5e9,#2563eb);border-color:transparent;color:#fff}
/* 무대 */
.cls-stage{flex:1;display:grid;place-items:center;padding:clamp(10px,1.8vh,28px) clamp(16px,4vw,64px);overflow:auto}
.cls-slide{width:100%;max-width:1150px;text-align:center;animation:clsin .32s ease}
@keyframes clsin{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.cls-ico{font-size:clamp(48px,8vw,110px);line-height:1;filter:drop-shadow(0 8px 22px rgba(56,189,248,.35))}
/* 본문이 있는 카드는 아이콘을 조금 작게 — 글이 잘리지 않도록 */
.cls-ico.sm{font-size:clamp(36px,5.4vw,74px)}
.cls-title{font-size:clamp(30px,5.2vw,68px);font-weight:900;margin-top:clamp(8px,1.6vh,20px);line-height:1.25}
.cls-sub{font-size:clamp(16px,2.1vw,28px);color:var(--sub);margin-top:clamp(8px,1.4vh,16px);line-height:1.5}
.cls-lines{list-style:none;padding:0;margin:clamp(16px,3vh,34px) auto 0;max-width:980px;text-align:left}
.cls-lines li{font-size:clamp(17px,2.35vw,33px);line-height:1.5;margin-bottom:clamp(10px,1.8vh,20px);
  padding-left:1.5em;position:relative;color:#dbe7ff}
.cls-lines li::before{content:"●";position:absolute;left:0;color:var(--brand);font-size:.62em;top:.5em}
.cls-lines li b{color:var(--gold)}
.cls-slide.cover .cls-title{font-size:clamp(36px,7vw,86px)}
.cls-tag{display:inline-block;font-size:clamp(12px,1.3vw,17px);font-weight:900;color:var(--brand2);
  background:#0b3a52;border-radius:999px;padding:6px 16px;margin-bottom:clamp(6px,1.2vh,14px)}
/* 문제 슬라이드 */
.cls-q{font-size:clamp(21px,3.1vw,44px);font-weight:900;line-height:1.4;margin-bottom:clamp(14px,2.4vh,28px)}
.cls-q b{color:var(--brand2)}
.cls-opts{display:grid;gap:clamp(8px,1.3vh,14px);max-width:900px;margin:0 auto;text-align:left}
.cls-opt{background:#132242;border:2px solid #263a63;border-radius:14px;
  padding:clamp(10px,1.7vh,18px) clamp(14px,1.8vw,22px);font-size:clamp(16px,2.1vw,29px);font-weight:700;
  display:flex;gap:.7em;align-items:center;transition:.25s}
.cls-opt .on{flex:none;width:1.5em;height:1.5em;border-radius:50%;background:#22345c;color:#9db0d6;
  display:grid;place-items:center;font-size:.8em;font-weight:900}
.cls-opt.right{border-color:var(--good);background:#123a2c;color:#a7f3d0}
.cls-opt.right .on{background:var(--good);color:#04231a}
.cls-exp{margin-top:clamp(12px,2vh,22px);background:#12402f;border:1px solid #2f6b52;border-radius:14px;
  padding:clamp(11px,1.8vh,18px);font-size:clamp(15px,1.9vw,26px);color:#a7f3d0;line-height:1.5;max-width:900px;
  margin-left:auto;margin-right:auto;text-align:left}
/* 빈칸 — 카드의 <b>강조어</b>를 가렸다가 하나씩 공개 */
.cls-bk{display:inline-block;min-width:3.2em;padding:0 .35em;border-bottom:3px solid var(--gold);
  color:transparent;background:rgba(251,191,36,.12);border-radius:5px 5px 0 0;transition:.25s}
.cls-bk.on{color:var(--gold);font-weight:900;background:rgba(251,191,36,.2)}
.cls-lines li b{color:var(--gold)}
/* 그림 */
.cls-fig{margin:clamp(10px,2vh,20px) auto 0;max-width:min(100%,760px)}
/* 그림이 커도 한 화면에 들어오도록 높이를 제한한다(빔프로젝터에서 스크롤 없이) */
.cls-fig img{width:auto;max-width:100%;max-height:26vh;height:auto;display:block;margin:0 auto;
  border-radius:14px;background:#fff;padding:clamp(6px,1vh,12px);box-shadow:0 10px 30px rgba(0,0,0,.45)}
.cls-fig.sm{max-width:min(100%,420px)}
/* 그림이 있는 카드: 넓은 화면에서 그림 | 본문 2단 — 세로를 아껴 한 화면에 담는다 */
@media (min-width:900px){
  /* 그림보다 글이 더 넓어야 줄바꿈이 덜 생겨 세로가 짧아진다 */
  .cls-body.two{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);
    gap:clamp(12px,1.8vw,28px);align-items:center;margin-top:clamp(10px,2vh,20px)}
  .cls-body.two .cls-fig{margin:0;max-width:100%}
  .cls-body.two .cls-fig img{max-height:40vh}
  .cls-body.two .cls-lines{margin:0;max-width:none}
  .cls-body.two .cls-lines li{font-size:clamp(15px,1.95vw,27px);margin-bottom:clamp(8px,1.4vh,15px)}
}
.cls-fig .cap{font-size:clamp(12px,1.4vw,18px);color:var(--muted);margin-top:8px;font-weight:700}
/* 그림 여러 장 */
.cls-figs{display:grid;grid-template-columns:repeat(auto-fit,minmax(clamp(130px,15vw,220px),1fr));
  gap:clamp(8px,1.4vw,18px);margin:clamp(10px,2vh,20px) auto 0;max-width:1000px}
.cls-figs figure{margin:0}
.cls-figs img{width:100%;height:auto;max-height:24vh;object-fit:contain;display:block;
  border-radius:12px;background:#fff;padding:6px}
.cls-figs figcaption{font-size:clamp(11px,1.3vw,17px);color:#dbe7ff;margin-top:6px;font-weight:800;text-align:center}

/* 함께 확인(게임 데이터 재활용) */
.cls-rows{display:grid;gap:clamp(7px,1.2vh,13px);max-width:1000px;margin:clamp(10px,2vh,20px) auto 0;text-align:left}
.cls-row{display:grid;grid-template-columns:minmax(28%,auto) 1fr;gap:clamp(8px,1.2vw,18px);align-items:center;
  background:#132242;border:1px solid #263a63;border-radius:13px;padding:clamp(9px,1.5vh,15px) clamp(12px,1.6vw,20px)}
.cls-row .rk{font-size:clamp(15px,2vw,28px);font-weight:900;color:#dbe7ff}
.cls-row .rv{font-size:clamp(14px,1.75vw,25px);color:var(--muted);font-weight:700}
/* 항목이 아주 많으면(8개 이상) 넓은 화면에서 2열로 — 한 화면에 담기 */
@media (min-width:900px){
  .cls-rows.cols2{grid-template-columns:1fr 1fr;gap:clamp(6px,1vh,11px) clamp(10px,1.4vw,20px);max-width:1150px}
}
.cls-rows.tight{gap:clamp(5px,.8vh,9px)}
.cls-rows.tight .cls-row{padding:clamp(6px,1vh,11px) clamp(10px,1.4vw,17px)}
.cls-rows.tight .rk{font-size:clamp(13px,1.65vw,23px)}
.cls-rows.tight .rv{font-size:clamp(12px,1.5vw,21px)}
.cls-row.shown{border-color:var(--good);background:#123a2c}
.cls-row.shown .rv{color:#a7f3d0}
/* 하단 바 */
.cls-bot{display:flex;align-items:center;gap:10px;padding:12px 18px;border-top:1px solid #22345c;flex:none;flex-wrap:wrap}
.cls-dots{flex:1;display:flex;gap:4px;align-items:center;overflow:hidden}
.cls-dot{width:7px;height:7px;border-radius:50%;background:#2c4370;flex:none;transition:.2s}
.cls-dot.on{background:var(--brand);transform:scale(1.5)}
.cls-num{font-size:clamp(12px,1.3vw,16px);font-weight:900;color:var(--sub);white-space:nowrap}
.cls-nav{display:flex;gap:8px}
.cls-nav .cls-btn{min-width:clamp(64px,7vw,104px)}
.cls-nav .cls-btn:disabled{opacity:.35;cursor:default}
.cls-reveal{background:linear-gradient(135deg,#f59e0b,#f43f5e);border:0;color:#fff}
/* 타이머 */
.cls-timer{position:fixed;right:18px;bottom:74px;z-index:210;background:#0d1830;border:1px solid #2c4370;
  border-radius:18px;padding:14px;box-shadow:0 18px 50px rgba(0,0,0,.6);display:none;min-width:210px}
.cls-timer.show{display:block}
.cls-timer .tnum{font-size:clamp(34px,5vw,58px);font-weight:900;text-align:center;color:var(--brand2);
  font-variant-numeric:tabular-nums;line-height:1.1}
.cls-timer .tnum.warn{color:var(--gold)} .cls-timer .tnum.over{color:var(--bad)}
.cls-timer .tpre{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;justify-content:center}
.cls-timer .tpre button{background:#16233f;border:1px solid #2c4370;color:var(--ink);border-radius:9px;
  padding:7px 11px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit}
.cls-timer .tpre button:hover{border-color:var(--brand)}
.cls-timer.ring{animation:tring .5s ease 4}
@keyframes tring{0%,100%{transform:none}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}
@media (prefers-reduced-motion: reduce){
  .cls-slide{animation:none} .cls-timer.ring{animation:none}
}
`;

var injected=false;
function inject(){
  if(injected) return; injected=true;
  var s=document.createElement("style"); s.textContent=CSS; document.head.appendChild(s);
}

/* ══════════ 슬라이드 화면 ══════════ */
function start(opt){
  inject();
  var S=(opt.slides||[]).slice();
  if(!S.length) return;
  document.body.classList.add("classmode");

  var root=el("div","cls");
  root.innerHTML=''
   +'<div class="cls-top">'
   +  '<div><div class="ct1">'+(opt.tag||"")+'</div><div class="ct2">'+(opt.name||"")+' · 수업용 화면</div></div>'
   +  '<div class="sp"></div>'
   +  '<button class="cls-btn" id="clsTimer">⏱ 타이머</button>'
   +  '<button class="cls-btn" id="clsFull">⛶ 전체화면</button>'
   +  '<button class="cls-btn" id="clsExit">'+(opt.exitLabel||"🎮 학생 화면")+'</button>'
   +'</div>'
   +'<div class="cls-stage"><div class="cls-slide" id="clsSlide"></div></div>'
   +'<div class="cls-bot">'
   +  '<div class="cls-dots" id="clsDots"></div>'
   +  '<div class="cls-num" id="clsNum"></div>'
   +  '<div class="cls-nav">'
   +    '<button class="cls-btn" id="clsPrev">← 이전</button>'
   +    '<button class="cls-btn cls-reveal" id="clsShow" style="display:none">정답 공개</button>'
   +    '<button class="cls-btn on" id="clsNext">다음 →</button>'
   +  '</div>'
   +'</div>';
  document.body.appendChild(root);

  var timer=el("div","cls-timer");
  timer.innerHTML='<div class="tnum" id="tNum">0:00</div>'
   +'<div class="tpre">'
   +  '<button data-s="30">30초</button><button data-s="60">1분</button>'
   +  '<button data-s="180">3분</button><button data-s="300">5분</button>'
   +  '<button data-s="0">정지</button>'
   +'</div>';
  document.body.appendChild(timer);

  var i=0, shown=0;
  var dots=$("#clsDots",root);
  S.forEach(function(){ dots.appendChild(el("i","cls-dot")) });

  // 카드 본문의 <b>강조어</b> 개수 = 빈칸 개수
  function blankCount(s){
    if(s.t!=="card" || s.noBlank) return 0;
    var n=0;
    (s.lines||[]).forEach(function(t){ n += (String(t).match(/<b>/g)||[]).length });
    return n;
  }
  function hidden(){
    var s=S[i];
    if(s.t==="quiz") return shown?0:1;
    if(s.t==="rows") return Math.max(0,(s.rows||[]).length-shown);
    if(s.t==="card") return Math.max(0,blankCount(s)-shown);
    return 0;
  }
  // <b>말</b> → 빈칸(공개된 것만 글자 표시)
  function blanks(html,from,upto){
    var k=from;
    return String(html).replace(/<b>(.*?)<\/b>/g,function(_,w){
      var on=(k<upto); k++;
      return '<span class="cls-bk'+(on?" on":"")+'">'+w+'</span>';
    });
  }
  function figHtml(s){
    if(s.figs && s.figs.length){
      return '<div class="cls-figs">'+s.figs.map(function(f){
        return '<figure><img src="'+f.src+'" alt="'+(f.cap||"")+'">'
             + (f.cap?'<figcaption>'+f.cap+'</figcaption>':'')+'</figure>';
      }).join("")+'</div>';
    }
    if(s.img){
      return '<div class="cls-fig'+(s.imgSmall?" sm":"")+'"><img src="'+s.img+'" alt="'+(s.title||"")+'">'
           + (s.imgCap?'<div class="cap">'+s.imgCap+'</div>':'')+'</div>';
    }
    return "";
  }
  function draw(){
    var s=S[i], h="";
    if(s.t==="card"){
      // 강조어를 빈칸으로 가렸다가 공개(빈칸이 없으면 그냥 본문)
      var nb=blankCount(s), used=0;
      var lis=(s.lines||[]).map(function(t){
        if(!nb) return '<li>'+t+'</li>';
        var c=(String(t).match(/<b>/g)||[]).length;
        var out='<li>'+blanks(t,used,shown)+'</li>';
        used+=c; return out;
      }).join("");
      // 그림이 있으면 이모지 아이콘은 생략한다(그림이 이미 시각 자료라 세로가 넘침)
      // 그림이 있으면 이모지 아이콘을 빼고, 넓은 화면에서는 그림·본문을 2단으로(세로 절약)
      var hasFig=!!(s.img||s.figs);
      h=(hasFig ? '' : '<div class="cls-ico sm">'+(s.ico||"")+'</div>')
       +'<div class="cls-title">'+s.title+'</div>'
       +'<div class="cls-body'+(hasFig?" two":"")+'">'+figHtml(s)+'<ul class="cls-lines">'+lis+'</ul></div>';
    }
    else if(s.t==="quiz"){
      h='<div class="cls-q"><b>Q'+s.n+'.</b> '+s.q+'</div><div class="cls-opts">';
      (s.a||[]).forEach(function(txt,k){
        var on=(shown&&k===s.c);
        h+='<div class="cls-opt'+(on?" right":"")+'"><span class="on">'+String.fromCharCode(65+k)+'</span><span>'+txt+'</span></div>';
      });
      h+='</div>'+(shown&&s.x?'<div class="cls-exp">💡 '+s.x+'</div>':'');
    }
    else if(s.t==="rows"){
      // 항목이 많으면 큰 아이콘을 빼고 제목에 붙인다(세로 절약)
      var cnt=(s.rows||[]).length, many=cnt>=5;
      // 짧은 항목이 많을 때만 2열(설명이 길면 줄바꿈으로 더 높아진다)
      var avg=0; (s.rows||[]).forEach(function(r){ avg+=(String(r.k).length+String(r.v).length) });
      avg = cnt ? avg/cnt : 0;
      var cols2 = cnt>=6 && avg<42;
      h=(many?'':'<div class="cls-ico">'+(s.ico||"")+'</div>')
       +'<div class="cls-title">'+(many?(s.ico||"")+' ':'')+s.title+'</div>'
       +(s.sub?'<div class="cls-sub">'+s.sub+'</div>':'')+figHtml(s)
       +'<div class="cls-rows'+(many?" tight":"")+(cols2?" cols2":"")+'">';
      (s.rows||[]).forEach(function(r,k){
        var on=k<shown;
        h+='<div class="cls-row'+(on?" shown":"")+'"><div class="rk">'+r.k+'</div>'
          +'<div class="rv">'+(on?r.v:"❓ 무엇일까?")+'</div></div>';
      });
      h+='</div>';
    }
    else {   // cover · section · end
      h='<div class="cls-ico">'+(s.ico||"")+'</div>'
       +(s.tag?'<div class="cls-tag" style="margin-top:14px">'+s.tag+'</div>':'')
       +'<div class="cls-title">'+s.title+'</div>'
       +(s.sub?'<div class="cls-sub">'+s.sub+'</div>':'')+figHtml(s);
    }
    var slide=$("#clsSlide",root);
    slide.innerHTML=h;
    slide.className="cls-slide"+(s.t==="cover"?" cover":"");
    $$(".cls-dot",dots).forEach(function(d,k){ d.classList.toggle("on",k===i) });
    $("#clsNum",root).textContent=(i+1)+" / "+S.length;
    $("#clsPrev",root).disabled=(i===0);
    var left=hidden(), btn=$("#clsShow",root);
    btn.style.display=left?"block":"none";
    if(left){
      if(s.t==="rows")      btn.textContent="정답 공개 ("+shown+"/"+s.rows.length+")";
      else if(s.t==="card") btn.textContent="빈칸 공개 ("+shown+"/"+blankCount(s)+")";
      else                  btn.textContent="정답 공개";
    }
    $("#clsNext",root).textContent = (i===S.length-1) ? "처음으로" : "다음 →";
  }
  function reveal(){
    var s=S[i];
    if(s.t==="quiz") shown=1;
    else if(s.t==="rows") shown=Math.min(s.rows.length,shown+1);
    else if(s.t==="card") shown=Math.min(blankCount(s),shown+1);
    draw();
    if(window.FX) FX.sound("up");
  }
  function move(d){
    if(d>0 && i===S.length-1){ i=0; shown=0; draw(); return }
    var n=i+d; if(n<0||n>=S.length) return;
    i=n; shown=0; draw();
  }
  $("#clsPrev",root).addEventListener("click",function(){ move(-1) });
  $("#clsNext",root).addEventListener("click",function(){ move(1) });
  $("#clsShow",root).addEventListener("click",reveal);
  $("#clsExit",root).addEventListener("click",function(){
    if(opt.onExit){ opt.onExit(); return }
    var q=new URLSearchParams(location.search); q.delete("mode");
    location.search=q.toString();
  });
  $("#clsFull",root).addEventListener("click",function(){
    if(document.fullscreenElement) document.exitFullscreen();
    else if(document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
  });

  /* 타이머 — 모둠 활동·생각할 시간 재기 */
  var tLeft=0, tId=null;
  function tDraw(){
    var m=Math.floor(Math.abs(tLeft)/60), sec=Math.abs(tLeft)%60;
    var n=$("#tNum",timer);
    n.textContent=(tLeft<0?"-":"")+m+":"+(sec<10?"0":"")+sec;
    n.className="tnum"+(tLeft<0?" over":(tLeft<=10?" warn":""));
  }
  function tSet(sec){
    clearInterval(tId); tId=null; tLeft=sec; tDraw();
    if(!sec) return;
    tId=setInterval(function(){
      tLeft--; tDraw();
      if(tLeft===0){
        timer.classList.add("ring");
        if(window.FX) FX.sound("clear");
        setTimeout(function(){ timer.classList.remove("ring") },2200);
      }
    },1000);
  }
  $$(".tpre button",timer).forEach(function(b){
    b.addEventListener("click",function(){ tSet(parseInt(b.dataset.s,10)) });
  });
  $("#clsTimer",root).addEventListener("click",function(){
    timer.classList.toggle("show");
    $("#clsTimer",root).classList.toggle("on",timer.classList.contains("show"));
  });

  document.addEventListener("keydown",function(e){
    if(e.key==="ArrowRight"||e.key===" "||e.key==="PageDown"){
      e.preventDefault(); if(hidden()) reveal(); else move(1);
    }
    else if(e.key==="ArrowLeft"||e.key==="PageUp"){ e.preventDefault(); move(-1) }
    else if(e.key==="t"||e.key==="T"){ $("#clsTimer",root).click() }
    else if(e.key==="f"||e.key==="F"){ $("#clsFull",root).click() }
    else if(e.key==="Escape" && !document.fullscreenElement){ $("#clsExit",root).click() }
  });

  tDraw(); draw();
}

/* 원본 학습지(HWP)·교재(PDF)에서 가져온 그림 — 카드 이름으로 붙인다 */
var FIG={
  "회전익 드론":      {img:"images/multicopter-types.png", imgCap:"멀티콥터 종류 — 로터 3·4·6·8개 (트라이 · 쿼드 · 헥사 · 옥토)"},
  "토크 상쇄":        {img:"images/props-cw-ccw.png", imgCap:"대각선끼리 같은 방향 — 1·3번 CW, 2·4번 CCW (교재 109쪽)"},
  "리포 배터리 전압": {img:"images/battery.jpg", imgCap:"리튬 폴리머 배터리 — 10000mAh · 10C · 11.1V(3S) 표기"},
  "배터리 안전":      {img:"images/battery6s.jpg", imgCap:"6cell 22.2V 22000mAh — 셀 수가 늘면 전압이 올라간다"}
};
/* 차시 뒤에 덧붙이는 그림 슬라이드 */
var EXTRA={
  "02": [
    {t:"section", ico:"🎮", title:"조종은 로터 속도로 한다", after:"cards",
     sub:"<b>고속</b> 쪽이 더 들려서 <b>저속</b> 쪽으로 기울고, 기운 방향으로 움직인다.",
     figs:[
       {src:"images/fly-up.png",      cap:"① 상승 — 네 개 모두 고속"},
       {src:"images/fly-down.png",    cap:"② 하강 — 네 개 모두 저속"},
       {src:"images/fly-forward.png", cap:"③ 전진 — 앞 저속 · 뒤 고속"},
       {src:"images/fly-back.png",    cap:"④ 후진 — 앞 고속 · 뒤 저속"},
       {src:"images/fly-right.png",   cap:"⑤ 우측 이동 — 왼쪽 고속"},
       {src:"images/fly-left.png",    cap:"⑥ 좌측 이동 — 오른쪽 고속"},
       {src:"images/fly-yaw1.png",    cap:"⑦ 제자리 회전(요)"},
       {src:"images/fly-yaw2.png",    cap:"⑧ 반대로 회전(요)"}
     ]},
    {t:"rows", ico:"🕹️", title:"조종기 스틱과 연결하면", after:"cards",
     sub:"위 그림의 번호와 이어서 생각해 보자.",
     rows:[
       {k:"스로틀 — 네 로터를 함께",   v:"상승 · 하강 (①②)"},
       {k:"엘리베이터 — 앞뒤 차이",    v:"전진 · 후진 (③④)"},
       {k:"에일러론 — 좌우 차이",      v:"좌 · 우 이동 (⑤⑥)"},
       {k:"러더 — 대각선 한 쌍",       v:"제자리 회전, 요 (⑦⑧)"}
     ]}],
  "01": [{t:"section", ico:"🎆", title:"드론은 이런 곳에도 쓰인다", after:"cards",
          sub:"한강 드론 라이트쇼 — 수백 대가 <b>정해진 자리</b>를 지키며 함께 난다.",
          img:"images/droneshow.jpg", imgCap:"드론 라이트쇼(군집 비행)"}],
  "04": [{t:"section", ico:"🗺️", title:"어디서 날리면 안 될까?", after:"cards",
          sub:"빨간 <b>P 구역</b>은 비행 금지, 초록 원은 <b>관제권</b>(공항 주변)이다. 여기서 날리려면 <b>승인</b>이 필요하다.",
          img:"images/nofly-map.png", imgCap:"드론 비행 금지 구역과 관제권 확인 지도 (교재 34쪽)"},
         {t:"section", ico:"🎫", title:"조종자 증명 응시 기준", after:"cards",
          sub:"무게 등급에 따라 필요한 <b>비행 경력</b>이 다르다.",
          img:"images/cert-table.png", imgCap:"1~4종 응시 기준 (교재 34쪽)"}],
  "06": [{t:"card", ico:"🔢", title:"신고번호는 이렇게 읽는다", after:"cards", noBlank:true,
          img:"images/regnum.png", imgCap:"예) C4CM0001234",
          lines:["맨 앞 <b>C0~C4</b> — 기체 종류와 무게 등급",
                 "다음 <b>C 또는 N</b> — 사업용(C) 인지 비사업용(N) 인지",
                 "그 다음 <b>M·H·P·S</b> — 멀티콥터 · 헬리콥터 · 패러글라이더 · 기타",
                 "마지막 <b>숫자</b> — 일련번호"]}]
};

/* ══════════ lesson.js 차시 데이터 → 슬라이드 (내용 중복 없음) ══════════ */
function fromLesson(cfg){
  var S=[];
  var extra=(EXTRA[cfg.id]||[]).slice();
  function pushExtra(afterType){          // 선언 순서를 그대로 유지한다
    var rest=[];
    extra.forEach(function(x){ if(x.after===afterType) S.push(x); else rest.push(x) });
    extra=rest;
  }
  // 항목이 많거나 설명이 길면 한 화면에 안 들어오므로 여러 장으로 나눈다
  function pushRows(o){
    var rows=o.rows||[];
    var avg=0; rows.forEach(function(r){ avg+=(String(r.k).length+String(r.v).length) });
    avg = rows.length ? avg/rows.length : 0;
    var per = avg>=42 ? 5 : (avg>=26 ? 5 : 10);      // 설명이 길수록 한 장에 적게
    if(rows.length<=per){ S.push(o); return }
    var pages=Math.ceil(rows.length/per);
    for(var p=0;p<pages;p++){
      var part={}; for(var k in o) part[k]=o[k];
      part.rows=rows.slice(p*per,(p+1)*per);
      part.title=o.title+" ("+(p+1)+"/"+pages+")";
      if(p>0){ part.sub=""; part.figs=null; part.img=null }   // 이어지는 장은 안내·그림 생략
      S.push(part);
    }
  }
  S.push({t:"cover", ico:cfg.logo||"🚁", tag:cfg.tag, title:cfg.name, sub:cfg.sub||""});
  (cfg.steps||[]).forEach(function(step){
    if(step.type==="cards"){
      S.push({t:"section", ico:step.ico||"📖", title:step.label,
              sub:(step.intro||"")+"<br><br><span style='font-size:.82em;color:#fbbf24'>💡 노란 <b>빈칸</b>은 <b>정답 공개</b>(또는 Space)를 누를 때마다 하나씩 나타난다.</span>"});
      (step.data||[]).forEach(function(c){
        var sl={t:"card", ico:c.i, title:c.n, lines:c.d||[]};
        var f=FIG[c.n]; if(f){ sl.img=f.img; sl.imgCap=f.imgCap; sl.imgSmall=f.small }
        S.push(sl);
      });
      pushExtra("cards");
    }
    else if(step.type==="quiz"){
      S.push({t:"section", ico:"🙋", title:"함께 풀어 보기",
              sub:"문제를 읽고 <b>스스로 생각한 뒤</b> 발표해 보자. 정답은 선생님이 공개한다."});
      (step.data||[]).forEach(function(q,i){
        if(!q.a) return;                       // 단답형은 화면 풀이에서 제외
        S.push({t:"quiz", n:i+1, q:q.q, a:q.a, c:q.c, x:q.x||""});
      });
      pushExtra("quiz");
    }
    else if(step.type==="sort"){
      pushRows({t:"rows", ico:step.ico||"🗂️", title:step.label, sub:step.intro||"어디에 들어갈지 함께 생각해 보자.",
              rows:(step.data.items||[]).map(function(it){ return {k:it.t, v:it.bin} })});
    }
    else if(step.type==="match"){
      pushRows({t:"rows", ico:step.ico||"🔗", title:step.label, sub:step.intro||"무엇과 이어질지 함께 생각해 보자.",
              rows:(step.data||[]).map(function(r){ return {k:r.k, v:r.a} })});
    }
    else if(step.type==="pick"){
      pushRows({t:"rows", ico:step.ico||"✅", title:step.label, sub:step.intro||"맞는 설명인지 함께 판단해 보자.",
              rows:(step.data||[]).map(function(c){
                return {k:c.t, v:(c.ok?"⭕ 맞다":"❌ 아니다")+(c.why?" — "+c.why:"")} })});
    }
    else if(step.type==="seq"){
      pushRows({t:"rows", ico:step.ico||"🔢", title:step.label, sub:step.intro||"어떤 순서일지 함께 맞혀 보자.",
              rows:(step.data||[]).map(function(t,i){ return {k:(i+1)+"번째", v:t} })});
    }
    else if(step.type==="custom"){
      S.push({t:"section", ico:step.ico||"🎮", title:step.label,
              sub:"학생들이 <b>각자 기기에서</b> 해 보는 활동이다.<br>아래 <b>학생 화면</b> 버튼으로 넘어가 함께 해 보자."});
    }
    else if(step.type==="probe"){
      S.push({t:"section", ico:step.ico||"🔎", title:step.label+" (과제 안내)",
              sub:(step.topic||"")+(step.keywords&&step.keywords.length
                  ? "<br><br><span style='font-size:.8em;color:#38bdf8'>검색어 예시 — "+step.keywords.join(" · ")+"</span>" : "")});
    }
  });
  extra.forEach(function(x){ S.push(x) });      // 자리를 못 찾은 그림 슬라이드는 끝에
  S.push({t:"end", ico:"🎉", title:"오늘 수업 끝!",
          sub:"이제 <b>학생 화면</b>에서 게임과 학습지로 직접 확인해 보자."});
  start({tag:cfg.tag, name:cfg.name, slides:S});
}

function isClass(){
  try{ return new URLSearchParams(location.search).get("mode")==="class" }catch(e){ return false }
}
function openClass(){
  var q=new URLSearchParams(location.search); q.set("mode","class"); location.search=q.toString();
}

window.ClassMode={ start:start, fromLesson:fromLesson, isClass:isClass, open:openClass, init:inject };
})();
