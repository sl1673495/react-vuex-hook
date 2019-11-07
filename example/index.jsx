import React, { useMemo } from 'react'
import { Spin, Button, Card } from 'antd'
import { connect, useStore } from './store.js'
import './index.css'
import 'antd/dist/antd.css'

const { Meta } = Card
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
    <section className="wrap">
      <Card
        hoverable
        style={{ width: 240 }}
      >
        <Spin spinning={loading}>
          <div className="chunk">
            <div className="chunk">store中的count现在是 {count}</div>
            <Button onClick={add}>add</Button>
            <Button onClick={asyncAdd}>async add</Button>
          </div>
          <div className="chunk">
            <span>通过getters计算出来的countPlusOne是 {countPlusOne}</span>
          </div>

          {/** 性能优化的做法 * */}
          {useMemo(
            () => (
              <div className="chunk">
                <span>只有count变化会重新渲染 {count}</span>
              </div>
            ),
            [count]
          )}
        </Spin>
      </Card>
    </section>
  )
}

// 必须用connect包裹 内部会保证Context的Provider在包裹Count的外层
export default connect(Count)
