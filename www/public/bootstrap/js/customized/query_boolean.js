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
		var QueryString = constructBooleanString(result);
		
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
	}
	
});

function constructBooleanString(ruleObj){
	var QueryString = '';
	var operator = ruleObj.condition;
	$.each(ruleObj.rules,function(i,val){
		// beginning
		if (i === 0){
			if ('rules' in val){
				console.log(val.rules);
				QueryString += "(" + constructBooleanString(val) + ")" ;			
			}else{
				QueryString += "\"" + val.value + "\"" 
			}
		}
		//middle
		else{
			if ('rules' in val){
				QueryString += " " + operator + " (" + constructBooleanString(val) + ")";
			}else{
				QueryString += " " + operator + " \"" + val.value + "\"";
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