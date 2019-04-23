
function Classifier (classes, enums, frameLength) {
	this.classes = classes;
	this.enums = enums;
	this.frameLength = frameLength;
	
	// prepare for classifications
	var varOffsets = [];
	var scale = [];
	classes.varNames.forEach(function(name, n) {
		varOffsets.push(enums.event[name]);
		var s = classes.scale[n];
		if (name=="sneakDuration" || name=="sprintDuration") {
			s = s * 1000;
		}
		scale.push(s);
	});
	this.varOffsets = varOffsets;
	this.scale = scale;
	
	this.maxKey = function (o) {
		// return Object.keys(o).sort(function(a,b){return o[a]-o[b];})[0];
		var vMax = -Infinity;
		var kMax = null;
		for (var k in o) {
			var v = o[k];
			if (v<=vMax) continue;
			vMax = v;
			kMax = k;
		}
		return kMax;
	};
	
	this.addCls = function (timeline) {
		var acc = {b:0,m:0,f:0,e:0,i:0};
		var maxKey = this.maxKey;
		for (var time in timeline) {
			var players = timeline[time];
			for (var player in players) {
				var events = players[player];
				var cls = this.classify(events);
				var c = maxKey(cls);
				events.cls = c;
				acc[c] += 1;
			}
		}
		console.log(acc);
	};
	
	this.classify = function (frame) {
		var frameLength = this.frameLength;
		var norm = this.varOffsets.map(function (e, i) {
			var v = frame[e];
			if (v===undefined) v = 0;
			return (v/frameLength*1000 - classes.center[i]) / scale[i];
		});
		var out = {};
		for (var c in classes.classes) {
			var a = 0;
			classes.classes[c].forEach(function (s,i) {
				a += norm[i] * s;
			});
			out[c] = a;
		}
		return out;
	};
}

