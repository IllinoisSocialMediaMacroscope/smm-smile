document.addEventListener ("keydown", function (e) {
	
	// for tagging modal ctrl + alt + N
	if (e.ctrlKey  &&  e.altKey  &&  e.code === "KeyN") {
		if(currPage !== 'history'){
			$("#tag-modal").modal('show');
		}else{
			var title_arr = $("#title-container").find("h4").text().split('/');
			var ID = title_arr.slice(-2)[0];
			$("#jobId").val(ID);
			$("#tag-modal").modal('show');		
		}
	}
	
	// for terminate ctrl + alt + T
	if (e.ctrlKey  &&  e.altKey  &&  e.code === "KeyT") {
		$("#terminate-modal").modal('show');
	}
	
	// for terminate ctrl + alt + E
	if (e.ctrlKey  &&  e.altKey  &&  e.code === "KeyE") {
		exportOptions('export');
	}
	
	// download search results ctrl + alt + D
	if (e.ctrlKey  &&  e.altKey  &&  e.code === "KeyD") {
		if(currPage !== 'history'){
			$("#success").modal('show');
		}
	}
});