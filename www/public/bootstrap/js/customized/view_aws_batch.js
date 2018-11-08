$("#batch-email-alert").on('keypress',function(e){
	if (e.keyCode === 13 || e.keycode == 10){
		e.preventDefault(); 
		ajaxSubmit("#analytics-config","batch");
	}	
});