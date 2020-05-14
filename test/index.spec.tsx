import React from 'react'
import {cleanup, render, fireEvent} from '@testing-library/react'
import {renderHook, act} from '@testing-library/react-hooks'
import initStore from '../src'

const wait = (time: number) => new Promise(resolve => setTimeout(resolve, time))

const {connect, useStore} = initStore({
  getInitState: () => ({
    count: 1,
  }),
  mutations: {
    // 浅拷贝state
    add(state, payload) {
      return Object.assign({}, state, {count: state.count + 1})
    },
  },
  getters: {
    countPlusOne(state) {
      return state.count + 1
    },
  },
  actions: {
    async asyncAdd({dispatch, state, getters}, payload) {
      await wait(0)
      dispatch({type: 'add'})
      // 返回的值会被包裹的promise resolve
      return true
    },
    async asyncError() {
      throw new Error('async error')
    },
  },
})

function Comp({children = null}) {
  const {state, getters, dispatch} = useStore()
  const onAdd = () => dispatch({type: 'add'})
  const onErrorType = () => dispatch({type: 'ERROR_TYPE'} as any)
  const asyncAdd = () => dispatch.action({type: 'asyncAdd'})
  const asyncError = () => dispatch.action({type: 'asyncError'})
  return (
    <div>
      <span data-testid="count">{state.count}</span>
      <span data-testid="countPlusOne">{getters.countPlusOne}</span>
      <button data-testid="add" onClick={onAdd}></button>
      <button data-testid="asyncAdd" onClick={asyncAdd}></button>
      <button data-testid="asyncError" onClick={asyncError}></button>
      <button data-testid="error" onClick={onErrorType}></button>
      {children}
    </div>
  )
}

afterEach(cleanup)
// 调用connect包裹需要使用useStore的组件
const Connected = connect(Comp)

describe('connect to a component', () => {
  test('should state changed by mutation', () => {
    const {getByTestId} = render(<Connected />)
    expect(getByTestId('count').innerHTML).toBe('1')
    fireEvent.click(getByTestId('add'))
    expect(getByTestId('count').innerHTML).toBe('2')
  })

  test('should getter changed by mutation', () => {
    const {getByTestId} = render(<Connected />)
    expect(getByTestId('countPlusOne').innerHTML).toBe('2')
    fireEvent.click(getByTestId('add'))
    expect(getByTestId('countPlusOne').innerHTML).toBe('3')
  })

  test('should state and getter changed by async action', async () => {
    const {result} = renderHook(() => useStore(), {wrapper: Connected})
    const {dispatch} = result.current

    await act(async () => {
      await dispatch.action({
        type: 'asyncAdd',
      })

      const {state, getters} = result.current
      expect(state.count).toBe(2)
      expect(getters.countPlusOne).toBe(3)
    })
  })

  test('should correctly change loading state before and after async action', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useStore(), {
      wrapper: Connected,
    })
    const {dispatch} = result.current
    expect(result.current.state.loadingMap.any(['asyncAdd'])).toBeFalsy()
    await act(async () => {
      dispatch.action({
        type: 'asyncAdd',
      })
      await waitForNextUpdate()
      expect(result.current.state.loadingMap.any('asyncAdd')).toBeTruthy()
      await waitForNextUpdate()
      expect(result.current.state.loadingMap.any(['asyncAdd'])).toBeFalsy()
    })
  })

  test('should throw an exception when calling an error type', async () => {
    const {result} = renderHook(() => useStore(), {wrapper: Connected})
    const {dispatch} = result.current

    const throwFn = async () =>
      await dispatch.action({type: 'ERROR_TYPE'} as any)
    await act(async () => {
      try {
        await throwFn()
      } catch (e) {
        expect(e).toBeInstanceOf(Error)
      }
    })
  })

  test('should work with empty args', () => {
    const {connect} = initStore()
    const EmptyConnect = connect(() => {
      return <span data-testid="empty">empty</span>
    })
    const {getByTestId} = render(<EmptyConnect />)
    expect(getByTestId('empty').innerHTML).toBe('empty')
  })

  test('should not crash when calling loadingMap.any for a non-existent action type', async () => {
    const {result} = renderHook(() => useStore(), {wrapper: Connected})
    expect(result.current.state.loadingMap.any(['ERROR_TYPE'] as any)).toBe(
      false,
    )
  })
})
