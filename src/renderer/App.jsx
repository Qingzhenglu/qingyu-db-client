import React from 'react'
import './App.css'
import { Layout, Menu } from 'antd'


const { Header, Content, Sider } = Layout

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="header">
        <div className="logo">Qingyu DB Client</div>
      </Header>
      <Layout>
        <Sider width={200} theme="light">
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            items={[
              { key: '1', label: '数据库连接' },
              { key: '2', label: 'SQL查询' },
              { key: '3', label: '数据管理' }
            ]}
          />
        </Sider>
        <Content style={{ padding: '16px' }}>
          {/* 主内容区 */}
          <div className="content-wrapper">
            <h1>欢迎使用数据库管理系统</h1>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App