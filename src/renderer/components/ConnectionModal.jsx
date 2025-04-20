// src/components/ConnectionModal.jsx
import { useState } from 'react';
import { Modal, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ConnectionForm from './ConnectionForm';

const ConnectionModal = ({ onSave, onTest, initialValues }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const showModal = () => {
		setIsModalOpen(true);
	};

	const handleCancel = () => {
		setIsModalOpen(false);
	};

	return (
		<>
			<Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
				新建连接
			</Button>

			<Modal
				title="新建数据库连接"
				open={isModalOpen}
				onCancel={handleCancel}
				width={600}
				footer={null}
				destroyOnClose
			>
				<ConnectionForm
					initialValues={initialValues}
					onSave={onSave}
					onTest={onTest}
				/>
			</Modal>
		</>
	);
};

export default ConnectionModal;
