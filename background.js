// this is the background page!
chrome.runtime.onMessage.addListener(onMessage);

function onMessage(messageEvent, sender, callback)
{
    if (messageEvent.name == "setOptions")
    {
        chrome.storage.sync.set({options: messageEvent.options}, function() {
            // log
            console.log('Value is set to ' + JSON.parse(messageEvent.options));
            // callback
            if (callback) callback();
        });
    }
    else if (messageEvent.name == "getOptions")
    {
        chrome.storage.sync.get(['options'], function(result) {
            // log
            console.log('Value currently is ' + JSON.parse(result.key));
            callback(result.key);
        });
    }
}

chrome.browserAction.onClicked.addListener(function(activeTab)
{
    var newURL = "https://web.whatsapp.com";
    chrome.tabs.create({ url: newURL });
});