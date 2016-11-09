'use strict';

module.exports = helper;

function helper (register) {

    // returns previous number of tasks to render
    register('back', function (context) {
        return parseInt(context - 100);
    });

    register('forward', function (context, totalTasks) {
        var forwardTo = parseInt(context);
        var total = parseInt(totalTasks);

        console.log("forwardTo: " + forwardTo);
        console.log("total: " + total);

        if(forwardTo + 100 > total) {
            return totalTasks;
        }

        return parseInt(context + 100);
    });

}
