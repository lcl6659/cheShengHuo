/*
 * ajax集中库
 */
(function() {

	/*
	 * 登录
	 * optionDate = {
	 * 	   "phone" : "15851878125",//手机号码
		   "smsCode":"666666",//手机验证码
		   "openId":"asdkhdskbcw" //app端该值为空
	 * }
	 */
	function login(optionDate, callback) {
		var requestDate = getRequestDate(optionDate);
		worf.ajax({
			data: requestDate,
			url: worf.API_URL + '/m/v1/user/login.json',
			errorGoLogin: false,
			animate:true,
			overlayTip:"",
			success: function(json) {
				if(json.status == 1) {
					worf.user.setSessionToken(json.data.sessionToken);
					callback && callback(json);
				} else {
					worf.prompt.tip(json.message);
				}
			}
		});
	}

	/*
	 *登录时发送手机验证码 
	 * optionDate = {
	 * 	"phone" : "15851878125",//手机号码
	 * }
	 */
	function loginSendSmsCode(optionDate, callback) {
		var requestDate = getRequestDate(optionDate);
		worf.ajax({
			data: requestDate,
			url: worf.API_URL + '/m/v1/user/sendSmsCode.json',
			errorGoLogin: false,
			success: function(json) {
				callback && callback(json);
			}
		});
	}

	/*
	 * 注册用户
	 * optionDate={
	 * 	"userName":"小三"
		"phone" : "15851878125",//手机号码
		"smsCode":"123456", //手机验证码
		"openId":"asdkhdskbcw" //app端该值为空
	 * }
	 */
	function registerUser(optionDate, callback) {
		var requestDate = getRequestDate(optionDate);
		worf.ajax({
			data: requestDate,
			url: worf.API_URL + '/m/v1/user/registerUser.json',
			errorGoLogin: false,
			animate:true,
			overlayTip:"",
			success: function(json) {
				if(json.status == 1) {
					worf.user.setSessionToken(json.data.sessionToken);
					callback && callback(json);
				} else {
					worf.prompt.tip(json.message);
				}
			}
		});
	}

	/*
	 * 注册时发送手机验证码
	 * optionDate = {
	 * 	"phone" : "15851878125",//手机号码
	 * }
	 */
	function registerSendSmsCode(optionDate, callback) {
		var requestDate = getRequestDate(optionDate);
		worf.ajax({
			data: requestDate,
			url: worf.API_URL + '/m/v1/user/registerSendMsg.json',
			errorGoLogin: false,
			success: function(json) {
				callback && callback(json);
			}
		});
	}
	
	
	/*
	 * 设备列表
	 */
	function getEqptList(callback){
		var session_token = worf.user.getSessionToken();
		var requestDate = getRequestDate({"page":"1","size":10}, session_token);
		worf.ajax({
			data: requestDate,
			url: worf.API_URL + '/m/v1/equ/queryEqptList.json',
			errorGoLogin: true,
			animate:true,
			overlayTip:"",
			success: function(json) {
				if(json.status == 1) {
					callback && callback(json);
				} else {
					worf.prompt.tip(json.message);
				}
			}
		});
	}
	
	/*
	 * 车辆列表
	 */
	function getCars(callback){
		var session_token = worf.user.getSessionToken();
		var requestDate = getRequestDate({}, session_token);
		worf.ajax({
			data: requestDate,
			url: worf.API_URL + '/m/v1/monitor/queryCar.json',
			errorGoLogin: true,
			animate:false,
			overlayTip:"",
			moreAjax:true,
			success: function(json) {
				if(json.status == 1) {
					callback && callback(json);
				} else {
					worf.prompt.tip(json.message);
				}
			}
		});
	}
	
	/*
	 * 查询该车下的所有设备（实时监控点击选择车辆）
	 * optionDate={
			carId:"222"
	 * }
	 */
	function getEqptsByCarId(optionDate,callback){
		var session_token = worf.user.getSessionToken();
		var requestDate = getRequestDate(optionDate, session_token);
		worf.ajax({
			data: requestDate,
			url: worf.API_URL + '/m/v1/monitor/queryEqptsByCarId.json',
			errorGoLogin: true,
			animate:true,
			overlayTip:"",
			moreAjax:true,
			success: function(json) {
				if(json.status == 1) {
					callback && callback(json);
				} else {
					worf.prompt.tip(json.message);
				}
			}
		});
	}
	
	/*
	 * 根据设备号查询当前设备信息（实时监控点击车辆选择设备后）
	 * optionDate={
	 * 		"imei":111
	 * }
	 */
	function getEqptInfoByImei(optionDate,callback){
		var session_token = worf.user.getSessionToken();
		var requestDate = getRequestDate(optionDate, session_token);
		worf.ajax({
			data: requestDate,
			url: worf.API_URL + '/m/v1/monitor/queryEqptByImei.json',
			errorGoLogin: true,
			animate:true,
			overlayTip:"",
			moreAjax:true,
			success: function(json) {
				if(json.status == 1) {
					callback && callback(json);
				} else {
					worf.prompt.tip(json.message);
				}
			}
		});
	}
	

	/*
	 * 按天查询轨迹点数据
	 * optionDate = {
	 * 	"startTime" : "2016-09-04 10:10:10",//开始时间
	    "carId" : "3002",//车辆ID
	    "imei" : "14140792703",//设备IMEI
	    "endTime" : "2016-09-09 10:10:10",//结束时间
	    "nowTime" : "2016-09-04"//查询日期
	 * }
	 */
	function dayPoints(optionDate, callback) {
		var session_token = worf.user.getSessionToken();
		var requestDate = getRequestDate(optionDate, session_token);
		worf.ajax({
			data: requestDate,
			url: worf.API_URL + '/m/v1/playback/daypoints.json',
			errorGoLogin: false,
			animate:false,
			overlayTip:"",
			moreAjax:true,
			success: function(json) {
				callback && callback(json);
			},
			error:function(err){
				var json = {
					status:0
				}
				callback && callback(json);
			}
		});
	}

	/*
	 * 按天查询轨迹点数量 
	 * optionDate = {
	 * 	 "startTime" : "2016-09-04 10:10:10",//开始时间
	    "carId" : "3002",//车辆ID
	    "imei" : "14140792703",//设备IMEI
	    "endTime" : "2016-09-09 10:10:10"//结束时间
	 * }
	 * 
	 */
	function dayPointsCount(optionDate, callback) {
		var session_token = worf.user.getSessionToken();
		var requestDate = getRequestDate(optionDate, session_token);
		worf.ajax({
			data: requestDate,
			url: worf.API_URL + '/m/v1/playback/count.json',
			errorGoLogin: true,
			animate:true,
			overlayTip:"",
			success: function(json) {
				if(json.status == 1) {
					callback && callback(json);
				} else {
					worf.prompt.tip(json.message);
				}
			}
		});
	}
	
	/*
	 * 设备绑定发送手机验证码
	 * optionDate = {
	 * 	"phone" : "15851878125",//手机号码
	 * }
	 */
	function sendRelateSmsCode(optionDate, callback) {
		var session_token = worf.user.getSessionToken();
		var requestDate = getRequestDate(optionDate, session_token);
		worf.ajax({
			data: requestDate,
			url: worf.API_URL + '/m/v1/equ/sendRelateSmsCode.json',
			errorGoLogin: false,
			success: function(json) {
				callback && callback(json);
			}
		});
	}
	
	/*
	 * 关联设备
	 * optionDate = {
	 * 	 "licenseNum" : "赣A12345",//车牌号
		"phone":"158884848484",
		"imei":"aafdfafa4d6adas", //设备号
		"smsCode":"123456" //短信认证码
	 * }
	 */
	function relate(optionDate, callback) {
		var session_token = worf.user.getSessionToken();
		var requestDate = getRequestDate(optionDate,session_token);
		worf.ajax({
			data: requestDate,
			url: worf.API_URL + '/m/v1/equ/relate.json',
			errorGoLogin: false,
			animate:true,
			overlayTip:"",
			success: function(json) {
				callback && callback(json);
			}
		});
	}
	
	/*
	 * 验证设备号是否存在
	 *   "optionDate" : {
			"imei" : "4210142934"//设备号
		  }
	 */
	function checkimeiexist(optionDate, callback) {
		var session_token = worf.user.getSessionToken();
		var requestDate = getRequestDate(optionDate,session_token);
		worf.ajax({
			data: requestDate,
			url: worf.API_URL + '/m/v1/equ/checkimeiexist.json',
			errorGoLogin: true,
			success: function(json) {
				if(json.status == 1) {
					callback && callback(json);
				} else {
					worf.prompt.tip(json.message);
				}
			}
		});
	}
	
	
	/*
	 * 扫描车牌 
	 * optionDate = {
	 * 	image64:""
	 * }
	 */
	function scan(optionDate, callback) {
		var session_token = worf.user.getSessionToken();
		var requestDate = getRequestDate(optionDate,session_token);
		worf.ajax({
			data: requestDate,
			url: worf.API_URL + '/m/v1/car/scan.json',
			errorGoLogin: true,
			success: function(json) {
				if(json.status == 1) {
					callback && callback(json);
				} else {
					worf.prompt.tip(json.message);
				}
			}
		});
	}
	
	/*
	 * 获取用户个人信息
	 */
	function getUserInfo(callback){
		var session_token = worf.user.getSessionToken();
		var requestDate = getRequestDate({},session_token);
		worf.ajax({
			data: requestDate,
			url: worf.API_URL + '/m/v1/user/userInfo.json',
			errorGoLogin: true,
			success: function(json) {
				if(json.status == 1) {
					callback && callback(json);
				} else {
					worf.prompt.tip(json.message);
				}
			}
		});
	}
	
	
	/*
	 * 生成ajax参数
	 */
	function getRequestDate(data, session_token) {
		var dateNow = new Date();
		var p = {
			"platform": "WX",
			"app_version": "1.0",
			"service_provider": 0,
			"network_type": 1,
			"width": 0,
			"height": 0,
			"data": data,
			"timestamp": dateNow.getTime(),
			"session_token": session_token || ""
		}
		return p;
	}

	window.myAjax = {
		login: login,
		loginSendSmsCode: loginSendSmsCode,
		registerUser: registerUser,
		registerSendSmsCode: registerSendSmsCode,
		getEqptList:getEqptList,
		getCars:getCars,
		getEqptsByCarId:getEqptsByCarId,
		getEqptInfoByImei:getEqptInfoByImei,
		dayPoints: dayPoints,
		dayPointsCount:dayPointsCount,
		sendRelateSmsCode:sendRelateSmsCode,
		relate:relate,
		checkimeiexist:checkimeiexist,
		scan:scan,
		getUserInfo:getUserInfo
	}
})(window);