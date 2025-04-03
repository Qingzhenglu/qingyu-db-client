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
			database: config.database,
			ssl: config.ssl ? this.normalizeSSLConfig(config.ssl) : null,
			waitForConnections: true,
      connectionLimit: config.connectionLimit | 10
		};

    this.isTestConnection = isTestConnection;

    if (!isTestConnection) {
      this.pool = this.createPool();
    }
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
      rejectUnauthorized: sslConfig.rejectUnauthorized !== false 
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
			waitForConnections: this.config.waitForConnections,
      connectionLimit: this.config.connectionLimit | 10,
      onConnection: (connection) => {
        connection.on('error', (err) => {
          console.error('Connection error:', err);
        });
      }
    });

    // 监听连接池事件
    pool.on('connection', (connection) => {
      console.log('New connection established');
    })

    pool.on('acquire', (connection) => {
      console.log('Connection acquired');
    })

    pool.on('release', (connection) => {
      console.log('Connection released');
    })

    return pool;
  }

  async testConnection() {
    if (this.isTestConnection || !this.pool) {
      return this.testWithTemporaryConnection();
    }
    return this.testWithPoolConnection();
  }

  /**
   * 使用临时连接测试
   * @returns {Promise<{success: boolean, error?: string, version?: string}>}
   */
  async testWithTemporaryConnection() {
    let connection = null;
    try {
      connection = await mysql.createConnection({
        host: this.config.host,
        port: this.config.port || 3306,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        ssl: this.config.ssl ? this.normalizeSSLConfig(this.config.ssl) : null,
        connectionLimit: 1
      });

      const [rows] = await connection.query('SELECT version() AS version');

      return {
        success: true,
        version: rows[0].version
      };
    } catch (err) {
      return {
        success: false,
        error: this.parseError(err)
      }
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch (e) {
          console.error('Failed to close test connection:', e);
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
      connection = this.pool.getConnection();
      await connection.query('SELECT 1');
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: this.parseError(err)
      }
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
      'ER_ACCESS_DENIED_ERROR': 'Authentication failed: Invalid credentials',
      'ER_BAD_DB_ERROR': `Database not found: ${this.config.database}`,
      'ECONNREFUSED': `Connection refused: ${this.config.host}:${this.config.port}`,
      'ETIMEDOUT': 'Connection timeout',
      'PROTOCOL_CONNECTION_LOST': 'Connection lost',
      'ER_PARSE_ERROR': 'SQL syntax error',
      'ER_NO_SUCH_TABLE': 'Table does not exist',
      'ER_DUP_ENTRY': 'Duplicate entry'
    };

    return errorMap[err.code] || 
      `MySQL Error [${err.code}]: ${err.message}`;
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
      pendingAcquires: this.pool.pool._connectionQueue.length
    };
  }
}


