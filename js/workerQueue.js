
function workerQueue() {
	this.worker = {}; // worker prototype
	this.workersIdle = [];
	this.workersBusy = [];
	this.maxWorkers = 1;
	this.queue = [];
	this.jobs = {};
	this.nextID = 1;
	this.add = function(func, args, callback) {
		if (callback===undefined) callback = function() {};
		if (!window.Worker) {
			var res = func(args);
			callback(res);
		} else {
			var job = {id: this.nextID++, func: func, args: args, callback: callback};
			this.queue.push(job);
			this.dispatch();
		}
	};
	this.dispatch = function() {
		if (this.queue.length==0) return;
		var worker = this.getWorker();
		if (worker==null) return;
		this.workersBusy.push(worker);
		var job = this.queue.shift();
		this.jobs[job.id] = job;
		var code = '('+job.func.toString()+')';
		var data = {id: job.id, code: code, args: job.args};
		worker.postMessage(data);
	};
	this.getWorker = function() {
		var wq = this;
		var idle = this.workersIdle;
		var busy = this.workersBusy;
		var worker = idle.shift();
		if (worker!==undefined) return worker;
		if (busy.length+idle.length>=this.maxWorkers) return null;
		// create new worker
		var onmessage = function(e) {
			// console.log('Message received from main script');
			// console.log(e);
			var d = e.data;
			var func = eval(d.code);
			var transferList = [];
			var res = func(d.args, transferList);
			if (d.id===undefined) return;
			postMessage({res: res, id: d.id}, transferList);
		};
		var blob = new Blob(["this.onmessage = "+onmessage.toString()],{type: "text/javascript"});
		worker = new Worker(window.URL.createObjectURL(blob));
		// set properties from worker prototype
		var propertySet = function(a) {
			this[a.k] = a.eval ? eval(a.v) : a.v;
		};
		var data = {code: '('+propertySet.toString()+')'};
		var args = {};
		for (var k in this.worker) {
			var v = this.worker[k];
			if (v instanceof Function) {
				var code = '('+v.toString()+')';
				args = {k: k, v: code, eval: true};
			} else {
				args = {k: k, v: v, eval: false};
			}
			data.args = args;
			worker.postMessage(data);
		}
		if (this.worker.init!==undefined) {
			worker.postMessage({code: '(function(){init();})'});
		}
		// install local message handler
		worker.onmessage = function(e) {
			// console.log('Message received from worker');
			// console.log(e);
			var i = busy.indexOf(this);
			if (i!=-1) busy.splice(i, 1);
			idle.push(this);
			var job = wq.jobs[e.data.id];
			job.callback(e.data.res);
			delete wq.jobs[e.data.id];
			wq.dispatch();
		}
		return worker;
	}
};



