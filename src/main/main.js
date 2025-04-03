import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerDbHandlers } from '../shared/ipc/dbHandlers.js';
import { DatabaseService } from '../main/services/DatabaseService.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 全局变量保持窗口引用
let mainWindow;


function createWindow() {
	//创建浏览器窗口
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, './preload.js'),
			nodeIntegration: false,
			contextIsolation: true,
		},
	});

	if (process.env.NODE_ENV === 'development') {
		mainWindow.loadURL('http://localhost:3000');
		mainWindow.webContents.openDevTools();
	} else {
		mainWindow.loadFile('dist/renderer/index.html');
	}
}

// // 数据库连接模块（后续实现）
// const db = require('./db/core');

// 全局变量保持窗口引用
// let mainWindow: BrowserWindow | null;

// function createWindow() {
//     //创建浏览器窗口
//     mainWindow =  new BrowserWindow({
//         width: 1200,
//         height: 800,
//         webPreferences: {
//             nodeIntegration: false,  // 启用Node集成
//             contextIsolation: true,    // 关闭上下文隔离
//             preload: path.join(__dirname, '../preload/index.js') // 预加载脚本
//         },
//         title: 'Qingyu DB Client',
//         // icon: path.join(__dirname, '../resources/icon.png') // 应用图标
//     });

//     // 加载应用页面
//     if (process.env.NODE_ENV === 'development') {
//         // 开发模式： 加载Vite开发服务器
//         mainWindow.loadURL('http:localhost:3000');
//         mainWindow.webContents.openDevTools();
//     } else {
//         // 生产模式：加载打包后的文件
//         mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
//     }

//     // 窗口关闭事件
//     mainWindow.on('closed', () => {
//         mainWindow = null;
//     });
// }

// Electron准备就绪后初始化
app.whenReady().then(() => {
	registerDbHandlers();
	// 在主进程初始化时调用
	// const dbService = new DatabaseService();
	// dbService.registerHandlers();

	createWindow();
});

// // 所有窗口关闭时退出应用（macOS除外）
// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') {
//         app.quit();
//     }
// });

// app.on('activate', () => {
//     if (mainWindow === null) {
//       createWindow();
//     }
//   });

// 其他IPC通信...
