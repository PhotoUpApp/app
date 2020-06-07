exports.loadSettingsPage = function() {
  var child = child_process.spawn('/usr/local/bin/rclone', ['config', 'dump'], {
    encoding: 'utf8',
    shell: true
  });

  child.on('error', (error) => {
    console.log(error);
  });

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (data) => {
    $('#settings').val(data);
  });

  // Load album Path
  if (ipcRenderer.sendSync('get-store-value', 'settings.album_path') == '') {
    document.getElementById('album_path').placeholder = 'Type the path to your albums directory';
  } else {
    document.getElementById('album_path').value = ipcRenderer.sendSync('get-store-value', 'settings.album_path');
  }

  // Event: change album path
  document.getElementById('path').addEventListener('click', () => {
    document.getElementById('album_path').value = ipcRenderer.sendSync('select-dirs');

    // Save path
    ipcRenderer.send('set-store-value', document.getElementById('album_path').value);

    // Assume path is valid
    document.getElementById('album_path').setCustomValidity("");
    $("#album_path_err").hide();
  });


  // Wait for input and check if valid
  var typingTimer;
  var doneTypingInterval = 2000;  // 2 seconds
  $('#album_path').keyup(function() {
    clearTimeout(typingTimer);
    if ($('#album_path').val()) {
      typingTimer = setTimeout(doneTyping, doneTypingInterval);
    }
  });
  function doneTyping () {
    // Check if path exists
    const fs = require("fs");
    if (fs.existsSync(document.getElementById('album_path').value)) {

      // Save path
      ipcRenderer.send('set-store-value', {'settings.album_path': document.getElementById('album_path').value});

      // Styling
      $("#album_path").removeClass('input-invalid');
      $("#album_path").addClass('input-valid');
      $("#album_path_err").hide();
      setTimeout( function(){ $("#album_path").toggleClass('input-valid'); }, 3000 );
    } else {

      // Styling
      $("#album_path").addClass('input-invalid');
      $("#album_path_err").show();
      $("#album_path_err").html("Error: Path does not exist");
    }
  }
}
