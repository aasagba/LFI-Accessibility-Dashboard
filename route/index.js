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
		console.log("client url param: " + client);

		app.webservice.tasks.get({lastres: true}, function (err, tasks) {
			if (err) {
				return next(err);
			}
			var i;
			var length = tasks.length;

			//console.log("tasks: " + JSON.stringify(tasks));
			// "http://littleforest.co.uk"
			//client = "http://" + client;
			console.log("client id: " + client);

			var clientTasks = [];
			for (i=0; i<length;i++) {
				//console.log("task: " + JSON.stringify(tasks[i]));
				//console.log("url: " + JSON.stringify(tasks[i].url));
				//console.log("client id: " + JSON.stringify(tasks[i].client));
				if (tasks[i].client === client) {
					clientTasks.push(tasks[i]);
				}
			}

			//console.log("clientTasks: " + JSON.stringify(clientTasks));

			res.render('index', {
				tasks: clientTasks.map(presentTask),
				deleted: (typeof req.query.deleted !== 'undefined'),
				isHomePage: true,
				client: client
			});
		});
	});
}
