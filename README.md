# react-hook-store
react-hook配合context和useReducer封装的一个用于小型模块的store，提供类似vuex的语法。

### 适用场景
比较适用于单个比较复杂的小模块，个人认为这也是react官方推荐useReducer和context配合使用的场景。
由于所有使用了useContext的组件都会在state发生变化的时候进行更新(context的弊端)，推荐渲染复杂场景的时候配合useMemo来做性能优化。

### 编写store
```javascript
// store.js
import initStore from 'react-hook-store';

const store = {
  // 初始状态
  initState: {
    count: 0,
  },
  // 同步操作 必须返回state的拷贝值
  mutations: {
    // 浅拷贝state
    add(payload, state) {
      return Object.assign(
        {},
        state,
        { count: state.count + 1 }
      );
    },
  },
  // 异步操作，拥有dispatch的执行权
  actions: {
    async asyncAdd(payload, { dispatch, state, getters }) {
      await wait(1000);
      dispatch({ type: 'add' });
      // 返回的值会被包裹的promise resolve
      return true;
    },
  },
  // 计算属性 根据state里的值动态计算
  // 在页面中根据state值的变化而动态变化
  getters: {
    countPlusOne(state) {
      return state.count + 1;
    },
  },
};

export const { connect, Context } = initStore(store);

```

### 在页面引用

```javascript
// page.js
import React, { useContext, useMemo } from 'react';
import { Spin } from 'antd';
import { connect, Context } from './store.js';

function Count() {
  const { state, getters, dispatch } = useContext(Context);
  const { countPlusOne } = getters;
  const { loadingMap, count } = state;
  // loadingMap是内部提供的变量 会监听异步action的起始和结束
  // 便于页面显示loading状态
  // 需要传入对应action的key值
  // 数组内可以写多项同时监听多个action
  // 灵感来源于dva
  const loading = loadingMap.any(['asyncAdd']);

  // 同步的add
  const add = () => dispatch({ type: 'add' });

  // 异步的add
  const asyncAdd = () => dispatch.action({ type: 'asyncAdd' });
  return (
    <Spin spinning={loading}>
      <span>count is {count}</span>
      <span>countPlusOne is {countPlusOne}</span>
      <button onClick={add}>add</button>
      <button onClick={asyncAdd}>async add</button>

      {/** 性能优化的做法 * */}
      {useMemo(() => <span>只有count变化会重新渲染 {count}</span>, [count])}
    </Spin>
  );
}

// 必须用connect包裹 内部会保证Context的Provider在包裹Count的外层
export default connect(Count);

```
