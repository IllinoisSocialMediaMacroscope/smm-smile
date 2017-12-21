google.charts.load('current', {'packages':['gauge']});
/*--------------------------------draw gaudge---------------------------------------*/
function drawGauge(name,compound) {
	$('#gaudge').empty();
	$('#gaudge').append(`<div class="x_title"><h2>`+ name +`</h2></div></div><div class="x_content" id="chart_div"></div>`);
	
	var data = google.visualization.arrayToDataTable([
		['Label', 'Value'],	['Compound', compound],
	]);
	
	console.log($("#gaudge").width());
	var options = {
		width: $("#gaudge").width()*0.25, height: $("#gaudge").width()*0.25,
		
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

$(document).ready(function(){
	$("#selectFile").on('change',function(){
		var prefix = $(this).children(":selected").val();
		var directory = $(this).children(":selected").attr("class");
		$("#selectFilePreview-container").empty();
		$("#selectFileHeader-container").empty();
		
		$.ajax({
			type:'POST',
			url:'render', 
			data: {"prefix":prefix},				
			success:function(data){
				if (data){
					if ('ERROR' in data){
						$("#loading").hide();
						$("#background").show();
						$("#error").val(JSON.stringify(data));
						$("#warning").modal('show');
					}else{
						// the text fields are:  text, user.description(tweet), description(twtUser),
						// body(redditComment), selftext,title(redditSearch), 
						// public description, description(redditSearchSubreddit)
						// _source.text, _source.user.description(streaming)
						var allowed_field_list = ['text','user.description','description',
						'_source.text', '_source.user.description','body','title','_source.body','_source.title'];
						
						var index = [];
						$.each(data.preview[0],function(i,val){
							if (allowed_field_list.indexOf(val) >=0){
								index.push(i)
							}
						});
						var text_data = [];
						$.each(data.preview,function(i,val){
							var line = [];
							$.each(index,function(i,indice){
								line.push(val[indice]);
							});
							text_data.push(line);
						});
						
						$("#selectFilePreview-container").append(`<div class="form-group">
						<label class="control-label col-md-2 col-md-2 col-xs-12">preview data</label>
						<div class="col-md-8 col-md-8 col-xs-12" id="selectFilePreview"></div></div>`)				
						$("#selectFilePreview").append(arrayToTable(text_data.slice(0,11),'#selectFileTable'));
						//$("#selectFileTable").DataTable();
						
						$("#selectFileHeader-container").append(`<div class="form-group">
						<label class="control-label col-md-2 col-md-2 col-xs-12">Select Column to Analyze</label>
						<div class="col-md-8 col-md-8 col-xs-12" id="selectFileHeader"></div></div>`);
						$("#selectFileHeader").append(extractHeader2(text_data));
						
						// offer crawling for reddit comments modal
						if(directory === 'reddit-Post' || directory === 'reddit-Historical-Post' || directory === 'reddit-Search'){
							$("#dataset").val(prefix);
							$("#length").val(text_data.length-1);
							$("#getComment").show();
						}else{
							$("#getComment").hide();
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
		
		
	});
	
	$("#algorithm").on('change',function(){
		$("#citation-container").hide();
		$("#citation-notice").empty();
		
		var algorithm = $(this).children(":selected").val();
		if (algorithm === 'vader'){
			$("#citation-notice").append(
				`<p><b>Thank you for using our tool, if you use these results please cite it and the Vader method:</b></p>
				<ul>
					<li>Yun, J. T., Wang, C., Troy, J., Vance, N. P., Marini, L., Booth, R., Nelson, T., Hetrick, 
						A., & Hodgkins, H. (September, 2017) – Social Media Macroscope, <a href="http://socialmediamacroscope.org" target="_blank">
						http://socialmediamacroscope.org</a>.
					</li>
					<li><a href="https://scholar.google.com/scholar?hl=en&as_sdt=0%2C14&
					q=Hutto%2C+C.J.+%26+Gilbert%2C+E.E.+%282014%29.+VADER%3A+A+Parsimonious+Rule-based+Model+for+S
					entiment+Analysis+of+Social+Media+Text.++%09%09%09%09%09%09Eighth+International
					+Conference+on+Weblogs+and+Social+Media+%28ICWSM-14%29.+Ann+Arbor%2C+MI%2C+June+2014.&btnG=" target="_blank">
					Hutto, C.J. & Gilbert, E.E. (2014). VADER: A Parsimonious Rule-based Model for Sentiment Analysis of Social Media Text. 
						Eighth International Conference on Weblogs and Social Media (ICWSM-14). Ann Arbor, MI, June 2014.</a>
					</li>
				</ul>`
			);
			$("#citation-container").show();
		}
		
	});
});

/*----------------------form validation ----------------------------*/
function formValidation(){
	
	if ($("#selectFile option:selected").val() === 'Please Select...' || $("#selectFile option:selected").val() === undefined){
		$("#modal-message").append(`<h4>Please select a csv file from your folder!</h4>`);
		$("#alert").modal('show');
		$("#selectFile").focus();
		return false;
	}
	if ($("#selectFileTable thead tr").find('th').text() === ''){
		$("#modal-message").append(`<h4>This dataset you selected is empty, please select another one!</h4>`);
		$("#alert").modal('show');
		$("#selectFile").focus();
		return false;
	}
	if ($("input[name='selectFileColumn']:checked").val() === '' ||$("input[name='selectFileColumn']:checked").val() === undefined){
		$("#modal-message").append(`<h4>Please select a column of the text to analyze!</h4>`);
		$("#alert").modal('show');
		return false;			
	}
	
	if ($("#algorithm option:selected").val() === 'Please Select...' || $("#algorithm option:selected").val() === undefined){
		$("#modal-message").append(`<h4>Please select an algorithm</h4>`);
		$("#alert").modal('show');
		$("#algorithm").focus();
		return false;
	}	
	
	return true;
	
}





