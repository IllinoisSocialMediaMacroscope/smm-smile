$("#smile-login-submit").on("click",function(){
    var username = $("#smile-username").val();
    var password = $("#smile-password").val();

    if (username === undefined || username === ''){
        $("#modal-message").append(`<h4>Username cannot be empty!</h4>`);
        $("#alert").modal('show');
    }
    else if (password === undefined || password === ''){
        $("#modal-message").append(`<h4>Password cannot be empty!</h4>`);
        $("#alert").modal('show');
    }
    else{
        var data = {
            "username": username,
            "password": password
        };

        $.ajax({
            type:'POST',
            url:'smile-login',
            data: data,
            success:function(data) {
                console.log(data);
                if (data) {
                    if ('ERROR' in data) {
                        $("#error").val(JSON.stringify(data));
                        $("#warning").modal('show');
                    }
                    else {
                        window.location.href = "/";
                    }
                }
            },
            error: function(jqXHR, exception){
                $("#error").val(jqXHR.responseText);
                $("#warning").modal('show');
            }
        });
    }
});

$("#smile-register-submit").on("click",function(){
    var username = $("#smile-username").val();
    var password = $("#smile-password").val();

    if (username === undefined || username === ''){
        $("#modal-message").append(`<h4>Username cannot be empty!</h4>`);
        $("#alert").modal('show');
    }
    else if (password === undefined || password === ''){
        $("#modal-message").append(`<h4>Password cannot be empty!</h4>`);
        $("#alert").modal('show');
    }
    else{
        var data = {
            "username": username,
            "password": password
        };

        $.ajax({
            type:'POST',
            url:'register',
            data: data,
            success:function(data){
                if (data) {
                    if ('ERROR' in data) {
                        $("#error").val(JSON.stringify(data));
                        $("#warning").modal('show');
                    }
                    else {
                        window.location.href = "/";
                    }
                }
            },
            error: function(jqXHR, exception){
                $("#error").val(jqXHR.responseText);
                $("#warning").modal('show');
            }
        });
    }
});

