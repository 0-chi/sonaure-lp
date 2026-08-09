/* Sonaure — マイクロインタラクション
 *
 * ここでしか .motion を付けないので、このスクリプトが読めなかった場合は
 * CSSの初期状態（透明）も効かず、ページはそのまま表示される。
 * 「JSが失敗したら本文が消える」という事故を構造的に防ぐための作り。
 */
(function () {
  "use strict";

  var root = document.documentElement;

  // IntersectionObserver が無い環境では、隠すだけ隠して出せなくなるので何もしない
  if (!("IntersectionObserver" in window)) return;

  root.classList.add("motion");

  // 動きを減らす設定のときは、現れる演出をつけない（ホバーはCSS側で無効化）
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches) return;

  var SELECTOR = [
    "h2",
    ".lead",
    ".card", ".aud-card", ".ts-card", ".price-card", ".biz-card", ".step",
    ".tool-box", ".cta-box", ".soudan", ".blog-box",
    ".callout", ".trust-box", ".ts-trust",
    ".tw", "table", "details",
    ".author", ".related", ".backlink",
    ".plan-card", ".formats"
  ].join(",");

  function setup() {
    var vh = window.innerHeight || root.clientHeight;
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (!e.isIntersecting) continue;
        e.target.classList.add("is-in");
        io.unobserve(e.target);   // 一度出したら監視をやめる（再スクロールで再生しない）
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });

    var seen = [];
    var nodes = document.querySelectorAll(SELECTOR);

    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];

      // 入れ子の要素を二重に動かさない（表を .tw で囲んでいる箇所など）
      var nested = false;
      for (var j = 0; j < seen.length; j++) {
        if (seen[j].contains(el)) { nested = true; break; }
      }
      if (nested) continue;
      seen.push(el);

      // 最初から画面に入っている範囲は触らない。
      // ファーストビューを透明から始めると、表示が遅れたように見えるうえ
      // LCP（最大要素の描画時間）の計測も遅くなるため。
      if (el.getBoundingClientRect().top < vh * 0.9) continue;

      // 同じ親の中で並ぶものは、わずかにずらして出すと落ち着いて見える。
      // 積み上がりすぎないよう4つ分で頭打ちにする。
      var parent = el.parentElement;
      var order = 0;
      if (parent) {
        var sibs = parent.children;
        for (var k = 0; k < sibs.length; k++) {
          if (sibs[k] === el) break;
          if (sibs[k].matches && sibs[k].matches(SELECTOR)) order++;
        }
      }
      if (order > 0) {
        el.style.transitionDelay = Math.min(order, 4) * 60 + "ms";
      }

      el.classList.add("reveal");
      io.observe(el);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }
})();
