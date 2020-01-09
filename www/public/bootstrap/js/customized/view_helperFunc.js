function customized_reset(clearConfigForm = true) {
    // clear display sections
    $("#img-container").empty();
    $("#gaudge").empty();
    $("#result-container").empty();

    // clear side bars
    $("#side-download").empty();
    $(".row.announce").empty();
    $("#side-download-li").hide();
    $("#getImg").hide();
    $("#getComment").hide();

    // clear the configuration form
    if (clearConfigForm){
        $("#analytics-config select option").prop("selected", false);
        $previewContent = $("#selectFilePreview-container").children().find("div").empty();
        $columnContent = $("#selectFileHeader-container").children().find("div").empty();
        $preview = $("#selectFilePreview-container").hide();
        $column = $("#selectFileHeader-container").hide();
    }

    $("#citation-container").hide();
    $("#custom-citation-notice").empty();

    // clear popup form
    $(".modal input").val("");
}

function submit_reset(){
    // reset that only hides the
    $("#img-container").empty();
    $("#gaudge").empty();
    $("#result-container").empty();
}

/*----------------------------display uploaded csv --------------------------*/
function arrayToTable(array, tableID) {

    // set table head
    var tableRowLength = array[0].length;
    var tableContent = `<div class="table-responsive"><table class="table table-striped table-bordered" id=` + tableID.slice(1) + `><thead><tr>`;
    $.each(array[0], function (i, val) {
        /* the text fields are:  text(tweet), description(twtUser),
                body(redditComment), selftext,title(redditSearch),
                public description, description(redditSearchSubreddit)*/
        if (val === 'text') {
            val = 'tweet (text) '; // change the descrpition so preview is easy to understand
        } else if (val === 'body') {
            val = 'reddit comments (body)';
        } else if (val === 'selftext') {
            val = 'reddit post text (selftext)';
        } else if (val === 'title') {
            val = 'title';
        } else if (val === 'public_description') {
            val = 'subreddit public description (public_description)';
        } else if (val === '') {
            val = 'NaN';
        }
        tableContent += "<th>" + val + "</th>";
    });
    tableContent += `</tr></thead><tbody>`;

    // set table content
    $.each(array.slice(1), function (i, val) {
        tableContent += "<tr>";
        var rowLength = 0 ;
        $.each(val, function (j, cval) {
            // trim the content to 140 character maximum
            if (cval === undefined || cval.length === 0) {
                cval = '';
            }
            else if (cval.length >= 140) {
                cval = cval.slice(0, 140) + '...';
            }
            tableContent += `<td>` + cval + "</td>"
            rowLength = j;
        });

        // fix bug
        if (rowLength < tableRowLength -1){
            for (var e = 0; e < (tableRowLength -1) - rowLength; e ++) {
                tableContent += `<td></td>`;
            }
        }

        tableContent += "</tr>";
    });
    tableContent += "</tbody></table></div>"

    return tableContent
}

function extractHeader1(array) {
    var headerContent = '';
    column_header = array[0];
    $.each(column_header, function (i, val) {
        headerContent += `<label class=checkbox-inline" style="font-weight:normal;"><input type="checkbox" value=` + val + ` style="margin-right:3px;">` + val + `</label>`;
    });
    return headerContent;
}

function extractHeader2(array) {
    var headerContent = '';
    column_header = array[0];
    $.each(column_header, function (i, val) {
        //check the first item
        if (i === 0) {
            headerContent += `<label class=radio-inline>
			<input type="radio"  class="customized-radio" name="selectFileColumn",id=`
                + val + ` value=` + val + ` checked></div>` + val + ` </label>`;
        } else {
            headerContent += `<label class=radio-inline>
				<input type="radio" class="customized-radio" name="selectFileColumn",id=`
                + val + ` value=` + val + `></div>` + val + ` </label>`;
        }
    });
    return headerContent;
}

function previewSelectedFile(allowedFieldList, data) {
    var index = [];
    $.each(data.preview[0], function (i, val) {
        if (allowedFieldList.indexOf(val) >= 0) {
            index.push(i)
        }
    });

    var text_data = [];
    var count = 0;
    $.each(data.preview, function (i, val) {
        var line = [];

        // rendering rows has all the content non-empty for asthetic purpose
        var flag = true;
        $.each(index, function (i, indice) {
            if (val[indice] == '') {
                flag = false;
            }
            line.push(val[indice]);
        });
        if (flag) text_data.push(line);
    });

    return text_data;

}

/*----------------------------display results---------------------------------*/
function loadHandler(event) {
    var csv = event.target.result;
    processData(csv);
}

function processData(csv) {
    var previewLines = csv.split(/\r\n|\n/).slice(0, 2);
    var previewLinesWords = [];
    $(previewLines).each(function (i, val) {
        previewLinesWords.push($.csv.toArray(val));
    });
    // detect Category based on the first line
    $("#datasrc-criteria-hint").text("");
    if (previewLinesWords[0].indexOf('text') > 0 ||  previewLinesWords[0].indexOf('user.description') > 0 ){
        $("#datasrc-criteria-hint").html("<p>Based on the column of your imported file, it is likely that you uploaded a " +
            "<u>Tweet</u> dataset or <u>Twitter User Timeline</u> dataset.</p>")
    }
    else if (previewLinesWords[0].indexOf('title') > 0 || previewLinesWords[0].indexOf('description') > 0){
        $("#datasrc-criteria-hint").html("<p>Based on the column of your imported file, it is likely that you uploaded a " +
            "<u>Reddit Post (Submission)</u> dataset.</p>")
    }
    else if (previewLinesWords[0].indexOf('body') > 0 ){
        $("#datasrc-criteria-hint").html("<p>Based on the column of your imported file, it is likely that you uploaded a " +
            "<u>Reddit Comment</u> dataset.</p>")
    }
    else if (previewLinesWords[0].indexOf('contents') > 0){
        $("#datasrc-criteria-hint").html("<p>Based on the column of your imported file, it is likely that you uploaded a " +
            "<u>Crimson Hexagon</u> dataset.</p>")
    }
    else{
        $("#datasrc-criteria-hint").html("<p>We cannot detect the file category, make sure you choose <u>Others</u> in the category.</p>")
    }
    // set preview
    $("#import-cloud-preview").empty();
    $("#import-cloud-preview").append(arrayToTable(previewLinesWords, ""));

    // set column headers for userspec-Others-metadata
    $("#column-header-selection").empty();
    $("#column-header-selection").append(extractHeader1(previewLinesWords));

}

function errorHandler(event) {
    $("#error").val("Can't read the file!");
    $("#warning").modal('show');
}

function appendDownload(downloadID, downloadData) {
    $('#side-download-li').show();
    $(downloadID).empty();
    if (downloadData !== [] && downloadData !== '') {
        $.each(downloadData, function (i, val) {
            $(downloadID).append(`<li>
									<a href="` + val.content + `"><i class="fas fa-download"></i>&nbsp;` + val.name + `</a>
								</li>`);
        });
    }
}

function appendIntermediateDownload(downloadID, downloadData) {
    $(downloadID).empty();
    if (downloadData !== [] && downloadData !== '') {
        $(downloadID).append('<br><p>Files necessary for the next step:</p><ul class="list-unstyled"></ul>')
        $.each(downloadData, function (i, val) {
            if (val.name === 'Perserved classification pipeline'){
                $(downloadID).find(".list-unstyled").append(`<li>
									<a href="` + val.content + `" style="color:red;">` + val.name + `</a>
								</li>`);
            }
            else{
                $(downloadID).find(".list-unstyled").append(`<li>
									<a href="` + val.content + `">` + val.name + `</a>
								</li>`);
            }
        });
    }
}

function appendImg(imgID, imgData) {
    $(imgID).empty();
    if (imgData !== [] && imgData !== '') {
        $.each(imgData, function (i, val) {
            $(imgID).append(`<div class="x_title">
								<h2 class="title-w-buttons">` + val.name + `</h2>
								<button class="btn btn-danger share-btn" onclick="invokeShareModal('` + val.url + `')">
								    <i class="fas fa-share-alt"></i>
								    Share
                                </button>
							</div>
							<div class="x_content">
								<div class="note">
									<li><b>click, drag, and mouseover</b> the graph will give you more information</li>
									<li><b>hover</b> over top-right corner of the chart will present various operations</li>
									<li>details please consult
										<a href="https://plot.ly/" target="_blank">
											<img src="bootstrap/img/logo/plotly.png" width="18px"/>Plotly
										</a>
									</li>
								</div>
							</div>
							<div class="x_content">` + val.content + `</div>`)
        });
    }
}

function invokeShareModal(url){
    $("#share-link").val(url);
    $("#share-modal").modal({show: true});
}

function appendPreview(previewID, previewData) {
    $(previewID).empty();
    if (previewData !== [] && previewData !== '') {
        $.each(previewData, function (i, val) {
            if (val.dataTable === true) {
                $(previewID).append(`<div class="x_title">
								<h2>` + val.name + `</h2>
							</div>
							<div class="x_content">
								<div class="note">
									<li>pagination and search keywords enabled</li>
									<li><b>Click</b> table heads will rank the corresponding column</li>
									<li>details please consult 
										<a href="https://datatables.net/" target="_blank">DataTable plugin for JQuery</a>
									</li>
								</div>
							</div>
							<div class="x_content">` + arrayToTable(val.content, '#previewTopic') + `</div>`);
                if (val.orderColumn !== undefined) {
                    $("#previewTopic").DataTable({"order": [[val.orderColumn, 'desc']]});
                }
                else $("#previewTopic").DataTable();
            } else {
                $(previewID).append(`<div class="x_title">
								<h2>` + val.name + `</h2>
							<div class="x_content">` + arrayToTable(val.content, '#') + `</div>`);
            }
        });
    }
}

function drawWordTree(name, table, root) {
    $('#gaudge').empty();
    $('#gaudge').append(`<div class="x_title">
							<h2>` + name + `</h2>
						</div>
						<div class="x_content"> 
							<div class="note">
								<li>word tree reads from <b>left to right</b>, and each branch is a sentence/phrase</li>					
								<li><b>click</b> on the word will expand or collapse the tree</li>
								<li>size of the word stands for the <b>weight</b> of the word, which is proportional to their usage</li>
								<li>details please consult 
									<a href="https://developers.google.com/chart/interactive/docs/gallery/wordtree" target="_blank">
										<img src="bootstrap/img/logo/google-sm-logo.png" width="18px"/>Google Chart API
									</a>
								</li>
							</div>
						</div>
						<div class="x_content" id="chart_div">
						</div>`);

    var data = google.visualization.arrayToDataTable(table);
    var options = {
        wordtree: {
            format: 'implicit',
            word: root.toLowerCase()
        }
    };
    var chart = new google.visualization.WordTree(document.getElementById('chart_div'));
    chart.draw(data, options);
}

/*----------------------submit to analysis--------------------------------------------*/
function ajaxSubmit(formID, aws_identifier) {

    var prefix = $("#selectFile").children(":selected").val();
    var email = $("#batch-email-alert").val();

    var data = $(formID).serialize() + "&prefix=" + prefix
        + "&aws_identifier=" + aws_identifier
        + "&email=" + email
        + "&sessionURL=" + sessionURL;

    submit_reset();

    if (aws_identifier === "batch") {
        if (batchFormValidation()) {

            $(".loading").show();
            $("html, body").animate({scrollTop: $(".loading").offset().top - 100}, 1000);

            $.ajax({
                type: 'POST',
                url: $(formID).attr('action'),
                data: data,
                success: function (data) {

                    $(".loading").hide();

                    // ADD TO CLOWDER MODAL
                    $("#clowder-files-list").empty();
                    clowderFileGen(data.download);
                    clowderFileMeta();
                    $('.fileTags').tagsinput({freeInput: true});

                    if ('ERROR' in data) {
                        $("#error").val(JSON.stringify(data));
                        $("#warning").modal('show');
                    }
                    else if ('jobName' in data && 'jobId' in data) {
                        $("#aws-batch").modal('hide');
                        $("#aws-batch-confirmation").modal('show');

                        // ADD TO TAG MODAL
                        $("#jobId").val(data.ID);
                        $("#tag-modal").modal("show");
                    }
                },
                error: function (jqXHR, exception) {
                    $("#error").val(jqXHR.responseText);
                    $("#warning").modal('show');

                },
                timeout: 360000
            });
        }
    }
    else if (aws_identifier === "lambda") {

        $(".loading").show();
        $("html, body").animate({scrollTop: $(".loading").offset().top - 100}, 1000);

        $.ajax({
            type: 'POST',
            url: $(formID).attr('action'),
            data: data,
            success: function (data) {

                $(".loading").hide();

                // ADD TO CLOWDER MODAL
                $("#clowder-files-list").empty();
                clowderFileGen(data.download);
                clowderFileMeta();
                $('.fileTags').tagsinput({freeInput: true});

                if ('ERROR' in data) {
                    $("#error").val(JSON.stringify(data));
                    $("#warning").modal('show');
                }
                else {
                    appendDownload("#side-download", data.download);
                    appendImg("#img-container", data.img);
                    if (data.preview.content !== '') {
                        appendPreview('#result-container', data.preview);
                    }
                    if ('wordtree' in data && data.wordtree !== undefined) {
                        google.charts.setOnLoadCallback(drawWordTree(data.wordtree.name, data.wordtree.content, data.wordtree.root));
                    }

                    // ADD TO TAG MODAL
                    $("#jobId").val(data.ID);
                    $("#tag-modal").modal("show");
                }
            },
            error: function (jqXHR, exception) {
                $("#error").val(jqXHR.responseText);
                $("#warning").modal('show');

            },
            timeout: 360000
        });
    }
    else {
        $("#error").val("This algorithm has been incorrectly installed. You have to decide where to deploy this algorithm: AWS batch or AWS lambda!");
        $("#warning").modal('show');
    }

}

/*----------------------form validation ----------------------------*/
function formValidation() {

    var promises = [];

    // select
    promises.push(new Promise(function (resolve, reject) {
        $("#analytics-config select:visible").each(function (key, item) {
            if ($(item).find("option:selected").val() === 'Please Select...' || $(item).find("option:selected").val() === undefined) {
                $("#modal-message").append(`<h4>Missing ` + $(item).attr('id') + `!</h4>`);
                $("#alert").modal('show');
                reject();
            }
        });
        resolve();
    }));

    // checkbox
    promises.push(new Promise(function (resolve, reject) {
        $("#analytics-config input[type=checkbox]:visible").each(function (key, item) {
            if ($(item).find(":checked").val() === '' || $(item).find(":checked").val() === undefined) {
                $("#modal-message").append(`<h4>Missing ` + $(item).attr('id') + `!</h4>`);
                $("#alert").modal('show');
                reject();
            }
        });
        resolve();
    }));

    // text
    promises.push(new Promise(function (resolve, reject) {
        $("#analytics-config input[type=text]:visible").each(function (key, item) {
            if ($(item).val() === '' || $(item).val() === undefined) {
                $("#modal-message").append(`<h4>Missing ` + $(item).attr('id') + `!</h4>`);
                $("#alert").modal('show');
                reject();
            }
        });
        resolve();
    }));

    // file
    promises.push(new Promise(function (resolve, reject) {
        $("#analytics-config input[type=file]:visible").each(function (key, item) {
            if ($(item).attr('id') !== "importFile") {
                if ($(item).val() === '' || $(item).val() === undefined) {
                    $("#modal-message").append(`<h4>Missing ` + $(item).attr('id') + `!</h4>`);
                    $("#alert").modal('show');
                    reject();
                }
            }
        });
        resolve();
    }));

    return Promise.all(promises).then(() => {
        return true;
    }).catch(() => {
        return false;
    })
}

function batchFormValidation() {
    if ($(".dataset").val() === '' || $(".dataset").val() === undefined) {
        $("#modal-message").append(`<h4>This dataset you select is invalid.</h4>`);
        $("#alert").modal('show');
        return false
    }

    if ($(".length").val() === ''
        || $(".length").val() === undefined
        || $(".length").val() === 0) {
        $("#modal-message").append(`<h4>This dataset you select has no data!</h4>`);
        $("#alert").modal('show');
        return false
    }

    if ($("#batch-email-alert").val() === ''
        || $("#batch-email-alert").val() === undefined
        || $("#batch-email-alert").val().indexOf('@') <= -1) {
        $("#modal-message").append("<h4>Please provide a valid email address so we can reach to you " +
            "once your collection has completed!</h4>");
        $("#alert").modal('show');
        return false
    }

    return true;
}

/*-----------------------history page---------------------------*/
function submitHistory(currItem, folderURL){
    // highlight the selected item
    $(".historyTabs").css('color', '#ffffff').css('background', 'none');
    $(currItem).css('color','#333').css('background-color','#eae8e8');

    $("#title-container").empty();
    $("#overview-title").hide();
    $("#overview-container").empty();
    $("#img-container").empty();
    $("#result-container").empty();
    $("#gaudge").empty();
    $("#title").empty();
    $("#d3js-container").hide();
    $("#background").hide();
    $("#loading").show();

    $.ajax({
        type:'post',
        url:'history',
        data: {'folderURL': folderURL },
        success:function(data){
            if(data){
                if ('ERROR' in data){
                    $("#loading").hide();

                    $("#search-tag-results").empty();
                    $("#background").show();

                    $("#error").val(JSON.stringify(data));
                    $("#warning").modal('show');
                }else{
                    $("#loading").hide();

                    // ADD TO TAG MODAL
                    $("#jobId").val(data.ID);

                    // ADD TO CLOWDER MODAL
                    $("#clowder-files-list").empty();
                    if (data.title != 'Social Media'){
                        clowderFileGen(data.download);
                        clowderFileMeta();
                        $('.fileTags').tagsinput({ freeInput: true });
                    }

                    if ('title' in data || 'ID' in data){
                        appendTitle("#title-container",data.title, data.ID);
                        $("#tag-history-panel").show();
                        $("#clowder-history-panel").show();
                        $("#deleteFile").show();
                    }

                    if ('expandable' in data && data.expandable !== undefined){
                        $(".dataset").val(data.expandable);
                        $(".length").val(data.length);
                        $("#getComment").show();
                    }else{
                        $("#getComment").hide();
                    }

                    if ('crawlImage' in data && data.crawlImage !== undefined){
                        $(".dataset").val(data.crawlImage);
                        $(".length").val(data.length);
                        $("#getImg").show();
                    }else{
                        $("#getImg").hide();
                    }

                    if('config' in data || 'donwload' in data){
                        appendOverview("#overview-container",data.config, data.download);
                    }

                    if ('img' in data){
                        appendImg("#img-container",data.img);
                    }

                    if ('preview' in data){
                        appendPreview('#result-container',data.preview);
                    }

                    if('iframe' in data){
                        // draw iframe for topic modeling
                        drawIframe(data.iframe.name, data.iframe.content);
                    }

                    if('wordtree' in data){
                        // draw word tree for preprocessing
                        google.charts.setOnLoadCallback(drawWordTree(data.wordtree.name,data.wordtree.content,data.wordtree.root));
                    }
                }
            }
        },
        error: function(jqXHR, exception){
            $("#error").val(jqXHR.responseText);
            $("#warning").modal('show');

        }
    });

}

function deleteModal(folderURL,tab){
    $("#deleteButton").attr('folder-url', folderURL);
    $("#tab").val(tab);
    $("#delete").modal('show');
}

function deleteHistory(folderURL){
    //delete content
    $.ajax({
        type:'delete',
        url:'history',
        data: JSON.stringify({'folderURL':folderURL, 'type':'remote'}),
        contentType: "application/json",
        success:function(data){
            if(data){
                // delete tags
                $.ajax({
                    type:'delete',
                    url:'tag',
                    data:JSON.stringify({'jobId':folderURL}),
                    contentType: "application/json",
                    error: function(jqXHR, exception){
                        $("#error").val(jqXHR.responseText);
                        $("#warning").modal('show');
                    }
                });
                location.reload(true);
            }
        },
        error: function(jqXHR, exception){
            $("#error").val(jqXHR.responseText);
            $("#warning").modal('show');
        }
    });

}

function appendTitle(container, title,ID){
    $(container).append(`<h2 class="title-w-buttons">`+ title+ `</h2>
						<div style="display:inline;padding:0 20px;float:right;">
							<button class="btn btn-yes favicon-button" id="tag-history-panel">
								<i class="fas fa-tag"></i>Tag
							</button>
							<button class="btn btn-yes favicon-button" id="clowder-history-panel">
								<img src="bootstrap/img/logo/clowder-sm-logo.png" width=20/>Clowder
							</button>
							<button class="btn btn-yes favicon-button" id="getComment">
						        <i class="fas fa-comments"></i>&nbsp;Comment
						    </button>
						    <button class="btn btn-yes favicon-button" id="getImg">
						        <i class="fas fa-image"></i>&nbsp;Image
						    </button>
						    <button class="btn btn-yes favicon-button" id="deleteFile" onclick=\"deleteModal('` + ID + `')\">
						        <i class="fas fa-trash-alt"></i>&nbsp;Delete
						    </button></div>
						<h4>ID: ` + ID +`</h4>`);

    $("#getComment").on('click',function(e){
        e.preventDefault();
        $("#reddit-expand").modal('show');
    });

    // for image crawling
    $("#getImg").on("click", function(e) {
        e.preventDefault();
        $("#image-crawler").modal({show: true});
    });

    $("#clowder-history-panel").on('click',function(e){
        e.preventDefault();
        invoke_clowder();
    });

    $("#tag-history-panel").on('click',function(e){
        e.preventDefault();
        $("#tag-modal").modal('show');
    });
}

function appendOverview(container,config, download){
    $(container).empty();
    $(container).append(
       `<h2 id="overview-title">Overview&nbsp;
            <i class="far fa-question-circle" data-toggle="tooltip" data-html="true" data-placement="right" 
            title="Explanations for some of the common parameters: <ul>
            <li>q - search keyword</li><li>screen_name - twitter user handle</li>
            <li>page/pages - number of pages</li>
            <li>fields - fields to include in the returning social media data</li>
            <li>downloadables - links to download the results</li>
            <li>remoteReadPath - aws s3 path where the input files are stored</li>
            <li>resultPath - aws s3 path where the output results are stored</li>
            <li>column - the field of the social media data that analysis is applied on</li>
            <li>s3FolderName - aws s3 folder name that under the current user</li>
            <li>uid - identification code of the current analysis</li></ul>">
            </i>
        </h2>`
    );

    // vertical table
    var tableContent = `<div class="table-responsive"><table class="table table-striped table-bordered"><tbody>`;
    $.each(config, function(key,value){
        tableContent += `<tr><th>` + JSON.stringify(key) + `</th><td>` + JSON.stringify(value) + `</td></tr>`;
    });

    // add download files
    tableContent += `<tr><th>downloadables</th><td>`;
    $.each(download,function(i,val){
        tableContent += `<a style="display:block;color:red;" href="` + val.content+ `">` +val.name+`</a>`;
    });
    tableContent += `</td></tr></tbody></table></div>`;

    $(container).append(tableContent);
}

function drawIframe(name,fname){
    $('#gaudge').empty();
    $('#gaudge').append(`<div class="x_title"><h2>`+ name +`</h2></div></div><div class="x_content" id="chart_div"></div>`);
    $('#chart_div').append(`<iframe src="../../pyLDAvis/` + fname + `" style="background:#FFFFFF;display:block; width:100%; height:900px;">`);
}

function drawGauge(name,compound) {
    google.charts.load('current', {'packages':['gauge']});
    $('#gaudge').empty();
    $('#gaudge').append(`<div class="x_title"><h2>`+ name +`</h2></div></div><div class="x_content" id="chart_div" sytle="margin:auto 0;"></div>`);

    var data = google.visualization.arrayToDataTable([
        ['Label', 'Value'],	['Compound', compound],
    ]);

    var options = {
        width: $("#gaudge").width()*0.25, height: $("#gaudge").width()*0.25,
        backgroundColor: "transparent",
        greenFrom:0.5, greenTo:1.0,
        redFrom: -1, redTo: -0.5,
        yellowFrom:-0.75, yellowTo: 0.5,
        minorTicks: 0.5,
        min:-1,
        max:1
    };

    var chart = new google.visualization.Gauge(document.getElementById('chart_div'));
    chart.draw(data, options);

}

function toggle(self,id){
    $(id).toggle();

    if ($(id).is(':visible')){
        $(self).children('i').attr('class','fas fa-minus');
    }else{
        $(self).children('i').attr('class','fas fa-plus');
    }
}

function listTag(){
    $.ajax({
        type: 'GET',
        url: 'tag',
        data: {},
        success: function (data) {
            for (var ID in data){
                var parentID = ID.split('/').slice(-3, -1).join("-");
                var tagID = ID.split('/').slice(-2, -1)[0];
                $("#"+parentID).append(`<kbd>` + data[ID] + `</kbd>`);
            }
        },
        error: function (jqXHR, exception) {
            $("#error").val(jqXHR.responseText);
            $("#warning").modal('show');
        }
    });
}

/*-------------------- classification ---------------------*/
function addUUID(ID){
    if (ID !== ''){
        var uid = ID.split("/").slice(-2,-1);
        $("#ID-code h3").text(uid);
    }
}

function appendInstruction(ID){
    $(ID).empty();
    $(ID).append(`<h2>Instruction</h2>
								<div id="split-stats" style="padding:40px 100px;background-color:white;overflow:auto;">
									<p style="font-size:20px;">
										<b>Please download the training set, labeling your trainig set following the description below, and uploading this labeled file in the next step:</b> <br><br> 
										We train the text classification model to recognize the category of a certain piece of text by offering them examples, and
										Labeling the training set is the step to create such examples. Labels can be obtained by asking humans to make judgments 
										about a given piece of unlabeled data. 
										<br>
										<br>For example:<br> 
										<i>"Does this tweet contain a horse or a cow?" -- You can put <b>"cow"</b> or <b>"horse"</b> in the "category" column in the training set</i><br>
										<i>"Is this tweet a original tweet, retweet, or mentions someone?" -- You can put <b>"original"</b>,<b>"retweet"</b> or <b>"mentions"</b> in the "category" column in the training set</i>
									</p>
									<h2 style="color:black;">labeling in excel:<h2>
									<img src="bootstrap/img/gifs/labeling.gif" style="display:block; margin:auto;"/>
								</div>`);
}

/*-----------------------split --------------------------------------------*/
function split() {
    customized_reset(false);

    // first check if form valid or not
    formValidation().then(boolean => {
        if (boolean) {
            var prefix = $("#selectFile").children(":selected").val();
            var ratio = $("#ratio").val();
            var selectFileColumn = $("input[name='selectFileColumn']:checked").val();
            var data = "ratio=" + ratio + "&prefix=" + prefix + "&selectFileColumn=" + selectFileColumn + "&aws_identifier=lambda";

            $(".loading").show();
            $("html, body").animate({scrollTop: $(".loading").offset().top - 100}, 1000);
            $.ajax({
                type: 'POST',
                url: 'classification-split',
                data: data,
                success: function (data) {
                    if ('ERROR' in data) {
                        $(".loading").hide();
                        $("#error").val(JSON.stringify(data));
                        $("#warning").modal('show');
                    } else {
                        $(".loading").hide();
                        addUUID(data.ID);
                        $("#uuid-modal").modal('show');

                        appendIntermediateDownload("#intermediate-download", data.download)
                        appendInstruction("#gaudge", data.len_training, data.len_testing);
                        appendDownload("#side-download", data.download);
                        appendImg("#img-container", data.img);
                        appendPreview('#result-container', '');

                        // ADD to tag
                        $("#jobId").val(data.ID);

                        // ADD TO CLOWDER MODAL
                        $("#clowder-files-list").empty();
                        clowderFileGen(data.download);
                        clowderFileMeta();
                        $('.fileTags').tagsinput({freeInput: true});

                    }
                },
                error: function (jqXHR, exception) {
                    $("#error").val(jqXHR.responseText);
                    $("#warning").modal('show');

                }
            });
        }
    });
}

/*-----------------------train -------------------------------------------*/
function train() {

    customized_reset(false);

    // first check if form valid or not
    formValidation().then(boolean => {
        var file = $("#labeled").get(0).files[0];
        var formData = new FormData();
        formData.append('labeled', file, file.name);
        formData.append('labeledFilename', "LABELED_" + file.name);
        formData.append('uid', $("#uid").val());
        formData.append('model', $("#model option:selected").val());
        formData.append('aws_identifier', 'lambda');

        if (boolean) {
            $(".loading").show();
            $("html, body").animate({scrollTop: $(".loading").offset().top - 100}, 1000);
            $.ajax({
                type: 'PUT',
                url: 'classification-train',
                data: formData,
                processData: false,
                contentType: false,
                async: true,
                cache: false,
                success: function (data) {
                    if ('ERROR' in data) {
                        $(".loading").hide();
                        $("#error").val(JSON.stringify(data));
                        $("#warning").modal('show');
                    } else {
                        $(".loading").hide();

                        // ADD TO CLOWDER MODAL
                        $("#clowder-files-list").empty();
                        clowderFileGen(data.download);
                        clowderFileMeta();
                        $('.fileTags').tagsinput({freeInput: true});

                        // ADD to tag
                        $("#jobId").val(data.ID);

                        $("#gaudge").empty();

                        appendIntermediateDownload("#intermediate-download", data.download);
                        appendImg("#img-container", data.img);
                        appendDownload("#side-download", data.download);
                        appendPreview('#result-container', data.preview);
                        addUUID(data.ID);

                        $("#uuid-modal").modal('show');
                    }
                },
                error: function (jqXHR, exception) {
                    $("#error").val(jqXHR.responseText);
                    $("#warning").modal('show');
                }
            });
        }
    });
}

/*-----------------------predict -------------------------------------------*/
function predict() {
    customized_reset(false);

    // first check if form valid or not
    formValidation().then(boolean => {
        if (boolean) {
            var prefix = $("#selectFile").children(":selected").val();
            var data = "uid=" + $("#uid").val() + "&prefix=" + prefix + "&aws_identifier=lambda";

            $(".loading").show();
            $("html, body").animate({scrollTop: $(".loading").offset().top - 100}, 1000);
            $.ajax({
                type: 'POST',
                url: 'classification-predict',
                data: data,
                success: function (data) {
                    if ('ERROR' in data) {
                        $(".loading").hide();
                        $("#error").val(JSON.stringify(data));
                        $("#warning").modal('show');
                    } else {
                        $(".loading").hide();
                        $("#gaudge").empty();

                        // tag
                        $("#jobId").val(data.ID);

                        // ADD TO CLOWDER MODAL
                        $("#clowder-files-list").empty();
                        clowderFileGen(data.download);
                        clowderFileMeta();
                        $('.fileTags').tagsinput({freeInput: true});

                        appendIntermediateDownload("#intermediate-download", data.download);
                        appendImg("#img-container", data.img);
                        appendDownload("#side-download", data.download);
                        appendPreview('#result-container', data.preview);
                        appendPreview('#result-container', data.preview);

                        $("#tag-modal").modal("show");
                    }
                },
                error: function (jqXHR, exception) {
                    $("#error").val(jqXHR.responseText);
                    $("#warning").modal('show');

                }
            });
        }
    });
}
