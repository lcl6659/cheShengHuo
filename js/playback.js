var carId = worf.tools.queryString("carId");
var imei = worf.tools.queryString("imei"); //设备号
var licenseNum = worf.tools.queryString("licenseNum"); //车票号

var docHeight = document.documentElement.clientHeight;
var map;

var dayPoints = {
	data: []
};

var startTimeObj, endTimeObj;
var lushu, pointArr,jumpPointArr, stopPointsArr,startPointsArr, startMarker, endMarker, polyline, nowProcessInterval, luShuOptionData = {};
var playState = 0; //播放状态 0停止，1播放
var infoWindowHight, infoWindowWidth;

$(function() {
	//初始化地图容器高度
	$("title").text(licenseNum);
	$("#mapContainer").height(docHeight - $("#actionBox").height());
	$("#timeSelectBox").height(docHeight);
	initDefaltTime();
	initBMap();
	initProgress();
	initTimeTool();
	
	getPoints($("#startTimeText").val(),$("#endTimeText").val(),function(){
		if(dayPoints.data.length>0){
			initLuShu(dayPoints)
		}else{
			worf.prompt.tip("这个时段里没有数据");
		}
	});

	$("#playSpeed").on("input", function(e) {
		var min = parseInt($(this).attr("min"));
		var max = parseInt($(this).attr("max"));
		var p = (parseFloat(this.value) * 100) / (max);
		$(this).css('background-size', p + '% 100%');
		if(this.value == max) {
			$(this).css('border-radius', '0 0.12rem 0.12rem 0');
		} else {
			$(this).css('border-radius', '0');
		}
	});

	$("#playProgress").on("input", function(e) {
		var min = parseInt($(this).attr("min"));
		var max = parseInt($(this).attr("max"));
		var p = (parseFloat(this.value) * 100) / (max);
		$(this).css('background-size', p + '% 100%');
		if(this.value == max) {
			$(this).css('border-radius', '0 0.12rem 0.12rem 0');
		} else {
			$(this).css('border-radius', '0');
		}
		clearInterval(nowProcessInterval);
	});

	//播放速度
	$("#playSpeed").on("change", function(e) {
		luShuOptionData.speed = this.value;
		if(this.value == 0) {
			pauseLuShu();
		}
		lushu._setOptions({
			speed: this.value
		});
	});
	//播放进度
	$("#playProgress").on("change", function(e) {
		var jumpProcess = this.value;
		if(jumpProcess == 100) {
			jumpProcess = 99.9;
		}
		jumpProgress(jumpProcess);
	});

	//播放按钮
	$("#playBtn").on("click", function() {
		var _this = $(this);
		if($(this).hasClass("playing")) {
			pauseLuShu();
		} else {
			if(luShuOptionData.speed > 0) {
				playLuShu();
			}
		}
	});

	/*
	 * 出现时间选择框
	 */
	$("#actionBox").on("click", ".right-head", function() {
		$("#timeSelectBox").show();
	});

	/*
	 * 取消时段选择
	 */
	$("#timeSelectBox").on("click", ".cancle-btn", function() {
		$("#timeSelectBox").hide();

		var s = (new Date($("#startTimeText").val().replace(/-/g,"/"))).getTime();
		var n = (new Date($("#endTimeText").val().replace(/-/g,"/"))).getTime();

		$("#startTime").val($("#startTimeText").val().replace(/-/g,"/"));
		$("#endTime").val($("#endTimeText").val().replace(/-/g,"/"));

		$("#startTimeBox").find(".date-text").text(worf.tools.dateFormat(s, "yyyy-MM-dd"));
		$("#startTimeBox").find(".time-text").text(worf.tools.dateFormat(s, "HH:mm"));

		$("#endTimeBox").find(".date-text").text(worf.tools.dateFormat(n, "yyyy-MM-dd"));
		$("#endTimeBox").find(".time-text").text(worf.tools.dateFormat(n, "HH:mm"));
	});
	/*
	 * 确定时段选择
	 */
	$("#timeSelectBox").on("click", ".ok-btn", function() {
		
		//TODO
		var startTimestamp = (new Date($("#startTime").val())).getTime();
		var endTimestamp = (new Date($("#endTime").val())).getTime();

		if(endTimestamp <= startTimestamp) {
			worf.prompt.tip("结束时间必须大于开始时间");
			return false;
		} else if(endTimestamp - startTimestamp > 86400000 * 7) {
			worf.prompt.tip("时段间隔不能超过7天");
			return false;
		}
		
		
		$("#timeSelectBox").hide();

		var startTime = $("#startTime").val();
		var endTime = $("#endTime").val();

		$("#startTimeText").val(startTime.replace(/\//g,"-"));
		$("#endTimeText").val(endTime.replace(/\//g,"-"));
		
		resetLushu();//重置路书
		
		//出现播放遮罩
		$("#playMask").show();
		
		getPoints($("#startTimeText").val(),$("#endTimeText").val(),function(){
			if(dayPoints.data.length>0){
				initLuShu(dayPoints);
			}else{
				worf.prompt.tip("这个时段里没有数据");
			}
		});
	});
	
	
	
});

/*
 * 重置路书
 */
function resetLushu(){
	$("#playProgress").val(0);
	$("#playProgress").css('background-size', '0% 100%');
	if(lushu){
		pauseLuShu();
		lushu._path = [];//设置新的路径点数组，实现快进跳转
		map.removeOverlay(lushu._marker);
		map.removeOverlay(lushu._overlay);
		lushu = null;
		dayPoints.data = [];
		map.clearOverlays();
	}
}


/*
 * 路书播放
 */
function playLuShu() {
	$("#playBtn").addClass("playing");
	var newProgress = $("#playProgress").val();
	
	playState = 1;
	if(newProgress == 100) {
		jumpProgress(0);
	} else {
		lushu.start();
		setProcessInterval();
	}
}

/*
 * 路书停止
 */
function pauseLuShu() {
	lushu.pause();
	playState = 0;
	clearInterval(nowProcessInterval);
	$("#playBtn").removeClass("playing");
}

/*
 * 初始化地图
 */
function initBMap() {
	map = new BMap.Map("mapContainer"); // 创建地图实例  
	var point = new BMap.Point(116.404, 39.915); // 创建点坐标  
	map.centerAndZoom(point, 15); // 初始化地图，设置中心点坐标和地图级别
	//map.disableDragging();
	map.enableScrollWheelZoom(); //鼠标滚轮控制缩放
//	map.addControl(new BMap.GeolocationControl()); //定位控件，针对移动端开发，默认位于地图左下方。
	map.addControl(new BMap.NavigationControl()); //地图平移缩放控件
//	map.addControl(new BMap.MapTypeControl()); //默认位于地图右上方
}

/*
 * 初始化进度条
 */
function initProgress() {

	var $_playSpeed = $("#playSpeed");

	var min = parseInt($_playSpeed.attr("min"));
	var max = parseInt($_playSpeed.attr("max"));
	var p = (parseFloat($_playSpeed.val()) * 100) / (max);

	$_playSpeed.css('background-size', p + '% 100%');
	if($_playSpeed.val() == max) {
		$_playSpeed.css('border-radius', '0 0.12rem 0.12rem 0');
	} else {
		$_playSpeed.css('border-radius', '0');
	}
}

/*
 * 初始化时间插件
 */
function initTimeTool() {
	//初始化时间插件
	startTimeObj = new lCalendar();
	startTimeObj.init({
		'trigger': '#startTime',
		'type': 'datetime',
		"okCallback": setTimeCallback
	});

	endTimeObj = new lCalendar();
	endTimeObj.init({
		'trigger': '#endTime',
		'type': 'datetime',
		"okCallback": setTimeCallback
	});
}
/*
 * TODO 时间插件的确定回调函数
 */
function setTimeCallback(oldTime, newTime, inputElement) {
	var oldTimeStr = worf.tools.dateFormat(oldTime.getTime(), "yyyy-MM-dd HH:mm");
	var newTimeStr = worf.tools.dateFormat(newTime.getTime(), "yyyy-MM-dd HH:mm");
	if(oldTimeStr != newTimeStr) {

		var startTimestamp = (new Date($("#startTime").val())).getTime();
		var endTimestamp = (new Date($("#endTime").val())).getTime();

		var date = worf.tools.dateFormat(newTime.getTime(), "yyyy-MM-dd");
		var time = worf.tools.dateFormat(newTime.getTime(), "HH:mm");
		if($(inputElement).attr("id") == "startTime") {
			/*if(endTimestamp <= startTimestamp) {
				worf.prompt.tip("结束时间必须大于开始时间");
				$("#startTime").val(worf.tools.dateFormat(oldTime.getTime(), "yyyy-MM-dd HH:mm:ss"));
			} else if(endTimestamp - startTimestamp > 86400000 * 7) {
				worf.prompt.tip("时段间隔不能超过7天");
				$("#startTime").val(worf.tools.dateFormat(oldTime.getTime(), "yyyy-MM-dd HH:mm:ss"));
			} else {
				$("#startTimeBox").find(".date-text").text(date);
				$("#startTimeBox").find(".time-text").text(time);
			}*/
			
			$("#startTimeBox").find(".date-text").text(date);
			$("#startTimeBox").find(".time-text").text(time);
		} else {
			/*if(endTimestamp <= startTimestamp) {
				worf.prompt.tip("结束时间必须大于开始时间");
				$("#endTime").val(worf.tools.dateFormat(oldTime.getTime(), "yyyy-MM-dd HH:mm:ss"));
			} else if(endTimestamp - startTimestamp > 86400000 * 7) {
				worf.prompt.tip("时段间隔不能超过7天");
				$("#endTime").val(worf.tools.dateFormat(oldTime.getTime(), "yyyy-MM-dd HH:mm:ss"));
			} else {
				$("#endTimeBox").find(".date-text").text(date);
				$("#endTimeBox").find(".time-text").text(time);
			}*/
			
			$("#endTimeBox").find(".date-text").text(date);
			$("#endTimeBox").find(".time-text").text(time);
		}
	}
}

/*
 * 初始化时间 - 默认值
 */
function initDefaltTime() {
	var n = (new Date()).getTime();
	var s = n - 86400000;

	$("#startTime").val(worf.tools.dateFormat(s, "yyyy/MM/dd HH:mm:ss"));
	$("#endTime").val(worf.tools.dateFormat(n, "yyyy/MM/dd HH:mm:ss"));

	$("#startTimeText").val(worf.tools.dateFormat(s, "yyyy-MM-dd HH:mm:ss"));
	$("#endTimeText").val(worf.tools.dateFormat(n, "yyyy-MM-dd HH:mm:ss"));

	$("#startTimeBox").find(".date-text").text(worf.tools.dateFormat(s, "yyyy-MM-dd"));
	$("#startTimeBox").find(".time-text").text(worf.tools.dateFormat(s, "HH:mm"));

	$("#endTimeBox").find(".date-text").text(worf.tools.dateFormat(n, "yyyy-MM-dd"));
	$("#endTimeBox").find(".time-text").text(worf.tools.dateFormat(n, "HH:mm"));
}

/*
 * 设置播放进度实时更新
 */
function setProcessInterval() {
	nowProcessInterval = setInterval(function() {
		/*var nowAtIndex = getTroughPointIndex(map, pointArr, lushu);*/
		var nowAtIndex = pointArr.length-jumpPointArr.length+lushu.i;
		var nowProcess;
		var $_playProgress = $("#playProgress");
		
		if(pointArr.length - nowAtIndex > 1 && jumpPointArr.length-lushu.i>1) {
			nowProcess = (nowAtIndex * 100 / pointArr.length).toFixed(2);
			$_playProgress.css('border-radius', '0');
		} else {
			nowProcess = 100;
			$("#playBtn").removeClass("playing");
			playState = 0;
			clearInterval(nowProcessInterval);
			$_playProgress.css('border-radius', '0 0.12rem 0.12rem 0');
		}
		
		if(nowAtIndex > -1) {
			if(Math.abs($_playProgress.val()-nowProcess)<30){
				$_playProgress.val(nowProcess);
				$_playProgress.css('background-size', nowProcess + '% 100%');
			}
		}
	}, 10);
}

/*
 * 获取轨迹点数据
 */
var ajaxErrState = 0; //标识ajax
var pointsArrTemp = []; //存放ajax返回的数据，临时存放
function getPoints(startTime, endTime,callback) {

	var dateArr = getDateArr(startTime, endTime);

	ajaxErrState = 0;
	pointsArrTemp = [];
	
	worf.ajax.overlayShow("");//loading
	setTimeout(function(){
		worf.ajax.overlayHide()
	},3*60*1000);
	
	dateArr.forEach(function(dateObj) {
		var optionDate = {
			"startTime": dateObj.startTime,
			"carId": carId,
			"imei": imei,
			"endTime": dateObj.endTime,
			"nowTime": dateObj.endTime.split(" ")[0]
		}

		myAjax.dayPoints(optionDate, function(json) {
			if(json.status != 1) {
				ajaxErrState = 1;
			}
			pointsArrTemp.push(json);

			if(pointsArrTemp.length == dateArr.length) {
				//最后一次ajax请求
				if(ajaxErrState == 0) {
					//没有ajax出错
					pointsArrTemp.forEach(function(json) {
						dayPoints.data = dayPoints.data.concat(json.data);
					});
					
					pointsArrTemp = [];//释放内存
					
					//排序 按照设备时间从小到大排序
					dayPoints.data.sort(function(a,b){
						var aDate = new Date(a.et);
						var bDate = new Date(b.et);
				        return aDate.getTime()-bDate.getTime();
					});
					
					callback && callback();
					worf.ajax.overlayHide();
				} else {
					worf.prompt.tip("数据请求失败");
					pointsArrTemp = [];//释放内存
					worf.ajax.overlayHide();
				}
			}
		});

	});
}


/*
 * 获取时间数组（将时间按照每天分割）
 */
function getDateArr(startTime, endTime) {
	var dateArr = [];
	var startDate = new Date(startTime.replace(/-/g,"/"));
	var endDate = new Date(endTime.replace(/-/g,"/"));
	if(endDate.getDate() == startDate.getDate()) {
		//同一天
		var dateObj = {
			startTime: startTime,
			endTime: endTime
		}
		dateArr.push(dateObj);
	}else{
		var dateObj01 = {
			startTime: startTime,
			endTime: startDate.getFullYear() + "-" + add0(startDate.getMonth()+1) + "-" + add0(startDate.getDate()) + " " + "23:59:59"
		}
		dateArr.push(dateObj01);
		
		
		var timeStamp = (new Date(startDate.getFullYear() + "/" + add0(startDate.getMonth()+1) + "/" + startDate.getDate() + " " + "00:00:00")).getTime();
		var timeStampEnd = (new Date(endDate.getFullYear() + "/" + add0(endDate.getMonth()+1) + "/" + endDate.getDate() + " " + "00:00:00")).getTime();
		
		var n = Math.ceil((timeStampEnd-timeStamp)/86400000) -1;
		
		for(var i = 0; i < n; i++) {
			var timeStampStart = timeStamp + 86400000; //加一天
			var timeStampEnd = timeStamp + 86400000 + 86399000; //当天晚23::59:59
			var dateObj = {
				startTime: worf.tools.dateFormat(timeStampStart, "yyyy-MM-dd HH:mm:ss"),
				endTime: worf.tools.dateFormat(timeStampEnd, "yyyy-MM-dd HH:mm:ss")
			}
			timeStamp = timeStampStart;
			dateArr.push(dateObj);
		}
		
		var dateObj02 = {
			startTime: endDate.getFullYear() + "-" + add0(endDate.getMonth()+1) + "-" + add0(endDate.getDate()) + " " + "00:00:00",
			endTime: endTime
		}
		dateArr.push(dateObj02);
	}
	return dateArr;
}

/*
 * 日期为1位数是前面加个0
 */
function add0(n){
	if(n<10){
		return "0"+n
	}else{
		return n
	}
}

/*
 * 初始化路书
 */
function initLuShu(dayPoints) {
	luShuOptionData = {
		speed: $("#playSpeed").val(),
		nowProcess: 0
	}

	//进度归0
	$("#playProgress").val(0);
	$("#playProgress").css('background-size', '0% 100%');

	getPolylinePointsArr(dayPoints.data);

	//添加停车点
	if(stopPointsArr && stopPointsArr.length > 0) {
		stopPointsArr.forEach(function(oneStopPointObj, index) {
			
			getPointMsg(oneStopPointObj.point,function(address){
				var stopInfoWindowHtml = "<div class='InfoWindowHtml'>" +
				"<div class='head-box'>"+licenseNum+"</div>" +
				"<div class='stop-time-box'>停车时长：<span class='stop-time'>"+oneStopPointObj.stopDuration+"</span></div>" +
				"<div class='stop-place'>"+address+"</div>" +
				"</div>";
				addMarker(map, oneStopPointObj.point, stopInfoWindowHtml, "../imgs/icon_stop.png", 32, 34, 0, 0, 0);
			});
		});
	}
	
	//添加起点图标
	var firstPonit = new BMap.Point(dayPoints.data[0].lng, dayPoints.data[0].lat);
	getPointMsg(firstPonit,function(address){
		var firstPonitInfoWindowHtml = "<div class='InfoWindowHtml'>" +
		"<div class='head-box'>"+licenseNum+"</div>" +
		"<div class='stop-place-2'>"+address+"</div>" +
		"</div>";
		startMarker = addMarker(map, firstPonit, firstPonitInfoWindowHtml, "../imgs/icon_start.png", 32, 34, 0, 0, 0);
	});
	
	//添加终点图标
	var pointsLength = dayPoints.data.length;
	var endPonit = new BMap.Point(dayPoints.data[pointsLength - 1].lng, dayPoints.data[pointsLength - 1].lat);
	getPointMsg(endPonit,function(address){
		var endPonitInfoWindowHtml = "<div class='InfoWindowHtml'>" +
		"<div class='head-box'>"+licenseNum+"</div>" +
		"<div class='stop-place-2'>"+address +"</div>" +
		"</div>";
		endMarker = addMarker(map, endPonit, endPonitInfoWindowHtml, "../imgs/icon_end.png", 32, 34, 0, 0, 0);
	});

	//绘画轨迹
	polyline = new BMap.Polyline(pointArr, {
		strokeColor: "#4f7fff",
		strokeWeight: 5,
		strokeOpacity: 0.7,
		strokeStyle: "solid"
	});
	map.addOverlay(polyline);
	map.setViewport(dayPoints.data); //根据提供的地理区域或坐标设置地图视野，调整后的视野会保证包含提供的地理区域或坐标

	//路书
	lushu = createLuShu(map, pointArr, luShuOptionData.speed, []);
	
	

	//去除播放遮罩
	$("#playMask").hide();

	lushu.start();
	setTimeout(function() {
		lushu.pause();
		infoWindowHight = $(".InfoWindowHtml").height();
		infoWindowWidth = $(".InfoWindowHtml").width();

		//添加点击车子监听  点击弹出信息窗口
		/*lushu._marker.addEventListener("click", function() {
			lushu._overlay.toggle();
			if(stopOverlayArr.length > 0) {
				stopOverlayArr.forEach(function(stopOverlay) {
					map.removeOverlay(stopOverlay);
				});
			}
		});*/
		
	}, 400);
}

/*
 * 进度跳转
 */
function jumpProgress(newprocess) {
	jumpPointArr = getJumpPointArr(newprocess, pointArr);

	lushu._path = [];//设置新的路径点数组，实现快进跳转
	map.removeOverlay(lushu._marker);
	map.removeOverlay(lushu._overlay);
	lushu = null;
	
	lushu = createLuShu(map, jumpPointArr, luShuOptionData.speed, []);
	if(playState == 1) {
		lushu.start();
		setProcessInterval();
	} else {
		lushu.start();
		setTimeout(function() {
			/*var zoomNow = map.getZoom();
			map.setViewport([lushu._marker.getPosition()]);
			map.setZoom(zoomNow);*/
			lushu.pause();
		}, 415);
	}
}


/*
 * 创建lushu
 */
function createLuShu(map, pointArr, speed, landmarkPois) {
	var InfoWindowHtml = "<div class='InfoWindowHtml'>" +
		"<div class='head-box'>差不多还补差不多还差不多和不充电宝充道和</div>" +
		"<div class='stop-time-box'>停车时长：<span class='stop-time'>453天21小时23分22秒</span></div>" +
		"<div class='stop-place'>差不多是差不多还是才差不多差不多还差不多和才帮</div>" +
		"</div>";
	var lushu = new BMapLib.LuShu(map, pointArr, {
		defaultContent: InfoWindowHtml,
		autoView: true, //是否开启自动视野调整，如果开启那么路书在运动过程中会根据视野自动调整
		icon: new BMap.Icon('../imgs/car.png', new BMap.Size(50, 27), {
			anchor: new BMap.Size(27, 13)
		}),
		speed: speed,
		enableRotation: true, //是否设置marker随着道路的走向进行旋转
		landmarkPois: landmarkPois
	});
	return lushu;
}


//生成轨迹点数组
function getPolylinePointsArr(data) {
	pointArr = [];
	stopPointsArr = [];
	startPointsArr = [];
	for(var i = 0; i < data.length; i++) {
		var point = new BMap.Point(data[i].lng, data[i].lat);
		pointArr.push(point);
		if(data[i].lt == "STOP") {
			var pObj = {
				point:point,
				time:(new Date(data[i].et)).getTime(),
				stopDuration:""
			}
			stopPointsArr.push(pObj);
		}
		if(data[i].lt == "START") {
			var pObj = {
				point:point,
				time:(new Date(data[i].et)).getTime()
			}
			startPointsArr.push(pObj);
		}
	}
	
	//生成停车时间
	stopPointsArr.forEach(function(stopPointObj,index){
		var timeStamp = stopPointObj.time;
		for(var i=0;i<startPointsArr.length;i++){
			if(startPointsArr[i].time>stopPointObj.time){
				stopPointObj.stopDuration = formatDuring(startPointsArr[i].time-stopPointObj.time);
				break;
			}
		}
	});
	
	
	jumpPointArr = pointArr;
}

/*
 * 通过毫秒数，获取时间字符串
 */
function formatDuring(mss) {
    var days = parseInt(mss / (1000 * 60 * 60 * 24))==0?"":parseInt(mss / (1000 * 60 * 60 * 24))+"天";
    var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))==0?"":parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))+"小时";
    var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60))==0?"":parseInt((mss % (1000 * 60 * 60)) / (1000 * 60))+"分";
    var seconds = (mss % (1000 * 60)) / 1000+ "秒";
    return days + hours + minutes + seconds;
}



/*
 * 添加覆盖物
 * map：地图对象
 * point：防置的点
 * imgPath：图片本地路径（相对路径）
 * imgWidth，imgHeight覆盖物宽、高
 * left：左偏移
 * top：上偏移
 * rotation：旋转角度
 */
var stopOverlayArr = [];

function addMarker(map, point, InfoWindowHtml, imgPath, imgWidth, imgHeight, left, top, rotation) { // 创建图标对象   
	var myIcon = new BMap.Icon(imgPath, new BMap.Size(imgWidth, imgHeight), {
		// 设置图片偏移。   
		// 当您需要从一幅较大的图片中截取某部分作为标注图标时，您   
		// 需要指定大图的偏移位置，此做法与css sprites技术类似。    
		imageOffset: new BMap.Size(0, 0) // 设置图片偏移    
	});
	// 创建标注对象并添加到地图   
	var marker = new BMap.Marker(point, {
		icon: myIcon,
		offset: new BMap.Size(left, top), //偏移
		rotation: rotation //旋转
	});
	map.addOverlay(marker);

	marker.addEventListener("click", function(e) {
		//其他面板消失
		lushu._overlay.hide();
		if(stopOverlayArr.length > 0) {
			stopOverlayArr.forEach(function(stopOverlay) {
				map.removeOverlay(stopOverlay);
			});
		}
		var stopOverlay = new StopOverlay(marker.getPosition(), infoWindowHight, infoWindowWidth, InfoWindowHtml);
		stopOverlayArr = [];
		stopOverlayArr.push(stopOverlay);
		map.addOverlay(stopOverlay);
	});

	return marker;
}

/*
 * 根据进度，判断数组中的应该跳转的点位置
 * process:0~100
 */
function getJumpPointArr(process, pointArr) {
	var index = 0;
	if(process == 0) {
		index = 0;
	} else if(process < 0) {
		index = 0;
	} else if(process == 100) {
		index = pointArr.length;
	} else if(process > 100) {
		index = pointArr.length;
	} else {
		index = parseInt((pointArr.length * process) / 100);
	}
	var jumpPointArr = pointArr.slice(index, pointArr.length);
	return jumpPointArr;
}

/*
 * 获取经过点的index
 */
function getTroughPointIndex(map, pointArr, lushu) {
	var markerPoi = new BMap.Point(lushu._marker.getPosition().lng, lushu._marker.getPosition().lat);
	for(var i = 0; i < pointArr.length; i++) {
		var distance = map.getDistance(markerPoi,pointArr[i]);
		//两点距离小于10米，认为是同一个点
		if(distance < 0.1) {
			return i;
		}
	}
	return -1;
}

/*
 * 获取地址信息
 */
function getPointMsg(point,callback){
	var gc = new BMap.Geocoder();//地址解析类
	gc.getLocation(point, function(rs){
        var addr = rs.address;
        callback && callback(addr);
    });
}


/**
 * 自定义的overlay，显示在小车的上方
 * @param {Point} Point 要定位的点.
 * @param {String} html overlay中要显示的东西.
 * @return 无返回值.
 */
function StopOverlay(point, infoWindowHight, infoWindowWidth, html) {
	this._point = point;
	this._html = html;
	this._infoWindowHight = infoWindowHight;
	this._infoWindowWidth = infoWindowWidth;
}
StopOverlay.prototype = new BMap.Overlay();
StopOverlay.prototype.initialize = function(map) {
	var div = this._div = document.createElement("div");
	div.style.width = "auto";
	div.style.minWidth = "50px";
	div.style.position = "absolute";
	div.style.background = "#fff";
	div.style.borderRadius = "0.15rem";
	div.style.boxShadow = "0px 0px 10px #CCCCCC";
	div.style.zIndex = -BMap.Overlay.getZIndex(this._point.lat);
	/*	div.style.display = "none";
	 */
	div.innerHTML = this._html;
	map.getPanes().floatPane.appendChild(div);

	var _this = this;

	map.addEventListener('touchend', function(e) {
		var className = e.domEvent.srcElement.className;
		if(className == "InfoWindowHtml" || className == "head-box" || className == "stop-time-box" || className == "stop-place-2" || className == "stop-place" || className == "stop-time") {
			_this._div.style.display = 'none';
		}
	});

	return div;
}
StopOverlay.prototype.draw = function() {
	var h = $(this._div).height();
	var position = map.pointToOverlayPixel(this._point);
	this._div.style.left = position.x - (this._infoWindowWidth / 2) + "px";
	this._div.style.top = position.y - (h + 30) + "px";
}
//实现显示方法    
StopOverlay.prototype.show = function() {
	if(this._div) {
		this._div.style.display = "";
	}
}
// 实现隐藏方法  
StopOverlay.prototype.hide = function() {
	if(this._div) {
		this._div.style.display = 'none';
	}
}
StopOverlay.prototype.toggle = function() {
	if(this._div) {
		if(this._div.style.display == "none") {
			this.show();
		} else {
			this.hide();
		}
	}
}