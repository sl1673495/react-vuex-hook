import * as React from 'react'

export interface IMutationsOption<State> {
  [key: string]: (state: State, payload: any) => State
}

export interface IGettersOption<State> {
  [key: string]: (state: State) => any
}

export type IState<State> = State & {
  loadingMap: ILoadingMap
}

export type ILoadingMap = {
  [key: string]: boolean
} & {
  any: (keys: string | string[]) => boolean
}

interface IActionContext<State, GettersOption> {
  state: State
  getters: IGetters<GettersOption>
  dispatch: IDispatch
}

export interface IActionsOption<State, GettersOption> {
  [key: string]: (
    context: IActionContext<State, GettersOption>,
    payload: any
  ) => Promise<any>
}

export interface IOptions<State> {
  initState: State
  mutations: IMutationsOption<State>
  getters: IGettersOption<State> 
  actions: IActionsOption<State, IGettersOption<State>>
}

export interface IConnect {
  (Component: React.FC): React.FC
}

export interface ICreated<State> {
  connect: IConnect
  useStore: () => IContext<IState<State>>
}

export interface IDispatchArgs {
  type: string
  payload?: any
}

export type IDispatch = React.Dispatch<IDispatchArgs> & {
  action: (args: IDispatchArgs) => Promise<any>
}

export type IGetters<GettersOption> = {
  [K in keyof GettersOption]: any
}

export interface IContext<State> {
  dispatch: IDispatch
  state: IState<State>
  getters: IGetters<IGettersOption<State>>
}
