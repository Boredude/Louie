// this is the background page!
chrome.runtime.onMessage.addListener(onMessage);

function onMessage(messageEvent, sender, callback)
{
    if (messageEvent.name == "setOptions")
    {
        chrome.storage.sync.set({options: messageEvent.options}, function() {
            // callback
            callback();
        });
    }
    else if (messageEvent.name == "getOptions")
    {
        chrome.storage.sync.get('options', function(result) {
            // callback
            callback(result.options);
        });
    }

    return true; // Inform Chrome that we will make a delayed sendResponse
}

chrome.browserAction.onClicked.addListener(function(activeTab)
{
    var newURL = "https://web.whatsapp.com";
    chrome.tabs.create({ url: newURL });
});