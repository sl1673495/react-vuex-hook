import * as React from "react"

export interface IMutationsValue<State> {
  (state: State, payload: any): State
}

export interface IGettersValue<State> {
  (state: State): any
}

export type IState<State, ActionsKey extends string> = State & {
  loadingMap: ILoadingMap<ActionsKey>
}

export type ILoadingMap<ActionsKey extends string> = Record<
  ActionsKey,
  boolean
> & {
  any: (keys: ActionsKey | ActionsKey[]) => boolean
}

interface IActionContext<
  State,
  MutationsKey,
  GettersKey extends string,
  ActionsKey extends string
> {
  state: State
  getters: IGettersResult<GettersKey>
  dispatch: IDispatch<MutationsKey, ActionsKey>
}

export type IActionsOption<
  State,
  MutationsKey extends string,
  GettersKey extends string,
  ActionsKey extends string
> = Record<
  ActionsKey,
  (
    context: IActionContext<State, MutationsKey, GettersKey, ActionsKey>,
    payload: any,
  ) => Promise<any>
>

export interface IOptions<
  State,
  MutationsKey extends string,
  GettersKey extends string,
  ActionsKey extends string
> {
  getInitState: () => State
  mutations: Record<MutationsKey, IMutationsValue<State>>
  getters: IGetters<State, GettersKey>
  actions: IActionsOption<State, MutationsKey, GettersKey, ActionsKey>
}

export interface IConnect<T> {
  (Component: React.ComponentType<T>): React.FC<T>
}

export interface IDispatchArgs<MutationsKey> {
  type: MutationsKey
  payload?: any
}

export interface IDispatchActionArgs<ActionsKey> {
  type: ActionsKey
  payload?: any
}

export type IDispatch<MutationsKey, ActionsKey> = React.Dispatch<
  IDispatchArgs<MutationsKey>
> & {
  action: (args: IDispatchActionArgs<ActionsKey>) => Promise<any>
}

export type IGetters<State, GettersKey extends string> = Record<
  GettersKey,
  IGettersValue<State>
>

export type IGettersResult<GettersKey extends string> = {
  [K in GettersKey]: any
}

export interface IContext<
  State,
  MutationsKey,
  GettersKey extends string,
  ActionsKey extends string
> {
  dispatch: IDispatch<MutationsKey, ActionsKey>
  state: IState<State, ActionsKey>
  getters: IGettersResult<GettersKey>
}
