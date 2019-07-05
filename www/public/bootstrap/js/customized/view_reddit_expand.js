$("#rdCommentReq").on('click', function () {

    if (checkRedditReq()) {
        $.ajax({
            type: 'post',
            url: 'reddit-expand',
            data: {
                "prefix": $("#reddit-expand").find(".dataset").val(),
                "email": $("#reddit-expand").find(".email-alert").val(),
                "sessionURL": sessionURL
            },
            success: function (data) {
                if (data === 'done') {
                    $("#reddit-expand").modal('hide');
                    $("#reddit-expand-confirmation").modal('show');
                } else if (data === 'pop alert') {
                    $("#reddit-expand-exist").modal('show');
                }
            },
            error: function (jqXHR, exception) {
                $("#error").val(jqXHR.responseText);
                $("#warning").modal('show');

            }
        });
    }
});

$("#rdCommentYes").on('click', function () {

    if (checkRedditReq()) {
        $.ajax({
            type: 'post',
            url: 'reddit-expand',
            data: {
                "prefix": $("#reddit-expand").find(".dataset").val(),
                "email": $("#reddit-expand").find(".email-alert").val(),
                "consent": true,
                "sessionURL": sessionURL
            },
            success: function (data) {
                if (data === 'done') {
                    $("#reddit-expand").modal('hide');
                    $("#reddit-expand-exist").modal('hide');
                    $("#reddit-expand-confirmation").modal('show');
                } else {
                    console.log(data);
                }
            },
            error: function (jqXHR, exception) {
                $("#error").val(jqXHR.responseText);
                $("#warning").modal('show');
            }
        });
    }
});

$("#rdCommentNo").on('click', function () {
    $("#reddit-expand").modal('hide');
    $("#reddit-expand-exist").modal('hide');
});

$(".email-alert").on('keypress', function (e) {
    if (e.keyCode === 13 || e.keycode == 10) {
        e.preventDefault();

        if (checkRedditReq()) {
            $.ajax({
                type: 'post',
                url: 'reddit-expand',
                data: {
                    "prefix": $("#reddit-expand").find(".dataset").val(),
                    "email": $(this).val(),
                    "sessionURL": sessionURL
                },
                success: function (data) {
                    if (data === 'done') {
                        $("#reddit-expand").modal('hide');
                        $("#reddit-expand-confirmation").modal('show');
                    } else if (data === 'pop alert') {
                        $("#reddit-expand-exist").modal('show');
                    }
                },
                error: function (jqXHR, exception) {
                    $("#error").val(jqXHR.responseText);
                    $("#warning").modal('show');
                }
            });
        }
    }
});


function checkRedditReq() {
    if ($("#reddit-expand").find(".dataset").val() === ''
        || $("#reddit-expand").find(".dataset").val() === undefined) {
        $("#modal-message").append(`<h4>This Reddit Post you select is invalid.</h4>`);
        $("#alert").modal('show');
        return false
    }

    if ($("#reddit-expand").find(".length").val() === ''
        || $("#reddit-expand").find(".length").val() === undefined
        || $("#reddit-expand").find(".length").val() === 0) {
        $("#modal-message").append(`<h4>This Reddit Post you select has no data!</h4>`);
        $("#alert").modal('show');
        return false
    }

    if ($("#reddit-expand").find(".email-alert").val() === ''
        || $("#reddit-expand").find(".email-alert").val() === undefined
        || $("#reddit-expand").find(".email-alert").val().indexOf('@') <= -1) {
        $("#modal-message").append(`<h4>Please provide a valid email address so we can reach to you once your collection has completed!</h4>`);
        $("#alert").modal('show');
        return false
    }

    return true
}
