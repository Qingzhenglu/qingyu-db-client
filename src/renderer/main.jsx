import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import 'antd/dist/reset.css' // 必须的全局样式
import '@ant-design/v5-patch-for-react-19' //react-19兼容包


const root = createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)