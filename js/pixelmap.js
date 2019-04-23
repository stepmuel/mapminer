
function PixelMap (width, height, e) {
	this.element = e;
	this.dim = [Math.round(width), Math.round(height)];
	this.center = [0, 0];
	this.translate = [0, 0];
	this.scale = 1;
	this.tmpCan = document.createElement("canvas");
	Object.defineProperty(this, "origin", {
		get: function () {
			var x = (this.center[0]-this.dim[0]*0.5) - this.translate[0];
			var y = (this.center[1]-this.dim[1]*0.5) - this.translate[1];
			var x = (this.center[0] - this.translate[0] - this.dim[0]*0.5/this.scale);
			var y = (this.center[1] - this.translate[1] - this.dim[1]*0.5/this.scale);
			var x = this.center[0]-this.dim[0]*0.5-this.translate[0]/this.scale;
			var y = this.center[1]-this.dim[1]*0.5-this.translate[1]/this.scale;
			// console.log(this.scale);
			return [x, y];
			return [Math.round(x), Math.round(y)];
		} 
	});
	Object.defineProperty(this, "frame", {
		get: function () { 
			var o = this.origin; 
			var w = this.dim[0]/this.scale;
			var h = this.dim[1]/this.scale;
			return [[o[0],o[0]+w],[o[1],o[1]+h]];
		} 
	});
	this.intFrame = function (ext) {
		if (ext===undefined) ext = 0;
		ext = Math.floor(ext/this.scale);
		var f = this.frame
		var xRange = [Math.floor(f[0][0]-ext), Math.ceil(f[0][1]+ext)];
		var yRange = [Math.floor(f[1][0]-ext), Math.ceil(f[1][1]+ext)];
		return [xRange, yRange];
	};
	this.setElementDim = function (element) {
		element.style.width = this.dim[0]+"px";
		element.style.height = this.dim[1]+"px";
	};
	
	this.setElementDim(e);
	e.style.position = "relative";
	e.style.border = "1px solid #000";
	//e.style.backgroundColor = 'lime';
	
	this.layerOrder = [];
	this.layers = {};
	this.addLayer = function (name) {
		this.layerOrder.push(name);
		var can = document.createElement("canvas");
		this.layers[name] = can;
		this.element.appendChild(can);
		can.width = this.dim[0];
		can.height = this.dim[1];
		can.style.position = "absolute";
		can.style.left = "0";
		can.style.top = "0";
		// TODO: z-index
		this.setElementDim(can);
		return can;
	};
	this.getLayer = function (name) { return this.layers[name]; };
	
	this.imageData = {};
	this.setImageData = function (layer, data, frame) {
		this.imageData[layer] = {data: data, frame: frame};
	}
	this.createImageData = function (w, h) {
		return this.tmpCan.getContext("2d").createImageData(w, h);
	};
	this.placeImageData = function () {
		var frame = this.frame;
		var tmpCan = this.tmpCan;
		var s = this.scale;
		for (var layer in this.imageData) {
			var imgData = this.imageData[layer].data;
			tmpCan.width = imgData.width;
			tmpCan.height = imgData.height;
			tmpCan.getContext("2d").putImageData(imgData, 0, 0);
			var can = this.layers[layer];
			var imgFrame = this.imageData[layer].frame;
			var ctx = can.getContext("2d");
			ctx.clearRect(0, 0, can.width, can.height);
			var dx = imgFrame[0][0] - frame[0][0];
			var dy = imgFrame[1][0] - frame[1][0];
			var w = imgFrame[0][1] - imgFrame[0][0];
			var h = imgFrame[1][1] - imgFrame[1][0];
			// dx = dy = 0;
			// s = 1;
			// dx = dx*s;
			// dy = dy*s;
			ctx.imageSmoothingEnabled = s<1;
			ctx.drawImage(tmpCan, dx*s, dy*s, w*s, h*s);
			// ctx.putImageData(imgData, 0, 0);
		}
	};
}




