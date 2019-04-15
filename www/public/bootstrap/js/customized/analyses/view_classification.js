$.getScript("bootstrap/js/customized/view_helperFunc.js", function () {

    $(document).ready(function () {
        $(".split").show();
        $(".train").hide();
        $(".predict").hide();
        $(".uid").hide();

        $("#labeled").on('change', function () {
            if ($("#labeled").get(0).files[0] === undefined) {
                var fname = '';
            } else {
                var fname = $("#labeled").get(0).files[0].name;
            }
            $("#upload-fname").text(fname);
        });

        $("#task").on('change', function () {
            var task = $(this).children(":selected").attr("value");
            if (task === 'split') {
                $("#file-container").show();
                $("#divider").show();
                $("#import-container").show();

                $(".split").show();
                $(".train").hide();
                $(".uid").hide();
                $(".predict").hide();
            }
            else if (task === 'train') {
                $("#file-container").hide();
                $("#divider").hide();
                $("#import-container").hide();

                $(".train").show();
                $(".split").hide();
                $(".uid").show();
                $(".predict").hide();
            }
            else if (task === 'predict') {
                $("#file-container").hide();
                $("#divider").hide();
                $("#import-container").hide();

                $(".train").hide();
                $(".split").hide();
                $(".uid").show();
                $(".predict").show();
            } else {
                $("#selectFile").prop('disabled', false);
            }

        });

    });
});
