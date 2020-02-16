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
					//console.log(mutation.target.data);
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
	if (document.getElementsByClassName("menu-item-louis").length > 0) return; // already added
	
	// fetch contacts
	chrome.runtime.sendMessage({ name: "getContacts" }, function (contacts) 
	{
		var firstMenuItem = document.getElementsByClassName("_3j8Pd")[0];
		if (firstMenuItem != undefined)
		{
			var menuItemElem = document.createElement("div");
			menuItemElem.setAttribute("id", "louis-dropdown");
			menuItemElem.setAttribute("class", "_3j8Pd menu-item-louis");
			
			var iconElem = document.createElement("button");
			iconElem.setAttribute("class", "icon icon-louis");
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
			
			const dropContent = buildStayInTouchDropdownContent(window.urgencies, contacts);
			
			const onNotificationTabClick = (e) => {
				document.getElementById("c1").setAttribute("class", "content");
				document.getElementById("c2").setAttribute("class", "content hidden");
			};

			const onContactsTabClick = (e) => {
				document.getElementById("c1").setAttribute("class", "content hidden");
				document.getElementById("c2").setAttribute("class", "content");
			};

			const onContactClick = (e) => {
				// get id
				const jid = e.currentTarget.id;
				// close drop
				drop.close();
				// dispatch event
				setTimeout(() => {
					// open stay in touch dialog
					document.dispatchEvent(new CustomEvent('onOpenStayInTouchDialog', {detail: JSON.stringify(contacts[jid])}));	
				}, 100);
			}
			
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
				
				document.getElementById("tab1").addEventListener("click", onNotificationTabClick);
				document.getElementById("tab2").addEventListener("click", onContactsTabClick);
				
				for (let e of document.getElementsByClassName("contact")) {
					e.addEventListener("click", onContactClick)
				}
			});
			drop.on("close", function()
			{
				document.getElementById("tab1").removeEventListener("click", onNotificationTabClick);
				document.getElementById("tab2").removeEventListener("click", onContactsTabClick);

				for (let e of document.getElementsByClassName("contact")) {
					e.removeEventListener("click", onContactClick)
				}
			});
		}
	});
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

					setTimeout(() => {
						// show toast
						nativeToast({
							message: 'changes saved',
							edge: false,
							debug: false
						  })
					}, 500);
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

	// calculate the difference between the days we last chatted to the days we need to chat
	const difference = daysSinceLastChat - daysToStayInTouch;

	// if difference is positive meaning we haven't talked to the contact more time than we defined
	if (difference > 0) {
		// if more than 10 days have passed from the moment we needed to chat with contact, it's defined urgent
		// if 1 to 9 days have passed from the moment we needed to chat with contact, it's defined high
		return difference >= 10 ? "urgent" : "high";
	// if difference is negative meaning we haven't passed the time we defined
	} else {
		// if less than one day left until the moment we needed to chat with contact, it's defined medium
		// if between 1 to 5 days left until the moment we needed to chat with contact, it's defined low
		// otherwise not urgent at all
		return difference >= -1 
					 ? "medium" 
					 : difference >= -5 ? "low"
					 : "none";
	}
}


function buildStayInTouchDropdownContent(urgencies, contacts) {

	return `
	<div class="container">
		<input type="radio" id="tab1" name="tab" checked>
		<label for="tab1"><i class="fa fa-code"></i> Notifications</label>
		<input type="radio" id="tab2" name="tab">
		<label for="tab2"><i class="fa fa-history"></i> Contacts</label>
		<div class="line"></div>
		<div class="content-container">
			<div class="content" id="c1">
				${buildStayInTouchDropdownNotificationContent(urgencies)}
			</div>
			<div class="content hidden" id="c2">
				${buildStayInTouchDropdownContactsContent(contacts)}
			</div>
		</div> 
	</div>
	`;
}

function buildStayInTouchDropdownNotificationContent(urgencies) {
	
	let content = '<div class="louis-dropdown-container">';

	if (urgencies && urgencies.count > 0) {
		
		content += '<ul class="louis-dropdown-list">';

		if (urgencies.hasOwnProperty("urgent")) {
			content += buildNotificationItem(urgencies["urgent"], "urgent");
		} 
		if (urgencies.hasOwnProperty("high")) {
			content += buildNotificationItem(urgencies["high"], "high");
		} 
		if (urgencies.hasOwnProperty("medium")) {
			content += buildNotificationItem(urgencies["medium"], "medium");
		} 
		if (urgencies.hasOwnProperty("low")) {
			content += buildNotificationItem(urgencies["low"], "low");
		} 
		
		content += '</ul>';
	} else {
		content += '<h3 id="all-caught-up">You are all caught up!</h3>'
	}

	content += '</div>';

	return content;
}

function buildNotificationItem(contacts, urgency) {

	let content = "";
	// foreach contacts in the urgency
	for (contact of contacts) {
		// add li to content
		content += `<li class="louis-dropdown-item _3zy-4 Sl-9e urgency">
						<h3>${contact.formattedName}</h3>
						<span class="urgency_${urgency}">${urgency}</span>
					</li>`;
	}

	return content;
} 

function buildStayInTouchDropdownContactsContent(contacts) {
	
	let content = '<div class="louis-dropdown-container">';
	// if we have contacts defined
	if (contacts && Object.entries(contacts).length > 0) {
		content += '<ul class="louis-dropdown-list">';

		// iterate through the contacts
		for (jid in contacts) {
			// add li to content
			const contact = contacts[jid];
			let quantity, frequency;
			if (contact.schedule.quantity === "1") {
				quantity = "once";
				frequency = `a ${contact.schedule.frequency}`;
			} else if (contact.schedule.quantity === "2") {
				quantity = "twice";
				frequency = `a ${contact.schedule.frequency}`;
			} else {
				quantity = contact.schedule.quantity;
				frequency = `times a ${contact.schedule.frequency}`;
			}
			content += `<li class="louis-dropdown-item _3zy-4 Sl-9e contact" id="${jid}">
							<h3>${contact.formattedName} ${quantity} ${frequency}</h3>
						</li>`;
		}
		
		content += '</ul>';
	} else {
		content += '<h3 id="all-caught-up">So who would you like to stay in touch with?</h3>'
	}

	content += '</div>';

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
			<input type="radio" name="rdo" id="every" class="hidden" checked /> \
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


function checkInterception()
{
	if (!isInterceptionWorking)
	{
		sweetAlert("Oops...", "WhatsApp Web Louis Plugin has detected that interception is not working. Please try refreshing this page, or, if the problem presists, writing back to the developer.", "error");
		return false;
	}
	
	return true;
}
