# Louie - Stay In Touch for WhatsApp Web
This is the source code of a chrome extension that lets you stay in touch with your friends & family on WhatsApp Web.
You can find the published extension in [Chrome Web Store](https://chrome.google.com/webstore/detail/louie-stay-in-touch/cimpomloljeebpnbiacgkclehbkecbhh).

<img src="https://raw.githubusercontent.com/boredude/Louie/master/images/stay-in-touch-notifications.png" >

## Installing from GitHub directly
To install the extension off-store, download the latest release as a zip file from the [Releases](https://github.com/boredude/Louie/releases) page, 
**extract its content to a directory** and add it to Chrome using the 'Load unpacked extension' option when developer mode is turned on.

## How it works
This extension works by intercepting the WebSocket frames between chrome and WhatsApp's servers using a modified `WebSocket` constructor (see [wsHook](https://github.com/skepticfx/wshook)). 

Those frames are then decrypted if needed using the local encryption keys (stored in `localStorage`), and decoded from a binary form using a javascript code from WhatsApp's original implementation. 

The resulting "nodes" are being checked to find the chats and check them against the contacts and the "Stay In Touch" 
## Organization
The main code of the extension is located in `core/Main.js` and `core/UI.js`. 

Other files inside the `core` folder deal with the infrastructure that makes the interception and the decoding works. There is also an additional code for parsing messeges (such as `MessageTypes.js`) that is not used in the extension.
`background.js` mainly keeps track of the saved prefrences using `localStorage`.
