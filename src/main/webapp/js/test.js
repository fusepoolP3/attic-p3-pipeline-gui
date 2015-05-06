var pipelines;
var selectedPipeline;
var selectedText;

$(document).ready(function () {
	setURIParameters(refreshPage);
});

function refreshPage(){
	var query = 'SELECT * WHERE { ' 
			  + '<' + transformerRegistryURI + '> <http://www.w3.org/ns/ldp#contains> ?child . '
				  + '?child <http://purl.org/dc/terms/title> ?title . '
				  + '?child <http://vocab.fusepool.info/trldpc#transformer> ?uri . '
				  + 'OPTIONAL { '
				  +	'	?child <http://purl.org/dc/terms/description> ?description . '
				  +	'	?child <http://purl.org/dc/terms/created> ?date . '
				  + '}'
			  + '}';
    
	$.ajax({
        type: 'POST',
        url: sparqlEndpointURI,
		headers: { 
			'Accept' : 'application/sparql-results+json',
			'Content-Type': 'application/sparql-query;charset=UTF-8'
		},
		data: query
    }).done(function (data) {
		var transformers = data.results.bindings;
		var pipelineListContent = '';
        pipelines = new Array();

        jQuery.each(transformers, function (i, transformer) {
            if (transformer.uri.value.match('^' + pipelineBaseURI)) {
				pipelines[i] = transformer;
				pipelineListContent += '<li><a href="#" onclick="javascript:selectPipeline(' + i + ')"><span class="glyphicon glyphicon-plus"></span> ' + transformer.title.value + "</a></li>";
			}
        });

        if(!isEmpty(pipelineListContent)) {
            $('#pipeline-list').html(pipelineListContent);
        }
        else{
            $('#pipeline-list').html('<div style="height:35px;margin:15px;"><i>No avaliable pipeline...</i></div>');
        }
	
        hideLoadingCover();
    })
    .fail(function(xhr, textStatus, errorThrown) {
        hideLoadingCover();
        window.setTimeout(function() { 
			createAlertDialog(textStatus);  
		}, 400);
    });    
}

$('#file-path').click(function(){
    $('#file').click();
    return false;
});

$('#browse').click(function(){
    $('#file').click();
    return false;
});

$('#file').change(function(e){
    var filename = $('#file').val();
    var res = filename.split("\\");
    filename = res[res.length - 1];
    $('#file-path').val(filename);
    var file = e.target.files[0];
	if(!isEmpty(file)){
		showLoadingCover();
		var reader = new FileReader();
		reader.onload = function(e){
			selectedText = e.target.result;
			checkIfValid();
			hideLoadingCover();
		};
		reader.readAsText(file)
	}
    return false;
});

$('#send-btn').click(function(){
    showLoadingCover();
	
	var acceptHeader = $('#accept-header').val();
    var contentType = $('#content-type').val();
    
    if(isEmpty(acceptHeader)){
        acceptHeader = '*/*';
    }
	if(isEmpty(contentType)){
        contentType = 'text/plain; charset=utf-8';
    }
    
    $.ajax({
        type: 'POST',
        url: $('#selected-pipeline').val(),
        headers: { 
			'Accept': acceptHeader,
			'Content-Type': contentType
		},
        data: selectedText
    })
    .done(function(data) {
        console.log(data);
        $('#result-box').html("<pre class=\"prettyprint lang-xml\" style=\"background-color:transparent;\">" + escapeHTML(data) + "</pre>");
        hideLoadingCover();
    })
    .fail(function(xhr, textStatus, errorThrown) {
		hideLoadingCover();
        window.setTimeout(function() { 
			createAlertDialog(textStatus);  
			$('#result-box').html(xhr.responseText);
		}, 400);
    });
	 
    return false;
});

$('#clear-btn').click(function(){	
    selectedPipeline = "";
    selectedText = "";
	
    $('#selected-pipeline').val('');
    $('#file-path').val('');
    $('#file').val('');
    $('#content-type').val('');
	$('#accept-header').val('');
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
    $('#selected-pipeline').val(selectedPipeline.uri.value);
	$('#selected-pipeline').prop('title', selectedPipeline.uri.value);
    checkIfValid();
    return false;
}

function escapeHTML(html) {
    return html.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}