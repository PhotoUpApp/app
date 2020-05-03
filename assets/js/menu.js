window.$ = window.jQuery = require('jQuery');

// Initial page
$('document').ready(function() {
    $('#wrapper').load('sections/status.html', function() {
      loadStatusPage();
    });
});

// Side Menu
$('.menu-item').on('click', function (e) {
  e.preventDefault();
  var page = $(this).attr('href');
  $('#wrapper').load(page, function() {

     switch (e.target.textContent) {
       case 'Status':
         loadStatusPage();
         break;
       case 'Settings':
         loadSettingsPage();
         break;
       default:
         console.log(`Menu item ${e.target.textContent} not found!`);
     }

  });
});

function loadStatusPage() {
  var elem;
  $('document').ready(function(){
    elem = document.getElementById("googleProgressBar");
    elem.style.width = ipcRenderer.sendSync('op-check-status-google');

    elem = document.getElementById("s3ProgressBar");
    elem.style.width = ipcRenderer.sendSync('op-check-status-s3');
  });
}

function loadSettingsPage() {
  console.log('test')
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
}
