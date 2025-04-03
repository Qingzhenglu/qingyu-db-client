import { DatabaseFactory } from '../database/DatabaseFactory.js';
import { ipcMain } from 'electron';

export class DatabaseService {
  constructor() {
    this.connections = new Map();
  }

  registerHandlers() {
    ipcMain.handle('db:test-connection', async (_, { type, config }) => {

        // const conn = DatabaseFactory.create(type, config);
        // conn.isTestConnecion = true;
        // conn.testConnection();
    })

    // ipcMain.handle('db:connect', (_, { type, config }) => {
    //   const conn = DatabaseFactory.create(type, config);
    //   this.connections.set(config.id, conn);
    //   return { success: true };
    // });

    // ipcMain.handle('db:query', (_, { connId, sql }) => {
    //   const conn = this.connections.get(connId);
    //   return conn.query(sql);
    // });
  }
}