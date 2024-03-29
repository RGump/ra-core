'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.sanitizeListRestProps = exports.getListControllerProps = exports.ListController = undefined;

var _extends5 = require('babel-runtime/helpers/extends');

var _extends6 = _interopRequireDefault(_extends5);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _queryString = require('query-string');

var _reactRouterRedux = require('react-router-redux');

var _compose = require('recompose/compose');

var _compose2 = _interopRequireDefault(_compose);

var _reselect = require('reselect');

var _inflection = require('inflection');

var _inflection2 = _interopRequireDefault(_inflection);

var _debounce = require('lodash/debounce');

var _debounce2 = _interopRequireDefault(_debounce);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _pickBy = require('lodash/pickBy');

var _pickBy2 = _interopRequireDefault(_pickBy);

var _removeEmpty = require('../util/removeEmpty');

var _removeEmpty2 = _interopRequireDefault(_removeEmpty);

var _queryReducer = require('../reducer/admin/resource/list/queryReducer');

var _queryReducer2 = _interopRequireDefault(_queryReducer);

var _dataActions = require('../actions/dataActions');

var _listActions = require('../actions/listActions');

var _translate = require('../i18n/translate');

var _translate2 = _interopRequireDefault(_translate);

var _removeKey = require('../util/removeKey');

var _removeKey2 = _interopRequireDefault(_removeKey);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * List page component
 *
 * The <List> component renders the list layout (title, buttons, filters, pagination),
 * and fetches the list of records from the REST API.
 * It then delegates the rendering of the list of records to its child component.
 * Usually, it's a <Datagrid>, responsible for displaying a table with one row for each post.
 *
 * In Redux terms, <List> is a connected component, and <Datagrid> is a dumb component.
 *
 * Props:
 *   - title
 *   - perPage
 *   - sort
 *   - filter (the permanent filter to apply to the query)
 *   - actions
 *   - filters (a React Element used to display the filter form)
 *   - pagination
 *
 * @example
 *     const PostFilter = (props) => (
 *         <Filter {...props}>
 *             <TextInput label="Search" source="q" alwaysOn />
 *             <TextInput label="Title" source="title" />
 *         </Filter>
 *     );
 *     export const PostList = (props) => (
 *         <List {...props}
 *             title="List of posts"
 *             sort={{ field: 'published_at' }}
 *             filter={{ is_published: true }}
 *             filters={<PostFilter />}
 *         >
 *             <Datagrid>
 *                 <TextField source="id" />
 *                 <TextField source="title" />
 *                 <EditButton />
 *             </Datagrid>
 *         </List>
 *     );
 */
var ListController = exports.ListController = function (_Component) {
    (0, _inherits3.default)(ListController, _Component);

    function ListController() {
        var _ref;

        var _temp, _this, _ret;

        (0, _classCallCheck3.default)(this, ListController);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = ListController.__proto__ || Object.getPrototypeOf(ListController)).call.apply(_ref, [this].concat(args))), _this), _this.state = {}, _this.setSort = function (sort) {
            return _this.changeParams({ type: _queryReducer.SET_SORT, payload: sort });
        }, _this.setPage = function (page) {
            return _this.changeParams({ type: _queryReducer.SET_PAGE, payload: page });
        }, _this.setPerPage = function (perPage) {
            return _this.changeParams({ type: _queryReducer.SET_PER_PAGE, payload: perPage });
        }, _this.setFilters = (0, _debounce2.default)(function (filters) {
            if ((0, _isEqual2.default)(filters, _this.props.filterValues)) {
                return;
            }

            // fix for redux-form bug with onChange and enableReinitialize
            var filtersWithoutEmpty = (0, _removeEmpty2.default)(filters);
            _this.changeParams({ type: _queryReducer.SET_FILTER, payload: filtersWithoutEmpty });
        }, _this.props.debounce), _this.showFilter = function (filterName, defaultValue) {
            _this.setState((0, _defineProperty3.default)({}, filterName, true));
            if (typeof defaultValue !== 'undefined') {
                _this.setFilters((0, _extends6.default)({}, _this.props.filterValues, (0, _defineProperty3.default)({}, filterName, defaultValue)));
            }
        }, _this.hideFilter = function (filterName) {
            _this.setState((0, _defineProperty3.default)({}, filterName, false));
            var newFilters = (0, _removeKey2.default)(_this.props.filterValues, filterName);
            _this.setFilters(newFilters);
        }, _this.handleSelect = function (ids) {
            _this.props.setSelectedIds(_this.props.resource, ids);
        }, _this.handleUnselectItems = function () {
            _this.props.setSelectedIds(_this.props.resource, []);
        }, _this.handleToggleItem = function (id) {
            _this.props.toggleItem(_this.props.resource, id);
        }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
    }

    (0, _createClass3.default)(ListController, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (!this.props.query.page && !(this.props.ids || []).length && this.props.params.page > 1 && this.props.total > 0) {
                this.setPage(this.props.params.page - 1);
                return;
            }

            this.updateData();
            if (Object.keys(this.props.query).length > 0) {
                this.props.changeListParams(this.props.resource, this.props.query);
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.setFilters.cancel();
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.resource !== this.props.resource || nextProps.query.sort !== this.props.query.sort || nextProps.query.order !== this.props.query.order || nextProps.query.page !== this.props.query.page || nextProps.query.filter !== this.props.query.filter) {
                this.updateData(Object.keys(nextProps.query).length > 0 ? nextProps.query : nextProps.params);
            }
            if (nextProps.version !== this.props.version) {
                this.updateData();
            }
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
            if (nextProps.translate === this.props.translate && nextProps.isLoading === this.props.isLoading && nextProps.version === this.props.version && nextState === this.state && nextProps.data === this.props.data && nextProps.selectedIds === this.props.selectedIds && nextProps.total === this.props.total) {
                return false;
            }
            return true;
        }

        /**
         * Merge list params from 4 different sources:
         *   - the query string
         *   - the params stored in the state (from previous navigation)
         *   - the filter defaultValues
         *   - the props passed to the List component
         */

    }, {
        key: 'getQuery',
        value: function getQuery() {
            var query = Object.keys(this.props.query).length > 0 ? this.props.query : (0, _extends6.default)({}, this.props.params);
            var filterDefaultValues = this.props.filterDefaultValues || {};

            query.filter = (0, _extends6.default)({}, filterDefaultValues, query.filter);

            if (!query.sort) {
                query.sort = this.props.sort.field;
                query.order = this.props.sort.order;
            }
            if (!query.perPage) {
                query.perPage = this.props.perPage;
            }
            if (!query.page) {
                query.page = 1;
            }
            return query;
        }
    }, {
        key: 'updateData',
        value: function updateData(query) {
            var params = query || this.getQuery();
            var sort = params.sort,
                order = params.order,
                _params$page = params.page,
                page = _params$page === undefined ? 1 : _params$page,
                perPage = params.perPage,
                filter = params.filter;

            var pagination = {
                page: parseInt(page, 10),
                perPage: parseInt(perPage, 10)
            };
            var permanentFilter = this.props.filter;
            this.props.crudGetList(this.props.resource, pagination, { field: sort, order: order }, (0, _extends6.default)({}, filter, permanentFilter));
        }
    }, {
        key: 'changeParams',
        value: function changeParams(action) {
            var newParams = (0, _queryReducer2.default)(this.getQuery(), action);
            this.props.push((0, _extends6.default)({}, this.props.location, {
                search: '?' + (0, _queryString.stringify)((0, _extends6.default)({}, newParams, {
                    filter: JSON.stringify(newParams.filter)
                }))
            }));
            this.props.changeListParams(this.props.resource, newParams);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                basePath = _props.basePath,
                children = _props.children,
                resource = _props.resource,
                hasCreate = _props.hasCreate,
                data = _props.data,
                ids = _props.ids,
                total = _props.total,
                isLoading = _props.isLoading,
                translate = _props.translate,
                version = _props.version,
                selectedIds = _props.selectedIds;

            var query = this.getQuery();

            var queryFilterValues = query.filter || {};

            var resourceName = translate('resources.' + resource + '.name', {
                smart_count: 2,
                _: _inflection2.default.humanize(_inflection2.default.pluralize(resource))
            });
            var defaultTitle = translate('ra.page.list', {
                name: '' + resourceName
            });

            return children({
                basePath: basePath,
                currentSort: {
                    field: query.sort,
                    order: query.order
                },
                data: data,
                defaultTitle: defaultTitle,
                displayedFilters: this.state,
                filterValues: queryFilterValues,
                hasCreate: hasCreate,
                hideFilter: this.hideFilter,
                ids: ids,
                isLoading: isLoading,
                onSelect: this.handleSelect,
                onToggleItem: this.handleToggleItem,
                onUnselectItems: this.handleUnselectItems,
                page: parseInt(query.page || 1, 10),
                perPage: parseInt(query.perPage, 10),
                refresh: this.refresh,
                resource: resource,
                selectedIds: selectedIds,
                setFilters: this.setFilters,
                setPage: this.setPage,
                setPerPage: this.setPerPage,
                setSort: this.setSort,
                showFilter: this.showFilter,
                translate: translate,
                total: total,
                version: version
            });
        }
    }]);
    return ListController;
}(_react.Component); /* eslint no-console: ["error", { allow: ["warn", "error"] }] */


ListController.propTypes = {
    // the props you can change
    children: _propTypes2.default.func.isRequired,
    filter: _propTypes2.default.object,
    filters: _propTypes2.default.element,
    filterDefaultValues: _propTypes2.default.object, // eslint-disable-line react/forbid-prop-types
    pagination: _propTypes2.default.element,
    perPage: _propTypes2.default.number.isRequired,
    sort: _propTypes2.default.shape({
        field: _propTypes2.default.string,
        order: _propTypes2.default.string
    }),
    // the props managed by react-admin
    authProvider: _propTypes2.default.func,
    basePath: _propTypes2.default.string.isRequired,
    changeListParams: _propTypes2.default.func.isRequired,
    crudGetList: _propTypes2.default.func.isRequired,
    data: _propTypes2.default.object, // eslint-disable-line react/forbid-prop-types
    debounce: _propTypes2.default.number,
    filterValues: _propTypes2.default.object, // eslint-disable-line react/forbid-prop-types
    hasCreate: _propTypes2.default.bool.isRequired,
    hasEdit: _propTypes2.default.bool.isRequired,
    hasList: _propTypes2.default.bool.isRequired,
    hasShow: _propTypes2.default.bool.isRequired,
    ids: _propTypes2.default.array,
    selectedIds: _propTypes2.default.array,
    isLoading: _propTypes2.default.bool.isRequired,
    location: _propTypes2.default.object.isRequired,
    path: _propTypes2.default.string,
    params: _propTypes2.default.object.isRequired,
    push: _propTypes2.default.func.isRequired,
    query: _propTypes2.default.object.isRequired,
    resource: _propTypes2.default.string.isRequired,
    setSelectedIds: _propTypes2.default.func.isRequired,
    toggleItem: _propTypes2.default.func.isRequired,
    total: _propTypes2.default.number.isRequired,
    translate: _propTypes2.default.func.isRequired,
    version: _propTypes2.default.number
};

ListController.defaultProps = {
    debounce: 500,
    filter: {},
    filterValues: {},
    perPage: 10,
    sort: {
        field: 'id',
        order: _queryReducer.SORT_DESC
    }
};

var injectedProps = ['basePath', 'currentSort', 'data', 'defaultTitle', 'displayedFilters', 'filterValues', 'hasCreate', 'hideFilter', 'ids', 'isLoading', 'onSelect', 'onToggleItem', 'onUnselectItems', 'page', 'perPage', 'refresh', 'resource', 'selectedIds', 'setFilters', 'setPage', 'setPerPage', 'setSort', 'showFilter', 'total', 'translate', 'version'];

/**
 * Select the props injected by the ListController
 * to be passed to the List children need
 * This is an implementation of pick()
 */
var getListControllerProps = exports.getListControllerProps = function getListControllerProps(props) {
    return injectedProps.reduce(function (acc, key) {
        return (0, _extends6.default)({}, acc, (0, _defineProperty3.default)({}, key, props[key]));
    }, {});
};

/**
 * Select the props not injected by the ListController
 * to be used inside the List children to sanitize props injected by List
 * This is an implementation of omit()
 */
var sanitizeListRestProps = exports.sanitizeListRestProps = function sanitizeListRestProps(props) {
    return Object.keys(props).filter(function (props) {
        return !injectedProps.includes(props);
    }).reduce(function (acc, key) {
        return (0, _extends6.default)({}, acc, (0, _defineProperty3.default)({}, key, props[key]));
    }, {});
};

var validQueryParams = ['page', 'perPage', 'sort', 'order', 'filter'];
var getLocationPath = function getLocationPath(props) {
    return props.location.pathname;
};
var getLocationSearch = function getLocationSearch(props) {
    return props.location.search;
};
var selectQuery = (0, _reselect.createSelector)(getLocationPath, getLocationSearch, function (path, search) {
    var query = (0, _pickBy2.default)((0, _queryString.parse)(search), function (v, k) {
        return validQueryParams.indexOf(k) !== -1;
    });
    if (query.filter && typeof query.filter === 'string') {
        try {
            query.filter = JSON.parse(query.filter);
        } catch (err) {
            delete query.filter;
        }
    }
    return query;
});

function mapStateToProps(state, props) {
    var resourceState = state.admin.resources[props.resource];

    return {
        query: selectQuery(props),
        params: resourceState.list.params,
        ids: resourceState.list.ids,
        selectedIds: resourceState.list.selectedIds,
        total: resourceState.list.total,
        data: resourceState.data,
        isLoading: state.admin.loading > 0,
        filterValues: resourceState.list.params.filter,
        version: state.admin.ui.viewVersion
    };
}

exports.default = (0, _compose2.default)((0, _reactRedux.connect)(mapStateToProps, {
    crudGetList: _dataActions.crudGetList,
    changeListParams: _listActions.changeListParams,
    setSelectedIds: _listActions.setListSelectedIds,
    toggleItem: _listActions.toggleListItem,
    push: _reactRouterRedux.push
}), _translate2.default)(ListController);