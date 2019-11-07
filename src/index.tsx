import React from 'react'
import hoistStatics from 'hoist-non-react-statics'
import propTypes from 'prop-types'
import {
  IState,
  IGetters,
  ILoadingMap,
  IOptions,
  IConnect,
  ICreated,
  IDispatchArgs,
  IDispatch,
  IContext,
  IGettersOption,
} from './types'

const { useReducer, useContext, useMemo } = React
// reax: 创建一个小型的store
export default function initStore<State extends {}> (
  options?: IOptions<State>
) {
  const {
    initState = {} as State,
    mutations = {},
    actions: rawActions = {},
    getters: rawGetters = {},
  } = options || {}

  const stateWithLoadingMap = mixinState<State>(initState)
  mixinMutations(mutations)

  const reducer = (state: State, action: IDispatchArgs) => {
    const { type, payload } = action
    const mutation = mutations[type]
    // 用于开发环境时提示拼写错误，可以不计入测试覆盖率
    /* istanbul ignore if */
    if (typeof mutation !== 'function') {
      typeError(type)
    }
    return mutation(state, payload)
  }
  const Context = React.createContext<IContext<IState<State>>>(null)
  const Provider = (props: any) => {
    const { children } = props
    const [state, dispatch] = useReducer(reducer, stateWithLoadingMap)
    // 计算一把computed
    const computedGetters = useMemo(() => initGetter<State>(rawGetters, state), [state])
    // 让actions执行前后改变loading
    const actions = useMemo(() => initActions(rawActions, dispatch), [])
    const dispatchAction = useMemo(
      () => initDispatchAction(dispatch, actions, state, computedGetters),
      [actions, computedGetters, state]
    )
    // dispatchAction没法做到引用保持不变 所以挂到dispatch上
    // 这样用户使用useEffect把dispatch作为依赖 就不会造成无限更新
    const withDispatchAction: IDispatch = dispatch as any
    withDispatchAction.action = dispatchAction

    // 重命名state 用于强制推断类型
    const reducerState: IState<State> = state as any
    // 给loadingMap加上一些api
    enhanceLoadingMap(reducerState.loadingMap)
    return (
      <Context.Provider
        value={{
          state: reducerState,
          dispatch: withDispatchAction,
          getters: computedGetters,
        }}
      >
        {children}
      </Context.Provider>
    )
  }

  Provider.propTypes = {
    children: propTypes.element.isRequired,
  }

  const connect: IConnect = Component => {
    const WrapWithProvider = (props: any) => (
      <Provider>
        <Component {...props} />
      </Provider>
    )

    // 加上displayName
    // 拷贝静态属性
    return argumentContainer(WrapWithProvider, Component)
  }

  const useStore = () => useContext(Context)
  return { connect, useStore }
}

// 加入loadingMap
// 通过action的key可以读取到action是否正在执行
function mixinState<State>(state: State): IState<State> {
  const loadingMap = Object.create(null)
  return Object.assign(state, { loadingMap })
}

const CHANGE_LOADING = '@@changeLoadingState'

// 加入改变loading状态的方法
function mixinMutations(mutations) {
  return Object.assign(mutations, {
    [CHANGE_LOADING](state, payload) {
      const { actionKey, isLoading } = payload
      const { loadingMap } = state
      const newLoadingMap = {
        ...loadingMap,
        [actionKey]: isLoading,
      }
      return {
        ...state,
        loadingMap: newLoadingMap,
      }
    },
  })
}

// 通过最新的state把getter计算出来
function initGetter<State>(rawGetters: IGettersOption<State>, state: State): IGetters<IGettersOption<State>> {
  const getters = {}
  const rawGetterKeys = Object.keys(rawGetters)
  rawGetterKeys.forEach(rawGetterKey => {
    const rawGetter = rawGetters[rawGetterKey]
    const result = rawGetter(state)
    getters[rawGetterKey] = result
  })
  return getters as IGetters<IGettersOption<State>>
}

// 劫持原有的action方法 在action执行前后更改loading状态
function initActions(rawActions, dispatch) {
  const changeLoading = (actionKey, isLoading) =>
    dispatch({
      type: CHANGE_LOADING,
      payload: {
        isLoading,
        actionKey,
      },
    })
  const actions = {}
  const rawActionKeys = Object.keys(rawActions)
  rawActionKeys.forEach(rawActionKey => {
    actions[rawActionKey] = async (...actionArgs) => {
      changeLoading(rawActionKey, true)
      const result = await rawActions[rawActionKey](...actionArgs)
      changeLoading(rawActionKey, false)
      return result
    }
  })

  return actions
}

// dispatch actions里的方法
// 返回promise
function initDispatchAction(dispatch, actions, state, getters) {
  return ({ type, payload }) =>
    new Promise((resolve, reject) => {
      if (typeof actions[type] === 'function') {
        actions[type]({ dispatch, state, getters }, payload).then(resolve)
      } else {
        typeError(type)
      }
    })
}

function enhanceLoadingMap(loadingMap: ILoadingMap) {
  loadingMap.any = keys => {
    keys = Array.isArray(keys) ? keys : [keys]
    return keys.some(key => !!loadingMap[key])
  }
}

function typeError(type) {
  throw new Error(`error action type:${type}`)
}

function getDisplayName(WrappedComponent) {
  return (
    WrappedComponent.displayName || WrappedComponent.name || 'WrappedComponent'
  )
}

function argumentContainer(Container, WrappedComponent) {
  // 给组件增加displayName
  Container.displayName = `Store(${getDisplayName(WrappedComponent)})`
  // 增加被包裹组件的引用
  Container.WrappedComponent = WrappedComponent
  return hoistStatics(Container, WrappedComponent)
}