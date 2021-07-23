/*
* This runs synchronously after the side menu is loaded so that the icons
* can be added without any flickering when navigating through pages.
* The links in the toctree has no classes or IDs that can be used
* for selecting the elements, hence the following method is used where
* the first four links on the first level gets the icons.
*/

var mvpLinks = document.querySelectorAll("li.toctree-l1 > a");

if (mvpLinks.length > 4) {
  let rocketIcon = document.createElement('i');
  rocketIcon.classList.add('wy-menu-vertical-icon','fa','fa-rocket');
  mvpLinks[0].prepend(rocketIcon);
  mvpLinks[0].classList.add("mvp-link");

  let barsIcon = document.createElement('i');
  barsIcon.classList.add('wy-menu-vertical-icon','fa','fa-bars');
  mvpLinks[1].prepend(barsIcon);
  mvpLinks[1].classList.add("mvp-link");

  let folderIcon = document.createElement('i');
  folderIcon.classList.add('wy-menu-vertical-icon','fa','fa-folder-o');
  mvpLinks[2].prepend(folderIcon);
  mvpLinks[2].classList.add("mvp-link");

  let starIcon = document.createElement('i');
  starIcon.classList.add('wy-menu-vertical-icon','fa','fa-star-o');
  mvpLinks[3].prepend(starIcon);
  mvpLinks[3].classList.add("mvp-link");
};
