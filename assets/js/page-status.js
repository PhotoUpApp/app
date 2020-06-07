exports.loadStatusPage = function() {
  // Check if album path is configured
  if (ipcRenderer.sendSync('get-store-value', 'settings.album_path') == '') {
    $('#app-status').html('App not configured. You can do this under the <a class="menu-item" href="./sections/settings.html">Settings</a> page.');
    $('.menu-item').on('click', loadSection);
  } else {
    $('#app-status').html("Automatically syncing files in <b>" + ipcRenderer.sendSync('get-store-value', 'settings.album_path') + "</b>");
  }

  var elem;
  $('document').ready(function(){
    elem = document.getElementById("googleProgressBar");
    elem.style.width = ipcRenderer.sendSync('op-check-status-google');

    elem = document.getElementById("s3ProgressBar");
    elem.style.width = ipcRenderer.sendSync('op-check-status-s3');
  });
}
