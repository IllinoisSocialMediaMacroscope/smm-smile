function authorize(platform){
    // showing the check mark
    $("#" + platform + "-auth").find('img').show();

    // toggle the second auth panel
    $("#unauthorized").find("." + platform + "-auth").hide();
    $("#authorized").find("#" + platform + "-authorized").show();

    // enable the authorized platform selection
    if (platform === 'twitter') {
        $("#social-media option[value='queryTweet']").removeAttr('disabled');
        $("#social-media option[value='getTimeline']").removeAttr('disabled');
    } else if (platform === 'reddit') {
        $("#social-media option[value='queryReddit']").removeAttr('disabled');
        $("#social-media option[value='redditPost']").removeAttr('disabled');
        $("#social-media option[value='redditComment']").removeAttr('disabled');
    } else if (platform === 'crimson') {
        $("#social-media option[value='crimsonHexagon']").removeAttr('disabled');
    }
}


$(document).ready(function () {
    $.ajax({
        type:'get',
        url:"authorized",
        success: function(data){
            if ('ERROR' in data){
                $("#error").val(JSON.stringify(data));
                $("#warning").modal("show");
            }
            else{
                var platforms = ['twitter', 'reddit', 'crimson'];
                $.each(platforms, function (i, platform) {
                    if (data[platform]) {
                        authorize(platform);
                    }
                });
            }
        }
    });
});

$("#auth-next").on("click", function () {
    $("#auth-panel").hide();
    $("#searchPage").show();
});

/****************************** CRIMSON Hexagon ******************************/
$("#crimson-password").on('keyup', function (e) {
    if (e.keyCode === 13 || e.keyCode === 10) {

        $.ajax({
            type: 'post',
            url: 'login/crimson',
            data: {
                "crimson_username": $("#crimson-username").val(),
                "crimson_password": $("#crimson-password").val(),
            },
            success: function (data) {
                if ('ERROR' in data) {
                    $("#error").val(JSON.stringify(data));
                    $("#warning").modal('show');
                }
                else {
                    location.reload(true);
                }
            },
            error: function (jqXHR, exception) {
                $("#error").val(jqXHR.responseText);
                $("#warning").modal('show');
            }
        });
    }
});
$("#crimson-auth-submit").on('click', function () {
    $.ajax({
        type: 'post',
        url: 'login/crimson',
        data: {
            "crimson_username": $("#crimson-username").val(),
            "crimson_password": $("#crimson-password").val(),
        },
        success: function (data) {
            if ('ERROR' in data) {
                $("#error").val(JSON.stringify(data));
                $("#warning").modal('show');
            }
            else {
                location.reload(true);
            }
        },
        error: function (jqXHR, exception) {
            $("#error").val(jqXHR.responseText);
            $("#warning").modal('show');
        }
    });
});
$(".crimson-auth").find(".auth-button").on('click', function (e) {
    e.preventDefault();
    $("#crimson-callback").modal('show');
});
$(".crimson-auth").find("#crimson-icon-button").on('click', function (e) {
    e.preventDefault();
    $("#crimson-callback").modal('show');
});

/****************************** TWITTER ******************************/
$("#twitter-pin-submit").on('click', function () {
    console.log('clicked');
    $.ajax({
        type: 'post',
        url: 'login/twitter',
        data: {
            "twt_pin": $("#twitter-pin").val(),
        },
        success: function (data) {
            if ('ERROR' in data) {
                $("#error").val(JSON.stringify(data));
                $("#warning").modal('show');
            }
            else {
                location.reload(true);
            }
        },
        error: function (jqXHR, exception) {
            $("#error").val(jqXHR.responseText);
            $("#warning").modal('show');
        }
    });
});
$("#twitter-pin").on('keyup', function (e) {
    if (e.keyCode == 13 || e.keyCode == 10) {
        $.ajax({
            type: 'post',
            url: 'login/twitter',
            data: {"twt_pin": $("#twitter-pin").val()},
            success: function (data) {
                if ('ERROR' in data) {
                    $("#error").val(JSON.stringify(data));
                    $("#warning").modal('show');
                }
                else {
                    location.reload(true);
                }
            },
            error: function (jqXHR, exception) {
                $("#error").val(jqXHR.responseText);
                $("#warning").modal('show');
            }
        });
    }
});
$(".twitter-auth").find('a').on('click', function () {
    $("#twitter-callback").modal('show');
});

//***************************** REDDIT ******************************/
$("#reddit-agree").on('click', function () {
    $.ajax({
        type: 'get',
        url: 'login/reddit',
        success: function (data) {
            if ('ERROR' in data) {
                $("#error").val(JSON.stringify(data));
                $("#warning").modal('show');
            }
            else {
                location.reload(true);
            }
        },
        error: function (jqXHR, exception) {
            $("#error").val(jqXHR.responseText);
            $("#warning").modal('show');
        }
    });
});
$(".reddit-auth").find('a').on('click', function () {
    $("#reddit-callback").modal('show');
});
