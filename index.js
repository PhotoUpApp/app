'use strict';
const path = require('path');
const {app, BrowserWindow, Menu, Tray, ipcMain} = require('electron');
/// const {autoUpdater} = require('electron-updater');
const {is} = require('electron-util');
const unhandled = require('electron-unhandled');
const debug = require('electron-debug');
const contextMenu = require('electron-context-menu');
const menu = require('./menu');
const log4js = require('log4js');


unhandled();
debug();
contextMenu();

app.setAppUserModelId('com.photoup.app');
app.allowRendererProcessReuse = true;


// Set up logging
var logger = log4js.getLogger();
logger.level = 'debug';


let tray = null
app.whenReady().then(() => {
  tray = new Tray('./assets/img/unnamed.png')
  const contextMenu = Menu.buildFromTemplate([
    { label: 'GPhotos', type: 'normal' },
    { label: 'S3', type: 'normal' }
  ]);
  tray.setToolTip('PhotoUp status');
  tray.setContextMenu(contextMenu);
});

class OperationStatus {
  constructor(height, width) {
    this.google = '100%';
    this.s3 = '100%';
  }

	setGoogle(value) {
		this.google = value;
		this.renderStatus();
	}

	setS3(value) {
		this.s3 = value;
		this.renderStatus();
	}

	renderStatus() {
		const contextMenu = Menu.buildFromTemplate([
			{ label: 'GPhotos: ' + this.google, type: 'normal' },
			{ label: 'S3: ' + this.s3, type: 'normal' }
		]);
		tray.setContextMenu(contextMenu);
	}
}

let op = new OperationStatus();

ipcMain.on('op-status-update-google', (event, arg) => {
  op.setGoogle(arg);
});

ipcMain.on('op-status-update-s3', (event, arg) => {
  op.setS3(arg);
});

ipcMain.on('op-check-status-google', (event, arg) => {
  event.returnValue = op.google;
});

ipcMain.on('op-check-status-s3', (event, arg) => {
  event.returnValue = op.s3;
});


if (!is.development) {
	const FOUR_HOURS = 1000 * 60 * 60 * 4;
	setInterval(() => {
		autoUpdater.checkForUpdates();
	}, FOUR_HOURS);

	autoUpdater.checkForUpdates();
}

// Prevent window from being garbage collected
let mainWindow;

const createMainWindow = async () => {
	const win = new BrowserWindow({
		title: app.name,
		show: false,
    width: 1281,
    height: 800,
    minWidth: 1281,
    minHeight: 800,
    webPreferences: {
      devTools: false,
      nodeIntegration: true
    }
	});

	win.on('ready-to-show', () => {
		win.show();
	});

	win.on('closed', () => {
		// Dereference the window
		// For multiple windows store them in an array
		mainWindow = undefined;
	});

	await win.loadFile(path.join(__dirname, 'index.html'));

	return win;
};

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
	app.quit();
}

app.on('second-instance', () => {
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}

		mainWindow.show();
	}
});

app.on('window-all-closed', () => {
	if (!is.macos) {
		app.quit();
	}
});

app.on('activate', async () => {
	if (!mainWindow) {
		mainWindow = await createMainWindow();
	}
});

(async () => {
	await app.whenReady();
	Menu.setApplicationMenu(menu);
	mainWindow = await createMainWindow();
})();
