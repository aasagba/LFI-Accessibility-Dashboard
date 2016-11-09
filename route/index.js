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
	var allTaskCount = 0;

	var getResultById = function (task,index) {
		//console.log("in getResultById");
		return new Promise(function(resolve, reject) {
			//model.result.getByTaskId(task.id, {}, function (err, results) {
			app.webservice.task(task.id).results({}, function (err, results) {
				//console.log("model.result.getByTaskId");

				if (err || !results) {
					task.last_result = null;
				}

				if (results) {
					console.log("results returned: " + JSON.stringify(results));
					task.last_result = results[0];
				}

				resolve(task);
			});
		});
	};

	app.express.get('/client/:client', function (req, res, next) {
		var client = req.params.client;


		//console.log("client url param: " + client);

		app.webservice.tasks.get({lastres: true, client: client, skip: 0, searchTerm: " "}, function (err, tasks) {
			if (err) {
				return next(err);
			}
			//console.log("tasks: " + JSON.stringify(tasks));
			var loadMore = tasks.length >= 100;
			var loadPrevious = ((tasks.length - 100) - 100) > 0;
			allTasks = tasks;
			allTaskCount = allTasks.length;

			// *** TEST loop tasks and get results for first 100
			// get all tasks but results for first 100
				var currentTasks = tasks.slice(0,100);
				console.log("tasks length: " + tasks.length);
				currentTasks = currentTasks.map(getResultById);


				Promise.all(currentTasks).then(function (currentTasks) {
					res.render('index', {
						tasks: currentTasks.map(presentTask),
						taskCount: allTaskCount,
						deleted: (typeof req.query.deleted !== 'undefined'),
						isHomePage: true,
						client: client,
						skip: 0,
						loadMore: loadMore,
						loadPrevious: loadPrevious
					});
				});

			// *** TEST loop task and get results

			//console.log("Tasks returned from webservice: " + tasks.length);
			//console.log("Loadmore: " + loadMore);
			//console.log("Loadprevious: " + loadPrevious);
			//console.log("map tasks: " + JSON.stringify(tasks));
			/*
			res.render('index', {
				tasks: tasks.map(presentTask),
				deleted: (typeof req.query.deleted !== 'undefined'),
				isHomePage: true,
				client: client,
				skip: 0,
				loadMore: loadMore,
				loadPrevious: loadPrevious
			});
			*/
		});
	});

	app.express.get('/client/:client/sort/:column', function (req, res, next) {
		var client = req.params.client;
		var column = req.params.column;

		if (column == "name") {
			var sortedTasks = _.sortBy(allTasks, column);
			sortedTasks.reverse();
		} else if (column == "error") {
			console.log("sortby error");
			var sortedTasks = _.sortBy(allTasks, function (task) {
				if (task.count != undefined) {
					console.log("sortby error: " + task.count.error);
					return parseInt(task.count.error);
				}
			});
		}

		var loadMore = sortedTasks.length >= 100;
		var loadPrevious = ((sortedTasks.length - 100) - 100) > 0;

		res.render('index', {
			tasks: sortedTasks.map(presentTask),
			taskCount: allTaskCount,
			deleted: (typeof req.query.deleted !== 'undefined'),
			isHomePage: true,
			client: client,
			skip: 0,
			loadMore: loadMore,
			loadPrevious: loadPrevious
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
		var filtered = _.filter(allTasks, function(task, index) {
			console.log("task: " + JSON.stringify(task));

			if (task.name !== undefined && task.name.toLowerCase().match(searchTerm.toLowerCase())) {
				console.log("contains");
				return task;
			}
		});

		console.log("allTasks: " + allTasks.length);
		console.log("filtered: " + JSON.stringify(filtered));
		console.log("filtered length: " + filtered.length);
		filtered = filtered.map(getResultById);
		console.log("filtered and results: " + JSON.stringify(filtered));

		var loadMore = filtered.length >= 100;
		var loadPrevious = ((filtered.length - 100) - 100) > 0;

		Promise.all(filtered).then(function (filtered) {

			// store filtered in global array
			allTasks = filtered;
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
				loadPrevious: loadPrevious
			});
		});
		// TEST filter allTasks array

		/*
		app.webservice.tasks.get({lastres: true, client: client, skip: 0, searchTerm: searchTerm}, function (err, tasks) {
			if (err) {
				return next(err);
			}
			var loadMore = tasks.length >= 100;
			var loadPrevious = ((tasks.length - 100) - 100) > 0;

			//console.log("Tasks returned from webservice: " + tasks.length);
			//console.log("Loadmore: " + loadMore);
			//console.log("Loadprevious: " + loadPrevious);

			res.render('index', {
				tasks: tasks.map(presentTask),
				deleted: (typeof req.query.deleted !== 'undefined'),
				isHomePage: true,
				client: client,
				skip: 0,
				loadMore: loadMore,
				loadPrevious: loadPrevious
			});
		});*/
	});

	app.express.get('/client/:client/results/:skip', function (req, res, next) {
		var client = req.params.client;
		var skip = parseInt(req.params.skip) || 0;

		var currentTasks = allTasks.slice(skip, skip + 100);
		//console.log("tasks length: " + tasks.length);
		currentTasks = currentTasks.map(getResultById);
		console.log("allTasks in skip: " + allTasks.length);

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
				loadPrevious: loadPrevious
			});
		});

		/*if (skip === 0) {
			skip += 100;
		}*/

		//console.log("client url param: " + client);
		//console.log("skip url param: " + skip);

		/*app.webservice.tasks.get({lastres: true, client: client, skip: skip, searchTerm: " "}, function (err, tasks) {
			if (err) {
				return next(err);
			}
			//console.log("Tasks returned from webservice: " + tasks.length);
			var loadMore = tasks.length >= 100;
			var loadPrevious = (skip - 100) >= 0;
			//console.log("Loadprevious: " + loadPrevious);

			res.render('index', {
				tasks: tasks.map(presentTask),
				deleted: (typeof req.query.deleted !== 'undefined'),
				isHomePage: true,
				client: client,
				skip: skip,
				loadMore: loadMore,
				loadPrevious: loadPrevious
			});
		});*/
	});
}



