
// Display the search bar on mobile
$(document).on("click", "#search-button", function() {
    $('.wy-content-search').toggleClass('show');
    $('.wy-nav-content').toggleClass('showing-search-bar');
});

// Display the chromia-nav menu on mobile
$(document).on("click", "#hamburger-menu", function() {
  $('.chromia-nav-links').toggleClass('grow-menu');
});

// Flip the menu-arrow when the side navbar is toggled on mobile
$(document).on("click", "[data-toggle='wy-nav-top']", function() {
  if($('.wy-nav-side').hasClass('shift')) {
    $('#menu-arrow-right').removeClass('show');
  } 
  else {
    $('#menu-arrow-right').addClass('show');
  }
});

// Toggle between dark- and light mode
$(document).on("click", "[data-toggle='dark-mode-toggle']", function() {
  if ($('body').hasClass('dark-mode')) {
    darkModeOff();
  }
  else {
    darkModeOn();
  }
});

// Turns on dark mode
function darkModeOn() {
  $('.dark-mode-toggler').removeClass('fa-toggle-off');
  $('.dark-mode-toggler').addClass('fa-toggle-on');
  $('body').addClass('dark-mode');
  localStorage.setItem('themeMode', 'dark');
  return;
};

// Turns on light mode
function darkModeOff() {
  $('.dark-mode-toggler').removeClass('fa-toggle-on');
  $('.dark-mode-toggler').addClass('fa-toggle-off');
  $('body').removeClass('dark-mode');
  localStorage.setItem('themeMode', 'light');
  return;
};
