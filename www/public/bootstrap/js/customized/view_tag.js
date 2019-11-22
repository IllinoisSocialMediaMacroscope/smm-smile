$("#tagName").tagsinput({freeInput: true});

$("#tag").on('click',function(){

    if (validateTag()){
        // add default tag category to tags
        // networkx, classification, autophrase, sentiment, preprocess
        var tagCategory = $("#jobId").val().split('/').slice(-3, -2)[0];
        var data = {"jobId":$("#jobId").val(), "tagName":[tagCategory]};

        // tag
        if ($("#tag-modal").find(".tag.label.label-info")[0]){
            $("#tag-modal").find(".tag.label.label-info").each(function(i,val){
                data["tagName"].push($(val).text());
            });
        }

        $.ajax({
            type:'post',
            url:'tag',
            data: JSON.stringify(data),
            contentType: "application/json",
            success:function(data){
                if(currPage !== 'history'){
                    $("#tag-modal").modal('hide');
                }else{
                    $("#tag-modal").modal('hide');
                    var parentID = $("#jobId").val().split('/').slice(-3, -1).join("-");
                    var tagID = $("#jobId").val().split('/').slice(-2, -1)[0];
                    var tagName = data["tagName"];

                    $("#"+parentID).find("kbd").remove();
                    $("#"+parentID).append(`<kbd>` + tagName + `</kbd>`);
                }
            },
            error: function(jqXHR, exception){
                $("#error").val(jqXHR.responseText);
                $("#warning").modal('show');
            }
        });
	}
});

function validateTag(){
	if ($("#jobId").val() === "" || $("#jobId").val() === undefined ){
        $("#modal-message").append(`<h4>You have not performed any analysis. There is currently nothing to be tagged yet.</h4>`);
        $("#alert").modal('show');
		return false;
	}

	return true;
}
