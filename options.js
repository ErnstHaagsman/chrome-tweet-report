var storageArea = chrome.storage.local;

function onLoad(){
  storageArea.get({
    token: ''
  }, function(items) {
    var token_input = document.getElementById('token');
    token_input.value = items.token;
  });
}

function persistToken(){
  var token_input = document.getElementById('token');
  storageArea.set({
    token: token_input.value
  }, function(){
    var status = document.getElementById('status');
    status.textContent = 'Saved';
    setTimeout(function(){
      status.textContent = '';
    }, 750);
  })
}

document.addEventListener("DOMContentLoaded", onLoad);
document.getElementById('save').addEventListener('click', persistToken)