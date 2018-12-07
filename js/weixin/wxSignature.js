(function($) {
	var wxSignature = {
		data: {},
		ajax: {
			/*获取签名*/
			getSignature: function(callback) {
				worf.ajax({
					url: worf.API_URL + "/m/v1/wechat/signUrl.json",
					type:'post',
					data: {
						url: location.href.split('#')[0]
					},
					success: function(json) {
						if(json.status==1) {
							wxSignature.data.signature = json.data;
							callback && callback(json.data);
						} else {
							worf.prompt.tip(json.message);
						}
					}
				});
			}
		},
		//初始化微信分享
		initWeixin: function(signature,callback) {
			wx.config({
				debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
				appId: signature.appId, // 必填，公众号的唯一标识
				timestamp: signature.timestamp, // 必填，生成签名的时间戳
				nonceStr: signature.nonceStr, // 必填，生成签名的随机串
				signature: signature.signature, // 必填，签名，见附录1
				jsApiList: ['uploadImage','downloadImage','getNetworkType','scanQRCode'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
			});
			
			wx.ready(function(){
				callback && callback();
			});
			
			wx.error(function(res) {
				worf.prompt.tip("签名失败");
			});
		},
		
		/*初始化*/
		init: function(callback) {
			if(worf.device.wap) {
				wxSignature.ajax.getSignature(function(data) {
					wxSignature.initWeixin(data,callback);
				});
			}
		}
	};
	window.wxSignature = wxSignature;
})(Zepto);