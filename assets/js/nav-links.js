// "首页推荐" 里 "最新导航网址" 按钮的跳转目标。
//
// 换域名步骤：
//   真实域名格式为 vip.XXXXXX.xyz，写入下面数组时改写成 'vipVIPXXXXXX@qqxyz'
//   （只需替换中间的 6 位数字，前后的 vipVIP / @qqxyz 保持不变）。
//   数组可以随意增减条数，页面会按实际可用的条数显示按钮。
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
// 能收到任何 HTTP 响应（包括 404）就算可用；DNS 被污染、连接被重置、超时则算不可用并隐藏。
var NAV_CHECK_TIMEOUT = 6000;
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

function renderNavLinks() {
  var box = document.getElementById('nav-links');
  var tip = document.getElementById('nav-links-tip');
  if (!box) return;

  var show = [];
  for (var i = 0; i < navLinkList.length; i++) {
    if (navLinkStatus[i] === 'ok') show.push(i);
  }
  // 全部检测失败时兜底显示全部，避免检测误判导致页面上一个入口都没有
  var allFailed = navCheckDone && show.length === 0;
  if (allFailed) {
    for (var j = 0; j < navLinkList.length; j++) show.push(j);
  }

  box.innerHTML = '';
  for (var k = 0; k < show.length; k++) {
    var a = document.createElement('a');
    a.href = 'javascript:;';
    a.innerHTML = '最新导航网址' + (NAV_NUMS[k] || (k + 1));
    a.onclick = (function (idx) {
      return function () { goNavUrl(idx); };
    })(show[k]);
    box.appendChild(a);
  }

  if (tip) {
    if (!navCheckDone && show.length === 0) {
      tip.innerHTML = '正在检测可用线路，请稍候…';
      tip.style.display = 'block';
    } else if (allFailed) {
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
      renderNavLinks(); // 每出一个结果就刷新，能用的线路先显示出来
    });
  }
}

initNavLinks();
