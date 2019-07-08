$.getScript("bootstrap/js/customized/view_helperFunc.js", function(){

    $(document).ready(function () {

        // for reddit
        $("#getComment").on('click', function (e) {
            e.preventDefault();
            $("#reddit-expand").modal({show: true});
        });

        // for image crawling
        $("#getImg").on("click", function(e) {
            e.preventDefault();
            $("#image-crawler").modal({show: true});
        });

        // list dropdown menu
        $.ajax({
            type: 'POST',
            url: 'list',
            data: {},
            success: function (data) {
                if (data) {
                    if ('ERROR' in data) {
                        $("#loading").hide();
                        $("#background").show();
                        $("#error").val(JSON.stringify(data));
                        $("#warning").modal('show');
                    } else {
                        // networkx page has restriction to only apply to twitter data
                        if (window.location.pathname.split('/').slice(-1)[0] === 'networkx') {
                            $.each(data, function (key, val) {
                                if (key === 'twitter-Tweet' || key === 'twitter-Stream') {
                                    $("#selectFile").append($("<optgroup></optgroup>").attr("label", key));
                                    $.each(val, function (key2, val2) {
                                        $("#selectFile").find(`optgroup[label='` + key + `']`).after($("<option></option>")
                                        .attr("value", val2)
                                        .attr("class", key)
                                        .attr("id", key2)
                                        .text(key2));
                                    });
                                }
                            });
                        }
                        else {
                            $.each(data, function (key, val) {
                                $("#selectFile").append($("<optgroup></optgroup>")
                                .attr("label", key));
                                $.each(val, function (key2, val2) {
                                    $("#selectFile").find(`optgroup[label='` + key + `']`).after($("<option></option>")
                                    .attr("value", val2)
                                    .attr("class", key)
                                    .attr("id", key2)
                                    .text(key2));
                                });
                            });
                        }

                        // show select and hide loading bar 4
                        $("#selectFile").show();
                        $("#selectLoading").hide();
                    }
                }
            },
            error: function (jqXHR, exception) {
                $("#error").val(jqXHR.responseText);
                $("#warning").modal('show');
            }
        });

        // select from dropdown and show preview
        $("#selectFile").on('change', function () {
            var prefix = $(this).children(":selected").val();
            var directory = $(this).children(":selected").attr("class");

            $preview = $("#selectFilePreview-container").find(".col-md-8.col-md-8.col-xs-12");
            $column = $("#selectFileHeader-container").find(".col-md-8.col-md-8.col-xs-12");
            $("#selectFilePreview-container").hide();
            $("#selectFileHeader-container").hide();
            $preview.empty();
            $column.empty();

            if (prefix !== 'Please Select...') {
                $("#previewLoading").show();
                $.ajax({
                    type: 'POST',
                    url: 'render',
                    data: {"prefix": prefix},
                    success: function (data) {
                        if (data) {
                            if ('ERROR' in data) {
                                $("#loading").hide();
                                $("#background").show();
                                $("#error").val(JSON.stringify(data));
                                $("#warning").modal('show');
                            } else {
                                var allowedFieldList = data['columnHeaders']['autophrase'];
                                var text_data = previewSelectedFile(allowedFieldList, data);
                                $(".dataset").val(prefix);
                                $(".length").val(text_data.length - 1);

                                // hide loading bar
                                $("#previewLoading").hide();

                                // add preview and column
                                $preview.append(arrayToTable(text_data.slice(0, 11), '#selectFileTable'));
                                $column.append(extractHeader2(text_data));
                                $("#selectFilePreview-container").show();
                                $("#selectFileHeader-container").show();


                                // offer image crawling
                                if (directory === 'reddit-Post'
                                    || directory === 'reddit-Historical-Post'
                                    || directory === 'reddit-Search'
                                    || directory === 'crimson-Hexagon'
                                    || directory === 'twitter-Tweet'
                                    || directory === 'twitter-Timeline'){
                                    $("#getImg").show();

                                    // offer crawling for reddit comments modal
                                    if (directory === 'reddit-Post'
                                        || directory === 'reddit-Historical-Post'
                                        || directory === 'reddit-Search') {
                                        $("#getComment").show();
                                    } else {
                                        $("#getComment").hide();
                                    }
                                }
                                else{
                                    $("#getImg").hide();
                                }
                            }
                        }
                    },
                    error: function (jqXHR, exception) {
                        $("#error").val(jqXHR.responseText);
                        $("#warning").modal('show');
                    }
                });
            }
        });

        // lambda vs batch
        $("#submit").on('click', function () {

            // first check if form valid or not
            formValidation().then(boolean => {
                if (boolean) {

                    // get the cutoff between lambda or batch
                    var cutOff = -9999;
                    $.ajax({
                        type: 'GET',
                        url: 'list-analyses',
                        success: function (data) {
                            if (data.analyses) {
                                $.each(data.analyses, function (i, analysis) {
                                    if (window.location.pathname.split('/').slice(-1)[0] === analysis.url) {
                                        if (analysis.batch === false && analysis.lambda === true) {
                                            cutOff = 10000000000000;
                                        }
                                        else if (analysis.batch === true && analysis.lambda === false) {
                                            cutOff = -9999;
                                        }
                                        else if (analysis.batch && analysis.lambda) {
                                            if ('cutoff' in analysis) cutOff = analysis.cutoff;
                                            else cutOff = 5000;
                                        }
                                    }
                                });
                            }
                            if ($(".length").val() === undefined) {
                                $("#modal-message").val("Cannot perform analysis on this dataset. Check if it exists!");
                                $("#alert").modal('show');
                            }
                            else if ($(".length").val() <= cutOff) {
                                ajaxSubmit(`#analytics-config`, 'lambda');
                            }
                            else {
                                $("#aws-batch").modal('show');
                            }
                        },
                        error: function (jqXHR, exception) {
                            $("#error").val(jqXHR.responseText);
                            $("#warning").modal('show');
                        }
                    });
                }
            });
        });

        //clowder onclick
        $("#clowder-left-panel").on('click', function (e) {
            e.preventDefault();
            invoke_clowder();
        });

        //tag onclick
        $("#tag-left-panel").on('click', function (e) {
            e.preventDefault();
            $("#tag-modal").modal('show');
        });

        // google chart
        google.charts.load('current', {packages: ['wordtree']});
    });

});


