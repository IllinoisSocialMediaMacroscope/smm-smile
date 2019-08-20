$("#imgCrawler").on('click',function(){
    if (checkImgCrawlerReq()){
        $.ajax({
            type:'post',
            url:'image-crawler',
            data: {"prefix":$("#image-crawler").find(".dataset").val(),
                "email":$("#image-crawler").find(".email-alert").val(),
                "sessionURL": sessionURL},
            success:function(data){
                if (data === 'done'){
                    $("#image-crawler").modal('hide');
                    $("#image-crawler-confirmation").modal('show');
                }else if (data === 'pop alert'){
                    $("#image-crawler-exist").modal('show');
                }
            },
            error: function(jqXHR, exception){
                $("#error").val(jqXHR.responseText);
                $("#warning").modal('show');
            }
        });
    }
});

$("#imgCrawlerYes").on('click',function(){
    if (checkImgCrawlerReq()){
        $.ajax({
            type:'post',
            url:'image-crawler',
            data: {"prefix":$("#image-crawler").find(".dataset").val(),
                "email":$("#image-crawler").find(".email-alert").val(),
                "consent":true,
                "sessionURL": sessionURL
            },
            success:function(data){
                if (data === 'done'){
                    $("#image-crawler").modal('hide');
                    $("#image-crawler-exist").modal('hide');
                    $("#image-crawler-confirmation").modal('show');
                }else{
                    console.log(data);
                }
            },
            error: function(jqXHR, exception){
                $("#error").val(jqXHR.responseText);
                $("#warning").modal('show');

            }
        });
    }
});

$("#imgCrawlerNo").on('click',function(){
    $("#image-crawler").modal('hide');
    $("#image-crawler-exist").modal('hide');
});

$(".email-alert").on('keypress',function(e){
    if (e.keyCode === 13 || e.keycode === 10){
        e.preventDefault();

        if (checkImgCrawlerReq()){
            $.ajax({
                type:'post',
                url:'reddit-expand',
                data: {"prefix":$("#image-crawler").find(".dataset").val(),
                    "email":$(this).val(),
                    "sessionURL": sessionURL},
                success:function(data){
                    if (data === 'done'){
                        $("#reddit-expand").modal('hide');
                        $("#reddit-expand-confirmation").modal('show');
                    }else if (data === 'pop alert'){
                        $("#reddit-expand-exist").modal('show');
                    }
                },
                error: function(jqXHR, exception){
                    $("#error").val(jqXHR.responseText);
                    $("#warning").modal('show');

                }
            });
        }
    }
});

function checkImgCrawlerReq(){
    if($("#image-crawler").find(".dataset").val() === ''
        || $("#image-crawler").find(".dataset").val() === undefined){
        $("#modal-message").append(`<h4>This dataset you select is invalid.</h4>`);
        $("#alert").modal('show');
        return false
    }

    if($("#image-crawler").find(".length").val() === ''
        || $("#image-crawler").find(".length").val() === undefined
        || $("#image-crawler").find(".length").val() === 0){
        $("#modal-message").append(`<h4>This dataset you select has no data!</h4>`);
        $("#alert").modal('show');
        return false
    }

    if($("#image-crawler").find(".email-alert").val() === ''
        || $("#image-crawler").find(".email-alert").val() === undefined
        || $("#image-crawler").find(".email-alert").val().indexOf('@')<= -1){
        $("#modal-message").append(`<h4>Please provide a valid email address so we can reach to you once your collection has completed!</h4>`);
        $("#alert").modal('show');
        return false
    }

    return true
}
