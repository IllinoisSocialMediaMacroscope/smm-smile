// initialization
$(document).ready(function(){
    $(".keywords").highlight("OR",
        {wordsOnly:true, caseSensitive: true, className:'OR'});
    $(".keywords").highlight("AND",
        {wordsOnly:true, caseSensitive: true, className:'AND'});
    $(".keywords").highlight("-",
        {wordsOnly:true, caseSensitive: true, className:'NOT'});
    $(".keywords").highlight(["(", ")"],
        {className:'parenthesis'});

    parameters = {};
    parameters['filter:'] = {};
    parameters['filter:']['keywords:'] = '';
    parameters['id:'] = '';
    parameters['fields'] = `\n\t\t\tassignedCategoryId\n\t\t\tassignedEmotionId\n\t\t\tauthor\n\t\t\tcontents\n\t\t\tdate` +
        `\n\t\t\tcountry\n\t\t\tcountry_id\n\t\t\tcountry_name\n\t\t\tlanguage\n\t\t\tlocation\n\t\t\ttitle` +
        `\n\t\t\ttype\n\t\t\turl`;

});

$(document).on('click', '.dropdown-menu', function (e) {
    if ($(this).parent().is(".open")) {
        e.stopPropagation();
    }
});

$("#monitor-dataSource").on('change', function() {
    filterMonitors();
});

$("#monitor-type").on('change', function(){
    filterMonitors();
});

$(".search-monitor-btn").on('click',function(){
    $("div.searchbox").remove();
    $(".monitor-item")
        .css('height', 212)
        .css('border', '1px solid #ccc')
        .css('background-color', '#eae8e8');
    $(this).parents(".monitor-item")
        .css('border', '5px solid #00bcd487')
        .css('background-color', 'white');

    if ($(this).parents("#searchbox").length === 0) {
        $(this).parents(".monitor-item").append(`
                    <div class="input-group searchbox" style="width:1000px;margin:auto auto;margin-top:50px;padding:15px 0px;">
                        <input type="text" class="form-control" id="searchbox" placeholder="search by keywords, or leave it blank to collect sampled data from this monitor"/>
                        <div class="input-group-btn">
                            <div class="btn-group" role="group">
                                <div class="dropdown dropdown-lg">
                                    <button type="button" class="btn btn-default" onclick="toggleDropdown(this);">
                                        <i class="fas fa-chevron-down"></i>&nbsp;
                                        Advanced
                                    </button>    
                                    <div class="dropdown-menu dropdown-menu-right" style="width:900px;margin-top:-1px;padding:30px;">
                                        <div class="form-group" style="overflow:auto;">
                                            <label>Exchange Tweet ID for Tweet Text</label>
                                            <input type="checkbox" style="margin-left:10px;" id="trade-twitter"/>
                                            <span class="warningText">You have to authorize us to use your Twitter account. This consumes extra time and might trigger Twitter API's rate limit!</span>
                                        </div>
                                        <div class="form-group" style="overflow:auto;">
                                            <label>Start Date</label> 
                                            <input class="form-control" type="date" id="start"/>
                                        </div>
                                        <div class="form-group" style="overflow:auto;">
                                            <label>End Date</label>
                                            <input class="form-control" type="date" id="end"/>
                                        </div>
                                        <div class="form-group" style="overflow:auto;">
                                            <label>Filter by Site</label> 
                                            <input class="form-control" id="site-filter" placeholder="google.com"/>
                                        </div>
                                        <div class="form-group">
		                                    <label class="label-control">Select Fields</label>
		                                    <br>
                                            <select multiple id="crimsonFields" class="fields">
                                                <optgroup label="BasicFields">
                                                    <option value="assignedCategoryId" selected>assigned Category Id</option>
                                                    <option value="assignedEmotionId" selected>assigned Emotion Id</option>
                                                    <option value="author" selected>author</option>  
                                                    <option value="contents" selected>contents</option>
                                                    <option value="date" selected>date</option>
                                                    <option value="country" selected>country</option>
                                                    <option value="country_id" selected>country id</option>
                                                    <option value="language" selected>language</option>
                                                    <option value="location" selected>location</option>
                                                    <option value="title" selected>title</option>
                                                    <option value="type" selected>type</option>
                                                    <option value="url" selected>url</option>
                                                </optgroup>
                                            </select>
                                        </div>
                                        <div class="form-group" style="overflow:auto;">
						                    <textarea class="form-control" id="input" rows="15" disabled />
						                </div>
					                    <div class="form-group" style="overflow:auto;">
							                <button type="button" class="btn btn-primary" id="adv-search-btn">
							                    <i class="fas fa-search"></i>&nbsp;
								                Search	
                                            </button> 
											<button type="button" class="btn btn-info" id="expandDoc">
											    <i class="fas fa-question-circle"></i>&nbsp;
								                Help
                                            </button>
                                        </div>								
                                    </div>
                                </div> 
                            </div> 
                            <button type="button" class="btn btn-primary" id="simple-search-btn">
                                <i class="fas fa-search"></i>&nbsp;
                                Search
                            </button>
                        </div>
                    </div>`);

        $('.fields').multiselect({
            enableFiltering: true,
            filterBehavior: 'value',
            dropUp:true,
            maxHeight:600,
            width:'800px',
            buttonWidth:'838px',
            includeSelectAllOption: true,
            enableCollapsibleOptGroups: true,
        });

        $(this).parents(".monitor-item").css('height', 328);

        $("#simple-search-btn").on('click', function(e){
            var id = $(this).parents(".monitor-item").find("#monitor-id").text();
            saveModalInvoke(id, '#searchbox');
        });

        $("#searchbox").on('keypress', function(e){
            if ( (e.keyCode == 13 || e.keycode == 10 )&& !$("#simple-search-btn").attr('disabled')){
                e.preventDefault();

                var id = $(this).parents(".monitor-item").find("#monitor-id").text();
                saveModalInvoke(id, '#searchbox');
            }
        });

        setDate();
        expandDoc();
    }
});

function filterMonitors(){
    var dataSource = $("#monitor-dataSource option:selected").val();
    var type = $("#monitor-type option:selected").val();

    if (dataSource === "null" && type === "null") {
        $(".monitor-list").children().each(function () {
            $(this).show();
        });
    }
    else if (dataSource === 'null') {
        $(".monitor-list").children().each(function () {
            if ($(this).find('kbd').text() === type) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    else if (type === 'null') {
        $(".monitor-list").children().each(function () {

            var exist = false;
            $.each($(this).find('p'), function (i, p_tag) {
                if (p_tag.textContent === dataSource) {
                    exist = true;
                }
                ;
            });

            if (exist === true) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    else{
        $(".monitor-list").children().each(function () {

            var exist = false;
            $.each($(this).find('p'), function (i, p_tag) {
                if (p_tag.textContent === dataSource) {
                    exist = true;
                };
            });

            if ($(this).find('kbd').text() === type && exist === true) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }
}

function toggleDropdown(e){
    if ($(e).parent().is(".open")){
        $(e).parents(".monitor-item").css('height',328);
        $("#simple-search-btn").attr("disabled", false);
    }
    else{
        $(e).parents(".monitor-item").css('height',1200);
        $("#simple-search-btn").attr("disabled", true);

        var id = $(e).parents(".monitor-item").find("#monitor-id").text();
        updateGraphQL(id);

        /* trigger save modal */
        $("#adv-search-btn").on('click', function(e){
            saveModalInvoke(id, '#input');
        });
    }
    $(e).parent().toggleClass('open');
}

function updateGraphQL(id) {
    // initialize graphql textbox
    Query = '';

    var keyword =  $("#searchbox").val();
    var keyword = keyword.replace(/[\"]+/g, `\\"`);
    parameters['filter:']['keywords:'] = keyword;
    parameters['id:'] = id;

    Query = updateString(parameters);
    $("#input").val(`{\n\n` + Query + `\n\n}`);

    // field selection on change
    $("#crimsonFields").on('change', function () {
        fields_string = '';
        fields = {BasicFields: []};
        $.each($(this).find(':selected'), function (i, val) {
            var label = $(val.parentNode)[0].label;
            fields[label].push(val.value);
        });
        if (fields['BasicFields'].length !== 0) {
            $.each(fields['BasicFields'], function (i, val) {
                fields_string += '\n\t\t\t' + val;
            });
        }
        parameters['fields'] = fields_string;
        Query = updateString(parameters);
        $("#input").val(`{\n\n` + Query + `\n\n}`);
    });

    //Start Date
    $("#start").change(function () {
        parameters['start:'] = $("#start").val();
        Query = updateString(parameters);
        $("#input").val(`{\n\n` + Query + `\n\n}`);
    });

    // Twitter
    $("#trade-twitter").change(function () {
        if ($(this).is(":checked")) {
            parameters['twitter:'] = 'on';
        }else{
            parameters['twitter:'] = 'off';
        }
        Query = updateString(parameters);
        $("#input").val(`{\n\n` + Query + `\n\n}`);
    });

    //End Date
    $("#end").change(function () {
        parameters['end:'] = $("#end").val();
        Query = updateString(parameters);
        $("#input").val(`{\n\n` + Query + `\n\n}`);
    });

    //Filter by Site
    $("#site-filter").on('keyup', function(e){
        if (e.keyCode !== 13 && e.keyCode != 10){
            parameters['filter:']['site:'] = $("#site-filter").val();
            Query = updateString(parameters);
            $("#input").val(`{\n\n` + Query + `\n\n}`);
        }
    });

    $("#searchbox").on('keyup', function(e){
        if ( e.keyCode !== 13 && e.keycode !== 10 ){
            // escape doule quotation mark
            var keyword =  $("#searchbox").val();
            var keyword = keyword.replace(/[\"]+/g, `\\"`);
            parameters['filter:']['keywords:'] = keyword;
            Query =updateString(parameters);
            $("#input").val(`{\n\n` + Query +`\n\n}`);
        }
    });
}

function updateString(parameters){
    query = `\tcrimsonQuery{\n\t\tgetPost(` +  constructQuery(parameters) +  `\n\t\t}\n\t}`;
    return query;
}

function constructQuery(parameterObj){
    var keys = [];
    $.each(Object.keys(parameterObj),function(i,item){
        if (item === 'filter:'){
            if ((parameterObj[item]['keywords:'] !== '' && parameterObj[item]['keywords:'] !== undefined)
                || (parameterObj[item]['site:'] !== '' && parameterObj[item]['site:'] !== undefined)) {
                keys.push(item);
            }
        }
        else if (item !== 'fields' && parameterObj[item] !== ''){
            keys.push(item);
        }
    });

    var query = '';
    $.each(keys, function(i,key){
        if (typeof parameterObj[key] === 'string'){
            query += key + `"` + parameterObj[key] + `"`;
        }else if (typeof parameterObj[key] === 'number'){
            query += key + parameterObj[key];
        }else if (typeof parameterObj[key] === 'object'){
            var value = '';
            $.each(parameterObj[key], function(k, v){
                if (v !== '') value += k + v + '|';
            })
            query += key + `"` + value + `"`;
        }

        if (i!==keys.length-1){
            query += `,`;
        }
    });

    query +=  `){` + parameterObj.fields;

    return query;

}

/* save file modal */
function saveModalInvoke(id, searchID){
    if ( formValid(searchID)){
        $("#save").modal('show');
    }
    $("#saveButton")
        .attr('name',searchID)
        .attr('monitor-id', id);
}

/* save file modal click events */
function saveButtonClick(){
    var searchID = $("#saveButton").attr('name');
    if (saveValid('#sn-filename')){
        if (searchID === '#searchbox'){
            var id = $("#saveButton").attr('monitor-id');
            submitSearchbox(id, searchID,`#sn-filename`);
        }
        else{
            submitFullQuery(searchID,`#sn-filename`);
        }
    }
}

/*form validation */
function saveValid(filenameID){
    //check filename is legal or not
    // no empty, no space and . allowed
    // must be English
    var regexp1 =/^[A-Za-z0-9__-]+$/;

    if ($(filenameID).val() === '' || $(filenameID).val()=== undefined){
        $("#modal-message").append(`<h4>filename must not be empty!</h4>`)
        $("#alert").modal('show');
        $(filenameID).focus();
        return false
    }else if (!regexp1.test($(filenameID).val())){
        $("#modal-message").append(`<h4>filename illegal!<br> Legal Filename should only include <i>Alphabet, Number,
		Underscore</i> and/or <i>Dash</i>. <b>Example: mySearch-cwang138</b></h4>`);
        $("#alert").modal('show');
        $(filenameID).focus();
        return false
    }else if ($(filenameID).val()>=72){
        $("#modal-message").append(`<h4>filename exceed 72 characters!</h4>`);
        $("#alert").modal('show');
        $(filenameID).focus();
        return false
    }else{
        return true
    }
}

function twitterCallback(){
    $("#alert").modal('hide');
    $("#twitter-callback").modal('show');
}

function formValid(searchID){
    $("#modal-message").empty();

    // check the input box has English words or numbers or not
    // leaving it empty means just collect all the data in that monitor
    if ($("#searchbox").val() !== '') {
        var regx = /^[\":?)(#@A-Za-z0-9_ _+-_&_|]+$/;
        if (!regx.test($("#searchbox").val()) || $("#searchbox").val() >= 500) {

            $("#modal-message").append(`<h4>Please type in search keyword in the form of <i>English words, number, operators, 
                                        and/or combinations</i> of them!<br><b>Length shouldn't exceed 500 characters!</b></h4>`);
            $("#alert").modal('show');
            return false
        }
    }

    // extra search for advanced
    if (searchID === '#input'){
        if ($("#start").val() !== '' && $("#end").val() !== '' && $("#start").val() > $("#end").val()) {
            $("#modal-message").append(`<h4>Start time cannot be later than end time!</h4>`);
            $("#alert").modal('show');
            return false
        }
        var dateRange = setDate();
        if ($("#start").val() !== '' && $("#start").val() < dateRange['start']){
            $("#modal-message").append(`<h4>Start time cannot be earlier than monitor start time!</h4>`);
            $("#alert").modal('show');
            return false
        }
        if ($("#start").val() !== '' && $("#end").val() > dateRange['end']){
            $("#modal-message").append(`<h4>End time cannot be later than monitor end time!</h4>`);
            $("#alert").modal('show');
            return false
        }
        if ($("#trade-twitter").is(":checked") && $.cookie("twitter-success") !== "true"){
            $("#modal-message").append(`<h4>You have not authorized us to use your Twitter account yet.</h4>
                                            <a href="login/twitter?currentURL=` + newPath + `" target="_blank" onClick="twitterCallback();">
                                            Click here to Authorize Twitter</a>`);
            $("#alert").modal('show');
            return false
        }
    }

    return true
}

// save modal click
$("#saveButton").on('click',function(e){
    saveButtonClick()
});

// save file name
$("#sn-filename").on('keypress',function(e){
    if (e.keyCode === 13 || e.keycode == 10){
        e.preventDefault();
        saveButtonClick()
    }
});

$("#sn-filename").on("keyup",function(e){
    if (e.keyCode !== 13 && e.keyCode!== 10){
        $('#display-savefiles').empty();
        $('#display-savefiles').append(`<p style="text-align:left;padding-top:7px;">` + $(this).val() + '.csv' + `</p>` );
    }
});

function submitFullQuery(textareaID,filenameID){

    $(".loading").show();

    var queryString = $(textareaID).val();
    var filename = $(filenameID).val();
    var prefix = 'crimson-Hexagon';
    var params = parameters;
    $.ajax({
        url:"query",
        type:"post",
        data:{"query":queryString,
            "filename":filename,
            "params":JSON.stringify(params),
            "pages":-999,
            "prefix":prefix
        },
        success:function(data){
            $(".loading").hide();
            if ('ERROR' in data){
                $("#error").val(JSON.stringify(data));
                $("#warning").modal('show');
            }else{
                renderDownload(data.URLs, data.fname)
            }
        },
        error: function(jqXHR, exception){
            $("#error").val(jqXHR.responseText);
            $("#warning").modal('show');
        }
    });
}

function submitSearchbox(monitorId, searchboxID, filenameID){

    $(".loading").show();

    // escape doule quotation mark
    var keyword = $(searchboxID).val();
    var keyword = keyword.replace(/[\"]+/g, `\\"`);

    dateRange = setDate();
    parameters['filter:']['keywords:'] = keyword;
    parameters['id:'] = monitorId;

    if (keyword === ''){
        var queryString = `{
                                crimsonQuery{
                                    getPost(id:"` + id + `", start: "`
                                        + dateRange['start'] + `", end: "` + dateRange['end'] + `"){
                                        assignedCategoryId
                                        assignedEmotionId
                                        author
                                        contents
                                        date
                                        country
                                        country_id
                                        country_name
                                        language
                                        location
                                        title
                                        type
                                        url
                                    }
                                }                      
                            }`;
    }
    else{
        var queryString = `{
                                crimsonQuery{
                                    getPost(filter:"keywords:` + keyword + `",id:"` + id + `", start: "`
                                    + dateRange['start'] + `", end: "` + dateRange['end'] + `"){
                                        assignedCategoryId
                                        assignedEmotionId
                                        author
                                        contents
                                        date
                                        country
                                        country_id
                                        country_name
                                        language
                                        location
                                        title
                                        type
                                        url
                                    }
                                }                      
                            }`;
    }
    var filename = $(filenameID).val();
    var prefix = 'crimson-Hexagon';
    var params = parameters;
    $.ajax({
        url:"query",
        type:"post",
        data:{"query":queryString,
            "filename":filename,
            "params":JSON.stringify(params),
            "pages":-999,
            "prefix":prefix
        },
        success:function(data){
            $(".loading").hide();
            if ('ERROR' in data){
                $("#error").val(JSON.stringify(data));
                $("#warning").modal('show');
            }else{
                renderDownload(data.URLs, data.fname)
            }
        },
        error: function(jqXHR, exception){
            $("#error").val(jqXHR.responseText);
            $("#warning").modal('show');
        }
    });
}

function renderDownload(URLs, fname){
    // hide the saving modal
    $("#save").modal('hide');

    // append modal-download in the background
    $("#modal-download")
        .empty()
        .append(`<ul style="margin:5px 5px;">
            <a href="` + URLs[0] + `" style="color:red;">
        <i class="fas fa-download"></i>&nbsp;`
        + `DONWLOAD ` +  fname + `</a>
            <p hidden>` + URLs[1] +`</p>
        </ul>`);
    $("#success").modal('show');
    $("#rendering").find('a[class="btn btn-info"]').attr('href',URLs[0]);
}

function setDate(){
    min = $("#start").parents(".monitor-item").find(".results-start").text();
    max = $("#end").parents(".monitor-item").find(".results-end").text();

    $("#start").attr('min', min);
    $("#start").attr('max', max);
    $("#end").attr('min', min);
    $("#end").attr('max', max);

    return {"start": min, "end":max}
}

function expandDoc(){
    $("#expandDoc").click(function(){
        $("#documentation").toggleClass("expand");

        // calculate how many monitor-item class ahead of this
        var marginTop = $("#expandDoc").parents(".monitor-item").position()['top'];
        $("#docIframe").height(1200);
        $("#docIframe").css('margin-top', marginTop);

        $(".monitor-list").parent().toggleClass('col-lg-8 col-md-8 col-sm-8 col-xs-8');
    });
}
