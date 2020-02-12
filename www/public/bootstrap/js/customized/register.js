$("#smile-register-submit").on("click",function(){
    $.ajax({
        type:'post',
        url:'register',
        data: {
            "username": $("#smile-username").val(),
            "password":$("#smile-password").val()
        },
        success:function(data){
            console.log(data);
        },
        error: function(jqXHR, exception){
            $("#error").val(jqXHR.responseText);
            $("#warning").modal('show');
        }
    });
});
