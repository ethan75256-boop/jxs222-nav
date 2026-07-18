var host = window.location.host;
var el = document.getElementById('host');
el.innerHTML = host+'网址导航';

function goNav() {
  var page1 = document.getElementById('page1');
  var page2 = document.getElementById('page2');
  page1.style.display = 'none';
  page2.style.display = 'block';
}
var title = document.getElementsByTagName('title')[0];
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
  title.innerHTML = ''; //移动端网页标题
}else {
  title.innerHTML = '首页导航网-Home';
}

function searchBing(){
  var value = document.getElementById('search-input').value;
  window.location.href = 'https://www.bing.com/search?q='+value;
}
