import {
	Button,
	Card,
	Col,
	Flex,
	Form,
	Input,
	InputNumber,
	message,
	Row,
	Select,
	Space,
	Switch,
} from 'antd';
import { useState } from 'react';
import { SaveOutlined, SyncOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function ConnectionForm({ onSave, onTest, initialValues }) {
	const [form] = Form.useForm();
	const [testing, setTesting] = useState(false);
	const [saving, setSaving] = useState(false);

	const handleTest = async () => {
		try {
			const values = await form.validateFields(); // 表单验证
			console.log(values);
			setTesting(true);
			const result = await onTest(values);
			console.log(result)
			if (result.success) {
				message.success('连接测试成功');
			} else {
				message.error(`连接失败： ${result.error}`);
			}
		} catch (error) {
			message.error('请填写完整的连接信息');
		} finally {
			setTesting(false);
		}
	};

	const handleSave = async () => {
		try {
			const values = await form.validateFields();
			setSaving(true);
			await onSave(values);
			message.success('连接已保存');
		} catch (error) {
			message.error('连接保存失败');
		} finally {
			setSaving(false);
		}
	};

	//主机地址校验规则
	const validateHost = (_, value) => {
		if (!value) {
			return Promise.reject(new Error('请输入主机地址'));
		}

		// 检查IPv4
		const ipv4Pattern =
			/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(:[0-9]+)?$/;
		// 检查域名
		// const domainPattern = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])(:[0-9]+)?$/;
		// 检查IPv6
		const ipv6Pattern =
			/^\[([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\](:[0-9]+)?$/;

		if (
			value === 'localhost' ||
			ipv4Pattern.test(value) ||
			ipv6Pattern.test(value)
		) {
			return Promise.resolve();
		}

		return Promise.reject(new Error('无效的主机地址格式'));
	};

	return (
		<Flex vertical={true}>
			<Form
				name="connectionForm"
				form={form}
				layout="vertical"
				initialValues={initialValues}
				requiredMark={false}
				style={{ maxWidth: 600 }}
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
			>
				<Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
					<Form.Item
						name="name"
						label="数据库连接名称"
						rules={[{ required: true, message: '请输入连接名称' }]}
					>
						<Input placeholder="我的数据库连接" />
					</Form.Item>

					<Form.Item
						name="type"
						label="数据库类型"
						rules={[{ required: true, message: '请选择数据库类型' }]}
					>
						<Select>
							<Option value="mysql">MySQL</Option>
							<Option value="postgres">PostgreSQL</Option>
							<Option value="sqlite">SQLite</Option>
						</Select>
					</Form.Item>
				</Card>

				<Card title="连接配置" size="small" style={{ marginBottom: 16 }}> 
				<Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
					{({ getFieldValue }) => {
						const dbType = getFieldValue('type');

						if (dbType === 'sqlite') {
							return (
								<Form.Item
									name="path"
									label="数据库文件路径"
									rules={[
										{ required: true, message: '请输入SQLite文件路径' },
										{ pattern: /^[\/\\].+/, message: '请输入有效的文件路径' }]}
								>
									<Input placeholder="/path/to/database.sqlite" />
								</Form.Item>
							);
						}
						return (
							<>
								<Row gutter={16}>
									<Col span={12}>
										<Form.Item
											name="host"
											label="主机"
											initialValue="localhost"
											rules={[{ validator: validateHost }]}
										>
											<Input placeholder="输入主机地址" />
										</Form.Item>
									</Col>
									<Col span={12}>
										<Form.Item
											name="port"
											label="端口"
											initialValue={dbType === 'mysql' ? 3306 : 5432}
											rules={[
												{ required: true, message: '请输入端口号' },
												{
													type: 'number',
													min: 1,
													max: 65535,
													message: '端口必须在1-65535之间',
												},
											]}
										>
											<InputNumber style={{ width: '100%' }}/>
										</Form.Item>
									</Col>
								</Row>

								<Form.Item
									name="user"
									label="用户名"
									rules={[
										{ required: true, message: '请输入用户名' },
										{ max: 32, message: '用户名不能超过32个字符' },
										{
											pattern: /^[a-zA-Z0-9_]+$/,
											message: '用户名只能包含字母、数字和下划线',
										},
									]}
								>
									<Input />
								</Form.Item>

								<Form.Item
									name="password"
									label="密码"
									rules={[
										{ required: true, message: '请输入密码' },
										{ min: 6, message: '密码长度不能少于6个字符' },
										{ max: 64, message: '密码长度不能超过64个字符' },
									]}
								>
									<Input.Password />
								</Form.Item>

								<Form.Item
									name="database"
									label="数据库名"
									rules={[
										{ max: 64, message: '数据库名称不能超过64个字符' },
										{
											pattern: /^[a-zA-Z0-9_\-]+$/,
											message: '数据库名称只能包含字母、数字、下划线和连字符',
										},
									]}
								>
									<Input />
								</Form.Item>

								<Form.Item
									name="ssl"
									label="SSL"
									valuePropName="checked"
									initialValue={false}
								>
									<Switch />
								</Form.Item>
							</>
						);
					}}
				</Form.Item>
				</Card>

				<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
					<Space>
						<Button
							icon={<SyncOutlined />}
							onClick={handleTest}
							loading={testing}
						>
							测试连接
						</Button>
						<Button
							type="primary"
							icon={<SaveOutlined />}
							onClick={handleSave}
							loading={saving}
						>
							保存连接
						</Button>
					</Space>
				</Form.Item>
			</Form>
		</Flex>
	);
}
