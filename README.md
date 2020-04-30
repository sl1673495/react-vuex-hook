# react-vuex-hook
react-vuex-hook是利用React Hook配合Context和useReducer封装的一个用于小型模块的状态管理库，提供类似vuex的语法。

react-vuex-hook is a state management library for small modules using React Hook with Context and useReducer, providing vuex-like syntax.

## 稳定性
[![Build Status](https://travis-ci.org/sl1673495/react-vuex-hook.svg?branch=master)](https://travis-ci.org/sl1673495/react-vuex-hook)
[![Coverage Status](https://coveralls.io/repos/github/sl1673495/reax-hook/badge.svg?branch=master)](https://coveralls.io/github/sl1673495/reax-hook?branch=master)

## 安装
```
npm install react-vuex-hook -S
```

## 使用

### 编写 store

```javascript
// store.js
import initStore from 'react-vuex-hook'

export const { connect, useStore } = initStore({
  // 初始状态
  getInitState: () => ({
    count: 0
  }),
  // 同步操作 必须返回state的拷贝值
  mutations: {
    // 浅拷贝state
    add(state, payload) {
      return Object.assign({}, state, { count: state.count + 1 });
    }
  },
  // 异步操作，拥有dispatch的执行权
  actions: {
    async asyncAdd({ dispatch, state, getters }, payload) {
      await wait(1000);
      dispatch({ type: "add" });
      // 返回的值会被包裹的promise resolve
      return true;
    }
  },
  // 计算属性 根据state里的值动态计算
  // 在页面中根据state值的变化而动态变化
  getters: {
    countPlusOne(state) {
      return state.count + 1;
    }
  }
});



// 注意这里不要提前声明好配置对象然后传递给initStore
// 否则由于ts的限制会失去类型推断
```

### 在页面引用

```javascript
// page.js
import React, { useMemo } from 'react'
import { Spin } from 'antd'
import { connect, useStore } from './store.js'

function Count() {
  const { state, getters, dispatch } = useStore()
  const { countPlusOne } = getters
  const { loadingMap, count } = state
  // loadingMap是内部提供的变量 会监听异步action的起始和结束
  // 便于页面显示loading状态
  // 需要传入对应action的key值
  // 数组内可以写多项同时监听多个action
  // 灵感来源于dva
  const loading = loadingMap.any(['asyncAdd'])

  // 同步的add
  const add = () => dispatch({ type: 'add' })

  // 异步的add
  const asyncAdd = () => dispatch.action({ type: 'asyncAdd' })
  return (
    <Spin spinning={loading}>
      <span>count is {count}</span>
      <span>countPlusOne is {countPlusOne}</span>
      <button onClick={add}>add</button>
      <button onClick={asyncAdd}>async add</button>

      {/** 性能优化的做法 * */}
      {useMemo(
        () => (
          <span>只有count变化会重新渲染 {count}</span>
        ),
        [count]
      )}
    </Spin>
  )
}

// 必须用connect包裹 内部会保证Context的Provider在包裹Count的外层
export default connect(Count)
```

### 适用场景

比较适用于单个比较复杂的小模块，个人认为这也是 react 官方推荐 useReducer 和 context 配合使用的场景。
由于所有使用了 useContext 的组件都会在 state 发生变化的时候进行更新(context 的弊端)，推荐渲染复杂场景的时候配合 useMemo 来做性能优化。


## 为什么用它
1. 带给你Vuex类似的语法。
2. 完善的TypeScript类型推导。
3. 测试覆盖率100%

## 文档

https://sl1673495.github.io/react-vuex-hook/

## 更新 5.0
1. 为了避免state复杂嵌套数据的污染，initState初始化的传入值由initState改为getInitState方法

## 更新 3.0

1. 全面使用TypeScript重构

2. 脚手架工具使用umi团队的`father`

3. 基于docz的文档

## 更新 2.0

1. 新增测试用例，测试覆盖率达到100%

2. `mutation` 的函数参数顺序和 Vuex 保持一致

```js
  mutations: {
    // 浅拷贝state
    add(state, payload) {
      return Object.assign({}, state, { count: state.count + 1 })
    },
  },
```

3. `actions` 的函数参数和vuex保持一致
```js
  actions: {
    async asyncAdd({ dispatch, state, getters }, payload) {
      await wait(100)
      dispatch({ type: 'add' })
      // 返回的值会被包裹的promise resolve
      return true
    },
  },
```
