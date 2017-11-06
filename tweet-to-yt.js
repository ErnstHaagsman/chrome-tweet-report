var storageArea = chrome.storage.local;

var YOUTRACK_URL = "https://youtrack.jetbrains.com";
var ISSUE_ROUTE = YOUTRACK_URL + "/rest/issue";
var YOUTRACK_PROJECT = "CPRTINF";

function basicNotify(message){
  chrome.notifications.create(null, {
      "type": "basic",
      "iconUrl": "youtrack-16.png",
      "title": "Tweet Reporting",
      "message": message
    });
}

// Apparently event listeners for notifications are a global thing.
// We're using the YouTrack Ticket ID as the notification ID
chrome.notifications.onButtonClicked.addListener(handleSuccessNotification);
function handleSuccessNotification(ticketID, button_index){
  // The only button is undo, so undo
  undoReport(ticketID);
}

chrome.notifications.onClicked.addListener(handleOnClicked);
function handleOnClicked(ticketID) {
  openTicket(ticketID);
}

function openTicket(ticketID) {
  var url = YOUTRACK_URL + "/issue/" + ticketID;
  chrome.tabs.create({
    url: url
  });
}

function reportTweet(info, tab){
  var linkUrl = info.linkUrl;
  var createTicketRequest = new XMLHttpRequest();
  var twitter_user;
  var ticketID;

  storageArea.get('token', function(items){
    // Prepare the ticket. We'd like the title to contain the username of the Twitter user
    // this is in the URL: https://twitter.com/<username>/status/<status_id>
    // So the third element of the URL split by '/' should be the username
    twitter_user = linkUrl.split("/")[3];
    var ticket_title = "Twitter " + twitter_user;

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
    ticketID = ticketUrl.substr(ticketUrl.lastIndexOf("/") + 1);

    var notification = chrome.notifications.create(ticketID, {
      "type": "basic",
      "iconUrl": "youtrack-16.png",
      "title": "Tweet by " + twitter_user + " reported",
      "message": "Issue ID: " + ticketID,
      "buttons": [
        {
          "title": "Undo"
        }
      ]
    });

  }

  function onError(e){
    basicNotify('Error ' + e);
  }
}

function undoReport(issue_id){
  storageArea.get('token', function(items){
    var url = ISSUE_ROUTE + "/" + issue_id;

    var deleteTicketRequest = new XMLHttpRequest();

    // Prepare the DELETE request
    deleteTicketRequest.addEventListener("load", onLoad);
    deleteTicketRequest.addEventListener("error", onError);
    deleteTicketRequest.open("DELETE", url);

    // Add the authentication for the YT REST request
    var token = items.token;
    deleteTicketRequest.setRequestHeader("Authorization", "Bearer " + token);
    deleteTicketRequest.setRequestHeader("Accept", "application/json");

    deleteTicketRequest.send();
  });

  function onLoad(e){
    basicNotify("Issue "+ issue_id + " deleted");
  }

  function onError(e){
    basicNotify("An error occurred: " + e);
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