document.addEventListener ("keydown", function (e) {
	
	// for tagging modal ctrl + alt + N
	if (e.ctrlKey  &&  e.altKey  &&  e.code === "KeyN") {
		$("#tag-modal").modal('show');		
	}
	
	// for terminate ctrl + alt + T
	if (e.ctrlKey  &&  e.altKey  &&  e.code === "KeyT") {
		$("#terminate-modal").modal('show');
	}
	
	// for terminate ctrl + alt + E
	if (e.ctrlKey  &&  e.altKey  &&  e.code === "KeyE") {
		exportOptions();
	}
	
	// clowder hotkey ctrl + at + C
	if (e.ctrlKey  &&  e.altKey  &&  e.code === "KeyC"){
		invoke_clowder();
	}
});
