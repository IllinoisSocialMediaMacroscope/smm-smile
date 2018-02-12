var rules_plugins = {
  condition: 'AND',
  rules: [{
    id: 'name',
    operator: 'equal',
    value: 'Mistic'
  }]
};

$('#builder').queryBuilder({
  plugins: [
    'bt-tooltip-errors'
  ],

  filters: [{
    id: 'name',
    label: 'Name',
    type: 'string',
    operators: ['equal']
  }],

  //rules: rules_plugins
});

$('#btn-reset').on('click', function() {
  $('#builder').queryBuilder('reset');
});

$('#btn-set').on('click', function() {
  $('#builder').queryBuilder('setRules', rules_plugins);
});

$('#btn-get').on('click', function() {
  var result = $('#builder').queryBuilder('getRules');
	console.log(result);
	
  /*if (!$.isEmptyObject(result)) {
    alert(JSON.stringify(result, null, 2));
  }*/
});