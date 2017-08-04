/*-------------------------html tricks--------------------------------------*/
function init(){
	checkbox_onclick();
	
	$("#file").prop('checked',true);
	$("#file-container").show();
	$("#url-container").hide();
	
	$("input[name='option']").on('change', function(){
		if($("input[name='option']:checked").val() === 'file'){
			$("#file-container").show();
			$("#url-container").hide();
			$("#selectFilePreview-container").show();
			$("#selectFileHeader-container").show();
		}else{
			$("#file-container").hide();
			$("#url-container").show();
			$("#selectFilePreview-container").hide();
			$("#selectFileHeader-container").hide();
		}
	});
}

function childMenu(id){
	 $(id).toggle('fast');
}

function checkbox_onclick(){
	$(document).on('change',':checkbox',function(){
		$(this).parent().toggleClass('checkbox-flat checkbox-flat-checked');
	});
}

function customized_reset(){
	$("#img-container").empty();
	$("#result-container").empty();
	$("#download-container").empty();
	//sidebar
	$("#overview").nextAll().remove()
}

/*----------------------------display uploaded csv --------------------------*/
function arrayToTable(array,tableID){
	
	// set table head
	
	var tableContent = `<div class="table-responsive"><table class="table table-striped table-bordered" id=`+tableID.slice(1,) + `><thead><tr>`;
	$.each(array[0],function(i,val){
	/* the text fields are:  text(tweet), description(twtUser),
			body(redditComment), selftext,title(redditSearch), 
			public description, description(redditSearchSubreddit)*/
		if (val === 'text'){
			val = 'tweet (text) '; // change the descrpition so preview is easy to understand
		}else if (val === 'body'){
			val = 'reddit comments (body)';
		}else if (val === 'selftext'){
			val = 'reddit post text (selftext)';
		}else if (val === 'title'){
			val = 'reddit post title (title)';
		}else if (val === 'public_description'){
			val = 'subreddit public description (public_description)';
		}else if (val === ''){
			val = 'NaN';
		}
		tableContent += "<th>"+val+"</th>";
	});
	tableContent += `</tr></thead><tbody>`
	
	// set table content
	$.each(array.slice(1),function(i,val){
		tableContent += "<tr>";
		$.each(val,function(j,cval){
			// trim the content to 100 character maximum
			if (cval.length >=100){
				cval = cval.slice(0,100) + '...';
			}else if (cval === '' || cval === undefined){
				cval = 'NaN';
			}
			tableContent += `<td>` + cval + "</td>"
		});
		tableContent += "</tr>";
	});
	tableContent += "</tbody></table></div>"
	
	return tableContent
}

function extractHeader1(array){
	var headerContent = '';
	column_header = array[0];
	$.each(column_header,function(i,val){
		
		headerContent += `<label class>
					<div id="customized-checkbox" class="checkbox-flat" style="position:relative;">
						<input type="checkbox" class="flat" style="position:absolute;opacity:0;" name="fields" id=`+ val + ` value=`+ val +
						`></div>` + val + `</label>`;
		
	});
	//console.log(headerContent);
	return headerContent;
}

function extractHeader2(array){
	var headerContent = '';
	column_header = array[0];
	$.each(column_header,function(i,val){
		//check the first item
		if (i === 0){
			headerContent += `<label class=radio-inline>
			<input type="radio"  class="customized-radio" name="selectFileColumn",id=`
				+ val +` value=`+ val +` checked></div>` + val +` </label>`;
		}else{
			headerContent += `<label class=radio-inline>
				<input type="radio" class="customized-radio" name="selectFileColumn",id=`
					+ val +` value=`+ val +`></div>` + val +` </label>`;
		}
	});
	//console.log(headerContent);
	return headerContent;
}
	

/*----------------------------display results---------------------------------*/
function appendDownload(downloadID, downloadData){
	$(downloadID).nextAll().remove()
	if(downloadData !== []){
		$.each(downloadData,function(i,val){
			$(downloadID).after(`<li><form action='/download' name='download' method='post'><span class="glyphicon glyphicon-download-alt"></span>
								<input type="hidden" value=`+val.content+`name="downloadURL" /><button type="submit" class="link-button">`
								+val.name+`</button></form></li>`)
		});
	}
}
	
function appendImg(imgID, imgData){
	$(imgID).empty();
	if (imgData !== []){
		$.each(imgData, function(i,val){
			$(imgID).append(`<div class="x_title"><h2>`+val.name+`</h2></div>` +
					`<div class="x_content">`+val.content+`</div>`)
		});
	}
}

function appendPreview(previewID, previewData){
	$(previewID).empty();
	if(previewData !== ''){
		$(previewID).append(`<div class="x_title"><h2>`+ previewData.name + `</h2></div>` +
			`<div class="x_content">`+arrayToTable(previewData.content, '#previewTopic') + `</div>`)
		$("#previewTopic").DataTable(); // change it to datatable
	}
}


/*----------------------submit to analysis--------------------------------------------*/
function ajaxSubmit(formID){
	
	if (formValidation()){
		
		$(".loading").show();
		$.ajax({
			type:'POST',
			url:$(formID).attr('action'), 
			data: $(formID).serialize(),				
			success:function(data){
				if ('ERROR' in data){
					$(".loading").hide();
					$("#error").val(JSON.stringify(data));
					$("#warning").modal('show');
				}else{
					$(".loading").hide();
					appendDownload("#overview",data.download);
					appendImg("#img-container",data.img);
					appendPreview('#result-container',data.preview);
					
					if ('compound' in data){
						// add gauge for sentiment analysis
						google.charts.setOnLoadCallback(drawGauge('Compound Sentiment Score of the whole document', parseFloat(data.compound)));
					}else if('iframe' in data){
						// draw iframe for topic modeling
						drawIframe(data.iframe.name, data.iframe.content);
					}else if('table' in data){
						// draw word tree for preprocessing
						google.charts.setOnLoadCallback(drawWordTree(data.table.name,data.table.content,data.table.root));
					}
				}
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
			
} 






