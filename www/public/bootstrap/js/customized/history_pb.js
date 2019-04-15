$.getScript("bootstrap/js/customized/view_helperFunc.js", function(){

    $(document).ready(function () {
        // google chart
        google.charts.load('current', {packages: ['wordtree']});

        $.ajax({
            type: 'POST',
            url: 'list-all',
            data: {},
            success: function (data) {
                if (data) {
                    if ('ERROR' in data) {
                        $("#loading").hide();

                        $("#search-tag-results").empty();
                        $("#background").show();

                        $("#error").val(JSON.stringify(data));
                        $("#warning").modal('show');
                    } else {
                        // first level
                        $.each(data, function (key, val) {
                            if (key === 'ML') {
                                var first_level = 'Machine Learning';
                            }
                            else if (key === 'NLP') {
                                var first_level = 'Nature Language Processing';
                            }
                            else if (key === 'NW') {
                                var first_level = 'Network Visualization and Analysis';
                            }
                            else if (key === 'GraphQL') {
                                var first_level = 'Social Media Data';
                            }
                            else {
                                var first_level = key
                            }
                            $(".nav.nav-sidebar").append(
                                `<li>
                                    <a onclick="toggle(this,` + key + `);" id="` + key + `-btn">
                                        <span class="glyphicon glyphicon-minus"></span>`
                                + first_level +
                                `</a>
                                </li>
                                <ul class="nav child_menu" style="display:block;" id="` + key + `"></ul>`);

                            // second level
                            $.each(val, function (key1, val1) {
                                if (key1 === 'feature') {
                                    var second_level = 'Feature Selection';
                                }
                                else if (key1 === 'clustering') {
                                    var second_level = 'Unsupervised Learning (clustering)';
                                }
                                else if (key1 === 'preprocessing') {
                                    var second_level = 'NLP Preprocessing';
                                }
                                else if (key1 === 'autophrase') {
                                    var second_level = 'Automated Phrase Mining';
                                }
                                else if (key1 === 'sentiment') {
                                    var second_level = 'Sentiment Analysis';
                                }
                                else if (key1 === 'topic-modeling') {
                                    var second_level = 'LDA Topic Modeling';
                                }
                                else if (key1 === 'twitter-Tweet') {
                                    var second_level = 'Twitter Tweet';
                                }
                                else if (key1 === 'twitter-User') {
                                    var second_level = 'Twitter User';
                                }
                                else if (key1 === 'twitter-Stream') {
                                    var second_level = 'Twitter Streaming Data';
                                }
                                else if (key1 === 'reddit-Search') {
                                    var second_level = 'Reddit Search Posts Title';
                                }
                                else if (key1 === 'reddit-Post') {
                                    var second_level = 'Subreddit Posts Title';
                                }
                                else if (key1 === 'reddit-Comment') {
                                    var second_level = 'Subreddit Comment';
                                }
                                else if (key1 === 'reddit-Historical-Post') {
                                    var second_level = 'Reddit Historical Post';
                                }
                                else if (key1 === 'reddit-Historical-Comment') {
                                    var second_level = 'Reddit Historical Comment';
                                }
                                else if (key1 === 'crimson-Hexagon') {
                                    var second_level = 'Crimson Hexagon Data';
                                }
                                else if (key1 === 'networkx') {
                                    var second_level = 'Python NetworkX';
                                }
                                else if (key1 === 'classification') {
                                    var second_level = 'Text Classification';
                                }
                                else {
                                    var second_level = key1;
                                }
                                $("#" + key).append(
                                    `<li>
                                            <a onclick="toggle(this,'#` + key1 + `');" id="` + key1 + `-btn">
                                                <span class="glyphicon glyphicon-plus"></span>`
                                    + second_level +
                                    `</a>
                                            <ul class="nav child_menu" style="display:none;" id="` + key1 + `"></ul>
                                        </li>`);

                                $.each(val1, function (key2, val2) {
                                    $("#" + key1).append(
                                        `<li id="` + key1 + "-" + key2 + `">
										<p class="historyTabs">` + key2 + `</p>
										<div class="historyTags" id="` + key2 + `"></div>
										<div class="button-unit">
											<button class="historyButtons" onclick="submitHistory('` + val2 + `');">view</button>
											<button class="historyButtons" onclick="deleteModal('` + val2 + "','" + key1 + "-" + key2 + `');">delete</button>
										</div>
								</li>`);
                                });
                            });
                        });
                        $("#historyListLoading").hide();
                        $("#historyLogo").show();
                        listTag();
                    }
                }
            },
            error: function (jqXHR, exception) {
                $("#error").val(jqXHR.responseText);
                $("#warning").modal('show');
            }
        });
    });

    $("#deleteButton").click(function (e) {
        var folderURL = $("#folderURL").val();
        var tab = $("#tab").val();
        deleteHistory(folderURL, tab);
    });

    /* search tag */
    $("#search-tag").on("keyup", function (e) {
        if (e.keyCode == 13 || e.keyCode == 10) {

            var tagName = $("#search-tag").val();
            $("#search-tag-results").empty();

            $.ajax({
                type: 'GET',
                url: 'tag',
                data: {tagName: tagName},
                success: function (data) {
                    if (Object.keys(data).length === 0) {
                        $("#search-tag-results").append(`<div class="list-container">
                                                <cite>cannot find matching tag</cite></div>`);
                    }
                    else {
                        for (var uuid in data) {
                            $("#search-tag-results").append(
                                `<div class="list-container">
                                            <h4>
                                                <a class="page-title" onclick="submitHistory('` + uuid + `')">` + uuid + `</a>
                                            </h4>
                                            <cite>` + data[uuid] + `</cite>
                                        </div>`
                            );
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

    $("#search-tag-btn").on("click", function (e) {

        var tagName = $("#search-tag").val();
        $("#search-tag-results").empty();
        $.ajax({
            type: 'GET',
            url: 'tag',
            data: {tagName: tagName},
            success: function (data) {
                if (Object.keys(data).length === 0) {
                    $("#search-tag-results").append(`<div class="list-container">
                                            <cite>cannot find matching tag</cite></div>`);
                }
                else {
                    for (var uuid in data) {
                        $("#search-tag-results").append(
                            `<div class="list-container">
							<h4>
								<a class="page-title" onclick="submitHistory('` + uuid + `')">` + uuid + `</a>
							</h4>
							<cite>` + data[uuid] + `</cite>
						</div>`
                        );
                    }
                }
            },
            error: function (jqXHR, exception) {
                $("#error").val(jqXHR.responseText);
                $("#warning").modal('show');
            }
        });
    });

    $("#search-tag-invoke").on("click", function (e) {
        $("#title-container").empty();
        $("#overview-container").empty();
        $("#img-container").empty();
        $("#result-container").empty();
        $("#gaudge").empty();
        $("#title").empty();
        $("#d3js-container").hide();
        $("#loading").hide();

        $("#search-tag-results").empty();
        $("#background").show();
    });

});
