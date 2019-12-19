"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = initStore;

var _react = _interopRequireDefault(require("react"));

var _hoistNonReactStatics = _interopRequireDefault(require("hoist-non-react-statics"));

var _propTypes = _interopRequireDefault(require("prop-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var useReducer = _react["default"].useReducer,
    useContext = _react["default"].useContext,
    useMemo = _react["default"].useMemo; // reax: 创建一个小型的store

function initStore(options) {
  var _ref = options || {},
      getInitState = _ref.getInitState,
      _ref$mutations = _ref.mutations,
      mutations = _ref$mutations === void 0 ? {} : _ref$mutations,
      _ref$actions = _ref.actions,
      rawActions = _ref$actions === void 0 ? {} : _ref$actions,
      _ref$getters = _ref.getters,
      rawGetters = _ref$getters === void 0 ? {} : _ref$getters;

  mixinMutations(mutations);

  var reducer = function reducer(state, action) {
    var type = action.type,
        payload = action.payload;
    var mutation = mutations[type]; // 用于开发环境时提示拼写错误，可以不计入测试覆盖率

    /* istanbul ignore if */

    if (typeof mutation !== 'function') {
      typeError(type);
    }

    return mutation(state, payload);
  };

  var Context = _react["default"].createContext(null);

  var Provider = function Provider(props) {
    var children = props.children;

    var _useReducer = useReducer(reducer, undefined, getInitState),
        _useReducer2 = _slicedToArray(_useReducer, 2),
        state = _useReducer2[0],
        dispatch = _useReducer2[1]; // 计算一把computed


    var computedGetters = useMemo(function () {
      return initGetter(rawGetters, state);
    }, [state]); // 让actions执行前后改变loading

    var actions = useMemo(function () {
      return initActions(rawActions, dispatch);
    }, []);
    var dispatchAction = useMemo(function () {
      return initDispatchAction(dispatch, actions, state, computedGetters);
    }, [actions, computedGetters, state]); // dispatchAction没法做到引用保持不变 所以挂到dispatch上
    // 这样用户使用useEffect把dispatch作为依赖 就不会造成无限更新

    var withDispatchAction = dispatch;
    withDispatchAction.action = dispatchAction; // 重命名state 用于强制推断类型

    var reducerState = state; // 给loadingMap加上一些api

    var enhancedState = enhanceLoadingMap(reducerState);
    return _react["default"].createElement(Context.Provider, {
      value: {
        state: enhancedState,
        dispatch: withDispatchAction,
        getters: computedGetters
      }
    }, children);
  };

  Provider.propTypes = {
    children: _propTypes["default"].element.isRequired
  };

  var connect = function connect(Component) {
    var WrapWithProvider = function WrapWithProvider(props) {
      return _react["default"].createElement(Provider, null, _react["default"].createElement(Component, Object.assign({}, props)));
    }; // 加上displayName
    // 拷贝静态属性


    return argumentContainer(WrapWithProvider, Component);
  };

  var useStore = function useStore() {
    return useContext(Context);
  };

  return {
    connect: connect,
    useStore: useStore
  };
}

var CHANGE_LOADING = '@@changeLoadingState'; // 加入改变loading状态的方法

function mixinMutations(mutations) {
  return Object.assign(mutations, _defineProperty({}, CHANGE_LOADING, function (state, payload) {
    var actionKey = payload.actionKey,
        isLoading = payload.isLoading;
    var loadingMap = state.loadingMap;

    var newLoadingMap = _objectSpread({}, loadingMap, _defineProperty({}, actionKey, isLoading));

    return _objectSpread({}, state, {
      loadingMap: newLoadingMap
    });
  }));
} // 通过最新的state把getter计算出来


function initGetter(rawGetters, state) {
  var getters = {};
  var rawGetterKeys = Object.keys(rawGetters);
  rawGetterKeys.forEach(function (rawGetterKey) {
    var rawGetter = rawGetters[rawGetterKey];
    var result = rawGetter(state);
    getters[rawGetterKey] = result;
  });
  return getters;
} // 劫持原有的action方法 在action执行前后更改loading状态


function initActions(rawActions, dispatch) {
  var changeLoading = function changeLoading(actionKey, isLoading) {
    return dispatch({
      type: CHANGE_LOADING,
      payload: {
        isLoading: isLoading,
        actionKey: actionKey
      }
    });
  };

  var actions = {};
  var rawActionKeys = Object.keys(rawActions);
  rawActionKeys.forEach(function (rawActionKey) {
    actions[rawActionKey] =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      var result,
          _args = arguments;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              changeLoading(rawActionKey, true);
              _context.next = 3;
              return rawActions[rawActionKey].apply(rawActions, _args);

            case 3:
              result = _context.sent;
              changeLoading(rawActionKey, false);
              return _context.abrupt("return", result);

            case 6:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
  });
  return actions;
} // dispatch actions里的方法
// 返回promise


function initDispatchAction(dispatch, actions, state, getters) {
  return function (_ref3) {
    var type = _ref3.type,
        payload = _ref3.payload;
    return new Promise(function (resolve, reject) {
      if (typeof actions[type] === 'function') {
        actions[type]({
          dispatch: dispatch,
          state: state,
          getters: getters
        }, payload).then(resolve);
      } else {
        typeError(type);
      }
    });
  };
}

function enhanceLoadingMap(state) {
  if (state) {
    if (!state.loadingMap) {
      state.loadingMap = {};
    }

    var loadingMap = state.loadingMap;

    loadingMap.any = function (keys) {
      keys = Array.isArray(keys) ? keys : [keys];
      return keys.some(function (key) {
        return !!loadingMap[key];
      });
    };

    return state;
  }
}

function typeError(type) {
  throw new Error("error action type:".concat(type));
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'WrappedComponent';
}

function argumentContainer(Container, WrappedComponent) {
  // 给组件增加displayName
  Container.displayName = "Store(".concat(getDisplayName(WrappedComponent), ")"); // 增加被包裹组件的引用

  Container.WrappedComponent = WrappedComponent;
  return (0, _hoistNonReactStatics["default"])(Container, WrappedComponent);
}