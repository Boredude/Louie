var isInterceptionWorking = false;

document.addEventListener('isInterceptionWorking', function(e) {
   isInterceptionWorking = e.detail;
});

if (document.querySelector(".app-wrapper > .app") != undefined)
{
	setTimeout(function () { onMainUIReady(); }, 100);
}
else
{
	var appElem = document.getElementById("app");
	if (appElem != undefined)
	{
		var mutationObserver = new MutationObserver(function (mutations)
		{
			var mainUiReady = false;
			for (var i = 0; i < mutations.length; i++)
			{
				var addedNodes = mutations[i].addedNodes;
				for (var j = 0; j < addedNodes.length; j++)
				{
					var addedNode = addedNodes[j];
					if (addedNode.nodeName.toLowerCase() == "div" && addedNode.classList.contains("app"))
					{
						setTimeout(function () { onMainUIReady(); }, 100);
						mainUiReady = true;
						break;
					}
					else if (addedNode.nodeName.toLowerCase() == "div" && addedNode.classList.contains("_2hHc6"))
					{
						if (shouldAddStayInTouchOption()) {
							addStayInTouchOption();
						}
						
						setTimeout(function() 
						{
							document.dispatchEvent(new CustomEvent('onDropdownOpened', {}));
							
						},200);
					}
					else if (addedNode.nodeName.toLowerCase() == "div" && addedNode.classList.contains("NuujD"))
					{
						document.dispatchEvent(new CustomEvent('onPaneChatOpened', {}));
					}
				}
				if (mainUiReady) break;
			}
		});
		mutationObserver.observe(appElem, { childList: true, subtree: true });
	}
}

function onMainUIReady() 
{
	document.dispatchEvent(new CustomEvent('onMainUIReady', {}));

	setTimeout(checkInterception, 1000);
	addIconIfNeeded();
	
	// if the menu itme is gone somehow after a short period of time (e.g because the layout changes from right-to-left) add it again
    setTimeout(addIconIfNeeded, 500);
	setTimeout(addIconIfNeeded, 1000);
	
	listenToChatPanelChanges();
}

function listenToChatPanelChanges() {
	// find chat panel element
	const chatListElem = document.getElementsByClassName("_1H6CJ _1rqO1")[0];
	if (chatListElem) {
		var mutationObserver = new MutationObserver(function (mutations)
		{
			for (var i = 0; i < mutations.length; i++)
			{
				const mutation = mutations[i];

				// if a new contact was loaded
				if (mutation.type === "childList" &&
					mutation.target.nodeName.toLowerCase() === "div" &&
					mutation.target.classList.contains("_3H4MS") &&
					mutation.addedNodes.length > 0) {
					// TODO: find the name and add logo to it
					//console.log(mutation.addedNodes[0].innerText);
				} else if (mutation.type === "characterData" &&
						   mutation.target.parentNode.parentNode.nodeName.toLowerCase() === "span" &&
						   mutation.target.parentNode.parentNode.classList.contains("_3NWy8")) {
					// TODO: find the name and add logo to it
					console.log(mutation.target.data);
				}
			}
		});
		mutationObserver.observe(chatListElem, { childList: true, 
												 characterData: true, 
												 subtree: true });
	}
}

function shouldAddStayInTouchOption() {
	// get delete chat menu item
	const menuItemsCollection = document.getElementsByClassName('_3zy-4 Sl-9e');
	const menuItemsArray = Array.from(menuItemsCollection);
	const deleteChatMenuItem = menuItemsArray.find(item => item.title === 'Delete chat');
	return deleteChatMenuItem;
}

function addStayInTouchOption() {
	// get menu items
	var menuItems = document.getElementsByClassName("_3z3lc")[0].getElementsByClassName("_3cfBY ");
	// get first menu item
	var firstMenuItem = menuItems[0];
	// copy it
	var stayInTouchMenuItem = firstMenuItem.cloneNode(true);
	// edit it
	stayInTouchMenuItem.style = "opacity: 1";
	stayInTouchMenuItem.innerHTML = '<div class="_3zy-4 Sl-9e" role="button" title="Stay in touch">Stay in touch</div>';
	// add hover behavior
	stayInTouchMenuItem.addEventListener('mouseenter', function (e) {
		stayInTouchMenuItem.classList.add('_3VXiW');
	});
	stayInTouchMenuItem.addEventListener('mouseleave', function () {
		stayInTouchMenuItem.classList.remove('_3VXiW');
	});
	// add click behavior
	stayInTouchMenuItem.addEventListener('click', function () {
		// dispatch event
		document.dispatchEvent(new CustomEvent('onStayInTouchClicked', {}));
	});

	// add to UI
	firstMenuItem.parentNode.insertBefore(stayInTouchMenuItem, firstMenuItem);
}

function addIconIfNeeded() 
{
	if (document.getElementsByClassName("menu-item-incognito").length > 0) return; // already added
	
	var firstMenuItem = document.getElementsByClassName("_3j8Pd")[0];
	if (firstMenuItem != undefined)
	{
		var menuItemElem = document.createElement("div");
		menuItemElem.setAttribute("id", "louis-dropdown");
		menuItemElem.setAttribute("class", "_3j8Pd menu-item-incognito");
		
		var iconElem = document.createElement("button");
		iconElem.setAttribute("class", "icon icon-incognito");
		iconElem.setAttribute("title", "Stay in touch");
		
		// if we have urgencies 
		if (window.urgencies && 
			window.urgencies.count > 0) {
			// add notification icon
			var notificationElem = document.createElement("span");
			notificationElem.setAttribute("class", "louis-notification");
			// set number of pending urgencies
			notificationElem.textContent = window.urgencies.count;
			// append to icon element
			iconElem.appendChild(notificationElem);
		}

		menuItemElem.appendChild(iconElem);
		firstMenuItem.parentElement.insertBefore(menuItemElem, firstMenuItem);
		
		const dropContent = buildStayInTouchDropdownContent(window.urgencies);
					
		var drop = new Drop(
		{
			target: menuItemElem,
			content: dropContent,
			position: "bottom left",
			classes: "dropdown-theme",
			openOn: "click",
			tetherOptions: 
			{
				offset: "-4px -4px 0 0"
			},
		});
		var originalCloseFunction = drop.close;
		drop.close = function()
		{
			//document.dispatchEvent(new CustomEvent('onIncognitoOptionsClosed', {detail: null}));
			setTimeout(function() {originalCloseFunction.apply(drop, arguments); }, 100);
		}
		drop.on("open", function()
		{
			if (!checkInterception()) return;
			
			// document.getElementsByClassName("menu-item-incognito")[0].setAttribute("class", "_3j8Pd GPmgf active menu-item-incognito");

			// document.getElementById("incognito-option-read-confirmations").addEventListener("click", onReadConfirmaionsTick);
			// document.getElementById("incognito-option-presence-updates").addEventListener("click", onPresenseUpdatesTick);
			// document.getElementById("incognito-option-safety-delay").addEventListener("input", onSafetyDelayChanged);
			// document.getElementById("incognito-option-safety-delay").addEventListener("keypress", isNumberKey);
			// document.getElementById("incognito-radio-enable-safety-delay").addEventListener("click", onSafetyDelayEnabled);
			// document.getElementById("incognito-radio-disable-safety-delay").addEventListener("click", onSafetyDelayDisabled);
			
			// document.dispatchEvent(new CustomEvent('onIncognitoOptionsOpened', {detail: null}));
		});
		drop.on("close", function()
		{
			// document.getElementsByClassName("menu-item-incognito")[0].setAttribute("class", "_3j8Pd menu-item-incognito");

			// document.getElementById("incognito-option-read-confirmations").removeEventListener("click", onReadConfirmaionsTick);
			// document.getElementById("incognito-option-presence-updates").removeEventListener("click", onPresenseUpdatesTick);
			// document.getElementById("incognito-radio-enable-safety-delay").removeEventListener("click", onSafetyDelayEnabled);
			// document.getElementById("incognito-radio-disable-safety-delay").removeEventListener("click", onSafetyDelayDisabled);
		});
	}
}



document.addEventListener('onChatsRecieved', function(e) 
{
	// parse data
	const chats = JSON.parse(e.detail);
	// send message
	chrome.runtime.sendMessage({ name: "getContacts" }, function (contacts) 
	{
		// set contacts if undefined
		contacts = contacts || {};
		const urgencies = {
			count: 0
		};
		// iterate all the stay in touch contacts
		for (var jid in contacts) {
			// if we have chat with this contact
			if (jid in chats) {
				// get last time that we chatted with this contact in miliseconds
				const last = chats[jid].t * 1000;
				const now = new Date().getTime();
				const schedule = contacts[jid].schedule;
				// calculate urgency
				const urgency = calculateStayInTouchUrgency(last, now, schedule);
				// if we urgency is other than none
				if (urgency !== 'none') {
					// init urguency if doesn't exist
					if (!(urgency in urgencies)) {
						urgencies[urgency] = [];
					} 
					// set urgency
					urgencies[urgency].push(contacts[jid]);
					urgencies.count++;
				}
			}
		}

		// set urgencies on global window object
		window.urgencies = urgencies;
	});
});



document.addEventListener('onOpenStayInTouchDialog', function(e) 
{
	// parse data
	var data = JSON.parse(e.detail);
	// send message
	chrome.runtime.sendMessage({ name: "getContacts" }, function (contacts) 
	{
		// set contacts if undefined
		contacts = contacts || {};
		// define click handlers
		const onEveryChecked = () => {
			// disable "Never" caption
			document.getElementById("never-caption").setAttribute("class", "disabled");
			document.getElementById("time").setAttribute("class", "space-left-right");
			document.getElementById("quantity").removeAttribute("disabled");
			document.getElementById("frequency").removeAttribute("disabled");
		};
		const onNeverChecked = () => {
			// disable "Every" inputs
			document.getElementById("never-caption").removeAttribute("class");
			document.getElementById("time").setAttribute("class", "space-left-right disabled");
			document.getElementById("quantity").setAttribute("disabled", "disabled");
			document.getElementById("frequency").setAttribute("disabled", "disabled");
		};

		// instanciate new modal
		var modal = new tingle.modal({
			footer: true,
			stickyFooter: false,
			closeMethods: ['overlay', 'button', 'escape'],
			closeLabel: "Close",
			onOpen: function() {
				console.log('modal open');
				// listen to radio button click
				document.getElementById("never").addEventListener("click", onNeverChecked);
				document.getElementById("every").addEventListener("click", onEveryChecked);
			},
			onClose: function() {
				console.log('modal closed');
				document.getElementById("never").removeEventListener("click", onNeverChecked);
				document.getElementById("every").removeEventListener("click", onEveryChecked);
			},
			beforeClose: function() {
				// here's goes some logic
				// e.g. save content before closing the modal
				return true; // close the modal
				return false; // nothing happens
			}
		});

		const content = buildStayInTouchDialogContent(data, contacts);
		modal.setContent(content);

		// add a button
		modal.addFooterBtn('Save', 'tingle-btn tingle-btn--primary', function() {
			// extract select component
			const select = document.getElementById("frequency");
			const never = document.getElementById("never");
			const every = document.getElementById("every");
			// if never was selected and we previously have value for this chat
			if (never.checked && data.jid in contacts) {
				// clear if from contacts
				delete contacts[data.jid];
			// if a schedule was chosen
			} else if (every.checked) {
				// extract values 
				const quantity = document.getElementById("quantity").value;
				const frequency = select.options[select.selectedIndex].value;
				// set data in contacts
				contacts[data.jid] = {
					...data,
					schedule: {
						quantity,
						frequency
					}
				};
			}

			// if either one of them was chosen
			if (every.checked || never.checked) {
				// setContacts
				chrome.runtime.sendMessage({ name: "setContacts", contacts }, () => {
					// close modal
					modal.close();
				});
			}
		});

		// add another button
		modal.addFooterBtn('Cancel', 'tingle-btn tingle-btn--danger', function() {
			// here goes some logic
			modal.close();
		});

		// open modal
		modal.open();
	});
});



document.addEventListener('onMarkAsReadClick', function(e) 
{
	var data = JSON.parse(e.detail);
	chrome.runtime.sendMessage({ name: "getOptions" }, function (options) 
	{
		if (options.readConfirmationsHook)
		{
			swal({
			  title: "Mark as read?",
			  text: data.formattedName + " will be able to tell you read the last " + (data.unreadCount > 1 ?  data.unreadCount + " messages." : " message."),
			  type: "warning",
			  showCancelButton: true,
			  confirmButtonColor: "#DD6B55",
			  confirmButtonText: "Yes, send receipt",
			  closeOnConfirm: true
			},
			function(){
			  document.dispatchEvent(new CustomEvent('sendReadConfirmation', {detail: JSON.stringify(data)}));
			  //swal("Sent!", "Messages were marked as read", "success");
			});
		}
	});
});


/*
 *	Calculate the urgency to stay in touch with the contact
 *
 * 	if we passed the requested time by 10 days, return urgent
 * 	if we passed the requested time by less than 10 days, return high
 *  if less than 2 days left to the requested time, return medium
 *  if between 2 to 5 days left to the requested time, return low
 *  else return none
 */
function calculateStayInTouchUrgency(lastTimestmap, nowTimestamp, schedule) {
	// To calculate the time difference of two dates 
	var differenceInTime = nowTimestamp - lastTimestmap;
	// To calculate the no. of days between two dates 
	var daysSinceLastChat = differenceInTime / (1000 * 3600 * 24); 
	// calculate how many days are on average on each period 
	const daysIn = {
		week: 7,
		month: 30,
		year: 365
	};
	// calculate every how many days we need to stay in touch 
	const daysToStayInTouch = daysIn[schedule.frequency] / schedule.quantity;

	// if more than 10 days have passed from the moment we needed to chat with contact, it's defined urgent
	if (daysSinceLastChat - daysToStayInTouch >= 10) return "urgent";
	// if 1 to 9 days have passed from the moment we needed to chat with contact, it's defined high
	else if (daysSinceLastChat - daysToStayInTouch > 0 && daysSinceLastChat - daysToStayInTouch < 10) return "high";
	// if less than 2 days have left until the moment we needed to chat with contact, it's defined medium
	else if (daysToStayInTouch - daysSinceLastChat <= 2) return "medium";
	// if between 2 to 5 days have left until the moment we needed to chat with contact, it's defined low
	else if (daysToStayInTouch - daysSinceLastChat > 2 && daysToStayInTouch - daysSinceLastChat <=5) return "low";
	// otherwise not urgent at all
	else return "none";
}


function buildStayInTouchDropdownContent(urgencies) {
	
	let content = ' \
	<div class="louis-dropdown-container"> \
		<ul class="louis-dropdown-list">';

	// iterate through the urgencies
	for (urgency in urgencies) {
		// skip the property count
		if (urgency === "count") continue;
		// foreach contacts in the urgency
		for (contact of urgencies[urgency]) {
			// add li to content
			content += `<li class="louis-dropdown-item _3zy-4 Sl-9e urgency_${urgency}">${contact.formattedName}</li>`;
		}
	}
	
	content += '</ul> \
	</div>';

	return content;
}

function buildStayInTouchDialogContent(data, contacts) {
		// set content
		let content = ' \
		    <h1 class="dialog-header">Stay in touch with ' + data.formattedName + '</h1> \
			<div class="option-container"> \
				<label for="never" class="radio"> \
					<input type="radio" name="rdo" id="never" class="hidden"/> \
					<span class="label"></span> \
					<span id="never-caption">Never</span> \
				</label> \
				<label for="every" class="radio">';

		// if we already have schedule for this chat
		if (data.jid in contacts) {
			// add content
			content += ' \
					<input type="radio" name="rdo" id="every" class="hidden" checked/> \
					<span class="label"></span> \
					<div> \
						<input type="number" id="quantity" name="quantity" min="1" max="30" step="1" value="' + contacts[data.jid].schedule.quantity + '" /> \
						<span id="time" class="space-left-right">time/s a </span> \
						<select id="frequency">';
			// if frequency is day
			if (contacts[data.jid].schedule.frequency === 'week' ) {
				content += '<option value="week" selected="selected">week</option>';
			} else {
				content += '<option value="week">week</option>';
			}
			// if frequency is week
			if (contacts[data.jid].schedule.frequency === 'month' ) {
				content += '<option value="month" selected="selected">month</option>';
			} else {
				content += '<option value="month">month</option>';
			}
			// if frequency is year
			if (contacts[data.jid].schedule.frequency === 'year' ) {
				content += '<option value="year" selected="selected">year</option>';
			} else {
				content += '<option value="year">year</option>';
			}
			// add end of select
			content += ' \
						</select> \
					</div>';
		} else {
			content += ' \
			<input type="radio" name="rdo" id="every" class="hidden" /> \
			<span class="label"></span> \
			<div> \
				<input type="number" id="quantity" name="quantity" min="1" max="30" step="1" value="1" /> \
				<span id="time" class="space-left-right">time/s a </span> \
				<select id="frequency"> \
					<option value="week" selected="selected">week</option> \
					<option value="month">month</option> \
					<option value="year">year</option> \
				</select> \
			</div>';
		}

		// add end of content
		content += ' \
				</label> \
			</div> \
		';

		return content;
}

function onReadConfirmaionsTick()
{
	var readConfirmationsHook = false;
	var checkbox = document.querySelector("#incognito-option-read-confirmations .checkbox-incognito");
    var checkboxClass = checkbox.getAttribute("class");
	var checkmark = checkbox.firstElementChild;
	var chekmarkClass = checkmark.getAttribute("class");
    if (checkboxClass.indexOf("unchecked") > -1)
    {
        checkbox.setAttribute("class", checkboxClass.replace("unchecked", "checked") + " _15wNI");
		checkmark.setAttribute("class", chekmarkClass.replace("_31Di_", "_3zTzS"));
        readConfirmationsHook = true;
    }
    else
    {
        checkbox.setAttribute("class", checkboxClass.replace("checked", "unchecked").split("_15wNI").join(""));
		checkmark.setAttribute("class", chekmarkClass.replace("_3zTzS", "_31Di_"));
        readConfirmationsHook = false;
		var redChats = document.getElementsByClassName("icon-meta unread-count incognito");
		for (var i=0;i<redChats.length;i++)
		{
			redChats[i].className = 'icon-meta unread-count';
		}
    }
    chrome.runtime.sendMessage({ name: "setOptions", readConfirmationsHook: readConfirmationsHook });
	document.dispatchEvent(new CustomEvent('onOptionsUpdate', 
	{
        detail: JSON.stringify({readConfirmationsHook: readConfirmationsHook})
    }));
}

function onPresenseUpdatesTick()
{
	var presenceUpdatesHook = false;
	var checkbox = document.querySelector("#incognito-option-presence-updates .checkbox-incognito");
    var checkboxClass = checkbox.getAttribute("class");
	var checkmark = checkbox.firstElementChild;
	var chekmarkClass = checkmark.getAttribute("class");
    if (checkboxClass.indexOf("unchecked") > -1)
    {
        checkbox.setAttribute("class", checkboxClass.replace("unchecked", "checked") + " _15wNI");
		checkmark.setAttribute("class", chekmarkClass.replace("_31Di_", "_3zTzS"));
        presenceUpdatesHook = true;
    }
    else
    {
        checkbox.setAttribute("class", checkboxClass.replace("checked", "unchecked").split("_15wNI").join(""));
		checkmark.setAttribute("class", chekmarkClass.replace("_3zTzS", "_31Di_"));
        presenceUpdatesHook = false;
    }
    chrome.runtime.sendMessage({ name: "setOptions", presenceUpdatesHook: presenceUpdatesHook });
	document.dispatchEvent(new CustomEvent('onOptionsUpdate', 
	{
        detail: JSON.stringify({presenceUpdatesHook: presenceUpdatesHook})
    }));
}

function onSafetyDelayChanged(event)
{
	if (isSafetyDelayValid(event.srcElement.value))
	{
		var delay = parseInt(event.srcElement.value);
		document.getElementById("incognito-option-safety-delay").disabled = false;
		chrome.runtime.sendMessage({ name: "setOptions", safetyDelay: delay });
		document.dispatchEvent(new CustomEvent('onOptionsUpdate', 
		{
			detail: JSON.stringify({safetyDelay: delay})
		}));
	}
}

function onSafetyDelayDisabled()
{
	document.getElementById("incognito-option-safety-delay").disabled = true;
	document.getElementById("incognito-radio-enable-safety-delay").checked = false;
	chrome.runtime.sendMessage({ name: "setOptions", safetyDelay: 0 });
	document.dispatchEvent(new CustomEvent('onOptionsUpdate', 
	{
        detail: JSON.stringify({safetyDelay: 0})
    }));
}

function onSafetyDelayEnabled()
{
	var delay = parseInt(document.getElementById("incognito-option-safety-delay").value);
	if (isNaN(delay)) delay = parseInt(document.getElementById("incognito-option-safety-delay").placeholder)
	document.getElementById("incognito-option-safety-delay").disabled = false;
	document.getElementById("incognito-radio-disable-safety-delay").checked = false;
	chrome.runtime.sendMessage({ name: "setOptions", safetyDelay: delay });
	document.dispatchEvent(new CustomEvent('onOptionsUpdate', 
	{
        detail: JSON.stringify({safetyDelay: delay})
    }));
}

function isSafetyDelayValid(string)
{
    var number = Math.floor(Number(string));
    return (String(number) === string && number >= 1 && number <= 30) || string == ""
}

function checkInterception()
{
	if (!isInterceptionWorking)
	{
		sweetAlert("Oops...", "WhatsApp Web Incognito has detected that interception is not working. Please try refreshing this page, or, if the problem presists, writing back to the developer.", "error");
		return false;
	}
	
	return true;
}

function isNumberKey(evt)
{
    var charCode = (evt.which) ? evt.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}