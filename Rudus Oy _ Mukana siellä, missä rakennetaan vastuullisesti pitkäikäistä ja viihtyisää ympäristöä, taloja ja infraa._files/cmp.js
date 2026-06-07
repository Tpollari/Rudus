/******/ (() => { // webpackBootstrap
/*!**************************!*\
  !*** ./src/cmphelper.js ***!
  \**************************/
(function () {
  // add window object to gravito

  window.gravito.cmp = {};
  var componentURL = window.gravito.config.cmp.settings.componentURL ? window.gravito.config.cmp.settings.componentURL : "https://cdn.gravito.net/cmp/v6";
  var version = window.gravito.config.cmp.settings.version ? window.gravito.config.cmp.settings.version : "latest";
  var loadBundles = function loadBundles(callback) {
    var ui_path = componentURL ? componentURL + "/" + version + "/bundle.js" : "dist/bundle.js";
    var el = document.createElement("script");
    el.src = ui_path;
    el.async = "true";
    el.type = "module";
    el.addEventListener("load", function () {
      callback();
    });
    document.head.appendChild(el);
  };
  function addCMPRoot() {
    // add CMP Root to dom
    var cmpRoot = document.createElement("div");
    cmpRoot.id = "gravitoCMPRoot";
    document.body.appendChild(cmpRoot);
  }
  // check if CMP root is already added
  // if (!document.getElementById("gravitoCMPRoot")) {
  //   addCMPRoot();
  // }
  addCMPRoot();
  loadBundles(function () {});
})();
/******/ })()
;