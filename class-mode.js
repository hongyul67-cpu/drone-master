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
.cls-stage{flex:1;display:grid;place-items:center;padding:clamp(14px,3vh,40px) clamp(16px,4vw,64px);overflow:auto}
.cls-slide{width:100%;max-width:1150px;text-align:center;animation:clsin .32s ease}
@keyframes clsin{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.cls-ico{font-size:clamp(48px,8vw,110px);line-height:1;filter:drop-shadow(0 8px 22px rgba(56,189,248,.35))}
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
/* 함께 확인(게임 데이터 재활용) */
.cls-rows{display:grid;gap:clamp(7px,1.2vh,13px);max-width:1000px;margin:clamp(10px,2vh,20px) auto 0;text-align:left}
.cls-row{display:grid;grid-template-columns:minmax(28%,auto) 1fr;gap:clamp(8px,1.2vw,18px);align-items:center;
  background:#132242;border:1px solid #263a63;border-radius:13px;padding:clamp(9px,1.5vh,15px) clamp(12px,1.6vw,20px)}
.cls-row .rk{font-size:clamp(15px,2vw,28px);font-weight:900;color:#dbe7ff}
.cls-row .rv{font-size:clamp(14px,1.75vw,25px);color:var(--muted);font-weight:700}
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

  function hidden(){
    var s=S[i];
    if(s.t==="quiz") return shown?0:1;
    if(s.t==="rows") return Math.max(0,(s.rows||[]).length-shown);
    return 0;
  }
  function draw(){
    var s=S[i], h="";
    if(s.t==="card"){
      h='<div class="cls-ico">'+(s.ico||"")+'</div><div class="cls-title">'+s.title+'</div>'
       +'<ul class="cls-lines"><li>'+(s.lines||[]).join("</li><li>")+'</li></ul>';
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
      h='<div class="cls-ico">'+(s.ico||"")+'</div><div class="cls-title">'+s.title+'</div>'
       +(s.sub?'<div class="cls-sub">'+s.sub+'</div>':'')+'<div class="cls-rows">';
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
       +(s.sub?'<div class="cls-sub">'+s.sub+'</div>':'');
    }
    var slide=$("#clsSlide",root);
    slide.innerHTML=h;
    slide.className="cls-slide"+(s.t==="cover"?" cover":"");
    $$(".cls-dot",dots).forEach(function(d,k){ d.classList.toggle("on",k===i) });
    $("#clsNum",root).textContent=(i+1)+" / "+S.length;
    $("#clsPrev",root).disabled=(i===0);
    var left=hidden(), btn=$("#clsShow",root);
    btn.style.display=left?"block":"none";
    if(left) btn.textContent = S[i].t==="rows" ? ("정답 공개 ("+shown+"/"+S[i].rows.length+")") : "정답 공개";
    $("#clsNext",root).textContent = (i===S.length-1) ? "처음으로" : "다음 →";
  }
  function reveal(){
    var s=S[i];
    if(s.t==="quiz") shown=1;
    else if(s.t==="rows") shown=Math.min(s.rows.length,shown+1);
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

/* ══════════ lesson.js 차시 데이터 → 슬라이드 (내용 중복 없음) ══════════ */
function fromLesson(cfg){
  var S=[];
  S.push({t:"cover", ico:cfg.logo||"🚁", tag:cfg.tag, title:cfg.name, sub:cfg.sub||""});
  (cfg.steps||[]).forEach(function(step){
    if(step.type==="cards"){
      S.push({t:"section", ico:step.ico||"📖", title:step.label, sub:step.intro||""});
      (step.data||[]).forEach(function(c){ S.push({t:"card", ico:c.i, title:c.n, lines:c.d||[]}) });
    }
    else if(step.type==="quiz"){
      S.push({t:"section", ico:"🙋", title:"함께 풀어 보기",
              sub:"문제를 읽고 <b>스스로 생각한 뒤</b> 발표해 보자. 정답은 선생님이 공개한다."});
      (step.data||[]).forEach(function(q,i){
        if(!q.a) return;                       // 단답형은 화면 풀이에서 제외
        S.push({t:"quiz", n:i+1, q:q.q, a:q.a, c:q.c, x:q.x||""});
      });
    }
    else if(step.type==="sort"){
      S.push({t:"rows", ico:step.ico||"🗂️", title:step.label, sub:step.intro||"어디에 들어갈지 함께 생각해 보자.",
              rows:(step.data.items||[]).map(function(it){ return {k:it.t, v:it.bin} })});
    }
    else if(step.type==="match"){
      S.push({t:"rows", ico:step.ico||"🔗", title:step.label, sub:step.intro||"무엇과 이어질지 함께 생각해 보자.",
              rows:(step.data||[]).map(function(r){ return {k:r.k, v:r.a} })});
    }
    else if(step.type==="pick"){
      S.push({t:"rows", ico:step.ico||"✅", title:step.label, sub:step.intro||"맞는 설명인지 함께 판단해 보자.",
              rows:(step.data||[]).map(function(c){
                return {k:c.t, v:(c.ok?"⭕ 맞다":"❌ 아니다")+(c.why?" — "+c.why:"")} })});
    }
    else if(step.type==="seq"){
      S.push({t:"rows", ico:step.ico||"🔢", title:step.label, sub:step.intro||"어떤 순서일지 함께 맞혀 보자.",
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
