var pipelines = [];
var selectedPipeline;
var selectedText;

$(document).ready(function () {
    createProgressDialog();
    createAlertDialog();
	
    refreshList();
});

$('#file-path').click(function(){
    $('#file').click();
    return false;
});

$('#browse').click(function(){
    $('#file').click();
    return false;
});

$('#file').change(function(e){
    openDialog('progressDialog');
	
    var filename = $('#file').val();
    var res = filename.split("\\");
    filename = res[res.length - 1];
    $('#file-path').val(filename);
    var file = e.target.files[0];
	
    var reader = new FileReader();
    reader.onload = function(e){
        selectedText = e.target.result;
        checkIfValid();
        window.setTimeout(function () {
            closeDialog('progressDialog')
        }, 200);
    };
    reader.readAsText(file)
    return false;
});

$('#send-btn').click(function(){
    openDialog('progressDialog');

    $.ajax({
        type: "POST",
        url: selectedPipeline,
        contentType: "text/plain; charset=utf-8",
        dataType: "text",
        data: selectedText
    })
    .done(function(data) {
        console.log(data);
        $('#result-box').html("<pre class=\"prettyprint lang-xml\" style=\"background-color:transparent;\">" + escapeHTML(data) + "</pre>");
        window.setTimeout(function () {
            closeDialog('progressDialog')
        }, 200);
    })
    .fail(function(xhr, textStatus, errorThrown) {
        closeDialog('progressDialog');
        $('#alertDialogErrorText').text(textStatus);
        openDialog('alertDialog');
    });
	 
    return false;
});

$('#clear-btn').click(function(){	
    selectedPipeline = "";
    selectedText = "";
	
    $('#selected-pipeline').val('');
    $('#file-path').val('');
    $('#file').val('');
    $('#result-box').html('');
    $('#send-btn').attr("disabled", true);
    return false;
});

function checkIfValid(){
    if(!isEmpty(selectedPipeline) && !isEmpty(selectedText)){
        $('#send-btn').attr("disabled", false);
    }
    else{
        $('#send-btn').attr("disabled", true);
    }
}

function selectPipeline(index){
    selectedPipeline = pipelines[index];
    $('#selected-pipeline').val(pipelines[index]);
    checkIfValid();
    return false;
}

function refreshList(){
    openDialog('progressDialog');
	
    $.ajax({
        type: "GET",
        url: "http://localhost:8080/services/resources/get"
    })
    .done(function(json) {
        data = json;
        
        var pipelineListContent = '';
        pipelines = new Array();
        jQuery.each(data.pipelines, function(i, pipeline) {
            pipelines[i] = pipeline.uri;
            pipelineListContent += '<li><a href="#" onclick="javascript:selectPipeline(' + i + ')"><span class="glyphicon glyphicon-plus"></span> ' + pipeline.name + "</a></li>";
        });

        if(!isEmpty(pipelineListContent)) {
            $('#pipeline-list').html(pipelineListContent);
        }
        else{
            $('#pipeline-list').html('<div style="height:35px;margin:15px;"><i>No avaliable pipeline...</i></div>');
        }
	
        window.setTimeout(function () {
            closeDialog('progressDialog')
        }, 200);
    })
    .fail(function(xhr, textStatus, errorThrown) {
        closeDialog('progressDialog');
        $('#alertDialogErrorText').text(textStatus);
        openDialog('alertDialog');
    });    
}

function escapeHTML(html) {
    return html.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}