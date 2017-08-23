var storageArea = chrome.storage.local;

var YOUTRACK_URL = "https://youtrack.jetbrains.com";
var ISSUE_ROUTE = YOUTRACK_URL + "/rest/issue";
var YOUTRACK_PROJECT = "PYMKT";

function reportTweet(info, tab){
  var linkUrl = info.linkUrl;
  var createTicketRequest = new XMLHttpRequest();

  storageArea.get('token', function(items){
    // Prepare the ticket. We'd like the title to contain the username of the Twitter user
    // this is in the URL: https://twitter.com/<username>/status/<status_id>
    // So the third element of the URL split by '/' should be the username
    var twitter_user = linkUrl.split("/")[3];
    var ticket_title = "PyCharm Twitter " + twitter_user;

    var ticket_description = linkUrl;

    // According to the YouTrack API docs, it only accepts the ticket data
    // as GET style URL parameters. So we'll need to encode these
    var url = ISSUE_ROUTE + "?project=" + encodeURIComponent(YOUTRACK_PROJECT);
    url += "&summary=" + encodeURIComponent(ticket_title);
    url += "&description=" + encodeURIComponent(ticket_description);

    // Prepare the PUT request
    createTicketRequest.addEventListener("load", onLoad);
    createTicketRequest.addEventListener("error", onError);
    createTicketRequest.open("PUT", url);

    // Add the authentication for the YT REST request
    var token = items.token;
    createTicketRequest.setRequestHeader("Authorization", "Bearer " + token);
    createTicketRequest.setRequestHeader("Accept", "application/json");

    createTicketRequest.send();
  });

  function onLoad(e){
    var ticketUrl = createTicketRequest.getResponseHeader("Location");

    // The last segment of the URL is the ticket ID
    // Example: http://unit-258.labs.intellij.net:8080/charisma/rest/issue/TST-1
    var ticketID = ticketUrl.substr(ticketUrl.lastIndexOf("/") + 1);

    alert('Reported ' + ticketID);
  }

  function onError(e){
    alert('Error ' + e);
  }
}

var menuItem = chrome.contextMenus.create({
  "title": "Report Tweet to YouTrack",
  "onclick": reportTweet,
  "contexts": [
    "link"
  ],
  "targetUrlPatterns": [
    "*://twitter.com/*/status/*"
  ]
});