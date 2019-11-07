import { IState, IOptions, IConnect, IContext } from './types';
export default function initStore<State extends {}>(options?: IOptions<State>): {
    connect: IConnect;
    useStore: () => IContext<IState<State>>;
};
