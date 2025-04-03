import { Button, Form, Input, message, Select, Switch } from "antd";
import { useState } from "react";
import { SaveOutlined, SyncOutlined } from "@ant-design/icons"

const { Option } = Select

export default function ConnectionForm({ onSave, onTest, initialValues }) {

    const [form] = Form.useForm()
    const [testing, setTesting] = useState(false)
    const [saving, setSaving] = useState(false)

    const handleTest = async () => {
        try {
            const values = await form.validateFields()  // 表单验证
            setTesting(true)
            console.log("In ConnectionForm test message "+ values)
            const result = await onTest(values)
            
            if (result.success) {
                message.success('连接测试成功')
            } else {
                message.error(`连接失败： ${result.message}`)
            }
        } catch (error) {
            message.error('请填写完整的连接信息')
        } finally {
            setTesting(false)
        }
    }

    const handleSave = async () => {
        try {
            const values = await form.validateFields()
            setSaving(true)
            await onSave(values)
            message.success('连接已保存')    
        } catch (error) {
            message.error('连接保存失败')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Form name="connectionForm" form={form} layout="vertical" initialValues={initialValues}>
            <Form.Item name="name" label="数据库连接名称" rules={[{ required: true }]}>
                <Input placeholder="我的数据库连接" value="test"/>
            </Form.Item>

            <Form.Item name="type" label="数据库类型" rules={[{ required: true }]} >
                <Select>
                    <Option value="mysql">MySQL</Option>
                    <Option value="postgres">PostgreSQL</Option>
                    <Option value="sqlite">SQLite</Option>
                </Select>
            </Form.Item>

            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
                { ({ getFieldValue }) => getFieldValue('type') !== 'sqlite' ? (
                    <>
                    <Form.Item name="host" label="主机" rules={[{ required: true }]}>
                        <Input placeholder="localhost" defaultValue="127.0.0.1" />
                    </Form.Item>
                    <Form.Item name="port" label="端口" rules={[{ required: true }]}>
                        <Input type="number" defaultValue="3306"/>
                    </Form.Item>
                    <Form.Item name="user" label="用户名" rules={[{ required: true }]}>
                        <Input defaultValue="root" />
                    </Form.Item>
                    <Form.Item name="password" label="密码" rules={[{ required: true }]}>
                        <Input.Password defaultValue="123456" />
                    </Form.Item>
                    <Form.Item name="database" label="数据库名" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="ssl" label="SSL" valuePropName="checked" rules={[{ required: true }]}>
                        <Switch />
                    </Form.Item>
                    </>
                ) : (
                    <Form.Item name="path" label="数据库文件路径" rules={[{ required: true }]}>
                        <Input placeholder="/path/to/database.sqlite" />
                    </Form.Item>
                ) }
            </Form.Item>

            <div>
                <Button
                    icon={<SyncOutlined />}
                    onClick={handleTest}
                    loading={testing}>
                        测试连接
                    </Button>
                <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={saving}>
                        保存连接
                    </Button>
            </div>
        </Form>
    )
}

