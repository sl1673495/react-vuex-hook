import React from "react"
import ReactDOM from "react-dom"
import initStore from "../../src"

const { connect, useStore } = initStore({
  getInitState: () => ({
    count: 1,
    logs: [] as string[],
  }),
  mutations: {
    // 浅拷贝state
    add(state) {
      return Object.assign({}, state, { count: state.count + 1 })
    },
    log(state, log: string) {
      return Object.assign({}, state, { logs: [...state.logs, log] })
    },
  },
  getters: {
    countPlusOne(state) {
      return state.count + 1
    },
    logStr(state) {
      return state.logs.join(",")
    },
  },
  actions: {
    async asyncAdd({ dispatch, state, getters }) {
      state.count
      getters.countPlusOne
      dispatch({ type: "add" })
      // 返回的值会被包裹的promise resolve
      return true
    },
  },
})

const MockComponent: React.FC<{ show: boolean }> = ({ show }) => {
  const { state, getters, dispatch } = useStore()

  const count = state.count + 1

  const logs = state.logs.map((log) => `Test typescript ${log}`)

  const countPlusTwo = getters.countPlusOne + 1

  dispatch({
    type: "add",
    payload: count + countPlusTwo,
  })

  dispatch({
    type: "log",
    payload: logs.join(","),
  })

  return show ? null : <span>Hello react-vuex-hook</span>
}

const Connected = connect(MockComponent)

ReactDOM.render(
  <Connected show={true} />,
  document.getElementById("typescript"),
)
