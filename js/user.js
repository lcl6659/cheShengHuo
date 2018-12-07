var codeCountDownInterval, countDown, sendSmsState = 0;
var base64Str = "";
$(function() {

	//注册 - 发送手机验证码
	$("#sendRegisterCode").on("click", function() {
		var mobile = $("#mobile").val();
		var _this = $(this);
		codeCountDown($(this), mobile, function() {
			myAjax.registerSendSmsCode({
				phone: mobile
			}, function(json) {
				if(json.status == 1) {
					sendSmsState = 1;
					worf.prompt.tip("验证码已发送");
				} else {
					worf.prompt.tip(json.message);
					clearInterval(codeCountDownInterval);
					_this.removeClass("sending");
					_this.text("获取验证码");
				}
			});
		});
	});

	//登录 - 验证码
	$("#sendLoginSms").on("click", function() {
		var mobile = $("#mobile").val();
		var _this = $(this);
		codeCountDown($(this), mobile, function() {
			myAjax.loginSendSmsCode({
				phone: mobile
			}, function(json) {
				if(json.status == 1) {
					sendSmsState = 1;
					worf.prompt.tip("验证码已发送");
				} else {
					worf.prompt.tip(json.message);
					clearInterval(codeCountDownInterval);
					_this.removeClass("sending");
					_this.text("获取验证码");
				}
			});
		});
	});
	
	//设备绑定 - 验证码
	$("#sendRelateSmsCode").on("click", function() {
		var mobile = $("#mobile").val().trim();
		var _this = $(this);
		codeCountDown($(this), mobile, function() {
			myAjax.sendRelateSmsCode({
				phone: mobile
			}, function(json) {
				if(json.status == 1) {
					sendSmsState = 1;
					worf.prompt.tip("验证码已发送");
				} else {
					worf.prompt.tip("验证码发送失败");
					clearInterval(codeCountDownInterval);
					_this.removeClass("sending");
					_this.text("获取验证码");
				}
			});
		});
	});

	//监听输入
	$("input").on("input", function() {
		if(checkInput()) {
			$(".btn-L").addClass("active");
		} else {
			$(".btn-L").removeClass("active");
		}
	});

	$("#licenseNum").on("blur", function(e) {
		$(this).val(this.value.toUpperCase());
	});
	$("#username").on("blur", function(e) {
		$(this).val(this.value.replace(/[^\a-zA-Z\u4E00-\u9FA5]/g,''));
	});

	//点击注册按钮
	$("#registerBtn").on("click", function() {
		if($(this).hasClass("active")) {
			var mobile = $("#mobile").val().trim();
			if(!worf.tools.checkMobile(mobile)) {
				worf.prompt.tip("手机号码格式有误");
				return false;
			}

			var optionData = {
				userName: $("#username").val().trim(),
				phone: mobile,
				smsCode: $("#smsCode").val().trim(),
				openId: worf.user.getOpenId()
			}
			myAjax.registerUser(optionData, function(json) {
				$("#regBox").hide();
				$("#regSuccessBox").show();
			});
		}
	});

	//登录
	$("#loginBtn").on("click", function() {
		if($(this).hasClass("active")) {
			var mobile = $("#mobile").val().trim();
			if(!worf.tools.checkMobile(mobile)) {
				worf.prompt.tip("手机号码格式有误");
				return false;
			}

			var optionData = {
				phone: mobile,
				smsCode: $("#smsCode").val().trim(),
				openId: worf.user.getOpenId()
			}
			myAjax.login(optionData, function(json) {
				var backUrl = worf.tools.queryString("state");
				if(backUrl) {
					worf.prompt.tip("登录成功");
					setTimeout(function() {
						worf.nav.replace(backUrl);
					}, 1000);
				} else {
					worf.prompt.tip("登录成功");
				}
			});
			
			
			
			
		}
	});

	//立即绑定
	$("#relateBtn").on("click", function() {
		if($(this).hasClass("active")) {
			var mobile = $("#mobile").val().trim();
			if(!worf.tools.checkMobile(mobile)) {
				worf.prompt.tip("手机号码格式有误");
				return false;
			}
			var optionData = {
				"licenseNum": $("#licenseNum").val().trim().toUpperCase(), //车牌号
				"phone": mobile,
				"imei": $("#imei").val().trim(), //设备号
				"smsCode": $("#smsCode").val().trim() //短信认证码
			}
			myAjax.relate(optionData, function(json) {
				if(json.status == 1) {
					worf.prompt.tip("绑定成功");
					setTimeout(function() {
						worf.nav.go(worf.origin+"/view/userCenter.html");
					}, 2000);
				} else {
					worf.prompt.tip(json.message);
				}
			});
		}
	});

	/*
	 * 设备号扫描
	 */
	$("#scanImei").on("click", function() {
		wx.scanQRCode({
			needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
			scanType: ["barCode"], // 可以指定扫二维码还是一维码，默认二者都有
			success: function(res) {
				var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
				var n = result.indexOf(",") + 1;
				var l = result.length;
				var v = result.substr(n);
				$("#imei").val(v);
			}
		});
	});

	/*
	 * 车牌号扫描
	 */
	$("#scanLicenseNum").on("click", function() {
		wx.chooseImage({
			count: 1, // 默认9
			sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
			sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
			success: function(res) {
				var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
			}
		});
	});


});

//验证码倒计时
function codeCountDown($_codeBtn, mobile, callback) {
	if(!$_codeBtn.hasClass("sending")) {
		if(mobile == "") {
			worf.prompt.tip("请输入手机号码");
		} else {
			if(worf.tools.checkMobile(mobile)) {
				$_codeBtn.addClass("sending");
				countDown = 60;
				$_codeBtn.text("剩余60S");
				codeCountDownInterval = setInterval(function() {
					countDown = countDown - 1;
					$_codeBtn.text("剩余" + countDown + "S");
					if(countDown < 1) {
						clearInterval(codeCountDownInterval);
						$_codeBtn.removeClass("sending");
						$_codeBtn.text("获取验证码");
					}
				}, 1000);
				callback && callback();
			} else {
				worf.prompt.tip("手机号码格式有误")
			}
		}
	}
}

//验证输入
function checkInput() {
	var n = 0;
	$("input[type=text]").each(function(index, input) {
		var val = $(input).val().trim();
		if(val == "") {
			n = n + 1;
		}
	});
	if(n > 0) {
		return false;
	} else {
		return true;
	}
}