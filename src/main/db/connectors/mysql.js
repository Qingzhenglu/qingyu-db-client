const mysql = require('mysql2/promise')

module.exports = {
  async connect(config) {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port || 3306,
      user: config.user,
      password: config.password,
      database: config.database,
      ssl: config.ssl ? { rejectUnauthorized: false } : null
    })
    
    // 测试连接是否有效
    await connection.ping()
    return connection
  },

  async disconnect(connection) {
    if (connection && connection.end) {
      await connection.end()
    }
  }
}