// this is the background page!
chrome.runtime.onMessage.addListener(onMessage);

function onMessage(messageEvent, sender, callback)
{
    if (messageEvent.name == "setContacts")
    {
        chrome.storage.sync.set({contacts: messageEvent.contacts}, function() {
            // callback
            callback();
        });
    }
    else if (messageEvent.name == "getContacts")
    {
        chrome.storage.sync.get('contacts', function(result) {
            // callback
            callback(result.contacts);
        });
    } 
    else if (messageEvent.name == "setUrgencies")
    {
        chrome.storage.sync.set({urgencies: messageEvent.urgencies}, function() {
            // callback
            callback();
        });
    }
    else if (messageEvent.name == "getUrgencies")
    {
        chrome.storage.sync.get('urgencies', function(result) {
            // callback
            callback(result.urgencies);
        });
    }

    return true; // Inform Chrome that we will make a delayed sendResponse
}

chrome.browserAction.onClicked.addListener(function(activeTab)
{
    var newURL = "https://web.whatsapp.com";
    chrome.tabs.create({ url: newURL });
});