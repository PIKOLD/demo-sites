/* Общий код демо: статус «открыто» и появление блоков. Вся внешность задаётся CSS сайта.
   Данные: <script type="application/json" id="site">{"hours":{"mon":[["10:00","22:00"]]},"is247":false}</script>
   Статус: <span data-status></span> получает текст и класс is-open или is-closed. Появление: атрибут data-r, CSS пишет сайт
   (.js [data-r]{opacity:0} и .js [data-r].in{opacity:1}). */
(function () {
  var el = document.getElementById('site'), S = el ? JSON.parse(el.textContent) : {};
  var DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  var WHEN = ['в воскресенье', 'в понедельник', 'во вторник', 'в среду', 'в четверг', 'в пятницу', 'в субботу'];
  var now = new Date(Date.now() + (new Date().getTimezoneOffset() + 180) * 60000);
  var min = function (t) { var p = t.split(':'); return +p[0] * 60 + +p[1]; };
  var cur = now.getHours() * 60 + now.getMinutes(), d = now.getDay(), text = '', open = false;
  if (S.is247) { text = 'Открыто круглосуточно'; open = true; }
  else if (S.hours) {
    (S.hours[DAYS[d]] || []).forEach(function (r) { var a = min(r[0]), b = min(r[1]); if (b <= a) b += 1440; if (cur >= a && cur < b) { open = true; text = 'Открыто сейчас · до ' + r[1]; } });
    (S.hours[DAYS[(d + 6) % 7]] || []).forEach(function (r) { var a = min(r[0]), b = min(r[1]); if (b <= a && cur < b) { open = true; text = 'Открыто сейчас · до ' + r[1]; } });
    if (!open) for (var i = 0; i < 8 && !text; i++) {
      var rs = S.hours[DAYS[(d + i) % 7]] || [];
      for (var k = 0; k < rs.length; k++) if (i > 0 || min(rs[k][0]) > cur) { text = 'Сейчас закрыто · откроемся ' + (i === 0 ? 'сегодня' : i === 1 ? 'завтра' : WHEN[(d + i) % 7]) + ' в ' + rs[k][0]; break; }
    }
  }
  document.querySelectorAll('[data-status]').forEach(function (e) { e.textContent = text; e.classList.add(open ? 'is-open' : 'is-closed'); });

  var items = document.querySelectorAll('[data-r]');
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still || !('IntersectionObserver' in window)) { items.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.12 });
  items.forEach(function (e) { io.observe(e); });
})();
