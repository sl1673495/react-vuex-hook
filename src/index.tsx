import React from 'react'
import hoistStatics from 'hoist-non-react-statics'
import propTypes from 'prop-types'
import {
  IState,
  IGetters,
  IGettersResult,
  IOptions,
  IDispatchArgs,
  IDispatch,
  IContext,
  IMutationsValue,
} from './types'

const {useReducer, useContext, useMemo} = React
// reax: 创建一个小型的store
export default function initStore<
  State extends {},
  MutationsKey extends string,
  GettersKey extends string,
  ActionsKey extends string
>(options?: IOptions<State, MutationsKey, GettersKey, ActionsKey>) {
  const {
    getInitState = () => undefined as () => State,
    mutations: rawMutations = {} as Record<
      MutationsKey,
      IMutationsValue<State>
    >,
    actions: rawActions = {},
    getters: rawGetters = {} as IGetters<State, GettersKey>,
  } = options || {}

  const mutations = mixinChangeLoading(rawMutations)

  const reducer = (state: State, action: IDispatchArgs<MutationsKey>) => {
    const {type, payload} = action
    const mutation = mutations[type]
    // 用于开发环境时提示拼写错误，可以不计入测试覆盖率
    /* istanbul ignore if */
    if (typeof mutation !== 'function') {
      typeError(type)
    }
    return mutation(state, payload)
  }

  const Context = React.createContext<
    IContext<IState<State, ActionsKey>, MutationsKey, GettersKey, ActionsKey>
  >(null)

  const Provider = (props: {children: React.ReactNode}) => {
    const {children} = props
    const [state, dispatch] = useReducer(reducer, undefined, getInitState)
    // 计算一把computed
    const computedGetters = useMemo(
      () => initGetter<State, GettersKey>(rawGetters, state),
      [state],
    )
    // 让actions执行前后改变loading
    const actions = useMemo(() => initActions(rawActions, dispatch), [])
    const dispatchAction = useMemo(
      () => initDispatchAction(dispatch, actions, state, computedGetters),
      [actions, computedGetters, state],
    )
    // dispatchAction没法做到引用保持不变 所以挂到dispatch上
    // 这样用户使用useEffect把dispatch作为依赖 就不会造成无限更新
    const withDispatchAction: IDispatch<
      MutationsKey,
      ActionsKey
    > = dispatch as any
    withDispatchAction.action = dispatchAction

    // 重命名state 用于强制推断类型
    const reducerState: IState<State, ActionsKey> = state as any
    // 给loadingMap加上一些api
    const enhancedState = enhanceLoadingMap<State, ActionsKey>(reducerState)
    return (
      <Context.Provider
        value={{
          state: enhancedState,
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

  const connect = <P extends {}>(Component: React.ComponentType<P>) => {
    const WrapWithProvider = (props: any) => (
      <Provider>
        <Component {...props} />
      </Provider>
    )
    return argumentContainer(WrapWithProvider, Component) as React.FC<P>
  }

  const useStore = () => useContext(Context)
  return {connect, useStore}
}

const CHANGE_LOADING = '@@changeLoadingState'
// 加入改变loading状态的方法
function mixinChangeLoading(mutations) {
  return Object.assign({}, mutations, {
    [CHANGE_LOADING](state, payload) {
      const {actionKey, isLoading} = payload
      const {loadingMap} = state
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
function initGetter<State, GettersKey extends string>(
  rawGetters: IGetters<State, GettersKey>,
  state: State,
) {
  const getters = {} as IGettersResult<GettersKey>
  const rawGetterKeys = Object.keys(rawGetters)
  rawGetterKeys.forEach(rawGetterKey => {
    const rawGetter = rawGetters[rawGetterKey]
    const result = rawGetter(state)
    getters[rawGetterKey] = result
  })
  return getters
}

// 劫持原有的action方法 在action执行前后更改loading状态
function initActions(rawActions: {}, dispatch: React.Dispatch<any>) {
  const changeLoading = (actionKey: string, isLoading: boolean) => {
    dispatch({
      type: CHANGE_LOADING,
      payload: {
        isLoading,
        actionKey,
      },
    })
  }

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

// dispatch actions里的方法 返回promise
function initDispatchAction(dispatch, actions, state, getters) {
  return ({type, payload}) =>
    new Promise((resolve, reject) => {
      if (typeof actions[type] === 'function') {
        actions[type]({dispatch, state, getters}, payload)
          .then(resolve)
          .catch(reject)
      } else {
        typeError(type)
      }
    })
}

function enhanceLoadingMap<State, ActionsKey extends string>(
  state: IState<State, ActionsKey>,
): IState<State, ActionsKey> {
  if (state) {
    if (!state.loadingMap) {
      state.loadingMap = {} as any
    }
    const {loadingMap} = state
    loadingMap.any = keys => {
      keys = Array.isArray(keys) ? keys : [keys]
      return keys.some(key => !!loadingMap[key])
    }
    return state
  }
}

function typeError(type: string) {
  throw new Error(`error action type:${type}`)
}

function getDisplayName(WrappedComponent: React.ComponentType) {
  return (
    WrappedComponent.displayName || WrappedComponent.name || 'WrappedComponent'
  )
}

function argumentContainer(
  Container: React.ComponentType & {WrappedComponent?: React.ComponentType},
  WrappedComponent: React.ComponentType,
) {
  // 给组件增加displayName
  Container.displayName = `Store(${getDisplayName(WrappedComponent)})`
  // 增加被包裹组件的引用
  Container.WrappedComponent = WrappedComponent
  return hoistStatics(Container, WrappedComponent)
}
