$(document).ready(function(){
	// checkbox_onclick();
	
	//tweek file container
	$("#file").prop('checked',true);
	$("#file-container").show();
	$("#getComment").on('click',function(e){
		e.preventDefault();
		$("#reddit-expand").modal({show:true});	
	});

	$('#file-container').after(`<div id="selectFilePreview-container"></div>`);
	$('#file-container').after(`<div id="preview-loading" style="display:none;text-align:center;">
									<div class="form-group">
										<label class="control-label col-md-2 col-md-2 col-xs-12"></label>
										<div class="col-md-8 col-md-8 col-xs-12">
											<img src="bootstrap/img/gifs/loading3.gif" width="250px"/>
										</div>
									</div>
								</div>`);
	$("#selectFilePreview-container").after(`<div id="selectFileHeader-container"></div>`);
	
	//clowder onclick
	$("#clowder-left-panel").on('click',function(e){
		e.preventDefault();
		invoke_clowder();
	});
	
	//tag onclick
	$("#tag-left-panel").on('click',function(e){
		e.preventDefault();
		$("#tag-modal").modal('show');			
	});
});


/*function checkbox_onclick(){
	$(document).on('change',':checkbox',function(){
		$(this).parent().toggleClass('checkbox-flat checkbox-flat-checked');
	});
}*/

function customized_reset(){
	$("#img-container").empty();
	$("#gaudge").empty();
	$("#result-container").empty();
	$("#side-download").empty();
	$(".row.announce").empty();
	$("#side-download-li").hide();
}

/*----------------------------display uploaded csv --------------------------*/
function arrayToTable(array,tableID){
	
	// set table head
	
	var tableContent = `<div class="table-responsive"><table class="table table-striped table-bordered" id=`+tableID.slice(1) + `><thead><tr>`;
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
			val = 'title';
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
			// trim the content to 140 character maximum
			if (cval.length >=140) {
                cval = cval.slice(0, 140) + '...';
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

function previewSelectedFile(allowedFieldList, data){
    var index = [];
    $.each(data.preview[0],function(i,val){
        if (allowedFieldList.indexOf(val) >=0){
            index.push(i)
        }
    });

    var text_data = [];
    var count = 0;
    $.each(data.preview,function(i,val){
        var line = [];

        // rendering rows has all the content non-empty for asthetic purpose
        var flag = true;
        $.each(index,function(i,indice){
            if (val[indice] == ''){
                flag = false;
            }
            line.push(val[indice]);
        });
        if (flag) text_data.push(line);
    });

    return text_data;

}

/*----------------------------display results---------------------------------*/
function appendDownload(downloadID, downloadData){
	$('#side-download-li').show();
	$(downloadID).empty()
	if(downloadData !== [] && downloadData !== ''){
		$.each(downloadData,function(i,val){
			$(downloadID).append(`<li>
									<a href="` + val.content + `"><span class="glyphicon glyphicon-download"></span>` + val.name + `</a>
								</li>`);
		});
	}
}

function appendIntermediateDownload(downloadID, downloadData){
    $(downloadID).empty()
    if(downloadData !== [] && downloadData !== ''){
        $(downloadID).append('<br><p>Files necessary for the next step:</p><ul class="list-unstyled"></ul>')
        $.each(downloadData,function(i,val){
            $(downloadID).find(".list-unstyled").append(`<li>
									<a href="` + val.content + `">` + val.name + `</a>
								</li>`);
        });
    }
}
	
function appendImg(imgID, imgData){
	$(imgID).empty();
	if (imgData !== [] && imgData !== ''){
		$.each(imgData, function(i,val){
			$(imgID).append(`<div class="x_title">
								<h2>`+val.name+`</h2>
							</div>
							<div class="x_content">
								<div class="note">
									<li><b>click, drag, and mouseover</b> the graph will give you more information</li>
									<li><b>hover</b> over top-right corner of the chart will present various operations</li>
									<li>details please consult 
										<a href="https://plot.ly/" target="_blank">
											<img src="bootstrap/img/logo/plotly.png" width="18px"/>Plotly
										</a>
									</li>
								</div>
							</div>
							<div class="x_content">`+val.content+`</div>`)
		});
	}
}

function appendPreview(previewID, previewData){
	$(previewID).empty();
	if(previewData !== [] && previewData !== ''){
		$.each(previewData, function(i,val){
			if (val.dataTable === true){
				$(previewID).append(`<div class="x_title">
								<h2>`+ val.name + `</h2>
							</div>
							<div class="x_content">
								<div class="note">
									<li>pagination and search keywords enabled</li>
									<li><b>Click</b> table heads will rank the corresponding column</li>
									<li>details please consult 
										<a href="https://datatables.net/" target="_blank">DataTable plugin for JQuery</a>
									</li>
								</div>
							</div>
							<div class="x_content">`+arrayToTable(val.content, '#previewTopic') + `</div>`);
				$("#previewTopic").DataTable(); // change it to datatable
			}else{
				$(previewID).append(`<div class="x_title">
								<h2>`+ val.name + `</h2>
							<div class="x_content">`+arrayToTable(val.content, '#') + `</div>`);
			}
		});
	}
}

function appendD3JS(data){
	$("#d3js-container").hide();
	$("#d3js-network-container").empty();
	$("#d3js-network-container").append(`<div style="display:block;text-align:left;">
											<button style="font-size:25px; padding:5px; width:50px; height:50px;" id="zoomin" class="zoom">+</button>
											<button style="font-size:25px; padding:5px; width:50px; height:50px;margin-left:-1px;" id="zoomout" class="zoom">-</button>
										</div>
	<svg id="d3js-network-svg" width="100%" height="1000px" preserveAspectRatio="xMidYMin">
		<defs>
			<marker id="arrow" viewbox="0 -5 10 10" refX="10" refY="0" markerWidth="3" markerHeight="3" orient="auto">
				<path d="M0,-5L10,0L0,5Z">
			</marker>
		</defs>
	</svg>
	`);
	draw_d3js(data.d3js_data['nodes'],data.d3js_data['links']);
	$("#d3js-container").show();
}


/*----------------------submit to analysis--------------------------------------------*/
function ajaxSubmit(formID,aws_identifier){
	
	var prefix = $("#selectFile").children(":selected").val();
	var length = $("#length").val();
	var email = $("#batch-email-alert").val();

	if (s3FolderName == undefined) s3FolderName = 'local'

	var data = $(formID).serialize() + "&prefix="+ prefix
				+ "&s3FolderName=" + s3FolderName 
				+ "&aws_identifier=" + aws_identifier
				+ "&email=" + email
				+ "&sessionURL=" + sessionURL;

	if (formValidation(aws_identifier)){
		
		customized_reset();

		// scroll to loading gif
		$(".loading").show();
        $("html, body").animate({scrollTop:$(".loading").offset().top -100}, 1000);

		$.ajax({
			type:'POST',
			url:$(formID).attr('action'), 
			data:data,				
			success:function(data){
				
				$(".loading").hide();

                if ('ERROR' in data){
					$("#error").val(JSON.stringify(data));
					$("#warning").modal('show');
				}else if ('jobName' in data && 'jobId' in data){
					$("#aws-batch").modal('hide');
					$("#aws-batch-confirmation").modal('show');
					
					$("#jobId").val(data.uid);					
				}else{
					appendDownload("#side-download",data.download);
					appendImg("#img-container",data.img);
					
					if (data.preview.content !== ''){
						appendPreview('#result-container',data.preview);
					}
					
					if('table' in data){
						// draw word tree for preprocessing
						google.charts.setOnLoadCallback(drawWordTree(data.table.name,data.table.content,data.table.root));
					}
					
					// ADD TO TAG MODAL
					$("#jobId").val(data.uid);	
										
					// ADD TO CLOWDER MODAL
					$("#clowder-files-list").empty();
					clowderFileGen(data.download);
					clowderFileMeta();
					$('.fileTags').tagsinput({ freeInput: true });
					
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
				
			},
			timeout: 360000
		}); 
	}
			
} 
