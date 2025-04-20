import mysql from 'mysql2/promise';

export class MySQLDriver {
	/**
	 * MySQL 数据库驱动
	 * @param {Object} config 数据库配置
	 * @param {boolean} [isTestConnection=false] 是否为测试连接
	 */
	constructor(config, isTestConnection = false) {
		this.config = {
			host: config.host,
			port: config.port || 3306,
			user: config.user,
			password: config.password,
			database: config.database || null,
			ssl: config.ssl ? this.normalizeSSLConfig(config.ssl) : null,
			waitForConnections: true,
			connectionLimit: config.connectionLimit | 10,
		};

		this.isTestConnection = isTestConnection;

		if (!isTestConnection) {
			this.pool = this.createPool();
		}
		console.log('isTestConnection ' + isTestConnection);
	}

	/**
	 * 标准化SSL配置
	 * @param {boolean|Object} sslConfig
	 * @returns {Object|null}
	 */
	normalizeSSLConfig(sslConfig) {
		if (!sslConfig) return null;
		if (typeof sslConfig === 'boolean') {
			return sslConfig ? { rejectUnauthorized: false } : null;
		}
		return {
			rejectUnauthorized: sslConfig.rejectUnauthorized !== false,
		};
	}

	/**
	 * 创建连接池
	 * @returns {mysql.Pool}
	 */
	createPool() {
		const pool = mysql.createPool({
			host: this.config.host,
			port: this.config.port || 3306,
			user: this.config.user,
			password: this.config.password,
			database: this.config.database,
			ssl: this.config.ssl ? this.normalizeSSLConfig(this.config.ssl) : null,
			waitForConnections: true, // 无可用连接时等待
			connectionLimit: this.config.connectionLimit,
			queueLimit: 0, // 不限制等待队列
			connectTimeout: 10000, // 10秒连接超时
			idleTimeout: 60000, // 60秒空闲超时
			ssl: this.config.ssl || null,
			timezone: 'local', // 时区同步
			charset: 'utf8mb4', // 支持emoji
			authPlugins: this.config.authPlugin
				? {
						mysql_clear_password: () => () =>
							Buffer.from(this.config.password + '\0'),
				  }
				: undefined,
		});

		// 监听连接池事件
		pool.on('connection', (connection) => {
			console.log('New connection established');
		});

		pool.on('acquire', (connection) => {
			console.log('Connection acquired');
		});

		pool.on('release', (connection) => {
			console.log('Connection released');
		});

		return pool;
	}

	async testConnection() {
		// console.log("test start")
		if (this.isTestConnection || !this.pool) {
			console.log('test with temporary');
			return this.testWithTemporaryConnection();
		}
		console.log('test with pool');
		return this.testWithPoolConnection();
	}

	/**
	 * 使用临时连接测试
	 * @returns {Promise<{success: boolean, error?: string, version?: string}>}
	 */
	async testWithTemporaryConnection() {

		let connection = null;
		try {
			// 1. 创建连接（添加关键配置）
			connection = await mysql.createConnection({
				host: this.config.host,
				port: this.config.port || 3306,
				user: this.config.user,
				password: this.config.password,
				database: this.config.database,
				connectTimeout: 5000, // 添加5秒连接超时
				ssl: this.config.ssl ? this.normalizeSSLConfig(this.config.ssl) : null,
				authPlugins: {
					// 处理MySQL 8.0+认证问题
					mysql_clear_password: () => () =>
						Buffer.from(this.config.password + '\0'),
				},
			});

			// 2. 测试查询（添加查询超时）
			const [rows] = await connection.query({
				sql: 'SELECT version() AS version',
				timeout: 3000, // 3秒查询超时
			});

			console.log('MySQL Version:', rows[0].version);

			// 3. 返回标准化结果
			return {
				success: true,
				version: rows[0].version,
			};
		} catch (err) {
			// 4. 错误处理
			return {
				success: false,
				error: this.parseError(err),
				errorCode: err.code, // 添加错误代码
				fatal: err.fatal, // 标记是否致命错误
			};
		} finally {
			// 5. 安全关闭连接
			if (connection) {
				try {
					await connection.end({ timeout: 1000 }); // 1秒关闭超时
				} catch (e) {
					console.error('Failed to close test connection:', e.message);
				}
			}
		}
	}

	/**
	 * 使用连接池测试
	 * @returns {Promise<{success: boolean, error?: string}>}
	 */
	async testWithPoolConnection() {
    
		let connection = null;
		try {
			connection = await this.pool.getConnection();
			await connection.query('SELECT 1');
			return { success: true };
		} catch (err) {
			return {
				success: false,
				error: this.parseError(err),
			};
		} finally {
			if (connection) {
				connection.release();
			}
		}
	}

	/**
	 * 执行SQL查询
	 * @param {string} sql SQL语句
	 * @param {Array} [params] 参数数组
	 * @returns {Promise<Array>}
	 */
	async query(sql, params = []) {
		if (this.isTestConnection) {
			throw new Error('Cannot execute query in test mode');
		}

		let connection = null;
		try {
			connection = await this.pool.getConnection();
			const [rows] = await connection.query(sql, params);
			return rows;
		} catch (err) {
			throw new Error(this.parseError(err));
		} finally {
			if (connection) {
				connection.release();
			}
		}
	}

	/**
	 * 关闭连接池
	 * @returns {Promise<void>}
	 */
	async close() {
		if (this.pool) {
			await this.pool.end();
		}
	}

	/**
	 * 解析MySQL错误
	 * @param {Error} err
	 * @returns {string}
	 */
	parseError(err) {
		const errorMap = {
			ER_ACCESS_DENIED_ERROR: 'Authentication failed: Invalid credentials',
			ER_BAD_DB_ERROR: `Database not found: ${this.config.database}`,
			ECONNREFUSED: `Connection refused: ${this.config.host}:${this.config.port}`,
			ETIMEDOUT: 'Connection timeout',
			PROTOCOL_CONNECTION_LOST: 'Connection lost',
			ER_PARSE_ERROR: 'SQL syntax error',
			ER_NO_SUCH_TABLE: 'Table does not exist',
			ER_DUP_ENTRY: 'Duplicate entry',
		};

		return errorMap[err.code] || `MySQL Error [${err.code}]: ${err.message}`;
	}

	/**
	 * 获取连接池状态
	 * @returns {Object|null}
	 */
	getPoolStatus() {
		if (!this.pool || !this.pool.pool) return null;

		return {
			totalConnections: this.pool.pool.connectionLimit,
			freeConnections: this.pool.pool._freeConnections.length,
			pendingAcquires: this.pool.pool._connectionQueue.length,
		};
	}
}

export default { Driver: MySQLDriver };
