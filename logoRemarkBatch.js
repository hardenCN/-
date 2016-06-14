'use strict';


var fs = require('fs'),
	gm = require('gm').subClass({
		imageMagick: true
	});
var qr = require('qr-image');
var S = require("string");
var async = require("async");


var q = async.queue(function(task, callback) {
	console.log('worker is processing task: ', task.name);
	task.run(callback);
}, 1);

q.saturated = function() {
	console.log('all workers to be used');
}

q.empty = function() {
	console.log('no more tasks wating');
}

q.drain = function() {
	console.log('all tasks have been processed');
}


var explorerlogoRemark = function(path, nextQueueTaskCallback) {
	fs.readdir(path, function(err, files) {
		if (err) {
			console.log("error:\n" + err);
			return;
		}
		var i = 0;
		async.eachSeries(files, function(file, callback) {
			fs.stat(path + "\\" + file + '',
				function(err, stat) {
					if (err) {
						console.log(err);
						return;
					}
					if (stat.isDirectory()) {
						console.log(path + "\\" + file + "\\");
						i++;
						if (i >= files.length) {
							nextQueueTaskCallback();
						}
						callback();
					} else {
						console.log(path + "\\" + file);
						if (S(file).startsWith('resize_')) {
							var readStream = fs.createReadStream(path + "\\" + file);
							gm(readStream).size(function(err, value) {
								console.log(JSON.stringify(value));
								try {
									if (value.width > value.height) {
										if (value.width > 2200) {
											gm(gm(path + "\\" + file)
													.composite('3big.png')
													.geometry('+50+' + (value.height - 200)) //左下角相对3.png => margin-left:10px;margin-bottom:10px
													.stream())
												.composite('2big.png')
												.geometry('+' + (value.width - 900) + '+40') //左下角相对3.png => margin-left:10px;margin-bottom:10px
												.quality(60)
												.write(path + "\\060sydianai" + file, function(err) {
													if (err) throw err;
													else {
														console.log('done');
														i++;
														if (i >= files.length) {
															nextQueueTaskCallback();
														}
														callback();
													}
												});
										} else {
											gm(gm(path + "\\" + file)
													.composite('3.png')
													.geometry('+10+' + (value.height - 67)) //左下角相对3.png => margin-left:10px;margin-bottom:10px
													.stream())
												.composite('2.png')
												.geometry('+' + (value.width - 260) + '+10') //左下角相对3.png => margin-left:10px;margin-bottom:10px
												.quality(60)
												.write(path + "\\060sydianai" + file, function(err) {
													if (err) throw err;
													else {
														console.log('done');
														i++;
														if (i >= files.length) {
															nextQueueTaskCallback();
														}
														callback();
													}
												});
										}

									} else if (value.width <= value.height) {
										if (value.height > 2200) {
											gm(gm(path + "\\" + file)
													.composite('3big.png')
													.geometry('+10+' + (value.height - 200)) //左下角相对3.png => margin-left:10px;margin-bottom:10px
													.stream())
												.composite('2big.png')
												.geometry('+' + (value.width - 900) + '+40') //左下角相对3.png => margin-left:10px;margin-bottom:10px
												.quality(60)
												.write(path + "\\060sydianai" + file, function(err) {
													if (err) throw err;
													else {
														console.log('done');
														i++;
														if (i >= files.length) {
															nextQueueTaskCallback();
														}
														callback();
													}
												});
										} else {
											gm(gm(path + "\\" + file)
													.composite('3.png')
													.geometry('+10+' + (value.height - 67)) //左下角相对3.png => margin-left:10px;margin-bottom:10px
													.stream())
												.composite('2.png')
												.geometry('+' + (value.width - 260) + '+10') //左下角相对3.png => margin-left:10px;margin-bottom:10px
												.quality(60)
												.write(path + "\\060sydianai" + file, function(err) {
													if (err) throw err;
													else {
														console.log('done');
														i++;
														if (i >= files.length) {
															nextQueueTaskCallback();
														}
														callback();
													}
												});
										}
									}
								} catch (e) {
									console.error(e);
									i++;
									if (i >= files.length) {
										nextQueueTaskCallback();
									}
									callback();
								}
							});
						} else {
							i++;
							if (i >= files.length) {
								nextQueueTaskCallback();
							}
							callback();
						}

					}
				}
			);
		});
	})
}


//图片所在dir
var initDir = "F:\\上传到网站";

function explorerlogoRemarkQueue(path) {
	//初始的文件夹直接放入queue
	if (path == initDir) {
		q.push({
			name: 'start',
			run: function(nextQueueTaskCallback) {
				explorerlogoRemark(path, nextQueueTaskCallback);
			}
		}, function(err) {
			console.log('start' + ' executed');
		});
	}
	fs.readdir(path, function(err, files) {
		if (err) {
			console.log("error:\n" + err);
			return;
		}
		files.forEach(function(file, index) {
			fs.stat(path + "\\" + file + '',
				function(err, stat) {
					if (err) {
						console.log(err);
						return;
					}
					if (stat.isDirectory()) {
						console.log(path + "\\" + file + "\\");
						q.push({
							name: 't' + index + file,
							run: function(nextQueueTaskCallback) {
								explorerlogoRemark(path + "\\" + file, nextQueueTaskCallback);
							}
						}, function(err) {
							console.log('t' + index + file + ' executed');
						});
						explorerlogoRemarkQueue(path + "\\" + file);
					}
				}
			);
		});
	})
}
explorerlogoRemarkQueue(initDir);