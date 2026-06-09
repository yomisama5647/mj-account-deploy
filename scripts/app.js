/**
 * 应用主入口
 */
(function () {
  UI.init();

  if (Auth.init()) {
    UI.showMain(Auth.currentUser);
    Records.init();
    UI.renderAll();
  } else {
    UI.showSetup();
  }
})();
