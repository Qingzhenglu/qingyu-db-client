const EventEmitter = require('events')

class ConnectionManager extends EventEmitter {
    constructor() {
        super() 
        this.connections = new Map() // 存储所有的连接 {id: {config, connection}}
        this.currentId = 0;
    }

    // 连接
    async connect(config) {
        const connector = require(`./connectors/${config.type}`)
        try {
            const connection = await connector.connect(config)
            const id = `conn_${++this.currentId}`

            this.connections.set(id, {
                config,
                connection,
                createdAt: new Date(),
                lastUsed: new Date()
            })

            this.emit('connection-changed')
            return { id, success: true}
        } catch (error) {
            return { success: false, message: error.message }
        }
    }

    // 断开连接
    async disconnect(id) {
        const conn = this.connections.get(id)
        if (!conn) return false 

        const connector = require(`./connectors/${conn.config.type}`)
        await connector.disconnect(conn.connection)

        this.connections.delete(id)
        this.emit('connection-changed')
        return true
    }

    // 测试连接
    async testConnection(config) {
        try {
          const result = await this.connect(config)
          if (result.success) {
            await this.disconnect(result.id)
            return { success: true }
          }
          return result
        } catch (error) {
          return { success: false, error: error.message }
        }
      }

    // 获取连接信息
    getConnection(id) {
        const conn = this.connections.get(id)
        if (conn) {
            conn.lastUsed = new Date()
            return conn.connection
        }
        return null
    }

    // 获取所有连接
    listConnections() {
        return Array.from(this.connections.entries()).map(([id, data]) => ({
            id,
            type: data.config.type,
            name: data.config.name || 'Unnamed',
            status: 'connected',
            createdAt: data.createdAt
        }))
    }
}

module.exports = new ConnectionManager()