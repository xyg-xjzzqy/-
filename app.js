/* ══════════════════════════════════════════════════════════════
   资源库页面
   · 数据来源：优先 /api/tools（后台 KV），失败时回退 ./data.json
   · 日常维护：直接编辑 data.json，或打开 /xyg.html 在线管理
   · 收藏 / 最近打开：只存在本机 localStorage，不上传任何服务器
   · 下方渲染逻辑平时不用动
══════════════════════════════════════════════════════════════ */

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

  var FAV_KEY = 'xyg:fav';
  var RECENT_KEY = 'xyg:recent';
  var RECENT_MAX = 8;

  var ITEM_MAP = {};
  var favs = readStore(FAV_KEY);
  var recents = readStore(RECENT_KEY);

  function $(s) { return document.querySelector(s); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---- 本地存储（隐私模式下静默失败） ---- */
  function readStore(key) {
    try {
      var v = JSON.parse(localStorage.getItem(key) || 'null');
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }
  function writeStore(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ }
  }

  function keyOf(it) { return it.url || ('#' + it.name); }
  function isFav(key) {
    for (var i = 0; i < favs.length; i++) { if (favs[i].key === key) return true; }
    return false;
  }
  function findFav(key) {
    for (var i = 0; i < favs.length; i++) { if (favs[i].key === key) return favs[i]; }
    return null;
  }

  /* ---- 整理配置数据 ---- */
  function normalizeCards(list) {
    return list.map(function (c) {
      return {
        variant: c.style === '推荐' ? '!' : c.style === '宽卡' ? '*' : '',
        title: c.title || '未命名分类',
        emoji: c.emoji || null,
        items: (c.items || []).map(function (raw) {
          var it = raw || {};
          var url = typeof it.url === 'string' ? it.url : '';
          var tags = Array.isArray(it.tags) ? it.tags.join(' ') : (it.tags || '');
          return {
            name: it.name || '未命名资源',
            btn: it.btn || (url ? '打开' : '待填写'),
            url: url,
            desc: typeof it.desc === 'string' ? it.desc : '',
            tags: String(tags),
            empty: !url
          };
        })
      };
    }).filter(function (c) { return c.items.length > 0; });
  }

  /* 名称 + 描述 + 标签 一起参与搜索 */
  function itemIndex(it) {
    return (it.name + ' ' + it.desc + ' ' + it.tags).toLowerCase();
  }
  function cardIndex(card) {
    return (card.title + ' ' + card.items.map(itemIndex).join(' ')).toLowerCase();
  }

  /* ★ / ☆ 加 U+FE0E 强制文字形态，否则会被系统渲染成彩色 emoji，color 失效 */
  var STAR_ON = '\u2605\uFE0E';
  var STAR_OFF = '\u2606\uFE0E';

  /* ---- Build DOM ---- */
  function starHTML(key, cls) {
    var on = isFav(key);
    return '<button class="res-star' + (cls ? ' ' + cls : '') + (on ? ' is-on' : '') + '"' +
      ' type="button" data-act="fav" data-key="' + esc(key) + '"' +
      ' aria-pressed="' + (on ? 'true' : 'false') + '"' +
      ' title="' + (on ? '取消收藏' : '加入收藏') + '">' + (on ? STAR_ON : STAR_OFF) + '</button>';
  }

  function resHTML(it, p) {
    var key = keyOf(it);
    var main = '<span class="res-main">' +
      '<span class="res-name">' + esc(it.name) + '</span>' +
      (it.desc ? '<span class="res-desc">' + esc(it.desc) + '</span>' : '') +
      '</span>';
    if (it.empty) {
      return '<div class="res" data-name="' + esc(itemIndex(it)) + '">' + main +
        '<span class="btn btn--pending">' + esc(it.btn) + '</span></div>';
    }
    var solid = /下载|安装/.test(it.btn);
    var cls = solid ? 'btn--solid' + (p.dark ? ' dark' : '') : 'btn--ghost';
    return '<div class="res" data-name="' + esc(itemIndex(it)) + '">' + main + starHTML(key) +
      '<a class="btn ' + cls + '" href="' + esc(it.url) + '" target="_blank" rel="noopener noreferrer"' +
      ' data-act="open" data-key="' + esc(key) + '">' + esc(it.btn) + '</a></div>';
  }

  function buildFeatured(card, i) {
    var it = card.items[0];
    var key = keyOf(it);
    var el = document.createElement('div');
    el.className = 'card card--featured';
    el.style.setProperty('--i', i);
    el.dataset.name = cardIndex(card);
    if (it.url) {
      el.dataset.href = it.url;
      el.dataset.key = key;
      el.classList.add('is-link');
    }
    var btn = it.url
      ? '<a class="btn btn--solid feat-btn" href="' + esc(it.url) + '" target="_blank" rel="noopener noreferrer"' +
        ' data-act="open" data-key="' + esc(key) + '">' + esc(it.btn) + '</a>'
      : '<span class="btn btn--solid feat-btn">' + esc(it.btn) + '</span>';

    var html = '<span class="ribbon">★ 推荐</span>' +
      (it.empty ? '' : starHTML(key, 'feat-star')) +
      '<div class="f-emoji">' + esc(card.emoji || '⭐') + '</div>' +
      '<div class="f-title">' + esc(card.title) + '</div>' +
      '<p class="f-sub">' + esc(it.name) + (it.desc ? ' · ' + esc(it.desc) : '') + '</p>' +
      btn;

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
    el.dataset.name = cardIndex(card);
    return el;
  }

  /* ---- 我的常用面板 ---- */
  function renderFavPanel() {
    var sec = $('#favSection');
    if (!sec) return;
    var showFav = favs.length > 0, showRec = recents.length > 0;

    $('#favCount').textContent = favs.length;
    $('#statFav').textContent = favs.length;
    $('#favClear').hidden = !showFav;
    sec.hidden = !showFav && !showRec;

    $('#favList').innerHTML = showFav
      ? favs.map(function (f) {
          return resHTML({
            name: f.name, btn: f.btn || '打开', url: f.url || '',
            desc: f.desc || '', tags: '', empty: !f.url
          }, PALETTE[0]);
        }).join('')
      : '<p class="fav-empty">点资源右侧的 ☆ 就能收藏到这里，只存在你自己的浏览器里。</p>';

    $('#recentWrap').hidden = !showRec;
    $('#recentRow').innerHTML = recents.map(function (r) {
      return '<a class="recent-chip" href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer"' +
        ' data-act="open" data-key="' + esc(r.key) + '"><span>' + esc(r.name) + '</span></a>';
    }).join('');
  }

  function syncStars() {
    document.querySelectorAll('.res-star[data-key]').forEach(function (b) {
      var on = isFav(b.getAttribute('data-key'));
      b.classList.toggle('is-on', on);
      b.textContent = on ? STAR_ON : STAR_OFF;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.title = on ? '取消收藏' : '加入收藏';
    });
  }

  function toggleFav(key) {
    for (var i = 0; i < favs.length; i++) {
      if (favs[i].key === key) {
        favs.splice(i, 1);
        writeStore(FAV_KEY, favs);
        return true;
      }
    }
    var it = ITEM_MAP[key];
    if (!it) return false;
    favs.unshift({ key: key, name: it.name, url: it.url, btn: it.btn, desc: it.desc });
    writeStore(FAV_KEY, favs);
    return true;
  }

  function pushRecent(item) {
    if (!item || !item.url) return;
    var k = keyOf(item);
    recents = recents.filter(function (r) { return r.key !== k; });
    recents.unshift({ key: k, name: item.name, url: item.url, btn: item.btn, desc: item.desc || '' });
    if (recents.length > RECENT_MAX) recents.length = RECENT_MAX;
    writeStore(RECENT_KEY, recents);
    renderFavPanel();
  }

  /* ---- Render（数据来自 data.json 或后台接口） ---- */
  function render(list) {
    var cards = normalizeCards(list);

    ITEM_MAP = {};
    cards.forEach(function (c) {
      c.items.forEach(function (it) { ITEM_MAP[keyOf(it)] = it; });
    });

    var featured = [], normal = [];
    cards.forEach(function (c) { (c.variant === '!' ? featured : normal).push(c); });

    var featGrid = $('#featuredGrid'), grid = $('#cardsGrid');
    featGrid.innerHTML = '';
    grid.innerHTML = '';
    var i = 0;
    featured.forEach(function (c) { featGrid.appendChild(buildFeatured(c, i++)); });
    normal.forEach(function (c, ci) { grid.appendChild(buildCard(c, ci, i++)); });

    var total = cards.reduce(function (n, c) { return n + c.items.length; }, 0);
    $('#statRes').textContent = total;
    $('#statCard').textContent = cards.length;
    $('#emptyTip').hidden = cards.length > 0;
    $('#noResult').hidden = true;
    renderFavPanel();
    return cards;
  }

  /* ---- Search filter ---- */
  function bindSearch(cards) {
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

    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== input) {
        e.preventDefault(); input.focus();
      }
    });
  }

  /* ---- 收藏 / 最近打开 交互 ---- */
  function bindActions() {
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;

      var star = t.closest('[data-act="fav"]');
      if (star) {
        e.preventDefault();
        e.stopPropagation();
        if (toggleFav(star.getAttribute('data-key'))) {
          syncStars();
          renderFavPanel();
        }
        return;
      }

      var link = t.closest('[data-act="open"]');
      if (link) {
        var lk = link.getAttribute('data-key');
        var item = ITEM_MAP[lk] || findFav(lk);
        // 延迟写入，避免面板重绘打断这次点击
        if (item) setTimeout(function () { pushRecent(item); }, 80);
        return;
      }

      var card = t.closest('.card--featured[data-href]');
      if (card) {
        var ck = card.getAttribute('data-key');
        var citem = ck ? ITEM_MAP[ck] : null;
        if (citem) setTimeout(function () { pushRecent(citem); }, 80);
        window.open(card.getAttribute('data-href'), '_blank', 'noopener');
      }
    });

    var clearBtn = $('#favClear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (!favs.length) return;
        if (!confirm('清空全部收藏？')) return;
        favs = [];
        writeStore(FAV_KEY, favs);
        syncStars();
        renderFavPanel();
      });
    }
  }

  /* ---- 加载数据：优先后台接口，回退静态 JSON ---- */
  async function loadCatalog() {
    var lastErr = null;
    for (var i = 0; i < 2; i++) {
      var url = i === 0 ? '/api/tools' : './data.json';
      try {
        var res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) continue;
        var data = await res.json();
        if (!Array.isArray(data)) continue;
        if (i === 0) {
          // 带 x-catalog 头才是真实目录；没有则说明后台未配置 KV，回退静态文件
          if (!res.headers.get('x-catalog')) continue;
          return data;
        }
        // 静态 data.json 为空时不采用
        if (!data.length) continue;
        return data;
      } catch (err) { lastErr = err; }
    }
    throw lastErr || new Error('没有可用数据');
  }

  function showError() {
    $('#emptyTip').hidden = false;
    $('#emptyTip').innerHTML =
      '<span class="big">⚠️</span><b>数据加载失败</b><br>请确认 data.json 存在，或改用本地服务器打开（例如 npx serve）。';
  }

  bindActions();
  loadCatalog().then(function (data) {
    var cards = render(data);
    bindSearch(cards);
  }).catch(showError);
})();
