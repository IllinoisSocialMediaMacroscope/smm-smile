document.addEventListener ("keydown", function (e) {
	
	// for tagging modal
	if (e.ctrlKey  &&  e.altKey  &&  e.code === "KeyT") {
		if(currPage !== 'history'){
			$("#tag-modal").modal('show');
		}else{
			var title_arr = $("#title-container").find("h4").text().split('/');
			var ID = title_arr.slice(-2)[0];
			$("#jobId").val(ID);
			$("#tag-modal").modal('show');		
		}
	}
});