import * as React from 'react';

export interface IMutationsValue<State> {
  (state: State, payload: any): State;
}

export interface IGettersOption<State> {
  [key: string]: IGettersValue<State>;
}

export interface IGettersValue<State> {
  (state: State): any;
}

export type IState<State> = State & {
  loadingMap: ILoadingMap;
};

export type ILoadingMap = {
  [key: string]: boolean;
} & {
  any: (keys: string | string[]) => boolean;
};

interface IActionContext<State, MutationsKey, GettersKey extends string, ActionsKey extends string> {
  state: State;
  getters: Record<GettersKey, IGettersValue<State>>;
  dispatch: IDispatch<MutationsKey, ActionsKey>;
}

export type IActionsOption<
  State,
  MutationsKey extends string,
  GettersKey extends string,
  ActionsKey extends string
> = Record<
  ActionsKey,
  (context: IActionContext<State, MutationsKey, GettersKey, ActionsKey>, payload: any) => Promise<any>
>;

export interface IOptions<
  State,
  MutationsKey extends string,
  GettersKey extends string,
  ActionsKey extends string
> {
  initState: State;
  mutations: Record<MutationsKey, IMutationsValue<State>>;
  getters: IGetters<State, GettersKey>;
  actions: IActionsOption<State, MutationsKey, GettersKey, ActionsKey>;
}

export interface IConnect {
  (Component: React.ComponentType<any>): React.FC;
}

export interface IDispatchArgs<MutationsKey> {
  type: MutationsKey;
  payload?: any;
}

export interface IDispatchActionArgs<ActionsKey> {
  type: ActionsKey;
  payload?: any;
}

export type IDispatch<MutationsKey, ActionsKey> = React.Dispatch<IDispatchArgs<MutationsKey>> & {
  action: (args: IDispatchActionArgs<ActionsKey>) => Promise<any>;
};

export type IGetters<State, GettersKey extends string> = Record<GettersKey, IGettersValue<State>>;

export interface IContext<State, MutationsKey, GettersKey extends string, ActionsKey extends string> {
  dispatch: IDispatch<MutationsKey, ActionsKey>;
  state: IState<State>;
  getters: IGetters<State, GettersKey>;
}
