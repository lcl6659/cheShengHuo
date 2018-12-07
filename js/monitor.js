var docHeight = document.documentElement.clientHeight;
var actionBoxHeight = $("#actionBox").height();
var selectEquipmentHeight = $("#selectEquipment").height();
var dataList;
var pointArr = [];
var carMarkerArr = [];
var map;
$(function() {
	//初始化地图容器高度
	$("#mapContainer").height(docHeight);
	$("#modelBack").height(docHeight);
	initBMap();
	initCarList();
	addMyControl();
	
	var n = 10;
	setInterval(function(){
		n=n-1;
		if(n>=0){
			$("#countDown").text(n);
			if(n==0){
				initCarList();
			}
		}else{
			n=10;
			$("#countDown").text(n);
		}
	},1000);
	

	//关闭信息框
	$("#close").on("click", function() {
		actionBox(false);
	});

	//选择设备
	$("#selectEquipment").on("click", ".one-eq", function() {
		if(!$(this).hasClass("select")) {
			$(this).addClass("select").siblings().removeClass("select");
		}
	});
	
	//选择设备 -取消
	$("#selectEquipment").on("click", ".cancle-btn", function() {
		selectEquipmentBox(false);
	});

	//选择设备 -确定
	$("#selectEquipment").on("click", ".ok-btn", function() {
		if($("#eqBox").find(".select").length>0){
			var imei = $("#eqBox").find(".select").text();
			getImeiInfoByImei(imei);
		}
	});
	
	//背景点击
	$("#modelBack").on("click", function() {
		selectEquipmentBox(false);
	});

});

/*
 * 初始化地图
 */
function initBMap() {
	map = new BMap.Map("mapContainer"); // 创建地图实例  
	var point = new BMap.Point(116.404, 39.915); // 创建点坐标  
	map.centerAndZoom(point, 15); // 初始化地图，设置中心点坐标和地图级别

	map.enableScrollWheelZoom(); //鼠标滚轮控制缩放
//	map.addControl(new BMap.GeolocationControl()); //定位控件，针对移动端开发，默认位于地图左下方。
	map.addControl(new BMap.NavigationControl()); //地图平移缩放控件
//	map.addControl(new BMap.MapTypeControl()); //默认位于地图右上方
}


function addMyControl(){
	//添加左下角 控件
	var backInitPosition = new BackInitPosition(map,pointArr);
	map.addControl(backInitPosition);
	
	//添加右上角 控件
	var changeMapType = new ChangeMapType(map);
	map.addControl(changeMapType);
	
}

/*
 * 初始化列表
 */
function initCarList() {
	myAjax.getCars(function(json) {
	 	map.clearOverlays();
		dataList = json.data;
		var carIdArr = [];
		dataList.forEach(function(car) {
			if(car.currentEqpt && car.currentEqpt.longitude && car.currentEqpt.latitude){
				var point = new BMap.Point(car.currentEqpt.longitude, car.currentEqpt.latitude);
				pointArr.push(point);
				carIdArr.push(car.carId);
				var carMarker = addMarker(map, point, "../imgs/car.png", 50, 27, 0, 0, 0);
				carMarkerArr.push(carMarker);
			}
		});
	
		map.setViewport(pointArr);
		
		if(carIdArr.length==1){
			getEqptByCarid(carIdArr[0]);
		}
		
		if(pointArr.length==0){
//			worf.nav.replace(worf.origin+"/view/relateEqpt.html");
			worf.nav.replace("relateEqpt.html")
		}
		
	});
}

/*
 * 根据汽车carid获取设备
 */
function getEqptByCarid(carid) {
	myAjax.getEqptsByCarId({carId:carid},function(json){
		var imeiList = json.data.list;
		if(imeiList.length == 0) {
			worf.prompt.tip("该车辆无关联设备");
		} else if(imeiList.length == 1) {
			var imei = imeiList[0].imei;
			getImeiInfoByImei(imei);
		}else{
			$("#eqBox").empty();
			json.data.list.forEach(function(oneImei){
				var $_eq = $('<div class="one-eq"></div>');
				$_eq.text(oneImei.imei);
				$("#eqBox").append($_eq);
			});
			selectEquipmentBox(true);
		}
	});
}


/*
 * 根据设备号获取设备信息
 */
function getImeiInfoByImei(imei){
	myAjax.getEqptInfoByImei({imei:imei},function(json){
		if(json.data.list[0].longitude && json.data.list[0].latitude){
			setActionBoxInfo(json.data.list[0]);
			selectEquipmentBox(false);
			actionBox(true);
		}else{
			worf.prompt.tip("百度地图没有上传定位信息");
		}
	});
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
function addMarker(map, point, imgPath, imgWidth, imgHeight, left, top, rotation) { // 创建图标对象   
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

	//点击事件
	marker.addEventListener("click", function(e) {
		var lat = this.point.lat;
		var lng = this.point.lng;
		var carInfo = getCarInfo(lat, lng);
		getEqptByCarid(carInfo.carId);
	});
	return marker;
}

/*
 * 通过经纬度找到对应的信息
 */
function getCarInfo(lat, lng) {
	var v;
	dataList.forEach(function(car) {
		if(car.currentEqpt && car.currentEqpt.longitude == lng && car.currentEqpt.latitude == lat) {
			v = car;
		}
	});
	return v;
}


/*
 * 设置面板信息
 */
function setActionBoxInfo(imeiInfo) {
	if(imeiInfo.longitude && imeiInfo.latitude){
		var $_actionBox = $("#actionBox");
		$_actionBox.find(".licenseNum").text(imeiInfo.licenseNum);
		$_actionBox.find(".power-num").text(imeiInfo.electricity);//电量
		$_actionBox.find(".state").text(imeiInfo.currentStatus || "--");//状态
		
		if(imeiInfo.currentStatus == "停车"){
			$("#stopTimeBox").show();
			$_actionBox.find(".stop-time").text(imeiInfo.currentStatusStr);//停车时长
		}else{
			$("#stopTimeBox").hide();
		}
		
		var stopPonit = new BMap.Point(imeiInfo.longitude, imeiInfo.latitude);
		
		if(imeiInfo.longitude=="114.028873" && imeiInfo.latitude=="22.537582"){
			//后台某人定位，即此时的设备还没有上传准确的定位
			$_actionBox.find(".stop-position").text("定位正常，等待设备上传最新定位数据");
		}else{
			getPointMsg(stopPonit,function(address){
				$_actionBox.find(".stop-position").text(address);
			});
		}
	}
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


/*
 * 信息框出现、影藏
 * show:true/false
 */
function actionBox(show) {
	if(show) {
		$("#actionBox").css("bottom", "0px");
		$("#actionBox").css("height", actionBoxHeight + "px");
		setTimeout(function() {
			$("#mapContainer").height(docHeight - actionBoxHeight);
		}, 500);
	} else {
		$("#actionBox").css("bottom", "0px");
		$("#actionBox").css("height", "0px");
		$("#mapContainer").height(docHeight);
	}
}

/*
 * 设备选择框出现、影藏
 * show:true/false
 */
function selectEquipmentBox(show) {
	if(show) {
		$("#modelBack").show();
		$("#selectEquipment").css("bottom", "0px");
		$("#selectEquipment").css("height", selectEquipmentHeight + "px");
	} else {
		$("#selectEquipment").css("bottom", "0px");
		$("#selectEquipment").css("height", "0px");
		setTimeout(function() {
			$("#modelBack").hide();
		}, 500);
	}
}