// get session id
var sessionURL = window.location.href;
var pathArray = window.location.pathname.split('/');
var newPath = "";
for (i=0; i<pathArray.length-1; i++){
	if (pathArray[i] === 'weber'){
		// session ID always is the one after weber
		var sessionID = pathArray[i+1];
	}
	
	newPath += pathArray[i];
	newPath += "/";
}
var currPage = pathArray[pathArray.length-1];
