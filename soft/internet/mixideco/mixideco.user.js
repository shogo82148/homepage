// ==UserScript==
// @name           MixiDeco
// @namespace      http://sora-blue.net/~shogo82148/
// @description    mixi日記に装飾
// @include        http://mixi.jp/add_diary.pl*
// @include        http://mixi.jp/edit_diary.pl*
// ==/UserScript==

(function(){
	//http://gihyo.jp/dev/feature/01/greasemonkey/0002?page=2
	/**
	 * document.createElement() +アルファな関数
	 * attrsに指定した属性を設定し，stylesに指定したCSSプロパティを設定する
	 */
	function $tag(tagName, attrs, styles){
	  var tag = document.createElement(tagName);
	  if(attrs){
	    for(a in attrs){
	      if(attrs.hasOwnProperty(a)){
	        tag[a] = attrs[a];
	      }
	    }
	  }
	  if(styles){
	    for(a in styles){
	      if(styles.hasOwnProperty(a)){
	        tag.style[a] = styles[a];
	      }
	    }
	  }
	  return tag;
	}

	  
	/**
	 * $tagのショートカット定義
	 * $div()でdiv要素を生成できるようにする。
	 * 引数は$tagの第2引数，第3引数をそのまま第1引数，第2引数として利用できる。
	 */
	"div p span a img table tr th td form label input textarea".split(" ").forEach(function(tagName){
	    var func = function(attrs, styles){
	      return $tag(tagName, attrs, styles);
	    };
	    eval("$" + tagName + "= func;" );
	  });


	/**
	 * document.createTextNode()のエイリアス
	 */
	function $text(text){
	  return document.createTextNode(text);
	}

	/**
	 * Element#appendChild() +アルファな関数
	 * 第1引数の要素の末尾要素として第2引数以降で指定する要素を追加する
	 * Element.prototypeの関数として定義するほうがスマートになりそうだが，
	 * GreasemonkeyではElement要素を直接扱えないのでこの定義方法をとった。
	 */
	function $add(parent, children){
	  if(arguments.length < 2) return "";
	  for(var i=1, child; child=arguments[i];i++){
	    if(typeof child != "object"){
	      child = $text(child+"");
	    }
	    parent.appendChild(child);
	  } 
	  return parent;
	}


	//http://archiva.jp/web/javascript/getRange_in_textarea.html よりこぴぺ
	var isIE = (navigator.appName.toLowerCase().indexOf('internet explorer')+1?1:0);
	function getAreaRange(obj) {
		var pos = new Object();
		if (isIE) {
			obj.focus();
			var range = document.selection.createRange();
			var clone = range.duplicate();
			
			clone.moveToElementText(obj);
			clone.setEndPoint( 'EndToEnd', range );
			pos.start = clone.text.length - range.text.length;
			pos.end = clone.text.length - range.text.length + range.text.length;
		} else if(window.getSelection()) {
			pos.start = obj.selectionStart;
			pos.end = obj.selectionEnd;
		}
		
		return pos;
		//alert(pos.start + "," + pos.end);
	}

	function surroundHTML(starttag, endtag) {
		var target = document.getElementById("diaryBody");
		var pos = getAreaRange(target);
		
		var val = target.value;
		var range = val.slice(pos.start, pos.end);
		var beforeNode = val.slice(0, pos.start);
		var afterNode = val.slice(pos.end);
		var insertNode;
		
		if (range || pos.start != pos.end) {
			insertNode = starttag + range + endtag;
			target.value = beforeNode + insertNode + afterNode;
		} else if (pos.start == pos.end) {
			insertNode = starttag + endtag;
			target.value = beforeNode + insertNode + afterNode;
		}
	}


	var btnArea = document.createElement("div");
	
	function addButton(label, title, starttag, endtag) {
		var btn = document.createElement("a");
		btn.addEventListener("click", function(e){surroundHTML(starttag, endtag);}, false);
		btn.innerHTML = label;
		btn.title = title;
		btnArea.appendChild(btn);
		btnArea.appendChild(document.createTextNode(" "))
	}
	
	function image(data) {
		return '<img src="' + data + '" width="22" height="22" />';
	}
	
	var large = image('data:image/gif;base64,'+
	    'R0lGODlhFgAWAIQUAAAAAMzMzNra2uHh4e7u7u/v7/Dw8PHx8fLy8vT09PX19fb29vf39/j4+Pn5'+
	    '+fr6+vv7+/z8/P39/f7+/v///////////////////////////////////////////////yH5BAEK'+
	    'AB8ALAAAAAAWABYAAAWY4BeMZGma4kCtbOuywzjNdG3b8q3fo+T/wGBwFClGAMikEmmMEI3LKKA5'+
	    'glivVyR2O3p4v18keNwdhwHm78jBbreR7vioQa/Xkfb8iMHv95F+gSMLhIWFSIaJIwqMjY1IjpEj'+
	    'CZSVlUiWmSMInJ2dSJ6hIwekpaVIpqkjBqytrq+vIwWztLW2tiMCBLu8vb68AgEiJ8QnHyEAOw==');
    var small = image('data:image/gif;base64,'+
	    'R0lGODlhFgAWAIQUAAAAAMzMzNra2uHh4e7u7u/v7/Dw8PHx8fLy8vT09PX19fb29vf39/j4+Pn5'+
	    '+fr6+vv7+/z8/P39/f7+/v///////////////////////////////////////////////yH5BAEK'+
	    'AB8ALAAAAAAWABYAAAWP4BeMZGma4kCtbOuywzjNdG3b8q3fo+T/wGBwFCkaj0gkMclMjiDQqHQ6'+
	    'HT2u2KxWa916tyOHeEwul0eNtHrNZo8Y8Lh8Ph8t7vi8Xj9SKACAgH6DhIQjCYgJAImMjYkjCJEI'+
	    'AJKVlpIjB5oHAJuen5sjBqOkpaamIwWqq6ytrSMCBLKztLWzAgEiJ7snHyEAOw==');
	var center = image('data:image/gif;base64,'+
	    'R0lGODlhFgAWAIQUAAAAAMzMzNra2uHh4e7u7u/v7/Dw8PHx8fLy8vT09PX19fb29vf39/j4+Pn5'+
	    '+fr6+vv7+/z8/P39/f7+/v///////////////////////////////////////////////yH5BAEK'+
	    'AB8ALAAAAAAWABYAAAWK4BeMZGma4kCtbOuywzjNdG3b8q3foyQBwKBwCPCNIhGiMog8Ip/QaHQE'+
	    'qVaXQGt19Oh2sQBvlysum8UjhwNMVI8aDfYQPmLY7/h8frTo98F+fSMKhIRghYQjCYuMjY6OIwgI'+
	    'ckKSIwcHlEGYIwaen6ChoSMFpaanqKgjAgStrq+wrgIBIie2Jx8hADs=');
	var right = image('data:image/gif;base64,'+
	    'R0lGODlhFgAWAIQUAAAAAMzMzNra2uHh4e7u7u/v7/Dw8PHx8fLy8vT09PX19fb29vf39/j4+Pn5'+
	    '+fr6+vv7+/z8/P39/f7+/v///////////////////////////////////////////////yH5BAEK'+
	    'AB8ALAAAAAAWABYAAAWK4BeMZGma4kCtbOuywzjNdG3b8q3foyQBwKBwCPCNIhGiMog8Ip/QaHQE'+
	    'qVqrS2B19Oh6u1lAl/stm78jhyNMVI8aDfYQPmLY7/h8frTo+/thfSMKhIWEYYQjCYuMjY6OIwgI'+
	    'ckKSIwcHlEGYIwaen6ChoSMFpaanqKgjAgStrq+wrgIBIie2Jx8hADs=');
	var hr = image('data:image/gif;base64,'+
	    'R0lGODlhFgAWAIQVAAAAAIAAAMzMzNra2uHh4e7u7u/v7/Dw8PHx8fLy8vT09PX19fb29vf39/j4'+
	    '+Pn5+fr6+vv7+/z8/P39/f7+/v///////////////////////////////////////////yH5BAEK'+
	    'AB8ALAAAAAAWABYAAAWI4CeMZGmaIlGtbOuyxEjNdG3b8q3f4zQBwKBwCPCNJBKiMog8Ip/QaHQU'+
	    'iSyX1REEclVutduweDwePQLotHqdfowc7PjaMWrY7/h8fsRgdIl9IwsLf0ODIwqJiouMjCMJCYVC'+
	    'kCMICJJBliMHnJ2en58jBqOkpaamIwMFq6ytrqwDAiIntCcfIQA7');
	var blink = image('data:image/gif;base64,'+
	    'R0lGODlhFgAWAIQWABcXFxgYGP8AAMzMzNra2uHh4e7u7u/v7/Dw8PHx8fLy8vT09PX19fb29vf3'+
	    '9/j4+Pn5+fr6+vv7+/z8/P39/f7+/v///////////////////////////////////////yH5BAEK'+
	    'AB8ALAAAAAAWABYAAAWs4DeMZGmaYmGtbOuyxVjNdG3b8q3fo0D9wKAQKBhNBJNJYMlsLpNI41Hp'+
	    'rE4nI4lWoO0uu9vuKEIul5fm9Dh9DrDLI4h8Pl/S7z2B/sHnL/t8enojDoWGhkuHiiMNjY6OS4+S'+
	    'IwyVlpZLl5ojC50CnaAAAKCeoCMKCgKoqwqirKiqCiMJAgm2twmiuLe1PQi/wMHCwEUDB8fIycrK'+
	    'IwQGz9DR0tAEAyIn2CcfIQA7');
	var ticker = image('data:image/gif;base64,'+
	    'R0lGODlhFgAWAIQUAAAAAMzMzNra2uHh4e7u7u/v7/Dw8PHx8fLy8vT09PX19fb29vf39/j4+Pn5'+
	    '+fr6+vv7+/z8/P39/f7+/v///////////////////////////////////////////////yH5BAEK'+
	    'AB8ALAAAAAAWABYAAAWi4BeMZGma4kCtbOuywzjNdG3b8q3fo+T/PwBwKBlFjsgjAJBsRoxOAIXp'+
	    'RI4g2Kx0mu1mR49weDtdms1hsJj8YgHSAYec3V4B5KOGvkFvA/QjDIKCZGeGgiMLiotbAIuPiyMK'+
	    'k5QKUgCVmQojCZ2enUufogkjCKanpwCoqwgjB6+wsbKyIwa2t7i5uSMFvb6/wMAjAgTFxsfIxgIB'+
	    'IifOJx8hADs=');
	var swing = image('data:image/gif;base64,'+
	    'R0lGODlhFgAWAIQVAAAAABgYGMzMzNra2uHh4e7u7u/v7/Dw8PHx8fLy8vT09PX19fb29vf39/j4'+
	    '+Pn5+fr6+vv7+/z8/P39/f7+/v///////////////////////////////////////////yH5BAEK'+
	    'AB8ALAAAAAAWABYAAAWl4CeMZGmaIlGtbOuyxEjNNA3UOCXnFHDzs9FkSJwAKoCicjKSOJ9H5HP6'+
	    'bE6jSJ9W6xxFvhHsiwX4jiDoAGXsAqDPkK187oaMHvi8fr8fORx0gQB/Iw0NYmwUAYYNIwwMiGMA'+
	    'j48jCwuCZJebIwqen6BRAKCeIwmnqKlHAKmoIwiwsbI+srIjB7i5ugC6vSMGwMHCw8MjAwXIycrL'+
	    'yQMCIifRJx8hADs=');
	var clrimage = image('data:image/gif;base64,'+
	    'R0lGODlhFgAWAIQcAAAAAAAA/2YAmQAzZgBmM1VVVQCZAL6+vszMzMzM/9ra2uHh4e7u7u/v7/Dw'+
	    '8PHx8fLy8vT09PX19fb29vf39/j4+Pn5+fr6+vv7+/z8/P39/f7+/v///////////////yH5BAEK'+
	    'AB8ALAAAAAAWABYAAAWq4IeMZGma4sKtbOuyy7jNdG3b8q3fo+b/wGBwlAEYj4GkcsBsZohHpDLZ'+
	    'dI4wUeOUWh1gRpcsYBvoDi7ggnotaLsJ8DgaYVmz3e143DKq2NV4eXoEFSMUfwWBAoMEFCMTB5GS'+
	    'CZSVBpeYEyMSkpOVlJiYEiMRnZGfoKEGESMQpgeoCaoGECMPt7i5urojDr6/wMHBIw3FxsfIyCMK'+
	    'DM3Oz9DOCggiJ9YnHyEAOw==');
	addButton(large, '文字を大きくする', '<span class="decoLarge" style="font-size:xx-large">', '</span>');
	addButton(small, '文字を小さくする', '<span class="decoSmall" style="font-size:xx-small">', '</span>');
	addButton(center, '中央揃え', '<div class="centerElement" style="text-align:center;">', '</div>');
	addButton(right, '右揃え', '<div class="rightElement" style="text-align:right;">', '</div>');
	addButton(hr, '水平線', '', '<hr />');
	addButton(blink, '点滅', '<span class="blinkText" style="text-decoration:blink;">', '</span>');
	addButton(ticker, 'テロップ', '<div class="marqueeScroll" style="display:-wap-marquee; -wap-marquee-style:scroll;">', '</div>');
	addButton(swing, 'スウィング', '<div class="marqueeAlternate" style="display:-wap-marquee; -wap-marquee-style:alternate;">', '</div>');
	
	//色ボタン
	var color = document.createElement("a");
	color.addEventListener("click", function(e){openPalette();}, false);
	color.innerHTML = clrimage;
	color.title = '色';
	btnArea.appendChild(color);
	
	//スタイルの変更関数の定義
	//http://d.hatena.ne.jp/os0x/20080109/1199867276
	if (typeof(GM_addStyle) != 'function') {
		function GM_addStyle(css) {
			var head = document.getElementsByTagName('head');
			if (!!head) {
				var style = document.createElement('style');
				style.type = 'text/css';
				style.textContent = css;
				head[0].appendChild(style);
			}
		}
	}
	
	//パレットの作成
	GM_addStyle('.mixiDeco-color_palette {\
			display:none;\
			position:absolute;\
			width:364px;\
			line-height:18px;\
			overflow:hidden;\
			margin:0;\
			padding:0;\
			border:solid 1px #FFC356;\
			background-color:#FFF;\
		}\
		.mixiDeco-color_palette_title {\
		    background-color: #FFC356;\
		    color: #333333;\
		    font-size: 12px;\
		    line-height: 16px;\
		    margin: 0;\
		    overflow: hidden;\
		    padding: 0;\
		    width: 364px;\
		}\
		.mixiDeco-color_palette_title_left {\
			float: left;\
			height: 16px;\
			width: 344px;\
		}\
		.mixiDeco-color_palette_title_right {\
			float: left;\
			height: 16px;\
			position: relative;\
			width: 20px;\
		}\
		.mixiDeco-color_palette_body {\
			background-color: #FFFFFF;\
			clear: both;\
			margin-bottom: 0;\
			text-align: left;\
		}\
		.mixiDeco-color_palette_color {\
			min-width:72px;\
		}');
	var palette = $div({className:'mixiDeco-color_palette'});
	var palette_title = $div({className:'mixiDeco-color_palette_title'});
	var palette_title_left = $div({innerHTML:'文字色',className:'mixiDeco-color_palette_title_left'});
	var palette_title_right = $div({className:'mixiDeco-color_palette_title_right'});
	var close_btn = $add($a({href:'javascript:void(0)',className:'emoji_palette_image_close'}),
		$img({src:'http://img.mixi.jp/img/p_close_rev.gif', alt:'close', height:11, width:12, className:'emoji_palette_image_close'})
	);
	var pallete_body = $div({className:'mixiDeco-color_palette_body'});
	var table = $table();
	var rows = [
		['#000000', '#0000FF', '#003366', '#663300', '#FF0000'],
		['#555555', '#660099', '#006633', '#FFA500', '#9900CC'],
		['#BEBEBE', '#CCCCFF', '#009900', '#FFFF00', '#FF00FF'],
		['#FFFFFF', '#CCFFFF', '#CCFFCC', '#FFFFCC', '#FFCCFF'],
	];
	
	for(var c=0;c<rows.length;c++){
		var columns = rows[c];
		var tr = $tr();
		for(var e=0;e<columns.length;e++) {
			var color = columns[e];
			var td = $td({className:'mixiDeco-color_palette_color',innerHTML:'　'},{backgroundColor:color});
			(function(color){td.addEventListener("click", function(e){
				surroundHTML('<span style="color:'+color+'">', '</span>');
				closePalette();
			}, false);})(color);
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
	pallete_body.appendChild(table);
	
	function openPalette() {
		palette.style.display='block';
	}
	
	function closePalette() {
		palette.style.display='none';
	}

	palette_title.addEventListener("click", function(e){closePalette();},false);
	$add(palette,
		$add(palette_title, palette_title_left, $add(palette_title_right, close_btn)),
		pallete_body
	);
	btnArea.appendChild(palette);
	
	var diaryBody = document.getElementById("diaryBody");
	var txtArea = diaryBody.parentNode;
	txtArea.insertBefore(btnArea, diaryBody);
})();
