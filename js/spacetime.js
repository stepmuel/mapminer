
function updateMap(timeFrame) {
	//var timeFrame = [0, 0];
	var frame = map.intFrame(100);
	var downSample = Math.log(1/map.scale)/Math.log(2);
	downSample = downSample<0 ? 0 : Math.floor(downSample);
	// console.log("scale: " + map.scale);
	// console.log("down sample: " + downSample);
	wq.queue.splice(0,wq.queue.length); // remove pending jobs
	var job = function(args, transferList) {
		var color = function(rgba, pos, v) {
			v = 255 * (1-1/(v/1000+1));
			rgba[pos+0] = 0;
			rgba[pos+1] = 0;
			rgba[pos+2] = 0;
			rgba[pos+3] = v;
		};
		var filter = function (time, player) {
			// if (player!="5") return false;
			// return data.timeline[time][player].cls == "f";
			// return player=="3";
			return true;
		};
		var world = "1";
		var result = fetchPixels(args[0], args[1], args[2], world, filter, color);
		var buffer = result.buffer;
		transferList.push(buffer);
		return {buffer: buffer, frame: result.frame, w: result.w, h:result.h};
	};
	var done = function(result) {
		var imageData = map.createImageData(result.w, result.h);
		imageData.data.set(new Uint8Array(result.buffer));
		map.setImageData("pos", imageData, result.frame);
		map.placeImageData();
	};
	wq.add(job, [frame, downSample, timeFrame], done);
}

function createWorkerQueue() {
	var wq = new workerQueue();
	wq.worker.fetchPixels = function (frame, ds, timeFrame, world, filter, color) {
		var startTime = new Date().getTime();
		var w = frame[0][1] - frame[0][0];
		var h = frame[1][1] - frame[1][0];
		w = w>>ds; h = h>>ds; // down sample
		var areaScale = (1<<ds);
		areaScale = 1/(areaScale*areaScale);
		var dx = frame[0][0], dy = frame[1][0];
		var pixel = new Uint32Array(w*h);
		var rgba = new Uint8Array(pixel.buffer);
		var mapData = this.data.pos;
		if (!timeFrame || timeFrame[0].valueOf()==timeFrame[1].valueOf()) timeFrame = [-Infinity, Infinity];
		// accumulate positions
		for (var map in mapData) {
			if (map!=world) continue;
			var times = mapData[map];
			for (var time in times) {
				if (time<timeFrame[0]||time>timeFrame[1]) continue;
				var players = times[time];
				for (var player in players) {
					if (!filter(time, player)) continue;
					var pixels = players[player];
					pixels.forEach(function(p) {
						var x = (p[0]-dx)>>ds, y = (p[1]-dy)>>ds;
						if (x<0||x>=w||y<0||y>=h) return;
						pixel[x+w*y] += p[2]*areaScale;
					});
				}
			}
		}
		// convert accumulated time to color
		for (var i=0; i < pixel.length; i++) {
			color(rgba, i*4, pixel[i]);
		};
		console.log("dt: " + (new Date().getTime() - startTime));
		return {buffer: rgba.buffer, frame: frame, w: w, h: h};
	};

	// transferring large objects is slow in chrome; transfer string instead
	wq.worker.init = function() {
		var startTime = new Date().getTime();
		this.data = JSON.parse(this.dataString);
		delete this.dataString;
		console.log("init dt: " + (new Date().getTime() - startTime));
	}
	return wq;
}


