import React, { useState, useCallback } from 'react';
import { Card, Button, Input } from 'antd';
import { connect, useStore } from './store';
import './index.css';
import 'antd/dist/antd.css';

let addLogHack = (val: string) => {};

function Count() {
  const {
    state: { count },
    dispatch,
  } = useStore();
  // 同步的add
  const add = useCallback(() => dispatch({ type: 'add' }), []);

  addLogHack('计数器组件重新渲染🚀');

  return (
    <Card hoverable style={{ marginBottom: 24 }}>
      <h1>计数器</h1>
      <div className="chunk">
        <div className="chunk">store中的count现在是 {count}</div>
        <Button onClick={add}>add</Button>
      </div>
    </Card>
  );
}

function Chat() {
  const {
    state: { message },
    dispatch,
  } = useStore();
  const [value, setValue] = useState('');

  addLogHack('聊天室组件重新渲染💐');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'chat',
      payload: e.target.value
    })
  }

  return (
    <Card hoverable style={{ marginBottom: 24 }}>
      <h1>聊天室</h1>
      当前消息是: {message}
        <Input onChange={onChange} placeholder="请输入消息" />
    </Card>
  );
}

function Logger() {
  const [logs, setLogs] = useState<string[]>([]);
  addLogHack = (log: string) => setLogs(prevLogs => [log, ...prevLogs]);
  return (
    <Card hoverable>
      <h1>控制台</h1>
      <div className="logs">
        {logs.map((log, idx) => (
          <p className="log" key={idx}>
            {log}
          </p>
        ))}
      </div>
    </Card>
  );
}

export default connect(() => {
  return (
    <div className="flex">
      <div className="left">
        <div className="count">
          <Count />
        </div>
        <div className="chat">
          <Chat />
        </div>
      </div>
      <div className="right">
        <Logger />
      </div>
    </div>
  );
});
