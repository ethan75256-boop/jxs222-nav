// "首页推荐" 里 "最新导航网址" 按钮的跳转目标。
//
// 换域名步骤：
//   真实域名格式为 vip.XXXXXX.xyz，写入下面数组时改写成 'vipVIPXXXXXX@qqxyz'
//   （只需替换中间的 6 位数字，前后的 vipVIP / @qqxyz 保持不变）。
//   数组可以随意增减条数，按钮按数组顺序编号（一、二、三…）。
// 还原规则（见 decodeUrl）：
//   .replace(/VIP/g,'.')  把 VIP 还原成点
//   .replace(/@qq/g,'.')  把 @qq 还原成点
// 例：'vipVIP713529@qqxyz' -> 'vip.713529.xyz'
var navLinkList = [
  'vipVIP713529@qqxyz',
  'vipVIP873987@qqxyz',
  'vipVIP879983@qqxyz',
];

// 自动检测：在访客自己的浏览器里逐个请求 https://域名/favicon.ico，
// 能收到任何 HTTP 响应（包括 404）就算可用；DNS 被污染、连接被重置、超时则算不可用，标注为已停用。
var NAV_CHECK_TIMEOUT = 5000;
var NAV_NUMS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

var navLinkStatus = []; // 每条的状态：'checking' | 'ok' | 'fail'
var navCheckDone = false;

function decodeUrl(s) {
  s = s.replace(/VIP/g, '.');
  s = s.replace(/@qq/g, '.');
  return 'https://' + s;
}

function goNavUrl(i) {
  window.location.href = decodeUrl(navLinkList[i]);
}

// 保留原函数名：从可用的线路里随机跳一条；还没检测出结果时从全部里随机。
function checkurl1() {
  var pool = [];
  for (var i = 0; i < navLinkList.length; i++) {
    if (navLinkStatus[i] === 'ok') pool.push(i);
  }
  if (pool.length === 0) {
    for (var j = 0; j < navLinkList.length; j++) pool.push(j);
  }
  goNavUrl(pool[Math.floor(Math.random() * pool.length)]);
}

// 按钮始终全部显示、编号固定；检测中标注"（检测中…）"、检测不通过标注"（此地址已停用）"，两种都置灰、不可点击。
function renderNavLinks() {
  var box = document.getElementById('nav-links');
  var tip = document.getElementById('nav-links-tip');
  if (!box) return;

  var failCount = 0;
  for (var i = 0; i < navLinkList.length; i++) {
    if (navLinkStatus[i] === 'fail') failCount++;
  }
  // 全部检测失败时不标停用，全部保持可点，避免检测误判导致一个入口都用不了
  var allFailed = navCheckDone && failCount === navLinkList.length;

  box.innerHTML = '';
  for (var k = 0; k < navLinkList.length; k++) {
    var a = document.createElement('a');
    var name = '最新导航网址' + (NAV_NUMS[k] || (k + 1));
    if (navLinkStatus[k] === 'checking') {
      // 检测出结果之前不可点，避免用户一进来就点到被墙的地址
      a.className = 'nav-off nav-wait';
      a.innerHTML = '<span>' + name + '</span><span class="nav-off-note">（检测中…）</span>';
    } else if (navLinkStatus[k] === 'fail' && !allFailed) {
      a.className = 'nav-off';
      a.innerHTML = '<span>' + name + '</span><span class="nav-off-note">（此地址已停用）</span>';
    } else {
      a.href = 'javascript:;';
      a.innerHTML = name;
      a.onclick = (function (idx) {
        return function () { goNavUrl(idx); };
      })(k);
    }
    box.appendChild(a);
  }

  if (tip) {
    if (allFailed) {
      tip.innerHTML = '当前网络下线路检测均未通过，可逐个尝试，或更换网络/浏览器后刷新页面。';
      tip.style.display = 'block';
    } else {
      tip.style.display = 'none';
    }
  }
}

function checkNavLink(i, callback) {
  var finished = false;
  function finish(ok) {
    if (finished) return;
    finished = true;
    callback(i, ok);
  }
  setTimeout(function () { finish(false); }, NAV_CHECK_TIMEOUT);

  var url = decodeUrl(navLinkList[i]) + '/favicon.ico?_=' + new Date().getTime();
  fetch(url, { mode: 'no-cors', cache: 'no-store', credentials: 'omit' })
    .then(function () { finish(true); }, function () { finish(false); });
}

function initNavLinks() {
  var i;
  // 老浏览器没有 fetch，无法检测，直接全部显示
  if (typeof window.fetch !== 'function') {
    for (i = 0; i < navLinkList.length; i++) navLinkStatus[i] = 'ok';
    navCheckDone = true;
    renderNavLinks();
    return;
  }

  var pending = navLinkList.length;
  for (i = 0; i < navLinkList.length; i++) navLinkStatus[i] = 'checking';
  renderNavLinks();

  for (i = 0; i < navLinkList.length; i++) {
    checkNavLink(i, function (idx, ok) {
      navLinkStatus[idx] = ok ? 'ok' : 'fail';
      pending--;
      if (pending === 0) navCheckDone = true;
      renderNavLinks(); // 每出一个结果就刷新一次
    });
  }
}

initNavLinks();
