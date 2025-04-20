import { useState, useEffect } from 'react'
import { Card, Tabs, Button, Modal } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import ConnectionForm from '../components/ConnectionForm'
import ConnectionList from '../components/ConnectionList'
import ConnectionModal from '../components/ConnectionModal'

const { TabPane } = Tabs

export default function ConnectionsPage() {
  const [connections, setConnections] = useState([])
  const [activeTab, setActiveTab] = useState('list')
  const [editingConn, setEditingConn] = useState(null)


  const loadConnections = async () => {
    const conns = await window.electronAPI.listConnections()
    if (conns !== null) {
      setConnections(conns)
    }
  }

  useEffect(() => {
    loadConnections()
  }, [])

  const handleSave = async (config) => {
    await window.electronAPI.connect(config)
    await loadConnections()
    setActiveTab('list')
    setEditingConn(null)
  }

  const handleTest = async (config) => {
    return await window.electronAPI.testConnection(config)
  }

  return (

    <Card
      title="数据库连接管理"
      extra={
        activeTab === 'list' && (
          <ConnectionModal
            initialValues={{ type: 'mysql' }}
            onSave={handleSave}
            onTest={handleTest}
          />
        )
      }
    >

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="连接列表" key="list">
          <ConnectionList
            connections={connections}
            onEdit={(conn) => {
              setEditingConn(conn)
              setActiveTab('form')
            }}
            onConnect={(id) => {
              // 处理连接逻辑
              console.log('Connecting to', id)
            }}
          />
        </TabPane>
        <TabPane tab={editingConn ? '编辑连接' : '新建连接'} key="form">
          <ConnectionForm
            initialValues={{ type: 'mysql' }}
            onSave={handleSave}
            onTest={handleTest}
          />
          <Button
            style={{ marginTop: 16 }}
            onClick={() => setActiveTab('list')}
          >
            返回列表
          </Button>
        </TabPane>
      </Tabs>
    </Card>
  )
}