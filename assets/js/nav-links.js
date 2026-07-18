// "首页推荐" 里 3 个"最新导航网址"按钮的跳转目标。
//
// 换域名步骤：
//   真实域名格式为 vip.XXXXXX.xyz，写入下面数组时改写成 'vipVIPXXXXXX@qqxyz'
//   （只需替换中间的 6 位数字，前后的 vipVIP / @qqxyz 保持不变）。
// 还原规则（见 checkurl1）：
//   .replace(/VIP/g,'.')  把 VIP 还原成点
//   .replace(/@qq/g,'.')  把 @qq 还原成点
// 例：'vipVIP713529@qqxyz' -> 'vip.713529.xyz'
function checkurl1() {
  var strU = "http";
  strU += "://";
  strU += "";
  var ul = [
    'vipVIP713529@qqxyz',
    'vipVIP873987@qqxyz',
    'vipVIP879983@qqxyz',
  ];
  var strU2 = ul[Math.floor((Math.random() * ul.length))];
  strU2 = strU2.replace(/VIP/g,'.');
  strU2 = strU2.replace(/@qq/g,'.');
  strU += strU2;
  window.location.href = strU;
}
