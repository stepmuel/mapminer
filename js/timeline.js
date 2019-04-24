
function TimeLine () {
	this.canvas = document.createElement("canvas");
	Object.defineProperty(this, "width", {
		get: function () { return this.canvas.width; },
		set: function (v) { this.canvas.width = v; },
	});
	Object.defineProperty(this, "height", {
		get: function () { return this.canvas.height; },
		set: function (v) { this.canvas.height = v; },
	});
	this.setData = function (data, step) {
		this.data = data;
		this.step = step;
	};
}

function WaveTimeLine () {
	TimeLine.apply(this); // inherit from TimeLine
	this.color = function (v, t) {return "#000";};
	this.amplitude = function (v, t) {return v;};
	this.plot = function (start, end) {
		var w = this.width;
		var h = this.height;
		var c = this.color;
		var a = this.amplitude;
		var step = this.step;
		var data = this.data;
		var ctx = this.canvas.getContext("2d");
		ctx.clearRect(0, 0, w, h);
		ctx.save();
    var s = w/(end-start)*step;
		ctx.scale(s, 1);
    var dx = s > 0.01 ? 1 : 1/(s*100);
		for (var t in this.data) {
			if (t<start-step||t>end) continue;
			var v = data[t];
			var dy = a(v)*h;
			var x = (t-start)/step;
			ctx.fillStyle = c(v);
			ctx.fillRect(x, (h-dy)/2, dx, dy);
		}
		ctx.restore();
	};
}

function EnumTimeLine () {
	TimeLine.apply(this); // inherit from TimeLine
	this.colors = {};
	this.values = [];
	this.valueMap = function (v) {return v;};
	this.plot = function (start, end) {
		var valOffset = {};
		this.values.forEach(function (v, i) {
			valOffset[v] = i;
		});
		var nValues = this.values.length;
		var w = this.width;
		var h = this.height;
		var step = this.step;
		var data = this.data;
		var ctx = this.canvas.getContext("2d");
		ctx.imageSmoothingEnabled = false;
		ctx.clearRect(0, 0, w, h);
		ctx.save();
    var s = w/(end-start)*step;
		ctx.scale(s, 1);
    var dx = s > 0.01 ? 1 : 1/(s*100);
		for (var t in this.data) {
			if (t<start-step||t>end) continue;
			var v = this.valueMap(data[t]);
			if (v===undefined || v===null) continue;
			var i = valOffset[v];
			if (i===undefined) continue;
			var x = (t-start)/step;
			ctx.fillStyle = this.colors[v];
			ctx.fillRect(x, i*h/nValues, dx, h/nValues);
			// ctx.fillRect(x, 0, 1, h);
		}
		ctx.restore();
	};
}

