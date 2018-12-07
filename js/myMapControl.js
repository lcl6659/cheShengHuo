// 定义一个控件类，即function    
function BackInitPosition(map,pointsArr) {
	// 设置默认停靠位置和偏移量  
	this.defaultAnchor = BMAP_ANCHOR_BOTTOM_LEFT ;
	this.defaultOffset = new BMap.Size(10, 30);
	this.pointsArr = pointsArr;
	this.map = map;
}
// 通过JavaScript的prototype属性继承于BMap.Control   
BackInitPosition.prototype = new BMap.Control();

// 自定义控件必须实现initialize方法，并且将控件的DOM元素返回   
// 在本方法中创建个div元素作为控件的容器，并将其添加到地图容器中   
BackInitPosition.prototype.initialize = function(map) {
	// 创建一个DOM元素   
	var div = document.createElement("div");
	// 设置样式    
	div.style.width = "0.8rem";
	div.style.height = "0.8rem";
	div.style.border = "1px solid #BDBDBD";
	div.style.borderRadius = "0.05rem";
	div.style.backgroundColor = "white";
	div.style.backgroundImage = "url(../imgs/btn_mubiao_normal.png)";
	div.style.backgroundPosition = "center";
	div.style.backgroundRepeat = "no-repeat";
	div.style.backgroundSize = "auto 0.45rem";
	div.style.boxShadow = "0px 0px 8px #999"
	
	var _this = this;
	// 绑定事件，点击一次放大两级    
	div.onclick = function(e) {
		_this.map.setViewport(_this.pointsArr,{
			margins:[10,10,10,10]
		});
	}
	// 添加DOM元素到地图中   
	map.getContainer().appendChild(div);
	// 将DOM元素返回  
	return div;
}






// 定义一个控件类，即function    
function ChangeMapType(map) {
	// 设置默认停靠位置和偏移量  
	this.defaultAnchor = BMAP_ANCHOR_TOP_RIGHT;
	this.defaultOffset = new BMap.Size(10, 10);
	this.map = map;
}
// 通过JavaScript的prototype属性继承于BMap.Control   
ChangeMapType.prototype = new BMap.Control();

// 自定义控件必须实现initialize方法，并且将控件的DOM元素返回   
// 在本方法中创建个div元素作为控件的容器，并将其添加到地图容器中   
ChangeMapType.prototype.initialize = function(map) {
	// 创建一个DOM元素   
	var div = document.createElement("div");
	// 设置样式    
	div.style.width = "0.8rem";
	div.style.height = "0.8rem";
	div.style.border = "1px solid #BDBDBD";
	div.style.borderRadius = "0.05rem";
	div.style.backgroundColor = "white";
	div.style.backgroundImage = "url(../imgs/img_qiehuan.png)";
	div.style.backgroundPosition = "center";
	div.style.backgroundRepeat = "no-repeat";
	div.style.backgroundSize = "auto 0.4rem";
	div.style.boxShadow = "0px 0px 8px #999"
	
	var _this = this;
	// 绑定事件，点击一次放大两级    
	div.onclick = function(e) {
		var nowMapType = _this.map.getMapType().getName();
		if(nowMapType == "地图"){
			_this.map.setMapType(BMAP_HYBRID_MAP);
		}else{
			_this.map.setMapType(BMAP_NORMAL_MAP);
		}
	}
	// 添加DOM元素到地图中   
	map.getContainer().appendChild(div);
	// 将DOM元素返回  
	return div;
}

