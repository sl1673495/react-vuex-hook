import { IState, IOptions, IConnect, IContext } from './types';
export default function initStore<State extends {}, MutationsKey extends string, GettersKey extends string, ActionsKey extends string>(options?: IOptions<State, MutationsKey, GettersKey, ActionsKey>): {
    connect: IConnect;
    useStore: () => IContext<IState<State, ActionsKey>, MutationsKey, GettersKey, ActionsKey>;
};
