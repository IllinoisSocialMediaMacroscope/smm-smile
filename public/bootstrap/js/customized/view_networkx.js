$(document).ready(function(){
	
	$("#model").on('change',function(){
		//these model does not allow you to specify how many clusters
		var model = $(this).find(':selected').val()
		//console.log(model);
		if (model === 'AffinityPropagation' || model === 'DBSCAN' || model === 'MeanShift'){
			$("#clusters").hide();
		}else{
			$("#clusters").show();
		}
	});
	
	
	$("#selectFile").on('change',function(){
		var foldername = $(this).children(":selected").attr("id");
		var directory = $(this).children(":selected").attr("class");
		$("#selectFilePreview-container").empty();
		//$("#selectFileHeader-container").empty();
		$.ajax({
			type:'POST',
			url:'/render', 
			data: {"foldername":foldername, "directory":directory},				
			success:function(data){
				if (data){
					var allowed_field_list = [
						// tweet
						'text',
						// stream
						'_source.text'];
					
					var index = [];
					$.each(data.preview[0],function(i,val){
						if (allowed_field_list.indexOf(val) >=0){
							index.push(i)
						}
					});
					var numCat_data = [];
						$.each(data.preview,function(i,val){
							var line = [];
							$.each(index,function(i,indice){
								line.push(val[indice]);
							});
							numCat_data.push(line); 
						});
					
					$("#selectFilePreview-container").append(`<div class="form-group">
					<label class="control-label col-md-2 col-md-2 col-xs-12">preview data</label>
					<div class="col-md-8 col-md-8 col-xs-12" id="selectFilePreview"></div></div>`)				
					$("#selectFilePreview").append(arrayToTable(numCat_data,'#selectFileTable'));
					//$("#selectFileTable").DataTable();
					
					
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
});

/*----------------------form validation ----------------------------*/
function formValidation(){
	
	if ($("#selectFile option:selected").val() === 'Please Select...' || $("#selectFile option:selected").val() === undefined){
		$("#modal-message").append(`<h4>Please select a csv file from your folder!</h4>`);
		$("#alert").modal('show');
		$("#selectFile").focus();
		return false;
	}
	if ($("#relationships option:selected").val() === '' || $("#relationships option:selected").val() === undefined){
		$("#modal-message").append(`<h4>Please select a model to perform!</h4>`);
		$("#alert").modal('show');
		$("#relationships").focus();
		return false;
	}
	if ($("#layout option:selected").val() === '' || $("#layout option:selected").val() === undefined){
		$("#modal-message").append(`<h4>Please select a network layout!</h4>`);
		$("#alert").modal('show');
		$("#layout").focus();
		return false;
	}
	if ($("#node_size").val()< 5 || $("#node_size").val() > 50){
		$("#modal-message").append(`<h4>The valid number of node size is between 5 to 50!</h4>`);
		$("#alert").modal('show');
		$("#node_size").focus();
		return false;
	}
	if ($("#edge_width").val()< 0.1 || $("#edge_width").val() > 5){
		$("#modal-message").append(`<h4>The valid number of edge width is between 0.1 to 5!</h4>`);
		$("#alert").modal('show');
		$("#edge_width").focus();
		return false;
	}
	
	return true;
	
}

function draw_d3js(d3js_data){
	var vis = d3.select("#d3js-network-svg");
	var width = document.getElementById("d3js-network-container").offsetWidth;;
	var height = 800;

	var color = d3.scale.category10();

	var force = d3.layout.force()
		.gravity(.05)
		.linkStrength(0.1)
		.charge(-30)
		.linkDistance(width/3)
		.size([width, height]);


	/* zoom-in
	function zoomed() {
		vis.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}
	var zoom = d3.behavior.zoom()
				.scaleExtent([1, 10])
				.on("zoom", zoomed);*/					

	force
		.nodes(d3js_data.nodes)
		.links(d3js_data.links)
		.start();
	
	//console.log(force.links());
	var links = vis.append("g").selectAll("line.link")
		.data(force.links())
		.enter()
		.append("line")
		.attr("id",function(d){ return d.source.id + '-' + d.target.id })
		.attr("class", "link")
		.attr("text",function(d){ return d.text })
		.attr("author",function(d){ return d.source.id })
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
	function tick(d) {
	  links.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });
	  nodes.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; });
	};
	
	var nodes = vis.selectAll("circle.node")
		.data(force.nodes())
		.enter()
		.append("circle")
		.attr("class", "node")
		.attr("r", 8)
		.attr("id",function(d){ return d.id })
		.style("fill", function(d) { return color(d.connectivity); })
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
	
	
		
	force.on("tick", function() {
		links.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });			

		nodes.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; });
		node_label.attr("x", function(d) { return d.x; })
			.attr("y", function(d) { return d.y-20; });
		
	});
	
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
		var tweet = d3.select(this).attr("text");
		var author = d3.select(this).attr("author");
		$("#tweet-display").text(tweet);
		$("#author-display").text("@" + author);
	})
	 .on("mouseout", function() {
		d3.select(this).style("stroke", "#999");
		$("#tweet-display").text('...');
		$("#author-display").text('Author');
	});

	

}