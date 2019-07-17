'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _reduxForm = require('redux-form');

var state = {};

var handleDestroy = function handleDestroy(action, next) {
    state[action.meta.form] = (state[action.meta.form] || 0) - 1;

    if (state[action.meta.form] <= 0) {
        return next(action);
    }

    // Drop the action
    return false;
};

var handleInitialize = function handleInitialize(action, next) {
    state[action.meta.form] = (state[action.meta.form] || 0) + 1;
    return next(action);
};

var handleAction = function handleAction(action, next) {
    switch (action.type) {
        case _reduxForm.actionTypes.DESTROY:
            return handleDestroy(action, next);
        case _reduxForm.actionTypes.INITIALIZE:
            return handleInitialize(action, next);
        default:
            return next(action);
    }
};

/**
 * This middleware ensure redux-form does not destroy forms after they are
 * remounted. This happens in a List component with a child (Datagrid, Tree)
 * containing forms as the List component clone them at each render, triggering a
 * unmount/mount. Related to this redux-form bug:
 * https://github.com/erikras/redux-form/issues/3435#issuecomment-359371803
 */

exports.default = function () {
    return function (next) {
        return function (action) {
            return handleAction(action, next);
        };
    };
};

module.exports = exports['default'];