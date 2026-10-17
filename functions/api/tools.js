/* Cloudflare Pages Functions · /api/tools
   需要绑定一个 KV 命名空间，名字为 TOOLS
   GET  /api/tools   返回当前资源目录（首次自动用 data.json 初始化）
   POST /api/tools   保存整份资源目录（需要 ADMIN_TOKEN，见 README）
*/

var JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

function isAuthorized(request, env) {
  var token = env.ADMIN_TOKEN;
  if (!token) return true; // 未配置令牌时放行，线上请务必配置
  var auth = request.headers.get('Authorization') || '';
  return auth === 'Bearer ' + token;
}

function isValidCatalog(data) {
  if (!Array.isArray(data)) return false;
  return data.every(function (card) {
    if (!card || typeof card.title !== 'string' || !Array.isArray(card.items)) return false;
    return card.items.every(function (it) {
      return it && typeof it.name === 'string' &&
        (it.url === undefined || typeof it.url === 'string') &&
        (it.btn === undefined || typeof it.btn === 'string');
    });
  });
}

export async function onRequestGet(context) {
  var env = context.env, request = context.request;
  var kv = env.TOOLS;

  if (!kv) return Response.json([], { headers: JSON_HEADERS });

  var text = await kv.get('catalog', 'text');
  if (text) return new Response(text, { headers: JSON_HEADERS });

  // 首次访问：从静态 data.json 初始化 KV
  try {
    var asset = await env.ASSETS.fetch(new URL('/data.json', request.url));
    if (asset.ok) {
      text = await asset.text();
      await kv.put('catalog', text);
      return new Response(text, { headers: JSON_HEADERS });
    }
  } catch (err) {
    // 本地预览或未配置 ASSETS 时忽略，返回空目录
  }

  return Response.json([], { headers: JSON_HEADERS });
}

export async function onRequestPost(context) {
  var env = context.env, request = context.request;

  if (!env.TOOLS) {
    return Response.json(
      { ok: false, error: '后台未配置 KV 绑定（TOOLS），请参考 README 配置' },
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
      { ok: false, error: '数据格式不正确：需要 title / items / name / url / btn 字段' },
      { status: 400, headers: JSON_HEADERS }
    );
  }

  await env.TOOLS.put('catalog', JSON.stringify(data));
  return Response.json({ ok: true, count: data.length }, { headers: JSON_HEADERS });
}
