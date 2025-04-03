import { ipcMain } from 'electron';
import { ConnectionManager } from '../../main/database/ConnectionManager.js';

export function registerDbHandlers() {
	const connectionManager = new ConnectionManager();

	ipcMain.handle('db:connect', async (_, config) => {
		return connectionManager.connect(config);
	});

	ipcMain.handle('db:disconnect', async (_, id) => {
		return connectionManager.disconnect(id);
	});

	ipcMain.handle('db:test-connection', async (_, config) => {
		return connectionManager.testConnection(config);
	});

	ipcMain.handle('db:list-connections', async () => {
		return connectionManager.listConnections();
	});
}
