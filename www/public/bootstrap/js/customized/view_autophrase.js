$(document).ready(function(){
    if (s3FolderName === undefined) s3FolderName = 'local';

    // list dropdown menu
    $.ajax({
        type:'POST',
        url:'list',
        data: {"s3FolderName":s3FolderName},
        success:function(data){
            if (data){
                if ('ERROR' in data){
                    $("#loading").hide();
                    $("#background").show();
                    $("#error").val(JSON.stringify(data));
                    $("#warning").modal('show');
                }else{
                    $.each(data, function(key,val){
                        $("#selectFile").append($("<optgroup></optgroup>")
                            .attr("label",key));
                        $.each(val, function(key2,val2){
                            $("#selectFile").find(`optgroup[label='` +key +`']`).after($("<option></option>")
                                .attr("value", val2)
                                .attr("class", key)
                                .attr("id", key2)
                                .text(key2));
                        });
                    });
                    // show select and hide loading bar 4
                    $("#selectFile").show();
                    $("#selectLoading").hide();
                }
            }
        },
        error: function(jqXHR, exception){
            $("#error").val(jqXHR.responseText);
            $("#warning").modal('show');
        }
    });

    // select from dropdown and show preview
    $("#selectFile").on('change',function(){
        var prefix = $(this).children(":selected").val();
        var directory = $(this).children(":selected").attr("class");
        $("#selectFilePreview-container").empty();
        $("#selectFileHeader-container").empty();

        // add loading bar here for preview
        $("#preview-loading").show();

        $.ajax({
            type:'POST',
            url:'render',
            data: {"prefix":prefix},
            success:function(data){
                if (data){
                    if ('ERROR' in data){
                        $("#loading").hide();
                        $("#background").show();
                        $("#error").val(JSON.stringify(data));
                        $("#warning").modal('show');
                    }else{
                        /* the text fields are:  text, user.description(tweet), description(twtUser),
                        body(redditComment), selftext,title(redditSearch),
                        public description, description(redditSearchSubreddit)*/

                        var allowedFieldList = ['text','user.description','_source.text', '_source.user.description',
                            'description', 'body','title','_source.body','_source.title', 'contents'];
                        text_data = previewSelectedFile(allowedFieldList, data);

                        // hide loading bar
                        $("#preview-loading").hide();

                        $("#selectFilePreview-container").append(`<div class="form-group">
						<label class="control-label col-md-2 col-md-2 col-xs-12">preview data</label>
						<div class="col-md-8 col-md-8 col-xs-12" id="selectFilePreview"></div></div>`)
                        $("#selectFilePreview").append(arrayToTable(text_data.slice(0, 11) ,'#selectFileTable'));

                        $("#selectFileHeader-container").append(`<div class="form-group">
						<label class="control-label col-md-2 col-md-2 col-xs-12">Select Column to Analyze</label>
						<div class="col-md-8 col-md-8 col-xs-12" id="selectFileHeader"></div></div>`);
                        $("#selectFileHeader").append(extractHeader2(text_data));

                        $(".dataset").val(prefix);
                        $(".length").val(text_data.length-1);

                        // offer crawling for reddit comments modal
                        if(directory === 'reddit-Post' || directory === 'reddit-Historical-Post' || directory === 'reddit-Search'){
                            $("#getComment").show();
                        }else{
                            $("#getComment").hide();
                        }
                    }
                }
            },
            error: function(jqXHR, exception){
                $("#error").val(jqXHR.responseText);
                $("#warning").modal('show');
            }
        });

    });

    // citation
    $("#algorithm").on('change',function(){
        $("#citation-container").hide();
        $("#citation-notice").empty();

        var algorithm = $(this).children(":selected").val();
        if (algorithm === 'autophrase'){
            $("#citation-notice").append(
                `<p><b>Thank you for using our tool, if you use these results please cite it and the NLTK python library:</b></p>
				<ul>
					<li>Yun, J. T., Vance, N., Wang, C., Troy, J., Marini, L., Booth, R., Nelson, T., Hetrick, A., Hodgekins, H. (2018). 
					The Social Media Macroscope. In Gateways 2018.&nbsp<a href="https://doi.org/10.6084/m9.figshare.6855269.v2" target="_blank">
					https://doi.org/10.6084/m9.figshare.6855269.v2</a>
					</li>
					<li>Shang, J., Liu, J., Jiang, M., Ren, X., Voss, C. R., & Han, J. (2017).
					    <a href="https://arxiv.org/pdf/1702.04457.pdf" target="_blank">
					        Automated phrase mining from massive text corpora. arXiv preprint arXiv:1702.04457.</a>
					</li>
				</ul>`
            );
            $("#citation-container").show();
        }

    });

    //batch
    $("#submit").on('click',function(){
        if (formValidation()){
            $("#aws-batch").modal('show');
        }
    });

});

/*----------------------form validation ----------------------------*/
function formValidation(aws_identifier){

    if ($("#selectFile option:selected").val() === 'Please Select...' || $("#selectFile option:selected").val() === undefined){
        $("#modal-message").append(`<h4>Please select a csv file from your folder!</h4>`);
        $("#alert").modal('show');
        $("#selectFile").focus();
        return false;
    }
    if ($("#selectFileTable thead tr").find('th').text() === ''){
        $("#modal-message").append(`<h4>This dataset you selected is empty, please select another one!</h4>`);
        $("#alert").modal('show');
        $("#selectFile").focus();
        return false;
    }
    if ($("#algorithm option:selected").val() === 'Please Select...' || $("#algorithm option:selected").val() === undefined){
        $("#modal-message").append(`<h4>Please select an algorithm!</h4>`);
        $("#alert").modal('show');
        $("#model").focus();
        return false;
    }

    if (aws_identifier === 'batch'){
        if($(".dataset").val() === '' || $(".dataset").val() === undefined){
            $("#modal-message").append(`<h4>This dataset you select is invalid.</h4>`);
            $("#alert").modal('show');
            return false
        }

        if($(".length").val() === ''
            || $(".length").val() === undefined
            || $(".length").val() === 0){
            $("#modal-message").append(`<h4>This dataset you select has no data!</h4>`);
            $("#alert").modal('show');
            return false
        }

        if($("#batch-email-alert").val() === ''
            || $("#batch-email-alert").val() === undefined
            || $("#batch-email-alert").val().indexOf('@')<= -1){
            $("#modal-message").append(`<h4>Please provide a valid email address so we can reach to you once your collection has completed!</h4>`);
            $("#alert").modal('show');
            return false
        }
    }

    return true;

}
