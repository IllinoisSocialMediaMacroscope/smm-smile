$.ajax({
    type: 'GET',
    url: 'list-analyses',
    success: function (data) {
        if (data.analyses) {
            $("#topbar-analytics").find("ul").empty();
            $.each(data.analyses, function (i, analysis) {
                $("#topbar-analytics").find("ul").append(`<li><a href="` + analysis.url + `">`
                    + analysis.name + `</a></li>`);
            });
        }
    },
    error: function (jqXHR, exception) {
        $("#error").val(jqXHR.responseText);
        $("#warning").modal('show');
    }
});
$("#topbar-analytics").find('ul').empty();

/**
 * tooltip
 */
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});
