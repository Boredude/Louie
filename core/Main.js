// global variables
var readConfirmationsHookEnabled = true;
var presenceUpdatesHookEnabled = true;
var safetyDelay = 0;
var WAdebugMode = false;
var isInitializing = true;
var exceptionsList = [];
var blinkingChats = {};
var chats = {};
var blockedChats = {};

// ---------------------
// Actual interception
// ---------------------

wsHook.before = function(originalData, url) 
{
	var payload = WACrypto.parseWebSocketPayload(originalData);
	var tag = payload.tag;
	var data = payload.data;
	
	return new Promise(function(resolve, reject)
	{
		if (data instanceof ArrayBuffer)
		{
			// encrytped binary payload
			WACrypto.decryptWithWebCrypto(data).then(function(decrypted)
			{
				if (decrypted == null) resolve(originalData);
				
				var nodeParser = new NodeParser();
				var node = nodeParser.readNode(new NodeBinaryReader(decrypted));
				
				if (isInitializing)
				{
					isInitializing = false;
					console.log("WhatsIncognito: Interception is working.");
					document.dispatchEvent(new CustomEvent('isInterceptionWorking', {detail: true}));
				}
				
				WACrypto.packNodeForSending(node, tag).then(function(packet)
				{
					if (WAdebugMode)
					{
						console.log("[Out] Sending binary with tag '" + tag + "' (" + decrypted.byteLength + " bytes, decrypted): ");
						console.log(node);
					}

					var data = packet.serialize();
					resolve(data);
				});
			});
		}
		else
		{
			// textual payload
			if (!(data instanceof ArrayBuffer))
			{
				if (WAdebugMode) console.log("[Out] Sending message with tag '" + tag +"':");
				if (data != "" && WAdebugMode) console.log(data);
				resolve(originalData);
			}
		}
	});
}

wsHook.after = function(messageEvent, url) 
{
	var payload = WACrypto.parseWebSocketPayload(messageEvent.data);
	var tag = payload.tag;
	var data = payload.data;
	
	if (data instanceof ArrayBuffer)
	{
		WACrypto.decryptWithWebCrypto(data).then(function(decrypted)
		{
			var nodeParser = new NodeParser();
			var node = nodeParser.readNode(new NodeBinaryReader(decrypted));
			
			if (WAdebugMode)
			{
				console.log("[In] Received binary with tag '" + tag + "' (" +  decrypted.byteLength + " bytes, decrypted)): ");
				console.log(node);
			}

			NodeHandler.handleReceivedNode(node);
		});
   }
   else
	{
		if (WAdebugMode) console.log("[In] Received message with tag '" + tag +"':");
		if (data != "" && WAdebugMode)
			console.log(data);
	}
	
}

var NodeHandler = {};

(function() {

	NodeHandler.handleReceivedNode = function(e)
	{
		// look for original (not duplicated) message containing whatsapp chats
		if ("response" === nodeReader.tag(e) && 
			"chat" === nodeReader.attr("type", e) &&
			!nodeReader.attr('duplicate', e)) {
			// Found it
			console.log('[In] recieved chats')
			console.log(e);
			// read children
			const children = nodeReader.children(e);
			// skip if not an array
			if (Array.isArray(children)) {
				// parse chats
				const chats = children.map(chlid => nodeReader.attrs(chlid))
									  .reduce((acc, chat) => {
										acc[chat.jid] = chat;
										  return acc;
									  }, {});
				// dispatch event
				document.dispatchEvent(new CustomEvent('onChatsRecieved', {detail: JSON.stringify(chats)}));
			}
		}
	}

	var nodeReader = 
	{
		tag: function(e) { return e && e[0] },
		attr: function(e, t) { return t && t[1] ? t[1][e] : void 0},
		attrs: function(e) { return e[1]},
		child: function s(e, t) {
			var r = t[2];
			if (Array.isArray(r))
				for (var n = r.length, o = 0; o < n; o++) {
					var s = r[o];
					if (Array.isArray(s) && s[0] === e)
						return s
				}
		},
		children: function(e) 
		{
			return e && e[2]
		},
		dataStr: function(e) 
		{
			if (!e) return "";
			var t = e[2];
			return "string" == typeof t ? t : t instanceof ArrayBuffer ? new BinaryReader(t).readString(t.byteLength) : void 0
		}
	}

})();

// ---------------------
// UI Event handlers
// ---------------------

document.addEventListener('onStayInTouchClicked', function(e) 
{
	var menuItems = document.getElementsByClassName("_3z3lc")[0].getElementsByClassName("_3cfBY ");
	var reactMenuItems = FindReact(document.getElementsByClassName("_2hHc6")[0])[0].props.children;
	var props = null;
	for (var i=0;i<reactMenuItems.length;i++)
	{
		if (reactMenuItems[i] == null) continue;

		if (reactMenuItems[i].key == ".$mark_unread")
		{
			markAsReadButton = menuItems[i];
			props = reactMenuItems[i].props;
			break;
		}
	}
	if (props != null)
	{
		var name = props.chat.name;
		var formattedName = props.chat.contact.formattedName;
		var jid = props.chat.id;
		var lastMessageIndex = props.chat.lastReceivedKey.id;
		var unreadCount = props.chat.unreadCount;
		var isGroup = props.chat.isGroup;
		var fromMe = props.chat.lastReceivedKey.fromMe;

		var data = {name: name, formattedName: formattedName, jid: jid, lastMessageIndex: lastMessageIndex, fromMe: fromMe, unreadCount: unreadCount, isGroup: isGroup};
		document.dispatchEvent(new CustomEvent('onOpenStayInTouchDialog', {detail: JSON.stringify(data)}));	
	}
});

document.addEventListener('onMainUIReady', function(e)
{
	exposeWhatsAppAPI();
});

// -------------------
// Helper functions
// --------------------
window.FindReact = function(dom) 
{
    for (var key in dom)
	{
        if (key.startsWith("__reactInternalInstance$")) 
		{
			var reactElement = dom[key];
			
			return reactElement.memoizedProps.children;
			
            var compInternals = dom[key]._currentElement;
            var compWrapper = compInternals._owner;
			if (compWrapper == null) return compInternals;
            var comp = compWrapper._instance;
            return comp;
        }
	}
    return null;
};

function exposeWhatsAppAPI()
{
	// iterate the modules using webpackJsonp and find the functions we are looking for
	// taken from https://github.com/danielcardeenas/sulla/blob/master/src/lib/wapi.js
	
	var foundModules = [];

	function iterateModules(modules) {
		for (let idx in modules) {
			if ((typeof modules[idx] === "object") && (modules[idx] !== null)) {
				let first = Object.values(modules[idx])[0];
				if ((typeof first === "object") && (first.exports)) {
					for (let idx2 in modules[idx]) {
						let module = modules(idx2);
						if (!module) continue;
						foundModules.push(module);

						// find the Store module
						if (module.Chat && module.Msg)
						{
							window.WhatsAppAPI_1 = module;
						}

						if (module.sendConversationSeen && module.binSend)
						{
							window.WhatsAppAPI_2 = module;
						}

						// find the module that lets us send read receipts
						if (module.sendSeen)
						{
							window.WhatsAppSeenAPI = module;
						}

						// find the web module
						if (module.VERSION_STR)
						{
							console.log("WhatsIncognito: WhatsApp Web verison is " + module.VERSION_STR);
						}
					}
				}
			}
		}
	}

	webpackJsonp([], { 'parasite': (x, y, z) => iterateModules(z) }, ['parasite']);
	
	if (window.WhatsAppSeenAPI == undefined)
	{
		console.error("WhatsAppWebIncognito: Can't find the WhatsApp API. Sending read receipts might not work.");
	}
}