function getParameterByName(name) {
	var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
	return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

$(document).ready(function() {
	if (getParameterByName('error')){
		$("#error").val(getParameterByName('error'));
		$("#warning").modal('show');
		$("#export-modal").modal('hide');
	}
})

	