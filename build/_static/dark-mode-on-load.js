/*
* To ensure no flickering when navigating between pages this script 
* runs synchronously when the dark mode toggler button is loaded
* so dark mode can be triggered.
*/

if ($('.dark-mode-toggler').length > 0){

  var themeMode = localStorage.getItem('themeMode');

  // Dark mode based on local storage
  if (themeMode == 'dark') {
    darkModeOn();
  }
  // Dark mode off based on local storage
  else if (themeMode == 'light'){
    darkModeOff();
  }
  else{
    if (window.matchMedia) {
      // Dark mode based on system preference
      if(window.matchMedia('(prefers-color-scheme: dark)').matches){
        darkModeOn();
      }
      // Dark mode off based on system preference
      else {
        darkModeOff();
      }
    } else {
      // Default
      darkModeOff();
    };
  };
};

// Turns on dark mode
function darkModeOn() {
  $('.dark-mode-toggler').removeClass('fa-toggle-off');
  $('.dark-mode-toggler').addClass('fa-toggle-on');
  $('body').addClass('dark-mode');
  localStorage.setItem('themeMode', 'dark');
  return;
};

// Turns off dark mode
function darkModeOff() {
  $('.dark-mode-toggler').removeClass('fa-toggle-on');
  $('.dark-mode-toggler').addClass('fa-toggle-off');
  $('body').removeClass('dark-mode');
  localStorage.setItem('themeMode', 'light');
  return;
};
