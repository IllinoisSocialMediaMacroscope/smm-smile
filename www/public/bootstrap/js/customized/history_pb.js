$(document).ready(function(){
    $.ajax({
        type:'POST',
        url:'list-all',
        data: {},
        success:function(data){
            if (data){
                if ('ERROR' in data){
                    $("#loading").hide();

                    $("#search-tag-results").empty();
                    $("#background").show();

                    $("#error").val(JSON.stringify(data));
                    $("#warning").modal('show');
                }else{
                    // first level
                    $.each(data, function(key,val){
                        if(key === 'ML'){ var first_level = 'Machine Learning'; }
                        else if (key === 'NLP'){ var first_level = 'Nature Language Processing'; }
                        else if (key === 'NW'){ var first_level ='Network Visualization and Analysis'; }
                        else if (key === 'GraphQL'){ var first_level = 'Social Media Data'; }
                        else{ var first_level = key }
                        $(".nav.nav-sidebar").append(
                            `<li>
                                    <a onclick="toggle(this,` + key +`);" id="` + key + `-btn">
                                        <span class="glyphicon glyphicon-minus"></span>`
                            + first_level +
                            `</a>
                                </li>
                                <ul class="nav child_menu" style="display:block;" id="` + key + `"></ul>`);

                        // second level
                        $.each(val, function(key1,val1){
                            if (key1 === 'feature'){ var second_level = 'Feature Selection'; }
                            else if(key1 === 'clustering'){var second_level = 'Unsupervised Learning (clustering)';}
                            else if(key1 === 'preprocessing'){var second_level = 'NLP Preprocessing'; }
                            else if(key1 === 'autophrase'){var second_level = 'Automated Phrase Mining'; }
                            else if(key1 === 'sentiment'){var second_level = 'Sentiment Analysis';}
                            else if(key1 === 'topic-modeling'){var second_level = 'LDA Topic Modeling';}
                            else if(key1 === 'twitter-Tweet'){var second_level = 'Twitter Tweet';}
                            else if(key1 === 'twitter-User'){var second_level = 'Twitter User';}
                            else if(key1 === 'twitter-Stream'){var second_level = 'Twitter Streaming Data';}
                            else if(key1 === 'reddit-Search'){var second_level = 'Reddit Search Posts Title';}
                            else if(key1 === 'reddit-Post'){var second_level = 'Subreddit Posts Title';}
                            else if(key1 === 'reddit-Comment'){var second_level = 'Subreddit Comment';}
                            else if(key1 === 'reddit-Historical-Post'){var second_level = 'Reddit Historical Post';}
                            else if(key1 === 'reddit-Historical-Comment'){var second_level = 'Reddit Historical Comment';}
                            else if(key1 === 'crimson-Hexagon'){var second_level = 'Crimson Hexagon Data';}
                            else if(key1 === 'networkx'){var second_level = 'Python NetworkX';}
                            else if(key1 === 'classification'){var second_level = 'Text Classification';}
                            else{var second_level = key1; }
                            $("#"+key).append(
                                `<li>
                                            <a onclick="toggle(this,'#` + key1 + `');" id="` + key1 + `-btn">
                                                <span class="glyphicon glyphicon-plus"></span>`
                                + second_level +
                                `</a>
                                            <ul class="nav child_menu" style="display:none;" id="` + key1 + `"></ul>
                                        </li>`);

                            $.each(val1, function(key2,val2){
                                $("#"+key1).append(
                                    `<li id="` + key1 + "-"+ key2 +`">
										<p class="historyTabs">` +key2 +`</p>
										<div class="historyTags" id="`+ key2 + `"></div>
										<div class="button-unit">
											<button class="historyButtons" onclick="submitHistory('` + val2 + `');">view</button>
											<button class="historyButtons" onclick="deleteModal('` + val2 + "','" + key1 + "-" + key2 +`');">delete</button>
										</div>
								</li>`);
                            });
                        });
                    });
                    $("#historyListLoading").hide();
                    $("#historyLogo").show();
                    listTag();
                }
            }
        },
        error: function(jqXHR, exception){
            $("#error").val(jqXHR.responseText);
            $("#warning").modal('show');
        }
    });
});

function submitHistory(folderURL){
	$("#title-container").empty();
	$("#overview-container").empty();
	$("#img-container").empty();
	$("#result-container").empty();
	$("#gaudge").empty();
	$("#title").empty();
	$("#d3js-container").hide();
	$("#background").hide();			
	$("#loading").show();
	
	$.ajax({
		type:'post',
		url:'history', 
		data: {'folderURL': folderURL },				
		success:function(data){
			if(data){
				if ('ERROR' in data){
					$("#loading").hide();

                    $("#search-tag-results").empty();
					$("#background").show();

					$("#error").val(JSON.stringify(data));
					$("#warning").modal('show');
				}else{
					$("#loading").hide();

                    // ADD TO TAG MODAL
                    $("#jobId").val(data.ID);

                    // ADD TO CLOWDER MODAL
                    $("#clowder-files-list").empty();
                    if (data.title != 'Social Media Past Search Result'){
                        clowderFileGen(data.download);
                        clowderFileMeta();
                        $('.fileTags').tagsinput({ freeInput: true });
                    }

					if ('title' in data || 'ID' in data){
						appendTitle("#title-container",data.title,data.ID);
					}
					
					if('config' in data || 'donwload' in data){
						appendOverview("#overview-container",data.config,data.download);
					}
					
					if ('img' in data){
						appendImg("#img-container",data.img);
					}
					
					if ('preview' in data){
						appendPreview('#result-container',data.preview);
					}
					
					if ('compound' in data){
						// add gauge for sentiment analysis
						//google.charts.setOnLoadCallback(drawGauge('Compound Sentiment Score of the whole document', parseFloat(data.compound)));
						console.log('revoke it');
					}
					
					if('iframe' in data){
						// draw iframe for topic modeling
						drawIframe(data.iframe.name, data.iframe.content);
					}
					
					if('table' in data){
						// draw word tree for preprocessing
						google.charts.setOnLoadCallback(drawWordTree(data.table.name,data.table.content,data.table.root));
					}
					
					if ('expandable' in data && data.expandable != undefined){
						$(".dataset").val(data.expandable);
						$(".length").val(data.length);
						$("#getComment").show();
					}else{
						$("#getComment").hide();
					}
				}
			}
		},
		error: function(jqXHR, exception){
			$("#error").val(jqXHR.responseText);
			$("#warning").modal('show');

		}
	}); 
	
} 

/* delete job modal */
function deleteModal(folderURL,tab){
	$("#folderURL").val(folderURL);
	$("#tab").val(tab);
	$("#delete").modal('show');
}

$("#deleteButton").click(function(e){
	var folderURL = $("#folderURL").val();
	var tab = $("#tab").val();
	deleteHistory(folderURL,tab);
});

$("#deleteButton").keypress(function(e){
	if (e.which == 13){
		var folderURL = $("#folderURL").val();
		var tab = $("#tab").val();
		deleteHistory(folderURL,tab);
	}
});
	
function deleteHistory(folderURL,tab){	
	//delete content
	$.ajax({
		type:'delete',
		url:'history',
		data: JSON.stringify({'folderURL':folderURL, 'type':'remote'}),
		contentType: "application/json",
		success:function(data){
			if(data){
				$("#title-container").empty();
				$("#overview-container").empty();
				$("#img-container").empty();
				$("#result-container").empty();
				$("#gaudge").empty();
				$("#title").empty();
				$("#d3js-network-container").empty();
				$("#d3js-container").hide();
				$("#" + tab).remove();
				$("#delete").modal('hide');

                $("#search-tag-results").empty();
				$("#background").show();

				// delete tags
				$.ajax({
					type:'delete',
					url:'tag',
					data:JSON.stringify({'jobId':folderURL}),
                    contentType: "application/json",
					error: function(jqXHR, exception){
                        $("#error").val(jqXHR.responseText);
                        $("#warning").modal('show');
					}
				});
			}
		},
		error: function(jqXHR, exception){
			$("#error").val(jqXHR.responseText);
			$("#warning").modal('show');
		}
	}); 

} 

function appendTitle(container, title,ID){
	$(container).append(`<h1 style="display:inline;vertical-align:middle">`+ title+ `</h1>
						<div style="display:inline;padding:0 20px;">
							<a class="btn btn-danger" href="" id="tag-history-panel">
								<span class="glyphicon glyphicon-tag"></span>Tag
							</a>
							<a class="btn btn-danger" href="" id="clowder-history-panel">
								<span class="glyphicon glyphicon-cloud-upload"></span>Clowder
							</a>
						<h4>ID: ` + ID +`</h4>
						<button class="btn btn-default" id="getComment">get comments</button>`);
	
	$("#getComment").on('click',function(e){
		e.preventDefault();
		$("#reddit-expand").modal('show');
	});
	
	$("#clowder-history-panel").on('click',function(e){
		e.preventDefault();
		invoke_clowder();
	});
	
	$("#tag-history-panel").on('click',function(e){
		e.preventDefault();
		$("#tag-modal").modal('show');			
	});
}

function appendOverview(container,config, download){
	
	$(container).append(`<h2>Overview</h2>`);
	// vertical table	
	var tableContent = `<div class="table-responsive"><table class="table table-striped table-bordered"><tbody>`;
	$.each(config, function(key,value){
		tableContent += `<tr><th>` + JSON.stringify(key) + `</th><td>` + JSON.stringify(value) + `</td></tr>`;
	});
	
	// add download files
	tableContent += `<tr><th>downloadables</th><td>`;
	$.each(download,function(i,val){
		tableContent += `<a style="display:block;color:red;" href="` + val.content+ `">` +val.name+`</a>`;
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

/* search tag */
$("#search-tag").on("keyup", function (e) {
    if (e.keyCode == 13 || e.keyCode == 10) {

        var tagName = $("#search-tag").val();
        $("#search-tag-results").empty();

        $.ajax({
            type: 'GET',
            url: 'tag',
            data: {tagName: tagName},
            success: function (data) {
                if (Object.keys(data).length === 0) {
                    $("#search-tag-results").append(`<div class="list-container">
                                                <cite>cannot find matching tag</cite></div>`);
                }
                else {
                    for (const [uuid, tag] of Object.entries(data)) {
                        $("#search-tag-results").append(
                            `<div class="list-container">
                                            <h4>
                                                <a class="page-title" onclick="submitHistory('` + uuid + `')">` + uuid + `</a>
                                            </h4>
                                            <cite>` + tag + `</cite>
                                        </div>`
                        );
                    }
                }
            },
            error: function (jqXHR, exception) {
                $("#error").val(jqXHR.responseText);
                $("#warning").modal('show');
            }
        });
    }
});

$("#search-tag-btn").on("click", function (e) {

    var tagName = $("#search-tag").val();
    $("#search-tag-results").empty();
    $.ajax({
        type: 'GET',
        url: 'tag',
        data: {tagName: tagName},
        success: function (data) {
            if (Object.keys(data).length === 0) {
                $("#search-tag-results").append(`<div class="list-container">
                                            <cite>cannot find matching tag</cite></div>`);
            }
            else {
                for (const [uuid, tag] of Object.entries(data)) {
                    $("#search-tag-results").append(
                        `<div class="list-container">
                                        <h4>
                                            <a class="page-title" onclick="submitHistory('` + uuid + `')">` + uuid + `</a>
                                        </h4>
                                        <cite>` + tag + `</cite>
                                    </div>`
                    );
                }
            }
        },
        error: function (jqXHR, exception) {
            $("#error").val(jqXHR.responseText);
            $("#warning").modal('show');
        }
    });
});

$("#search-tag-invoke").on("click", function(e){
    $("#title-container").empty();
    $("#overview-container").empty();
    $("#img-container").empty();
    $("#result-container").empty();
    $("#gaudge").empty();
    $("#title").empty();
    $("#d3js-container").hide();
    $("#loading").hide();

    $("#search-tag-results").empty();
    $("#background").show();
});

/* list tag */
function listTag(){
    $.ajax({
        type: 'GET',
        url: 'tag',
        data: {},
        success: function (data) {
            for (const [ID, tag] of Object.entries(data)){
                var parentID = ID.split('/').slice(-3, -1).join("-");
                var tagID = ID.split('/').slice(-2, -1)[0];
                $("#"+parentID).find("#" + tagID).append(`<kbd>tag: ` + tag + `</kbd>`);
            }
        },
        error: function (jqXHR, exception) {
            $("#error").val(jqXHR.responseText);
            $("#warning").modal('show');
        }
    });
}
