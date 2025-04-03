import { MySQLDriver } from './drivers/mysql.js';
// import { PostgreSQLDriver } from './drivers/postgres.js';

export class DatabaseFactory {
	static create(type, config) {
		switch (type) {
			case 'mysql':
				return new MySQLDriver(config);
			// case 'postgres':
			// 	return new PostgreSQLDriver(config);
			default:
				throw new Error(`Unsupported database type: ${type}`);
		}
	}
}
