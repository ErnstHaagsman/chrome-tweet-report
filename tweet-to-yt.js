function onClick(info, tab){
  var linkUrl = info.linkUrl;
  alert("The user clicked " + linkUrl);
}

var menuItem = chrome.contextMenus.create({
  "title": "Report Tweet to YouTrack",
  "onclick": onClick,
  "contexts": [
    "link"
  ],
  "targetUrlPatterns": [
    "*://twitter.com/*/status/*"
  ]
});