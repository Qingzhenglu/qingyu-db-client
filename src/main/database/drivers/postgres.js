import { Client } from 'pg'

module.exports = {
  async connect(config) {
    const client = new Client({
      host: config.host,
      port: config.port || 5432,
      user: config.user,
      password: config.password,
      database: config.database,
      ssl: config.ssl ? { rejectUnauthorized: false } : false
    })
    
    await client.connect()
    return client
  },

  async disconnect(connection) {
    if (connection && connection.end) {
      await connection.end()
    }
  }
}

export class PostgreSQLDriver {
  constructor() {
    
  }
}