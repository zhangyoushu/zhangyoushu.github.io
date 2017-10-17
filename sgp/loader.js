function importJS(src, callback)
{
  var s, r, t;
  r = false;
  s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = src;
  s.onload = s.onreadystatechange = function() {
    if ( !r && (!this.readyState || this.readyState == 'complete') )
    {
      r = true;
      callback();
    }
  };
  var head = document.getElementsByTagName('head')[0];
  if (head) {
    head.appendChild(s);
  } else {
    document.body.appendChild(s);
  }
}

function importCSS(href) {
  var s = document.createElement('link');
  s.setAttribute('rel', 'stylesheet');
  s.setAttribute('type', 'text/css');
  s.setAttribute('media', 'screen');
  s.setAttribute('href', href);
  var head = document.getElementsByTagName('head')[0];
  if (head) {
    head.appendChild(s);
  } else {
    document.body.appendChild(s);
  }
}

// var baseUrl = window.selectorGadgetPlusOptions.baseUrl;
var baseUrl = "https://raw.githubusercontent.com/zhangyoushu/sgp/master/";

var load = function(){
  importCSS(baseUrl + 'selectorgadget/selectorgadget.css');
  importCSS(baseUrl + 'sgplus.css');
  importJS('http://cdn.bootcss.com/jquery/1.3.2/jquery.min.js', function() {
    window.jQuerySG = jQuery.noConflict();
    importJS(baseUrl + 'diff_match_patch.js', function() {
      importJS(baseUrl + 'selectorgadget/dom.js', function() {
        importJS(baseUrl + 'selectorgadget/core.js', function() {
          importJS(baseUrl + 'sgplus.js', function() {
            window.jQuerySG('.selector_gadget_loading').remove();
            SelectorGadgetPlus.enable(baseUrl + 'sgplus-iframe.html');
          }) 
        });
      });
    });
  });
};

load();
