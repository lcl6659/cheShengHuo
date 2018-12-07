(function(win) {
	var wxAppId, origin, debug = false;
	//@if TARGETS='pro'
	wxAppId = "wx623327d1a70e0c1b";
	origin = "http://csh.lewei666.com/H5";
	debug = false;
	//@endif

	//@if TARGETS='uat'
	wxAppId = "wx7da99c57cccb15fc";
	origin = "http://172.16.88.216:8082/H5";
	debug = false;
	//@endif

	//@if TARGETS='sit'
	wxAppId = "wx7da99c57cccb15fc";
	origin = "http://172.16.88.216:8082/H5";
	debug = false;
	//@endif
	
	//@if TARGETS=false
    wxAppId = "wx332c4a060a725279";
	origin = document.location.origin;
	debug = true;
    //@endif
	
	
	var wxLogin = {
		getCookie: function(n) {
			var m = document.cookie.match(new RegExp("(^| )" + n + "=([^;]*)(;|$)"));
			return !m ? "" : m[2];
		},
		setCookie: function(name, value, hour, domain, path) {
			var expire = new Date();
			expire.setTime(expire.getTime() + (hour ? 3600000 * hour : 30 * 24 * 60 * 60 * 1000));

			document.cookie = name + "=" + value + "; " + "expires=" + expire.toGMTString() + "; path=" + (path ? path : "/") + "; " + (domain ? ("domain=" + domain + ";") : "");
		},
		goLogin: function(backUrl) {
			//snsapi_base || snsapi_userinfo
			var url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&" +
				"redirect_uri=REDIRECT&scope=snsapi_userinfo&response_type=code&state=STATE#wechat_redirect";
			var redirectUrl = origin + "/view/wx-back.html";
			backUrl = origin + backUrl;
			url = url.replace("APPID", wxAppId).replace("REDIRECT", encodeURIComponent(redirectUrl)).replace("STATE", encodeURIComponent(backUrl));
			if(debug) {
				var defaultId = this.getCookie("openid") || new Date().getTime();
				this.setCookie("openid", defaultId);
				window.location.replace(backUrl);
			} else {
				window.location.replace(url);
			}
			
		}
	};
	win.wxLogin = wxLogin;
})(window);