/*! 드론 제작 마스터 — 결과 제출 공용 (links/CONVENTIONS.md §1)
 *
 *  · 시트 탭(tool)은 "드론 제작 마스터" 하나로 두고, 어느 차시·어느 활동인지는
 *    mode 로 보낸다. 교사 시트의 "활동(파트)" 열에 그대로 들어간다.
 *  · 제출 버튼은 ?rc= 링크가 아니어도 항상 보인다. (누르면 왜 안 되는지 안내)
 *  · wrong 은 번호가 아니라 무엇을 틀렸는지 적는다.
 *
 *  쓰는 법 — 채점이 끝나는 자리에서 한 줄:
 *    RCPart.mount('#btnSubmit', {
 *      part : '드론 개요 — 학습지 퀴즈',       // mode. 파트마다 다르게!
 *      label: '학습지 퀴즈',                   // 버튼에 보일 짧은 이름
 *      extra: ['드론 구조 이해'],              // 생기부 키워드(선택)
 *      payload: function(){ return {score:…, correct:…, total:…, wrong:[…]}; }
 *    });
 */
(function () {
  'use strict';

  var TOOL = '드론 제작 마스터';

  function short(t, len) {
    t = String(t == null ? '' : t).replace(/<[^>]*>/g, '')
         .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
         .replace(/\s+/g, ' ').trim();
    return t.length > len ? t.slice(0, len - 1) + '…' : t;
  }

  /* [{no, q, pick, ans}] → ["3번 프레임→착륙장치", …] */
  function descs(items) {
    return (items || []).map(function (w) {
      return w.no + '번 ' + (w.src ? w.src + ' · ' : '') +
             short(w.pick, 16) + '→' + short(w.ans, 16);
    });
  }

  function el(target) {
    if (!target) return null;
    if (typeof target === 'string') return document.querySelector(target);
    return target;
  }

  /* 기존 제출 버튼(있으면)을 감추고, 그 자리에 규약대로 attach 한 버튼을 붙인다.
     attach 가 retry(같은 파트를 몇 번째 푸는지)와 계급을 알아서 채워 준다. */
  function mount(target, opt) {
    opt = opt || {};
    var anchor = el(target);
    if (!anchor) return null;
    if (!window.ResultCollector || !ResultCollector.attach) return null;

    // 시트 탭 이름을 통일 (페이지마다 달랐던 것을 하나로)
    if (ResultCollector.config) ResultCollector.config.tool = TOOL;

    // 옛 버튼은 자리만 내주고 사라진다
    anchor.style.display = 'none';

    var getPayload = opt.payload || function () { return {}; };
    var btn = ResultCollector.attach(anchor, function () {
      var p = getPayload() || {};
      if (!p.mode) p.mode = opt.part;
      return p;
    }, {
      id: opt.id || 'rcPartBtn',
      className: opt.className || 'btn',
      mode: opt.part,
      extra: opt.extra
    });

    if (btn) {
      btn.style.width = '100%';
      btn.textContent = '📤 [' + (opt.label || opt.part) + '] 결과 제출';
    }
    return btn;
  }

  /* 폼처럼 "다 썼는지 검사한 뒤에" 보내야 하는 자리용.
     attach 는 누르면 무조건 창을 열기 때문에 검사를 끼워 넣을 수 없다.
     그래서 도구가 자기 버튼을 그대로 쓰되, 보낼 때 이 함수를 부른다.
     ?rc= 링크가 아니면 attach 와 같은 안내를 띄운다. */
  var NL = String.fromCharCode(10);
  function submit(part, payload, extra) {
    if (!window.ResultCollector) return false;
    if (ResultCollector.config) ResultCollector.config.tool = TOOL;

    if (!ResultCollector.hasEndpoint || !ResultCollector.hasEndpoint()) {
      alert([
        '이 링크로는 제출이 되지 않아요.', '',
        '선생님이 나눠 준 제출용 링크(주소 뒤에 ?rc=... 가 붙은 링크)로',
        '들어와야 반·번호를 입력하고 결과를 보낼 수 있습니다.', '',
        '쓴 내용은 이 기기에 그대로 저장돼 있으니 그대로 이어서 하면 됩니다.'
      ].join(NL));
      return false;
    }

    var p = payload || {};
    if (!p.mode) p.mode = part;
    if (!p.extra && extra) p.extra = extra;
    if (p.retry === undefined && ResultCollector.bumpTry) p.retry = ResultCollector.bumpTry(p.mode);
    if (p.tier === undefined && window.Rank && Rank.get) {
      try { p.tier = Rank.get().tier.full; } catch (e) {}
    }
    ResultCollector.open(p);
    return true;
  }

  window.RCPart = { tool: TOOL, short: short, descs: descs, mount: mount, submit: submit };
})();
