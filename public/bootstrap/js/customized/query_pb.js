//corresponding to query.pug and searchbox.pug
function init(){
	
	// initialization
	$("#searchbox").prop('disabled',true);
	$("#dropdownButton").prop('disabled',true);
	$("#simple-search-btn").prop('disabled',true);
	
	queryTerm = '';
	Query ='';
	parameters = { 	tweet: {},
					twtUser: {},
					es: {},
					/*rdComment: {},
					rdSearch: {},
					rdReply: {},
					rdSub: {}*/
				};
	parameters['tweet']['q:'] = $("#searchbox").val();
	parameters['tweet']['count:'] = 100;
	parameters['tweet']['pages:'] = parseInt($("#tweet-count").val())/100;
	parameters['tweet']['fields'] = '';
	
	parameters['twtUser']['q:'] = $("#searchbox").val();
	parameters['twtUser']['count:'] = 20;
	//parameters['twtUser']['pageNum:'] = parseInt($("#twtUser-count").val())/20;
	parameters['twtUser']['fields'] = '';
	
	
	parameters['es']['q:'] = $("#searchbox").val();
	parameters['es']['perPage:'] =  1000;
	//parameters['es']['pageNum:']= parseInt($("#perPage").val())/1000;
	parameters['es']['fields'] = '';
	
	// save modal popup
	$("#adv-search-btn").on('click', function(e){
		modalPopUp('#input');
	});	
	$("#simple-search-btn").on('click', function(e){
		modalPopUp('#searchbox');
	});
	$("#searchbox").on('keypress', function(e){
		if ( (e.keyCode == 13 || e.keycode == 10 )&& !$("#simple-search-btn").attr('disabled')){
			e.preventDefault();
			modalPopUp('#searchbox');
		}
	});
	
	// save modal click
	$("#saveButton").on('click',function(e){
		saveModalClick()
	});
	$("#filename").on('keypress',function(e){
		if (e.keyCode === 13 || e.keycode == 10){
			e.preventDefault(); 
			saveModalClick()
		}
	});
	
	$("#filename").on("keyup",function(e){
		if (e.keyCode !== 13 || e.keyCode!== 10){
			$('#display').empty();
			//console.log($(this).val());
			$('#display').append(`<p style="text-align:left;">` + $(this).val() + '.csv' 
							+ `<br>` + $(this).val() + '.json' + `</p>` );
		}
	});
	
	
	// modal overlay
	$(document).on({
		'show.bs.modal': function () {
			var zIndex = 1040 + (10 * $('.modal:visible').length);
			$(this).css('z-index', zIndex);
			setTimeout(function() {
				$('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
			}, 0);
		},
		'hidden.bs.modal': function() {
			if ($('.modal:visible').length > 0) {
				// restore the modal-open class to the body element, so that scrolling works
				// properly after de-stacking a modal.
				setTimeout(function() {
					$(document.body).addClass('modal-open');
				}, 0);
			}
		}
	}, '.modal');
		
	// customize dropdown
	$('#dropdownButton').on('click',function(event){
		if ($("#searchbox").val() !== '' && $("#searchbox").val() !== undefined ){
			$(this).parent().toggleClass('open');
			if ($(this).parent().attr('class') === 'dropdown dropdown-lg open'){
				// disable search and enable advanced search
				$("#simple-search-btn").prop('disabled',true);
			}else{
				$("#simple-search-btn").prop('disabled',false);
			}
		}else{
			$("#modal-message").append(`<h4>filename illegal!<br> Legal Filename should only include <i>Alphabet, Number,
										Underscore</i> and/or <i>Dash</i>. <b>Example: mySearch-cwang138</b></h4>`);
			$("#alert").modal('show');
			$("#searchbox").focus();
		}
	});
	
	// customize selectpicker
	$('.selectpicker').selectpicker({ style: 'btn-info', size: 10 });

	// customize multiselectbox
    $(document).ready(function() {
        $('.fields').multiselect({
			enableFiltering: true,
			filterBehavior: 'value',
			dropUp:true,
			maxHeight:400,
			buttonWidth:'600px',
			includeSelectAllOption: true,		
			enableCollapsibleOptGroups: true,			
			});
    });
	
	// select box enable search
	$("#social-media").change(function(){
		$("#searchbox").prop('disabled',false);
		$("#dropdownButton").prop('disabled',false);
		$("#simple-search-btn").prop('disabled',false);
		
		$(".tweet").hide();
		$(".user").hide();
		$(".es-tweet").hide();
		$(".form-group.geocode").hide();
		$(".form-group.dateRange").hide();
		$(".form-group.es-geocode").hide();
		$(".form-group.es-dateRange").hide();
		$(".form-group.es-popularity").hide();
		
		
		queryTerm = $(this).find(':selected').val();
		if ( queryTerm === 'queryTweet'){
			$(".tweet").show();
			$("#searchbox").attr("placeholder","Tweet keywords that you wish to search...");
		}else if ( queryTerm === 'queryUser'){
			$(".user").show();
			$("#searchbox").attr("placeholder","Username keywords that you wish to search...");
		}else if ( queryTerm === 'streamTweet'){
			$(".es-tweet").show();
			$("#searchbox").attr("placeholder","Tweet keywords that you wish to search...");
		}
	
		Query = updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});

	/* documentation */
	$("#expandDoc").click(function(){
		$("#documentation").toggleClass("expand");
		$("#docIframe").height($(window).height());
		$("#searchPage").toggleClass("shrink");
		
	});
	/*---------------------------------------global search term---------------------------------------------------------------------------*/
	$("#searchbox").change(function(){
		parameters['tweet']['q:'] = $("#searchbox").val();
		parameters['twtUser']['q:'] = $("#searchbox").val();
		parameters['es']['q:'] = $("#searchbox").val();
		
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	
	/*---------------------------------------------query tweet ------------------------------------------------------------------------*/
	// toggle date range checkbox
	$("#dateRange").change(function(){
		
		parameters['tweet']['until:'] = $("#until").val();
		
		if ($("#dateRange").is(':checked')){
			$(".form-group.dateRange").show();
			
			$("#until").change(function(){
				parameters['tweet']['until:'] = $("#until").val();
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			
		}else{
			parameters['tweet']['until:'] = '';	
			$(".form-group.dateRange").hide();
		}	
		
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	// toggle geocode checkbox
	$("#geocode").change(function(){
		
		parameters['tweet']['geocode:'] = $("#lat").val() + `,`+ $("#lon").val() + `,`+ $("#radius").val() +`mi`;;
		
		if ($("#geocode").is(':checked')){
			$(".form-group.geocode").show();
			
			lat = lon = radius = '';
			$("#lat").change(function(){
				lat = $("#lat").val();
				parameters['tweet']['geocode:'] = lat + `,`+ lon + `,`+ radius +`mi`;
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			$("#lon").change(function(){
				lon = $("#lon").val();
				parameters['tweet']['geocode:'] = lat + `,`+ lon + `,`+ radius +`mi`;
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			$("#radius").change(function(){
				radius = $("#radius").val();
				parameters['tweet']['geocode:'] = lat + `,`+ lon + `,`+ radius +`mi`;
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			})
		
		}else{
			parameters['tweet']['geocode:'] = '';
			$(".form-group.geocode").hide();
		}
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	// tweet
	$("#tweet-count").change(function(){
		parameters['tweet']['count:'] = 100;
		parameters['tweet']['pages:'] = parseInt($("#tweet-count").val())/100;
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	
	$("#twtTweetFields").change(function(){
		fields_string = '';
		
		fields = {BasicFields:['text'],AuthorInformation:[],TweetEntities:[]};
		$.each($(this).find(':selected'),function(i,val){
			var label = $(val.parentNode)[0].label;
			fields[label].push(val.value);
		});
		
		if(fields['BasicFields'].length !== 0){
			$.each(fields['BasicFields'],function(i,val){
				fields_string += '\n\t\t\t' + val;
			});
		}
		if (fields['AuthorInformation'].length !== 0){
			fields_string += '\n\t\t\tuser{' ;
			$.each(fields['AuthorInformation'],function(i,val){
				fields_string += '\n\t\t\t\t' + val;
			});
			fields_string += '\n\t\t\t}' ;
		}
		if (fields['TweetEntities'].length !== 0){
			fields_string += '\n\t\t\tentities{' ;
			$.each(fields['TweetEntities'],function(i,val){
				if (val === 'user_mentions'){
					fields_string += '\n\t\t\t\tuser_mentions{\n\t\t\t\t\tauthor_id\n\t\t\t\t\tscreen_name\n\t\t\t\t}';
				}else{
					fields_string += '\n\t\t\t\t' + val;
				}
			});
			fields_string += '\n\t\t\t}' ;
		}
		
		parameters['tweet']['fields'] = fields_string;
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});		
	
	
	/*---------------------------------------------Elastic search ----------------------------------------------------------------------*/
	// toggle es date range checkbox
	$("#es-dateRange").change(function(){
		parameters['es']['startDate:'] = $("#start").val();
		parameters['es']['endDate:'] = $("#end").val();
		
		if ($("#es-dateRange").is(':checked')){
			$(".form-group.es-dateRange").show();
			
			$("#start").change(function(){
				parameters['es']['startDate:'] = $("#start").val();
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			$("#end").change(function(){
				parameters['es']['endDate:'] = $("#end").val();
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			
		}else{
			parameters['es']['startDate:']='';
			parameters['es']['endDate:']  = '';
			$(".form-group.es-dateRange").hide();
		}	
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	// toggle es-geocode checkbox
	$("#es-geocode").change(function(){
		parameters['es']['lat:'] =  parseFloat($("#es-lat").val());
		parameters['es']['lon:'] =  parseFloat($("#es-lon").val());
		parameters['es']['distance:'] =  $("#es-radius").val().toString() + 'mi';
		
		if ($("#es-geocode").is(':checked')){
			$(".form-group.es-geocode").show();

			$("#es-lat").change(function(){
				parameters['es']['lat:'] =  parseFloat($("#es-lat").val());
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			$("#es-lon").change(function(){
				parameters['es']['lon:'] =  parseFloat($("#es-lon").val());
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			$("#es-radius").change(function(){
				parameters['es']['distance:'] =  $("#es-radius").val().toString() + 'mi';
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			})
		
		}else{
			parameters['es']['lat:'] =  ''
			parameters['es']['lon:'] =  ''
			parameters['es']['distance:'] =  ''
			$(".form-group.es-geocode").hide();
		}
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	//toggle es-popularity checkbox
	$("#es-popularity").change(function(){
		parameters['es']['followers_count:'] = parseInt($("#followers_count").val());
		parameters['es']['statuses_count:'] =  parseInt($("#statuses_count").val());
		if ($("#es-popularity").is(':checked')){
			$(".form-group.es-popularity").show();
			
			$("#followers_count").change(function(){
				parameters['es']['followers_count:'] = parseInt($("#followers_count").val());
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			$("#statuses_count").change(function(){
				parameters['es']['statuses_count:'] =  parseInt($("#statuses_count").val());
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
		
		}else{
			parameters['es']['followers_count:'] = '';
			parameters['es']['statuses_count:'] =  '';
			$(".form-group.es-popularity").hide();
		}
		
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});	
	// perPage
	$("#perPage").change(function(){
		parameters['es']['perPage:'] = 1000;
		//parameters['es']['pageNum:']= parseInt($("#perPage").val())/1000;
		Query =updateString(queryTerm,parameters);
		//console.log(Query);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
		
	$("#twtStreamFields").change(function(){
		fields_string = '';
		
		fields = {BasicFields:['text'],ElasticSearchMetadata:[],AuthorInformation:[],GeoLocation:[]};
		$.each($(this).find(':selected'),function(i,val){
			var label = $(val.parentNode)[0].label;
			fields[label].push(val.value);
		});
		if (fields['ElasticSearchMetadata'].length !== 0){
			$.each(fields['ElasticSearchMetadata'],function(i,val){
				fields_string += '\n\t\t\t' + val;
			});
		}
		if(fields['BasicFields'].length !== 0){
			fields_string += '\n\t\t\t_source{' ;
			$.each(fields['BasicFields'],function(i,val){
				fields_string += '\n\t\t\t\t' + val;
			});
		
			if (fields['AuthorInformation'].length !== 0){
				fields_string += '\n\t\t\t\tuser{' ;
				$.each(fields['AuthorInformation'],function(i,val){
					fields_string += '\n\t\t\t\t\t' + val;
				});
				fields_string += '\n\t\t\t\t}' ;
			}
			if (fields['GeoLocation'].length !== 0){
				fields_string += '\n\t\t\t\tcoordinates{' ;
				$.each(fields['GeoLocation'],function(i,val){
					fields_string += '\n\t\t\t\t\t' + val;
				});
				fields_string += '\n\t\t\t\t}' ;
			}
			fields_string += '\n\t\t\t}' ;
		}
		
		parameters['es']['fields'] = fields_string;
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});		
	
	
	/*----------------------------------------------------- twitter user-------------------------------------------------------*/
	$("#twtUser-count").change(function(){
		parameters['twtUser']['count:'] = 20;
		//parameters['twtUser']['pageNum:'] = parseInt($("#twtUser-count").val())/20;
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	
	$("#twtUserFields").change(function(){
		fields_string = '';
		
		fields = {BasicFields:[],UserTimeline:[]};
		$.each($(this).find(':selected'),function(i,val){
			var label = $(val.parentNode)[0].label;
			fields[label].push(val.value);
		});
		
		if(fields['BasicFields'].length !== 0){
			$.each(fields['BasicFields'],function(i,val){
				fields_string += '\n\t\t\t' + val;
			});
		}
		if (fields['UserTimeline'].length !== 0){
			fields_string += '\n\t\t\ttimeline{' ;
			$.each(fields['UserTimeline'],function(i,val){
				fields_string += '\n\t\t\t\t' + val;
			});
			fields_string += '\n\t\t\t}' ;
		}
		
		parameters['twtUser']['fields'] = fields_string;
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
		
		
	});
	
}

function constructQuery(parameterObj){
	//console.log(parameterObj);
	var keys = [];
	$.each(Object.keys(parameterObj),function(i,item){
		if (item !== 'fields' && parameterObj[item] !== '' && item !=='pageNum:'){
			keys.push(item);
		}
	});
	
	var query = '';
	$.each(keys, function(i,key){
		if (typeof parameterObj[key] === 'string'){
			query += key + `"` + parameterObj[key] + `"`;
		}else{
			query += key + parameterObj[key];
		}
	
		if (i!==keys.length-1){
			query += `,`;
		}
	});
	
	query +=  `){` + parameterObj.fields;

	return query;

}
		
function updateString(queryTerm,parameters){
	var query = '';
	if (queryTerm == 'queryUser'){
		
		query = `\ttwitter{\n\t\t`	+ queryTerm + `(` +  constructQuery(parameters.twtUser) +  `\n\t\t}\n\t}`;
		
	}else if(queryTerm == 'queryTweet'){ 
		
		query =  `\ttwitter{\n\t\t`	+ queryTerm + `(`+ constructQuery(parameters.tweet)	+ `\n\t\t}\n\t}`;  
		
	}else if (queryTerm === 'streamTweet'){
		
		query =  `\telasticSearch{\n\t\t`+ queryTerm + `(`+  constructQuery(parameters.es) +  `\n\t\t}\n\t}`;  
			
	}
	
	return query;
}


/* save file modal */
function modalPopUp(searchID){
	if ( formValid(searchID)){
		$("#save").modal('show');
	}	
	
	//pass the searchID to somewhere
	$("#saveButton").attr('name',searchID);
}

/* save file modal click events */
function saveModalClick(){
	var searchID = $("#saveButton").attr('name');
	
	if (searchID === '#searchbox'){
		if (saveValid('#filename')){ 
			submitSearchbox(`#searchbox`,`#filename`);					
		}
					
	}
	else if (searchID === '#input'){
		if (saveValid('#filename')){
			submitQuery(`#input`,`#filename`);
		}
	}
}