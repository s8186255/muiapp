function showContacts() {
	//添加plus事件处理
	document.addEventListener("plusready", function() {
		find();
	}, false);


}

function find() {
	plus.contacts.getAddressBook(
		plus.contacts.ADDRESSBOOK_PHONE,
		function(addressbook) {
			contactStr = '';
			addressbook.find(
				["displayName", "phoneNumbers"],
				function(contacts) {
					length = contacts.length;
					for (var i = 0; i < length; i++) {
						try {
							contactStr += '<li  class="mui-table-view-cell mui-group-list-item mui-checkbox mui-left" onclick="handle(this)"><input type="checkbox"/>' + contacts[i].displayName + "|" + contacts[i].phoneNumbers[0].value + '</li>';
						} catch (e) {
							continue;
						}
					};
					document.getElementById('phoneList').innerHTML = contactStr + length.toString();
				},
				function() {
					alert("error");
				}, {
					multiple: true
				});
		},
		function(e) {
			alert("Get address book failed: " + e.message);
		});
};

function handle(item) {
	//if(item.querySelector("input").checked
	//alert(item.querySelector("input").checked);
	
};