var rules_plugins = {
  condition: 'AND',
  rules: [{
    id: 'keyword',
    operator: 'equal',
    value: ''
  }]
};

$('#builder').queryBuilder({
  plugins: [
    'bt-tooltip-errors'
  ],

  filters: [{
    id: 'keyword',
    label: 'keyword',
    type: 'string',
    operators: ['equal']
  }],

  rules: rules_plugins
});

$('#btn-reset').on('click', function() {
  $('#builder').queryBuilder('reset');
});

$('#btn-set').on('click', function() {
  $('#builder').queryBuilder('setRules', rules_plugins);
});

$('#btn-get').on('click', function() {
	
	if (customQueryBuilderChecker()){
		
		var result = $('#builder').queryBuilder('getRules');
		queryTerm = $("#social-media").find(':selected').val();
		
		if ( queryTerm === 'queryTweet'){
			var QueryString = constructBooleanString(result,'twitter');
			updateBooleanString(QueryString);
		}else if ( queryTerm === 'queryReddit'){
			var QueryString = constructBooleanString(result,'reddit');
			updateBooleanString(QueryString);
		}else{
			$("#modal-message").append(`<h4>The data source you selected does not support boolean operators search!</h4>`);
			$("#alert").modal('show');
		}
		
	}
	
});

function constructBooleanString(ruleObj, platform){
	var QueryString = '';
	var operator = ruleObj.condition;
	
	//map operator according to each platform's rule
	if (platform === 'twitter'){
		if (operator === 'AND'){
			operator = ' ';
		}else if (operator === 'OR'){
			operator = ' OR ';
		}else if (operator === 'NOT'){
			operator = ' -'
		}
	}
	else if (platform === 'reddit'){
		if (operator === 'AND'){
			operator = ' AND ';
		}else if (operator === 'OR'){
			operator = ' OR ';
		}else if (operator === 'NOT'){
			operator = ' NOT '
		}
	}
	
	$.each(ruleObj.rules,function(i,val){
		// beginning
		if (i === 0){
			if ('rules' in val){
				QueryString += "(" + constructBooleanString(val,platform) + ")" ;			
			}else{
				QueryString += "\"" + val.value + "\"" 
			}
		}
		//middle
		else{
			if ('rules' in val){
				QueryString += operator + "(" + constructBooleanString(val,platform) + ")";
			}else{
				QueryString += operator + "\"" + val.value + "\"";
			}
		}
	});
	
	return QueryString;
}

function customQueryBuilderChecker(){
	var keyword_list = [];
	var flag = true;
	$(".rule-value-container").find('input').each(function(i,item){
		if (keyword_list.indexOf($(item).val()) === -1){
			keyword_list.push($(item).val());
		}else{
			$("#modal-message").append(`<h4>The same keyword/phrases appear twice here!</h4>`);
			$("#alert").modal('show');
			flag = false;
		}
		
	});
	
	return flag;
}

function updateBooleanString(QueryString){
	// update both the search box as well as the query string in textarea
	$("#searchbox").val(QueryString);
	var keyword =  $("#searchbox").val();
	var keyword = keyword.replace(/[\"]+/g, `\\"`);
	
	parameters['tweet']['q:'] = keyword;
	parameters['twtUser']['q:'] = keyword;
	parameters['es']['q:'] = keyword;
	parameters['rdSearch']['query:'] = keyword;
	parameters['rdPost']['subredditName:']= keyword;
	parameters['rdComment']['subredditName:'] = keyword;
	parameters['psPost']['q:'] = keyword;
	parameters['psComment']['q:'] = keyword;
	
	Query =updateString(queryTerm,parameters);
	$("#input").val(`{\n\n` + Query +`\n\n}`);
	
	// $("#booleanQueryPreview").html("Query matches each platform's rule has been set in the searchbox: <br>" + QueryString);
}
