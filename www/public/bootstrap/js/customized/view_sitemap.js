/*----------------------sitemap-----------------------------*/
$("#sitemap").keypress(function(e){	
	if (e.keyCode == 13){
		e.preventDefault();
		$("#sitemap-list").empty();
		$.ajax({
			type:'post',
			url:'sitemap', 
			data: {"searchTerm": $("#sitemap-input").val()},				
			success:function(data){
			
				if (data.length === 0){
					$("#sitemap-list").append(`<div id="sitemap-none">
												<h4 class="page-title">No Relevant Result Found!</h4></div>`);
				}else{
					$.each(data,function(index,value){
						var complete_URL = $(location).attr('protocol') + '//' + $(location).attr('host') + "/" + value.url;
						$("#sitemap-list").append(`<div class="sitemap-list-container">
														<h4 class="page-title"><a href="`+ value.url + `">` + value['pageName'] + `</a></h4><cite>`
														+ complete_URL + `</cite></div>`);						
						});
				}
				$("#sitemap-match").modal('show');
			},
			error: function(jqXHR, exception){
					var msg = '';
					if (jqXHR.status === 0) {
						msg = 'Not connect.\n Verify Network.';
					} else if (jqXHR.status == 404) {
						msg = 'Requested page not found. [404]';
					} else if (jqXHR.status == 500) {
						msg = 'Internal Server Error [500].';
					} else if (exception === 'parsererror') {
						msg = 'Requested JSON parse failed.';
					} else if (exception === 'timeout') {
						msg = 'Time out error.';
					} else if (exception === 'abort') {
						msg = 'Ajax request aborted.';
					} else {
						msg = 'Uncaught Error.\n' + jqXHR.responseText;
					}
					$("#error").val(msg);
					$("#warning").modal('show');
					
				} 
			});
	}
});
						