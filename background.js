"use strict"

let currentAppWindowId = -1;

function openApp() {
  if (currentAppWindowId !== -1) chrome.windows.remove(currentAppWindowId);

  chrome.windows.create(
    {
      url: "./index.html",
      type: "popup",
      width: 420,
      height: 700,
    },
    (window) => {
      currentAppWindowId = window.id;
    }
  );
}

// handle events for app
chrome.runtime.onInstalled.addListener(function () {
  console.log(`tab holder just installed!\ninstlled time : ${Date()}`);
});

chrome.action.onClicked.addListener(function (tab) {
  openApp();
});

chrome.commands.onCommand.addListener((command) => {
  openApp();
});