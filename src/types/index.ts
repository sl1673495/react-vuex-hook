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

interface IActionContext<State, MutationKeys, GettersKey extends string> {
  state: State;
  getters: Record<GettersKey, IGettersValue<State>>;
  dispatch: IDispatch<MutationKeys>;
}

export interface IActionsOption<State, MutationKeys extends string, GettersKey extends string> {
  [key: string]: (
    context: IActionContext<State, MutationKeys, GettersKey>,
    payload: any,
  ) => Promise<any>;
}

export interface IOptions<State, MutationKeys extends string, GettersKey extends string> {
  initState: State;
  mutations: Record<MutationKeys, IMutationsValue<State>>;
  getters: IGetters<State, GettersKey>;
  actions: IActionsOption<State, MutationKeys, GettersKey>;
}

export interface IConnect {
  (Component: React.ComponentType<any>): React.FC;
}

export interface IDispatchArgs<MutationKeys> {
  type: MutationKeys;
  payload?: any;
}

export type IDispatch<MutationKeys> = React.Dispatch<IDispatchArgs<MutationKeys>> & {
  action: (args: IDispatchArgs<any>) => Promise<any>;
};

export type IGetters<State, GettersKey extends string> = Record<GettersKey, IGettersValue<State>>

export interface IContext<State, MutationKeys, GettersKey extends string> {
  dispatch: IDispatch<MutationKeys>;
  state: IState<State>;
  getters: IGetters<State, GettersKey>
}
