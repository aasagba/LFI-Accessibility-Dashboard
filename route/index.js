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

module.exports = route;

// Route definition
function route (app) {
	app.express.get('/client/:client', function (req, res, next) {
		var client = req.params.client;


		//console.log("client url param: " + client);

		app.webservice.tasks.get({lastres: true, client: client, skip: 0, searchTerm: " "}, function (err, tasks) {
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
		});
	});

	// filter route
	app.express.get('/client/:client/filter/:term', function (req, res, next) {
		var client = req.params.client;
		var searchTerm = req.params.term;

		if(searchTerm === "") {searchTerm = " "}

		//console.log("client url param: " + client);
		//console.log("Search Term: " + searchTerm);

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
		});
	});

	app.express.get('/client/:client/results/:skip', function (req, res, next) {
		var client = req.params.client;
		var skip = parseInt(req.params.skip) || 0;

		/*if (skip === 0) {
			skip += 100;
		}*/

		//console.log("client url param: " + client);
		//console.log("skip url param: " + skip);

		app.webservice.tasks.get({lastres: true, client: client, skip: skip, searchTerm: " "}, function (err, tasks) {
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
		});
	});
}



