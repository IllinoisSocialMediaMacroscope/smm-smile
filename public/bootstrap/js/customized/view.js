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

function checkbox_onclick(){
	$(document).on('change',':checkbox',function(){
		$(this).parent().toggleClass('checkbox-flat checkbox-flat-checked');
	});
}

function customized_reset(){
	$("#img-container").empty();
	$("#result-container").empty();
	$("#side-download").empty();
	$("#side-download-li").hide();
	$("#d3js-container").hide();
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
			//if (cval.length >=100){
			//	cval = cval.slice(0,100) + '...';
			if (cval === '' || cval === undefined){
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
	$('#side-download-li').show();
	$(downloadID).empty()
	if(downloadData !== []){
		$.each(downloadData,function(i,val){
			$(downloadID).append(`<li><form action='/download' name='download' method='post' class="side-form">
								<input type="hidden" value=`+val.content+` name="downloadURL" /><button type="submit" class="link-button"><span class="glyphicon glyphicon-download"></span>`
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

function appendD3JS(data){
	$("#d3js-container").hide();
	$("#d3js-network-container").empty();
	$("#d3js-network-container").append(`<svg id="d3js-network-svg" width="100%" height="1000px" preserveAspectRatio="xMidYMin">
		<defs>
			<marker id="arrow" viewbox="0 -5 10 10" refX="10" refY="0" markerWidth="3" markerHeight="3" orient="auto">
				<path d="M0,-5L10,0L0,5Z">
			</marker>
		</defs>
	</svg>`);
	draw_d3js(data.d3js_data['nodes'],data.d3js_data['links']);
	$("#d3js-container").show();
}

/*************************************************************d3js***************************************/
function draw_d3js(d_nodes,d_links){
	var width = 1000;
	var height =800;
	
	// colorscale
	var color = d3.scale.category20();
	var output = document.getElementById('colorscale');
	d3.select(output).selectAll('p').remove();
	for(let i = 0; i < 20; i++) {
		d3.select(output)
			.append('p')
			.text(`ccc`)
			.style('color',color(i))
			.style('background-color', color(i))
			.style('display','inline');
	}
	
	var force = d3.layout.force()
		.size([width, height])
		.charge(-20)
		.linkDistance(100)
		.on('start',start)
		.nodes(d_nodes)
		.links(d_links)
		//.on("tick",tick)
		.start();
		
	var vis = d3.select("#d3js-network-svg");
	
	var links = vis.append("g").selectAll("line.link")
		.data(force.links())
		.enter()
		.append("line")
		.attr("id",function(d){ return d.source.id + '-' + d.target.id })
		.attr("class", "link")
		.attr("tweet",function(d){ return d.text })
		.attr("author", function(d){ return d.source.id })
		.attr("marker-end", "url(#arrow)")
		.style("stroke-width", "6px")
		.style("stroke", "#999")
		.style("opacity","0.3");
	
	// drag
	var drag = d3.behavior.drag()
				.on("dragstart", dragstart)
				.on("drag", dragmove)
				.on("dragend", dragend);
	function dragstart(d) {
	  force.stop()
	}	
	function dragmove(d, i) {
		d.px += d3.event.dx;
		d.py += d3.event.dy;
		d.x += d3.event.dx;
		d.y += d3.event.dy; 
		tick(d);
	}
	function dragend(d, i) {
		var e = d3.event.sourceEvent;
		if (e.ctrlKey){
			d.fixed = true; 
		}else{
			d.fixed =false;
		}
		force.resume();
	}
	
	
	// normalize the connectivity in order to put color on it
	var min_conn = Infinity;
	var max_conn = 0;
	$.each(d_nodes,function(i,val){
		if (val['connectivity'] > max_conn){
			max_conn = val['connectivity'];
		}
		if (val['connectivity'] < min_conn){
			min_conn = val['connectivity'];
		}
	});

	var nodes = vis.selectAll("circle.node")
		.data(force.nodes())
		.enter()
		.append("circle")
		.attr("class", "node")
		.attr("r", 8)
		.attr("id",function(d){ return d.id })
		.style("fill", function(d) { 
			return color((d.connectivity - min_conn)/(max_conn-min_conn)*10); })
		.call(drag);

	var node_label = vis.selectAll("node_text")
		.data(force.nodes())
		.enter()
		.append("text")
			.text(function (d) { return "@" + d.id; })
			.attr("id",	function(d){return 'label-' + d.id; })
			.style("visibility", "hidden")
			.style("text-anchor", "middle")
			.style("fill", "#73879c")
			.style("font-family", "Arial")
			.style("font-size", 18);
	
	function start(){
		var ticksPerRender = 3;
		requestAnimationFrame(function render(){
			for (var i=0; i< ticksPerRender; i++){
				force.tick();
			}
			links.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });
			nodes.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; });
			node_label.attr("x", function(d) { return d.x; })
				.attr("y", function(d) { return d.y-20; });
				
			if (force.alpha() > 0){
				requestAnimationFrame(render);
			}
		})
	}

	function tick(d) {
		links.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });
		nodes.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; });
		node_label.attr("x", function(d) { return d.x; })
			.attr("y", function(d) { return d.y-20; });
	};
		
	/*force.on("tick", function() {
		//this takes time
		links.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });			

		nodes.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; });
		node_label.attr("x", function(d) { return d.x; })
			.attr("y", function(d) { return d.y-20; });
		
	});*/
	
	// hover on nodes show screen name
	vis.selectAll("circle.node").on("mouseover",function(){
		d3.select(this).attr("r", 18);
		var id = d3.select(this).attr("id");
		d3.select("#label-" + id).style("visibility","visible");
	})
	 .on("mouseout", function() {
		d3.select(this).attr("r", 8);
		var id = d3.select(this).attr("id");
		d3.select("#label-" + id).style("visibility","hidden");
	});
	
	// click on edges show tweet
	vis.selectAll("line.link").on("mouseover",function(){
		d3.select(this).style("stroke", "red");
		var tweet = d3.select(this).attr("tweet");
		var author = d3.select(this).attr("author");
		$("#author-display").text(author);
		$("#tweet-display").text(tweet);
	})
	 .on("mouseout", function() {
		d3.select(this).style("stroke", "#999");
		var tweet = d3.select(this).attr("tweet");
		var author = d3.select(this).attr("author");
		$("#author-display").text("AUTHOR");
		$("#tweet-display").text("tweet");
	});
	
	/* zoom click
	var zoom = d3.behavior.zoom().scaleExtent([1,8]).on("zoom", zoomed);
	function zoomed() {
		var group = d3
			.select("#d3js-network-container")
			.select("#d3js-network-svg")
			.selectAll("circle.node")
			.selectAll("node_text")
			.selectAll("line.link")
		group.attr("transform",
			"translate(" + zoom.translate() + ")" +
			"scale(" + zoom.scale() + ")"
		);
	}
	function interpolateZoom (translate, scale) {
		var self = this;
		return d3.transition().duration(350).tween("zoom", function () {
			var iTranslate = d3.interpolate(zoom.translate(), translate),
				iScale = d3.interpolate(zoom.scale(), scale);
			return function (t) {
				zoom
					.scale(iScale(t))
					.translate(iTranslate(t));
				zoomed();
			};
		});
	}
	function zoomClick() {
		var clicked = d3.event.target,
			direction = 1,
			factor = 0.2,
			target_zoom = 1,
			center = [width / 2, height / 2],
			extent = zoom.scaleExtent(),
			translate = zoom.translate(),
			translate0 = [],
			l = [],
			view = {x: translate[0], y: translate[1], k: zoom.scale()};

		direction = (this.id === 'zoom_in') ? 1 : -1;
		target_zoom = zoom.scale() * (1 + factor * direction);

		if (target_zoom < extent[0] || target_zoom > extent[1]) { return false; }

		translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
		view.k = target_zoom;
		l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

		view.x += center[0] - l[0];
		view.y += center[1] - l[1];

		interpolateZoom([view.x, view.y], view.k);
	}
	d3.select(".zoom-btn").on('click',zoomClick);*/
}

/*----------------------submit to analysis--------------------------------------------*/
function ajaxSubmit(formID){
	
	var foldername = $("#selectFile").children(":selected").attr("id");
	var directory = $("#selectFile").children(":selected").attr("class");
	var data = $(formID).serialize() + "&filename="+ directory + "/" + foldername + "/" + foldername + ".csv";
	
	if (formValidation()){
		
		$(".loading").show();
		$.ajax({
			type:'POST',
			url:$(formID).attr('action'), 
			data:data,				
			success:function(data){
				if ('ERROR' in data){
					$(".loading").hide();
					$("#error").val(JSON.stringify(data));
					$("#warning").modal('show');
				}else{
					$(".loading").hide();
					appendDownload("#side-download",data.download);
					appendImg("#img-container",data.img);
					
					if (data.preview.content !== ''){
						appendPreview('#result-container',data.preview);
					}
					
					if ('compound' in data){
						// add gauge for sentiment analysis
						//google.charts.setOnLoadCallback(drawGauge('Compound Sentiment Score of the whole document', parseFloat(data.compound)));
						console.log('revoke it');
					}else if('iframe' in data){
						// draw iframe for topic modeling
						drawIframe(data.iframe.name, data.iframe.content);
					}else if('table' in data){
						// draw word tree for preprocessing
						google.charts.setOnLoadCallback(drawWordTree(data.table.name,data.table.content,data.table.root));
					}else if('d3js_data' in data){
						appendD3JS(data);
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


