import { List, Button, Tag, Popconfirm, message } from 'antd'
import { DatabaseOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'

export default function ConnectionList({ connections, onEdit, onConnect }) {
  
  const handleDelete = async (id) => {
    const success = await disconnect(id)
    if (success) {
      message.success('连接已断开并删除')
    } else {
      message.error('操作失败')
    }
  }

  return (
    <List
      dataSource={connections}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Button 
              icon={<EditOutlined />} 
              onClick={() => onEdit(item)}
              size="small"
            />,
            <Popconfirm
              title="确定要删除此连接吗?"
              onConfirm={() => handleDelete(item.id)}
            >
              <Button 
                icon={<DeleteOutlined />} 
                danger 
                size="small"
              />
            </Popconfirm>
          ]}
        >
          <List.Item.Meta
            avatar={<DatabaseOutlined />}
            title={
              <div>
                <span style={{ marginRight: 8 }}>{item.name}</span>
                <Tag color={getColorByType(item.type)}>{item.type}</Tag>
              </div>
            }
            description={`创建于 ${new Date(item.createdAt).toLocaleString()}`}
          />
          <Button 
            type="link" 
            onClick={() => onConnect(item.id)}
          >
            连接
          </Button>
        </List.Item>
      )}
    />
  )
}

function getColorByType(type) {
  const colors = {
    mysql: 'blue',
    postgres: 'volcano',
    sqlite: 'green'
  }
  return colors[type] || 'gray'
}