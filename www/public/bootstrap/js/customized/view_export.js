function exportOptions(){
	$("#terminate-modal").modal('hide');
	$("#export-modal").find(".modal-footer").show();
    $("#export-modal").modal('show');
}

//get currentPage name for dropbox and read the ?dropbox=success
$("#box-auth").on('click',function(){
	$("#box-auth").attr("href","login/box?pageURL=" + currPage + "&currentURL=" + newPath);
});

// box authorization success
if(getParameterByName('box') === 'success'){
	$("#box-export").show();
	$("#export-modal").modal('show');
}else{
	$("#error").val(getParameterByName('box'));
	$("#warning").modal('show');
	$("#export-modal").modal('hide');
}

//authorize
$("#export-modal").find(".export-auth-btn").on('click', function(){
	var platform = $(this).parent();
	$(platform).find(".auth-code").val('');
	$(platform).find(".auth-code").css('display', 'block');
    $(platform).find(".export-loading").css('display','none');
    $(platform).find(".export-success").css('display','none');
    $(platform).find(".embedded-link").hide();
});

$("#export-modal").find(".auth-code").on("keyup",function(e){
	var $this = $(this);
	if (e.keyCode === 13 || e.keyCode === 10){
		var platform = $(this).parent().attr('id');
		$.ajax({
			type:'post',
			url:'login/' + platform,
			data: {"authorizeCode":$(this).val()},
			success:function(data){
				if (data){
					if ('ERROR' in data){
                        $this.val(''); //clear the text area
						$("#error").val(JSON.stringify(data));
						$("#warning").modal('show');
					}else{
                        $this.hide();
						$("#" + platform + "-export").show();
					}
				}
			},
			error: function(jqXHR, exception){
				$("#error").val(jqXHR.responseText);
				$("#warning").modal('show');						
			} 
		});
	}
});

$("#export-modal").find(".modal-body.export").find("button").on('click', function(){
    exportAllFiles($(this));
});

function exportAllFiles($this){
	$this.hide();
	$this.parent().find(".export-loading").css('display', 'inline-block');
	var id = $this.attr('id');
	$.ajax({
		type: 'post',
		url: 'export',
		data: {
			"id": id,
		},
		success: function (data) {
			$this.parent().find(".export-loading").hide();
			$this.show();
			if (data) {
				if ('ERROR' in data) {
					$("#error").val(JSON.stringify(data));
					$("#warning").modal('show');
				} else {
					$this.parent().find(".embedded-link")
					.attr("href", data.downloadUrl)
					.text(data.downloadUrl)
					.show();
				}
			}
		},
		error: function (jqXHR, exception) {
			$("#error").val(jqXHR.responseText);
			$("#warning").modal('show');
		}
	});
}
