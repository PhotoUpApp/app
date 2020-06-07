window.$ = window.jQuery = require('jQuery');

// Initial page
$('document').ready(function() {
    $('#wrapper').load('sections/status.html', function() {
      loadStatusPage();
    });
});

function loadSection(e) {
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
}

// Side Menu
$('.menu-item').on('click', loadSection);

// Load section code
const {loadStatusPage} = require("./assets/js/page-status.js" );
const {loadSettingsPage} = require("./assets/js/page-settings.js" );
