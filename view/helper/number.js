'use strict';

module.exports = helper;

function helper (register) {

    // returns previous number of tasks to render
    register('back', function (context) {
        return parseInt(context - 100);
    });

    register('forward', function (context) {
        return parseInt(context + 100);
    });

}
