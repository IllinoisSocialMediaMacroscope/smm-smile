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
                                var firstLevel = 'Machine Learning';
                            }
                            else if (key === 'NLP') {
                                var firstLevel = 'Nature Language Processing';
                            }
                            else if (key === 'NW') {
                                var firstLevel = 'Network Visualization and Analysis';
                            }
                            else if (key === 'GraphQL') {
                                var firstLevel = 'Social Media Data';
                            }
                            else {
                                var firstLevel = key
                            }
                            $(".nav.nav-sidebar").append(
                                `<li>
                                    <a onclick="toggle(this,` + key + `);" id="` + key + `-btn">
                                        <i class="fas fa-minus"></i>&nbsp;`
                                + firstLevel + `</a>
                                </li>
                                <ul class="nav child_menu" style="display:block;" id="` + key + `"></ul>`);

                            // second level
                            $.each(val, function (key1, val1) {
                                if (key1 === 'feature') {
                                    var secondLevel = 'Feature Selection';
                                }
                                else if (key1 === 'clustering') {
                                    var secondLevel = 'Unsupervised Learning (clustering)';
                                }
                                else if (key1 === 'preprocessing') {
                                    var secondLevel = 'NLP Preprocessing';
                                }
                                else if (key1 === 'autophrase') {
                                    var secondLevel = 'Automated Phrase Mining';
                                }
                                else if (key1 === 'sentiment') {
                                    var secondLevel = 'Sentiment Analysis';
                                }
                                else if (key1 === 'topic') {
                                    var secondLevel = 'Topic Modeling';
                                }
                                else if (key1 === 'twitter-Tweet') {
                                    var secondLevel = 'Twitter Tweet';
                                }
                                else if (key1 === 'twitter-Timeline') {
                                    var secondLevel = 'Twitter User Timeline';
                                }
                                else if (key1 === 'reddit-Search') {
                                    var secondLevel = 'Reddit Search Posts Title';
                                }
                                else if (key1 === 'reddit-Post') {
                                    var secondLevel = 'Subreddit Posts Title';
                                }
                                else if (key1 === 'reddit-Comment') {
                                    var secondLevel = 'Subreddit Comment';
                                }
                                else if (key1 === 'reddit-Historical-Post') {
                                    var secondLevel = 'Reddit Historical Post';
                                }
                                else if (key1 === 'reddit-Historical-Comment') {
                                    var secondLevel = 'Reddit Historical Comment';
                                }
                                else if (key1 === 'crimson-Hexagon') {
                                    var secondLevel = 'Crimson Hexagon Data';
                                }
                                else if (key1 === 'networkx') {
                                    var secondLevel = 'Python NetworkX';
                                }
                                else if (key1 === 'classification') {
                                    var secondLevel = 'Text Classification';
                                }
                                else {
                                    var secondLevel = key1;
                                }
                                var secondLevelEntryNum = Object.keys(val1).length || 0;

                                $("#" + key).append(
                                    `<li>
                                            <a onclick="toggle(this,'#` + key1 + `');" id="` + key1 + `-btn">
                                                <i class="fas fa-plus"></i>&nbsp;`
                                    + secondLevel + ` (` + secondLevelEntryNum + `)</a>
                                            <ul class="nav child_menu" style="display:none;" id="` + key1 + `"></ul>
                                        </li>`);

                                $.each(val1, function (key2, val2) {
                                    $("#" + key1).append(
                                        `<li id="` + key1 + "-" + key2 + `">
                                            <a class="historyTabs" onclick="submitHistory(this, '` + val2 + `');">` + key2 + `</a>
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

    $("#deleteButton").on('click', function (e) {
        e.preventDefault();
        var folderURL = $(this).attr('folder-url');
        deleteHistory(folderURL);
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
                                                <a class="page-title" onclick="submitHistory(this, '` + uuid + `')">` + uuid + `</a>
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
								<a class="page-title" onclick="submitHistory(this, '` + uuid + `')">` + uuid + `</a>
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
        $("#overview-title").hide();
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
