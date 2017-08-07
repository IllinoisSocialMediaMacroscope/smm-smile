function submitHistory(formID){	
	
	$.ajax({
		type:'post',
		url:$("#"+formID).attr('action'), 
		data: $("#"+formID).serialize(),				
		success:function(data){
			if(data){
				if ('ERROR' in data){
					$("#title-container").empty();
					$("#overview-container").empty();
					$("#img-container").empty();
					$("#result-container").empty();
					$("#gaudge").empty();
					$("#title").empty();
					
					$("#background").show();
					$("#error").val(JSON.stringify(data));
					$("#warning").modal('show');
				}else{
					$("#title-container").empty();
					$("#overview-container").empty();
					$("#img-container").empty();
					$("#result-container").empty();
					$("#gaudge").empty();
					$("#title").empty();
					
					$("#background").hide();
					
					appendTitle("#title-container",data.title,data.ID);
					appendOverview("#overview-container",data.config,data.download);
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

/* delete job modal */
function deleteModal(formID){
	
	$("#delete").modal('show');
		
	$("#deleteButton").click(function(){
		deleteHistory(formID);
	});

	$("#deleteButton").keypress(function(e){
		if (e.which == 13){
			deleteHistory(formID);
		}
	});
	
}

function deleteHistory(formID){	
	console.log('hitted');
	$.ajax({
		type:'post',
		url:'/delete', 
		data: $("#"+formID).serialize(),				
		success:function(data){
			if(data){
				$("#title-container").empty();
				$("#overview-container").empty();
				$("#img-container").empty();
				$("#result-container").empty();
				$("#gaudge").empty();
				$("#title").empty();
				// succesfully delete, then hide this tab
				//alert(data);
				$("#" + formID).parent().css( "display", "none" );
				$("#delete").modal('hide');
				$("#background").show();
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

function appendTitle(container, title,ID, config){
	$(container).append(`<h1>`+ title+ `</h1><h4>ID: ` + ID +`</h4>`);
}


function appendOverview(container,config, download){
	
	$(container).append(`<h2>Overview</h2>`);
	// vertical table	
	var tableContent = `<div class="table-responsive"><table class="table table-striped table-bordered"><tbody>`;
	$.each(config, function(key,value){
		tableContent += `<tr><th>` + key + `</th><td>` + value + `</td></tr>`;
	});
	
	// add download files
	tableContent += `<tr><th>downloadables</th><td>`;
	$.each(download,function(i,val){
		tableContent += `<form action='/download' name='download' method='post'><input type="hidden" value=`+val.content+` name="downloadURL" />
		<button type="submit" class="link-button" style="color:#73879c;border-bottom:1px solid "><span class="glyphicon glyphicon-download-alt"></span>`
								+val.name+`</button></form>`;
	});
	tableContent += `</td></tr></tbody></table></div>`;
	
	$(container).append(tableContent);
}

function drawIframe(name,fname){
	$('#gaudge').empty();
	$('#gaudge').append(`<div class="x_title"><h2>`+ name +`</h2></div></div><div class="x_content" id="chart_div"></div>`);
	$('#chart_div').append(`<iframe src="../../pyLDAvis/` + fname + `" style="background:#FFFFFF;display:block; width:100%; height:900px;">`);
}

google.charts.load('current', {packages:['wordtree']});
function drawWordTree(name,table,root){
	$('#gaudge').empty();
	$('#gaudge').append(`<div class="x_title"><h2>`+ name +`</h2></div></div><div class="x_content" id="chart_div" sytle="margin:0 auto;"></div>`);
	
	var data = google.visualization.arrayToDataTable(table);
	var options = {
          wordtree: {
            format: 'implicit',
			word:root.toLowerCase()
          }
        };
	var chart = new google.visualization.WordTree(document.getElementById('chart_div'));
        chart.draw(data, options);
}

google.charts.load('current', {'packages':['gauge']});
/*--------------------------------draw gaudge---------------------------------------*/
function drawGauge(name,compound) {
	$('#gaudge').empty();
	$('#gaudge').append(`<div class="x_title"><h2>`+ name +`</h2></div></div><div class="x_content" id="chart_div" sytle="margin:auto 0;"></div>`);
	
	var data = google.visualization.arrayToDataTable([
		['Label', 'Value'],	['Compound', compound],
	]);
	
	console.log($("#gaudge").width());
	var options = {
		width: $("#gaudge").width()*0.25, height: $("#gaudge").width()*0.25,
		backgroundColor: "transparent",
		greenFrom:0.5, greenTo:1.0,
		redFrom: -1, redTo: -0.5,
		yellowFrom:-0.75, yellowTo: 0.5,
		minorTicks: 0.5,
		min:-1,
		max:1
	};

	var chart = new google.visualization.Gauge(document.getElementById('chart_div'));
	chart.draw(data, options);
	
}


function toggle(self,id){
	
	$(id).toggle();
	
	if ($(id).is(':visible')){
		$(self).children('span').attr('class','glyphicon glyphicon-minus');
	}else{
		$(self).children('span').attr('class','glyphicon glyphicon-plus');
	}
}
