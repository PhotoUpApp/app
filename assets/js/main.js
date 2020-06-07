const {ipcRenderer} = require('electron');
const child_process = require('child_process');
const chokidar = require('chokidar');
const log4js = require('log4js');
const store = require('electron-store');


// Set up logging
var logger = log4js.getLogger();
logger.level = 'debug';

// Init storage
const appStore = new store();

// This function will run the rclone command for the destination
// specified and update the OperationStatus with the progress
// as well as exit code when it's done (using the callback).
function runRCloneCmd(destination, callback) {

		// Set args for destination
		var args = ['-P', '--stats-one-line', 'copy', appStore.get('settings.album_path')]
		if (destination == 'google') {
			args.push('GooglePhotos:album/');
		} else {
			args.push('S3:test-marius-123');
		}

		// Start process
    var child = child_process.spawn('rclone', args, {
        encoding: 'utf8',
        shell: true
    });

    child.on('error', (error) => {
			  logger.error(error);
    });

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (data) => {
			  data = data.toString();
        logger.debug(data);

				// Update status
				if (destination == 'google') {
          ipcRenderer.send('op-status-update-google', data.split(',')[1])
          var elem = document.getElementById("googleProgressBar");
          elem.style.width = data.split(',')[1];
				} else {
          ipcRenderer.send('op-status-update-s3', data.split(',')[1])
          var elem = document.getElementById("s3ProgressBar");
          elem.style.width = data.split(',')[1];
				}
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (data) => {
        // Return some data to the renderer process with the mainprocess-response ID
        mainWindow.webContents.send('mainprocess-response', data);
        logger.debug(data.toString());
    });

    child.on('close', (code) => {
        if (code == 0) {
						logger.info('[RClone] Upload complete');
						if (destination == 'google') {
                ipcRenderer.send('op-status-update-google', '100%')
                var elem = document.getElementById("googleProgressBar");
                elem.style.width = '100%';
						} else {
							  ipcRenderer.send('op-status-update-s3', '100%')
                var elem = document.getElementById("s3ProgressBar");
                elem.style.width = '100%';
						}

			  } else {
						logger.error('[RClone] Process ended with unknown status code: ', code);
        }
    });

    if (typeof callback === 'function')
        callback();
}


function runRClone(path) {
		// Start upload to GPhotos
		runRCloneCmd('google')

		// Start upload to S3
		runRCloneCmd('s3')
}

function startFSWatcher(path){
    var watcher = chokidar.watch(appStore.get('settings.album_path'), {
        persistent: true,
				ignoreInitial: true
    });

    watcher
		.on('ready', function() {
				logger.debug('[Watcher] FS watcher ready');
		})
		.on('error', function(error) {
         logger.error('[Watcher] Error with FS watcher: ', error);
    })
    .on('add', function(path) {
          logger.debug('[Watcher] New file added: ', path);
					runRClone(path);
    })
    .on('change', function(path) {
			   logger.debug('[Watcher] File changed: ', path);
				 runRClone(path);
    });
}


// Main
startFSWatcher()
