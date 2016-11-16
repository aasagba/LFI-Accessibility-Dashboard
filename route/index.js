// This file is part of pa11y-dashboard.
//
// pa11y-dashboard is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// pa11y-dashboard is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with pa11y-dashboard.  If not, see <http://www.gnu.org/licenses/>.

'use strict';

var presentTask = require('../view/presenter/task');
var _ = require('underscore');

module.exports = route;

// Route definition
function route (app) {
	//var model = app.model;
	var allTasks = [];
	var sortedTasks = new Array();
	var allTaskCount = 0;
	var filteredTaskCount = 0;
	var sortAsc = false;
	var sortAscError = true;
	var sortAscWarn = true;
	var sortAscNotice = true;
	var nameSortDirection = "fa-sort";
	var errorSortDirection = "fa-sort";
	var warnSortDirection = "fa-sort";
	var infoSortDirection = "fa-sort";

	var getResultById = function (task,index) {
		//console.log("in getResultById");
		return new Promise(function(resolve, reject) {
			//model.result.getByTaskId(task.id, {}, function (err, results) {
			app.webservice.task(task.id).homeresults({}, function (err, results) {
				//console.log("model.result.getByTaskId");

				if (err || !results) {
					task.last_result = null;
				}

				if (results) {
					//console.log("results returned: " + JSON.stringify(results));
					task.last_result = results[0];
				}

				resolve(task);
			});
		});
	};

	app.express.get('/client/:client', function (req, res, next) {
		var client = req.params.client;
		// reset sort order
		sortAsc = false;
		sortAscError = true;
		sortAscNotice = true;
		sortAscWarn = true;
		nameSortDirection = "fa-sort";
		errorSortDirection = "fa-sort";
		warnSortDirection = "fa-sort";
		infoSortDirection = "fa-sort";

		//console.log("client url param: " + client);
		app.webservice.tasks.get({lastres: true, client: client, skip: 0, searchTerm: " "}, function (err, tasks) {
			if (err) {
				return next(err);
			}
			var skip = req.params.skip;

			//console.log("tasks: " + JSON.stringify(tasks));
			var loadMore = tasks.length >= 100;
			//var loadPrevious = ((tasks.length - 100) - 100) > 0;
			var loadPrevious = false;
			allTasks = tasks.slice();
			allTaskCount = allTasks.length;

			//console.log("tasks length: " + tasks.length);
			allTasks = allTasks.map(getResultById);


			Promise.all(allTasks).then(function (allTasks) {
				//console.log("\n\nallTasks: " + JSON.stringify(allTasks)+"\n\n");
				sortedTasks = allTasks.slice();

				res.render('index', {
					tasks: allTasks.slice(0,100).map(presentTask),
					taskCount: allTaskCount,
					deleted: (typeof req.query.deleted !== 'undefined'),
					isHomePage: true,
					client: client,
					skip: 0,
					loadMore: loadMore,
					loadPrevious: loadPrevious,
					nameSortDirection: nameSortDirection,
					errorSortDirection: errorSortDirection,
					warnSortDirection: warnSortDirection,
					infoSortDirection: infoSortDirection
				});
			});
		});
	});

	app.express.get('/client/:client/sort/:column', function (req, res, next) {
		var client = req.params.client;
		var column = req.params.column;

		switch (column) {
			case "name":

				console.log("Sort by name");
				if(sortAsc){
					console.log("sort ascending: " + sortAsc);
					allTasks = _.sortBy(sortedTasks, function (task) {
						if (task._result != undefined) {
							return task._result.name;
						} else {
							return task.name;
						}
					});
					sortAsc = false;
				} else {
					console.log("sort descending: " + sortAsc);
					allTasks = _.sortBy(sortedTasks, function (task) {
						if (task._result != undefined) {
							return task._result.name;
						} else {
							return task.name;
						}
					}).reverse();
					sortAsc = true;
				}

				nameSortDirection = sortAsc ? 'fa-sort-desc' : 'fa-sort-asc';

				break;
			case "error":

				console.log("sortby error");

				if(sortAscError) {
					allTasks = _.sortBy(sortedTasks, function (task) {
						console.log("sortby task: " + JSON.stringify(task));

						if(task._result != undefined) {
							if (task._result.lastResult != undefined) {
								//console.log("sortby error 1: " + task._result.lastResult.count.error);
								return parseInt(task._result.lastResult.count.error, 10);
							}

							if (task._result.last_result != undefined) {
								//console.log("sortby error 2: " + task._result.last_result.count.error);
								return parseInt(task._result.last_result.count.error, 10);
							}
						} else {
							if (task.lastResult != undefined) {
								//console.log("sortby error 1: " + task.lastResult.count.error);
								return parseInt(task.lastResult.count.error,10);
							}

							if (task.last_result != undefined) {
								//console.log("sortby error 2: " + task.last_result.count.error);
								return parseInt(task.last_result.count.error,10);
							}
						}
					});
					sortAscError = false;
				} else {
					allTasks = allTasks.reverse();
					sortAscError = true;
				}

				errorSortDirection = sortAscError ? 'fa-sort-desc' : 'fa-sort-asc';

				break;
			case "warning":

				console.log("sortby warning");

				if(sortAscWarn) {
					allTasks = _.sortBy(sortedTasks, function (task) {
						console.log("sortby task: " + JSON.stringify(task));

						if(task._result != undefined) {
							if (task._result.lastResult != undefined) {
								//console.log("sortby error 1: " + task._result.lastResult.count.warning);
								return parseInt(task._result.lastResult.count.warning,10);
							}

							if (task._result.last_result != undefined) {
								//console.log("sortby error 2: " + task._result.last_result.count.warning);
								return parseInt(task._result.last_result.count.warning,10);
							}
						} else {
							if (task.lastResult != undefined) {
								//console.log("sortby error 1: " + task.lastResult.count.warning);
								return parseInt(task.lastResult.count.warning,10);
							}

							if (task.last_result != undefined) {
								//console.log("sortby error 2: " + task.last_result.count.warning);
								return parseInt(task.last_result.count.warning,10);
							}
						}
					});
					sortAscWarn = false;
				} else {
					allTasks = allTasks.reverse();
					sortAscWarn = true;
				}

				warnSortDirection = sortAscWarn ? 'fa-sort-desc' : 'fa-sort-asc';

				break;
			case "notice":

				console.log("sortby notice");

				if(sortAscNotice) {
					allTasks = _.sortBy(sortedTasks, function (task) {
						console.log("sortby task: " + JSON.stringify(task));

						if(task._result != undefined) {
							if (task._result.lastResult != undefined) {
								//console.log("sortby error 1: " + task._result.lastResult.count.notice);
								return parseInt(task._result.lastResult.count.notice, 10);
							}

							if (task._result.last_result != undefined) {
								//console.log("sortby error 2: " + task._result.last_result.count.notice);
								return parseInt(task._result.last_result.count.notice, 10);
							}
						} else {
							if (task.lastResult != undefined) {
								//console.log("sortby error 1: " + task.lastResult.count.notice);
								return parseInt(task.lastResult.count.notice, 10);
							}

							if (task.last_result != undefined) {
								//console.log("sortby error 2: " + task.last_result.count.notice);
								return parseInt(task.last_result.count.notice, 10);
							}
						}

					});
					sortAscNotice = false;
				} else {
					allTasks = allTasks.reverse();
					sortAscNotice = true;
				}

				infoSortDirection = sortAscNotice ? 'fa-sort-desc' : 'fa-sort-asc';

				break;
			default:
				console.log("Error filter " + column + " does not exist!");
		}

		Promise.all(allTasks).then(function (allTasks) {

			var loadMore = allTasks.length >= 100;
			var loadPrevious = ((allTasks.length - 100) - 100) > 0;
			sortedTasks = allTasks;
			var slice = [];
			slice = allTasks.slice(0,100);
			allTaskCount = sortedTasks.length;

			res.render('index', {
				tasks: slice.map(presentTask),
				taskCount: allTaskCount,
				deleted: (typeof req.query.deleted !== 'undefined'),
				isHomePage: true,
				client: client,
				skip: 0,
				loadMore: loadMore,
				loadPrevious: loadPrevious,
				nameSortDirection: nameSortDirection,
				errorSortDirection: errorSortDirection,
				warnSortDirection: warnSortDirection,
				infoSortDirection: infoSortDirection
			});
		});
	});

	// filter route
	app.express.get('/client/:client/filter/:term', function (req, res, next) {
		var client = req.params.client;
		var searchTerm = req.params.term;

		if(searchTerm === "") {searchTerm = " "}

		//console.log("client url param: " + client);
		console.log("Search Term: " + searchTerm);

		// TEST filter allTasks array
		var filtered = _.filter(sortedTasks, function(task, index) {
			//console.log("task: " + JSON.stringify(task));

			if (task._result !== undefined && task._result.name.toLowerCase().match(searchTerm.toLowerCase())) {
				//console.log("contains");
				return task;
			} else if (task.name !== undefined && task.name.toLowerCase().match(searchTerm.toLowerCase())) {
				//console.log("contains");
				return task;
			}
		});

		//console.log("allTasks: " + allTasks.length);
		//console.log("filtered: " + JSON.stringify(filtered));
		//console.log("filtered length: " + filtered.length);
		//filtered = filtered.map(getResultById);
		//console.log("filtered and results: " + JSON.stringify(filtered));

		var loadMore = filtered.length >= 100;
		var loadPrevious = ((filtered.length - 100) - 100) > 0;

		Promise.all(filtered).then(function (filtered) {

			// store filtered in global array
			sortedTasks = filtered;
			allTaskCount = sortedTasks.length;

			// render first 100 filtered results
			var filtered = filtered.slice(0,100);

			res.render('index', {
				tasks: filtered.map(presentTask),
				taskCount: allTaskCount,
				deleted: (typeof req.query.deleted !== 'undefined'),
				isHomePage: true,
				client: client,
				skip: 0,
				loadMore: loadMore,
				loadPrevious: loadPrevious,
				nameSortDirection: nameSortDirection,
				errorSortDirection: errorSortDirection,
				warnSortDirection: warnSortDirection,
				infoSortDirection: infoSortDirection
			});
		});
	});

	app.express.get('/client/:client/results/:skip', function (req, res, next) {
		var client = req.params.client;
		var skip = parseInt(req.params.skip) || 0;

		var currentTasks = sortedTasks.slice(skip, skip + 100);
		//console.log("tasks length: " + tasks.length);
		//currentTasks = currentTasks.map(getResultById);
		//console.log("allTasks in skip: " + sortedTasks.length);

		var loadMore = currentTasks.length >= 100;
		var loadPrevious = (skip - 100) >= 0;

		Promise.all(currentTasks).then(function (currentTasks) {
			res.render('index', {
				tasks: currentTasks.map(presentTask),
				taskCount: allTaskCount,
				deleted: (typeof req.query.deleted !== 'undefined'),
				isHomePage: true,
				client: client,
				skip: skip,
				loadMore: loadMore,
				loadPrevious: loadPrevious,
				nameSortDirection: nameSortDirection,
				errorSortDirection: errorSortDirection,
				warnSortDirection: warnSortDirection,
				infoSortDirection: infoSortDirection
			});
		});
	});
}



