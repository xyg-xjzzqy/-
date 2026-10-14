/* ══════════════════════════════════════════════════════
   资源库页面逻辑：解析配置区 → 渲染卡片 → 搜索
   资源链接请在 index.html 顶部的「资源链接配置区」里填写
══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var PALETTE = [
    { main: '#3D6BFF', tint: '#E8EEFF', dark: false },
    { main: '#FF7A2F', tint: '#FFE9DA', dark: false },
    { main: '#1FA55A', tint: '#E1F5E8', dark: false },
    { main: '#F7B32B', tint: '#FFF3D1', dark: true },
    { main: '#FF5D8F', tint: '#FFE3EC', dark: false },
    { main: '#8C5CFF', tint: '#EFE7FF', dark: false }
  ];
  var DEFAULT_EMOJI = ['📦', '🧩', '🎮', '🛠️', '🎧', '🗂️'];

  function $(s) { return document.querySelector(s); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---- Parse the config block ---- */
  function parse(txt) {
    var cards = [], cur = null;
    txt.split(/\r?\n/).forEach(function (raw) {
      var line = raw.trim();
      if (!line) return;
      if (/^##(!|\*)?/.test(line)) {
        var m = line.match(/^##([!*]?)\s*(.+)$/);
        if (m) {
          var title = m[2], emoji = null;
          var am = title.match(/\s@(\S+)\s*$/);
          if (am) { emoji = am[1]; title = title.slice(0, am.index).trim(); }
          cur = { variant: m[1], title: title, emoji: emoji, items: [] };
          cards.push(cur);
          return;
        }
      }
      if (line.charAt(0) === '#') return; // comment
      if (!cur) { cur = { variant: '', title: '其他', emoji: null, items: [] }; cards.push(cur); }
      var parts = line.split('|').map(function (s) { return s.trim(); });
      var it;
      if (parts.length === 1) it = { name: parts[0], btn: '待填写', url: '' };
      else if (parts.length === 2) it = { name: parts[0], btn: '打开', url: parts[1] };
      else it = { name: parts[0], btn: parts[1] || '打开', url: parts.slice(2).join('|') };
      it.empty = !it.url || it.url === '-';
      cur.items.push(it);
    });
    return cards.filter(function (c) { return c.items.length > 0; });
  }

  /* ---- Build DOM ---- */
  function resHTML(it, p) {
    var name = '<span class="res-name">' + esc(it.name) + '</span>';
    if (it.empty) {
      return '<div class="res" data-name="' + esc(it.name.toLowerCase()) + '">' + name +
        '<span class="btn btn--pending">' + esc(it.btn) + '</span></div>';
    }
    var solid = /下载|安装/.test(it.btn);
    var cls = solid ? 'btn--solid' + (p.dark ? ' dark' : '') : 'btn--ghost';
    return '<div class="res" data-name="' + esc(it.name.toLowerCase()) + '">' + name +
      '<a class="btn ' + cls + '" href="' + esc(it.url) + '" target="_blank" rel="noopener noreferrer">' + esc(it.btn) + '</a></div>';
  }

  function buildFeatured(card, i) {
    var it = card.items[0];
    var el = document.createElement(it.url ? 'a' : 'div');
    if (it.url) { el.href = it.url; el.target = '_blank'; el.rel = 'noopener noreferrer'; }
    el.className = 'card card--featured';
    el.style.setProperty('--i', i);
    el.dataset.name = (card.title + ' ' + it.name).toLowerCase();
    var html = '<span class="ribbon">★ 推荐</span>' +
      '<div class="f-emoji">' + esc(card.emoji || '⭐') + '</div>' +
      '<div class="f-title">' + esc(card.title) + '</div>' +
      '<p class="f-sub">' + esc(it.name) + '</p>' +
      '<span class="btn btn--solid feat-btn">' + esc(it.btn) + '</span>';
    if (card.items.length > 1) {
      html += '<div class="res-list" style="margin-top:16px;width:100%">' +
        card.items.slice(1).map(function (x) { return resHTML(x, PALETTE[1]); }).join('') + '</div>';
    }
    el.innerHTML = html;
    return el;
  }

  function buildCard(card, ci, i) {
    var p = PALETTE[ci % PALETTE.length];
    var el = document.createElement('article');
    el.className = 'card' + (card.variant === '*' ? ' card--wide' : '');
    el.style.setProperty('--tint', p.tint);
    el.style.setProperty('--accent', p.main);
    el.style.setProperty('--i', i);
    var emoji = card.emoji || DEFAULT_EMOJI[ci % DEFAULT_EMOJI.length];
    el.innerHTML =
      '<div class="card-head">' +
        '<span class="emoji-tile" aria-hidden="true">' + esc(emoji) + '</span>' +
        '<h2 class="card-title">' + esc(card.title) + '</h2>' +
        '<span class="card-count">' + card.items.length + ' 项</span>' +
      '</div>' +
      '<div class="res-list' + (card.variant === '*' ? ' res-cols' : '') + '">' +
        card.items.map(function (it) { return resHTML(it, p); }).join('') +
      '</div>';
    el.dataset.name = (card.title + ' ' + card.items.map(function (x) { return x.name; }).join(' ')).toLowerCase();
    return el;
  }

  /* ---- Render（数据来自 index.html 顶部的「资源链接配置区」） ---- */
  var cfgEl = document.getElementById('resource-config');
  var cfgText = cfgEl ? cfgEl.textContent : '';
  var hasData = cfgText.trim().length > 0;
  var cards = hasData ? parse(cfgText) : [];
  var featured = [], normal = [];
  cards.forEach(function (c) { (c.variant === '!' ? featured : normal).push(c); });

  var featGrid = $('#featuredGrid'), grid = $('#cardsGrid');
  var i = 0;
  featured.forEach(function (c) { featGrid.appendChild(buildFeatured(c, i++)); });
  normal.forEach(function (c, ci) { grid.appendChild(buildCard(c, ci, i++)); });

  var total = cards.reduce(function (n, c) { return n + c.items.length; }, 0);
  $('#statRes').textContent = total;
  $('#statCard').textContent = cards.length;

  if (!cards.length) {
    $('#emptyTip').hidden = false;
    $('#noResult').hidden = true;
  }

  /* ---- Search filter ---- */
  var input = $('#searchInput');
  function applyFilter() {
    if (!cards.length) return;
    var q = input.value.trim().toLowerCase(), any = false;
    document.querySelectorAll('#featuredGrid .card, #cardsGrid .card').forEach(function (card) {
      var items = card.querySelectorAll('.res'), visible = 0;
      if (items.length) {
        items.forEach(function (r) {
          var show = !q || r.dataset.name.indexOf(q) !== -1;
          r.style.display = show ? '' : 'none';
          if (show) visible++;
        });
      } else if (!q || card.dataset.name.indexOf(q) !== -1) {
        visible = 1;
      }
      card.classList.toggle('is-hide', visible === 0);
      if (visible) any = true;
    });
    $('#noResult').hidden = any;
  }
  input.addEventListener('input', applyFilter);

  /* ---- "/" focuses search ---- */
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== input) {
      e.preventDefault(); input.focus();
    }
  });
})();
