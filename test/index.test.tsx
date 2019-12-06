import React from 'react';
import { cleanup, render, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react-hooks';
import initStore from '../src';

const wait = (time: number) => new Promise(resolve => setTimeout(resolve, time));

const { connect, useStore } = initStore({
  initState: {
    count: 1,
  },
  mutations: {
    // 浅拷贝state
    add(state, payload) {
      return Object.assign({}, state, { count: state.count + 1 });
    },
  },
  getters: {
    countPlusOne(state) {
      return state.count + 1;
    },
  },
  actions: {
    async asyncAdd({ dispatch, state, getters }, payload) {
      await wait(0);
      dispatch({ type: 'add' });
      // 返回的值会被包裹的promise resolve
      return true;
    },
  },
});

function Comp({ children }) {
  const { state, getters, dispatch } = useStore();
  const onAdd = () => dispatch({ type: 'add' });
  const onErrorType = () => dispatch({ type: 'ERROR_TYPE' } as any);
  // 异步的add
  const asyncAdd = () => dispatch.action({ type: 'asyncAdd' });
  return (
    <div>
      <span data-testid="count">{state.count}</span>
      <span data-testid="countPlusOne">{getters.countPlusOne}</span>
      <button data-testid="add" onClick={onAdd}></button>
      <button data-testid="asyncAdd" onClick={asyncAdd}></button>
      <button data-testid="error" onClick={onErrorType}></button>
      {children}
    </div>
  );
}

afterEach(cleanup);
// 调用connect包裹需要使用useStore的组件
const Connected = connect(Comp);

describe('正常使用', () => {
  test('state和mutations表现正常', () => {
    const { getByTestId } = render(<Connected />);
    expect(getByTestId('count').innerHTML).toBe('1');
    fireEvent.click(getByTestId('add'));
    expect(getByTestId('count').innerHTML).toBe('2');
  });

  test('getters表现正常', () => {
    const { getByTestId } = render(<Connected />);
    expect(getByTestId('countPlusOne').innerHTML).toBe('2');
    fireEvent.click(getByTestId('add'));
    expect(getByTestId('countPlusOne').innerHTML).toBe('3');
  });

  test('异步actions派发后，state和getters表现正常', async () => {
    const { result } = renderHook(() => useStore(), { wrapper: Connected });
    const { dispatch } = result.current;

    await act(async () => {
      await dispatch.action({
        type: 'asyncAdd',
      });

      const { state, getters } = result.current;
      expect(state.count).toBe(2);
      expect(getters.countPlusOne).toBe(3);
    });
  });

  test('异步actions派发前后，对应的loading状态表现正常，并且测试any的两种参数格式', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useStore(), { wrapper: Connected });
    const { dispatch } = result.current;
    await act(async () => {
      dispatch.action({
        type: 'asyncAdd',
      });
      await waitForNextUpdate();
      expect(result.current.state.loadingMap.any('asyncAdd')).toBeTruthy();
      await waitForNextUpdate();
      expect(result.current.state.loadingMap.any(['asyncAdd'])).toBeFalsy();
    });
  });

  test('dispatch action时如果type传错会抛错', async () => {
    const { result } = renderHook(() => useStore(), { wrapper: Connected });
    const { dispatch } = result.current;

    const throwFn = async () => await dispatch.action({ type: 'ERROR_TYPE' } as any);
    await act(async () => {
      try {
        await throwFn();
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
    });
  });

  test('不传参的情况下调用initStore渲染正常', () => {
    const { connect } = initStore();
    const EmptyConnect = connect(() => {
      return <span data-testid="empty">empty</span>;
    });
    const { getByTestId } = render(<EmptyConnect />);
    expect(getByTestId('empty').innerHTML).toBe('empty');
  });

  test('无意义的调用loadingMap.any不会报错', async () => {
    const { result } = renderHook(() => useStore(), { wrapper: Connected });
    expect(result.current.state.loadingMap.any(['ERROR_TYPE'])).toBe(false);
  });
});
