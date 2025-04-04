import { EventEmitter } from 'events';
import { MySQLDriver } from './drivers/mysql.js';

export class ConnectionManager extends EventEmitter {
	constructor() {
		super();
		this.connections = new Map(); // 存储所有的连接 {id: {config, connection}}
		this.currentId = 0;
	}

	// 连接
	async connect(config) {
		console.log('connect start');
		console.log(config);
		const { dbClass } = require(`./drivers/${config.type}.js`);

		try {
			const db = new dbClass(config);
			const pool = db.createPool();
			// const connection = await connector.connect(config)
			const id = `conn_${++this.currentId}`;
			console.log('connect id: ' + id);
			this.connections.set(id, {
				config,
				pool,
				createdAt: new Date(),
				lastUsed: new Date(),
			});

			this.emit('connection-changed');
			return { id, success: true };
		} catch (error) {
			return { success: false, message: error.message };
		}
	}

	// 断开连接
	async disconnect(id) {
		const conn = this.connections.get(id);
		if (!conn) return false;

		const connector = require(`./connectors/${conn.config.type}`);
		await connector.disconnect(conn.connection);

		this.connections.delete(id);
		this.emit('connection-changed');
		return true;
	}

	// 测试连接
	async testConnection(config) {
		// 动态导入数据库驱动模块
		const driverModule = await import(`./drivers/${config.type}.js`);
		const { Driver } = driverModule.default;
		const db = new Driver(config, true);

		try {
			const result = await db.testConnection(config);
			console.log(result);
			if (result.success) {
				return { success: true };
			}
			return result;
		} catch (err) {
			return { success: false, error: err.message };
		}
	}

	// 获取连接信息
	getConnection(id) {
		const conn = this.connections.get(id);
		if (conn) {
			conn.lastUsed = new Date();
			return conn.connection;
		}
		return null;
	}

	// 获取所有连接
	listConnections() {
		return Array.from(this.connections.entries()).map(([id, data]) => ({
			id,
			type: data.config.type,
			name: data.config.name || 'Unnamed',
			status: 'connected',
			createdAt: data.createdAt || new Date().toISOString(),
		}));
	}
}
