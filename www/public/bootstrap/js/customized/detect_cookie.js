function areCookiesEnabled() {
    var cookieEnabled = navigator.cookieEnabled;

    // When cookieEnabled flag is present and false then cookies are disabled.
    if (cookieEnabled === false) {
        return false;
    }

    // try to set a test cookie if we can't see any cookies and we're using 
    // either a browser that doesn't support navigator.cookieEnabled
    // or IE (which always returns true for navigator.cookieEnabled)
    if (!document.cookie && (cookieEnabled === null || /*@cc_on!@*/false))
    {
        document.cookie = "testcookie=1";

        if (!document.cookie) {
            return false;
        } else {
            document.cookie = "testcookie=; expires=" + new Date(0).toUTCString();
        }
    }

    return true;
}

$(document).ready(function(){
	
	if (!areCookiesEnabled()){
		$('#cookie-alert').modal('show');
	}
});