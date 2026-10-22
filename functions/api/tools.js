/* Cloudflare Pages Functions · /api/tools
   需要绑定一个 KV 命名空间，名字为 TOOLS
   GET  /api/tools   返回当前资源目录（首次自动用 data.json 初始化）
   POST /api/tools   保存整份资源目录（需要 XYG_TOKEN，见 README）
*/

var JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store'
};

// GET 成功时带上这个头，前端据此区分「真实空目录」和「未配置 KV 的占位空数组」
function catalogHeaders() {
  return {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-catalog': '1'
  };
}

function isAuthorized(request, env) {
  var token = env.XYG_TOKEN;
  if (!token) return false; // 未配置令牌时禁止写入
  var auth = request.headers.get('Authorization') || '';
  return auth === 'Bearer ' + token;
}

// 只允许 http/https：挡住 javascript: data: 之类的伪协议，避免存进来变成 XSS
function isSafeUrl(url) {
  if (url === undefined || url === null || url === '') return true;
  if (typeof url !== 'string') return false;
  return /^https?:\/\//i.test(url.trim());
}

function isOptionalString(v) {
  return v === undefined || v === null || typeof v === 'string';
}

function isValidCatalog(data) {
  if (!Array.isArray(data) || data.length > 200) return false;
  return data.every(function (card) {
    if (!card || typeof card.title !== 'string' || !Array.isArray(card.items)) return false;
    if (card.items.length > 200) return false;
    return card.items.every(function (it) {
      return it && typeof it.name === 'string' &&
        isSafeUrl(it.url) &&
        isOptionalString(it.btn) &&
        isOptionalString(it.desc) &&
        (it.tags === undefined || typeof it.tags === 'string' || Array.isArray(it.tags));
    });
  });
}

export async function onRequestGet(context) {
  var env = context.env, request = context.request;
  var kv = env.TOOLS;

  // 没有 KV 绑定：返回空数组且不带 x-catalog 头，前端会自动回退到 data.json
  if (!kv) return Response.json([], { headers: JSON_HEADERS });

  var text;
  try {
    text = await kv.get('catalog', 'text');
  } catch (err) {
    return Response.json(
      { ok: false, error: '读取 KV 失败' },
      { status: 500, headers: JSON_HEADERS }
    );
  }
  if (text) return new Response(text, { headers: catalogHeaders() });

  // 首次访问：从静态 data.json 初始化 KV
  try {
    var asset = await env.ASSETS.fetch(new URL('/data.json', request.url));
    if (asset.ok) {
      text = await asset.text();
      await kv.put('catalog', text);
      return new Response(text, { headers: catalogHeaders() });
    }
  } catch (err) {
    // 本地预览或未配置 ASSETS 时忽略，返回空目录
  }

  return Response.json([], { headers: catalogHeaders() });
}

export async function onRequestPost(context) {
  var env = context.env, request = context.request;

  if (!env.TOOLS) {
    return Response.json(
      { ok: false, error: '后台未配置 KV 绑定（TOOLS），请参考 README 配置' },
      { status: 503, headers: JSON_HEADERS }
    );
  }

  if (!env.XYG_TOKEN) {
    return Response.json(
      { ok: false, error: '后台未配置 XYG_TOKEN 环境变量，发布功能已禁用' },
      { status: 503, headers: JSON_HEADERS }
    );
  }

  if (!isAuthorized(request, env)) {
    return Response.json(
      { ok: false, error: '未授权：请检查管理令牌' },
      { status: 401, headers: JSON_HEADERS }
    );
  }

  var data;
  try {
    data = await request.json();
  } catch (err) {
    return Response.json(
      { ok: false, error: '请求体不是合法 JSON' },
      { status: 400, headers: JSON_HEADERS }
    );
  }

  if (!isValidCatalog(data)) {
    return Response.json(
      { ok: false, error: '数据格式不正确：需要 title / items / name / url / btn 字段，且 url 必须是 http(s) 链接' },
      { status: 400, headers: JSON_HEADERS }
    );
  }

  await env.TOOLS.put('catalog', JSON.stringify(data));
  return Response.json({ ok: true, count: data.length }, { headers: JSON_HEADERS });
}
