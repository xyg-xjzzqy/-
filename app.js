/* ══════════════════════════════════════════════════════════════
   资源库页面：上方配置区填资源 → 下方代码负责渲染和搜索
══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
   💡 资源链接配置区【开始】 —— 只改这一块，改完保存、刷新网页生效
   ══════════════════════════════════════════════════════════════

   【怎么改】
   · 一个大括号块 { ... } = 一个分类（一张卡片）
   · 改链接：直接替换 url: '...' 引号里的网址
   · 加资源：在 items: [ ... ] 里照抄一行，改名称和网址即可
       { name: '资源名称', btn: '下载', url: 'https://...' },
   · 加分类：复制一整个 { ... } 块，改 title / emoji / items
   · btn 可省略（默认「打开」）；按钮文字含「下载/安装」会变成实心彩按钮
   · url 留空 '' 或省略 → 按钮显示灰色「待填写」
   · style 可选：'推荐' = 顶部大号推荐卡 ｜ '宽卡' = 占满一整行（资源多时用）
   · emoji 可省略，会自动配一个图标
   · 注意：行尾逗号不要丢，引号、冒号都用英文符号

   ══════════════════════════════════════════════════════════════ */

const RESOURCES = [

  {
    title: '闲鱼主页',
    emoji: '🛒',
    style: '推荐',                       // 顶部大号推荐卡片
    items: [
      { name: '前往我的闲鱼主页', btn: '进入主页', url: 'https://m.tb.cn/h.j0x82jk?tk=G3VcTsu96S3' },
    ],
  },

  {
    title: '联机',
    emoji: '🌐',
    items: [
      { name: '蓝盾', btn: '下载', url: 'https://share.feijipan.com/s/MvaT0Op4' },
      { name: '樱花', btn: '下载', url: 'https://share.feijipan.com/s/ZvaT0lAs' },
    ],
  },

  {
    title: '我的世界',
    emoji: '🧟',
    items: [
      { name: 'PCL启动器', btn: '下载', url: 'https://share.feijipan.com/s/7BaTFdei' },
      { name: '整合包', btn: '访问', url: 'https://bbsmc.net/' },
      { name: 'MC百科', btn: '访问', url: 'https://www.mcmod.cn/' },
    ],
  },

  {
    title: '实用工具',
    emoji: '🔧',
    style: '宽卡',                       // 占满一整行，资源多时用
    items: [
      { name: '窗口置顶', btn: '下载', url: 'https://share.feijipan.com/s/VzaTXVct' },
      { name: '图吧', btn: '下载', url: 'https://share.feijipan.com/s/KY7ASTh4' },
      { name: '弹窗定位（流氓软件清理）', btn: '下载', url: 'https://share.feijipan.com/s/KFaTXcsn' },
      { name: '电脑使用情况', btn: '下载', url: 'https://share.feijipan.com/s/r5aTX6gQ' },
      { name: '文件搜索', btn: '下载', url: 'https://share.feijipan.com/s/PBaTXxQa' },
      { name: 'Win11 轻松设置', btn: '下载', url: 'https://share.feijipan.com/s/gqaTXgcW' },
      { name: '局域网文件传', btn: '下载', url: 'https://share.feijipan.com/s/WmaTXRXe' },
      { name: '局域网文件共享', btn: '下载', url: 'https://share.feijipan.com/s/jSaTYDuQ' },
      { name: '卸载软件', btn: '下载', url: 'https://share.feijipan.com/s/SdaT2b90' },
      { name: '垃圾清理', btn: '下载', url: 'https://share.feijipan.com/s/cAaT2nOI' },
      { name: 'WizTree', btn: '下载', url: 'https://share.feijipan.com/s/mydMXDMN' },
      { name: '系统美化', btn: '下载', url: 'https://share.feijipan.com/s/TK8UlGSA' },
      { name: '手机音频转电脑', btn: '下载', url: 'https://share.feijipan.com/s/luwSiGi2' }
      { name: '校园网自动认证', btn: '下载', url: 'https://share.feijipan.com/s/pNxTt9SE' }
      { name: 'Adobe 全家桶', btn: '访问', url: 'https://www.yeah6.com/' },
      { name: 'Office 下载激活', btn: '访问', url: 'https://www.officetool.plus/zh-cn/' },
    ],
  },

  {
    title: '娱乐',
    emoji: '😍',
    items: [
      { name: '音乐', btn: '下载', url: 'https://share.feijipan.com/s/6EaTNCWm' },
    ],
  },

  {
    title: '游戏资源库',
    emoji: '🤖',
    items: [
      { name: 'Koyso', btn: '访问', url: 'https://koyso.to/' },
      { name: 'N网（游戏 MOD 网站）', btn: '访问', url: 'https://www.nexusmods.com/' },
    ],
  },

];

/* ═════════════════════ 资源链接配置区【结束】════════════════════ */

/* ═══════════════ 以下是页面渲染和搜索逻辑，平时不用动 ═══════════════ */
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

  /* ---- 整理配置数据 ---- */
  function normalizeCards() {
    return RESOURCES.map(function (c) {
      return {
        variant: c.style === '推荐' ? '!' : c.style === '宽卡' ? '*' : '',
        title: c.title || '未命名分类',
        emoji: c.emoji || null,
        items: (c.items || []).map(function (it) {
          var url = it.url || '';
          return {
            name: it.name || '未命名资源',
            btn: it.btn || (url ? '打开' : '待填写'),
            url: url,
            empty: !url
          };
        })
      };
    }).filter(function (c) { return c.items.length > 0; });
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

  /* ---- Render（数据来自上方「资源链接配置区」） ---- */
  var cards = normalizeCards();
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
