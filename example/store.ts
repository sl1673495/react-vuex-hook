// store.js
import initStore from "../src";

const wait = (time: number) => new Promise(resolve => setTimeout(resolve, time));

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
