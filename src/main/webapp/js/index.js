var data;
var selectedPipeline;
var transformers;

$(document).ready(function () {
	setURIParameters();
    refreshPage();
});

function refreshPage() {	
	var query = 'SELECT * WHERE { ' 
		  + '<' + tranformerRegistryURI + '> <http://www.w3.org/ns/ldp#contains> ?child . '
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
    }).done(function (json) {
        transformers = json.results.bindings;	
		refreshTable();
        
    }).fail(function (xhr, textStatus, errorThrown) {
        hideLoadingCover();
        window.setTimeout(function() { 
			createAlertDialog(textStatus); 
		}, 400);
    });
}

function refreshTable(uri) {	
	var pipelineListContent = '';
    var transformerListContent = '';
    var first = isEmpty(uri);

	if(!isEmpty(uri)){
		showLoadingCover();
	}
	
	jQuery.each(transformers, function (i, transformer) {
        if (transformer.uri.value.match('^' + pipelineBaseURI)) {
			var name = replaceForHTML(transformer.title.value);
			
			var childs = getTransformersFromQueryString(transformer.uri.value);
        
			if (first || transformer.child.value === uri) {
				selectedPipeline = transformer;
				
				pipelineListContent += '<a title="' + replaceForHTML(transformer.description.value) + '" href="#" onclick="refreshTable(\'' + transformer.child.value + '\');" class="list-group-item list-group-item-info"><span class="badge">' + childs.length + '</span><span class="list-text"><b>' + name + '</b></span></a>';

				jQuery.each(childs, function (j, child) {
					if(child == null){
						transformerListContent += '<tr><td>' + (j + 1) + '</td><td><i><font color="red">Deleted transformer</font></i></td><td></td></tr>';
					}
					else{
						transformerListContent += '<tr title="' + replaceForHTML(child.description.value) + '"><td>' + (j + 1) + '</td><td>' + replaceForHTML(child.title.value) + '</td><td>' + replaceForHTML(child.uri.value) + '</td></tr>';
					}
				});
				
				first = false;
			}
			else {
				pipelineListContent += '<a title="' + replaceForHTML(transformer.description.value) + '"href="#" onclick="refreshTable(\'' + transformer.child.value + '\');" class="list-group-item"><span class="badge">' + childs.length  + '</span><span class="list-text">' + name + '</span></a>';
			}
		}
    });

    if (!isEmpty(pipelineListContent)) {
        $('#pipeline-list').html(pipelineListContent);
    }
    else {
        $('#pipeline-list').html('<div style="height:35px;margin:15px;"><i>No avaliable pipeline...</i></div>');
    }

    if (!isEmpty(transformerListContent)) {
        $('#transformer-list').html(transformerListContent);
    }
    else {
        $('#transformer-list').html('<tr><td colspan="3"><i>No transformer available...</i></td></tr>');
    }

    hideLoadingCover();
}

function getTransformersFromQueryString(str){
	var arr = new Array();

	if(!isEmpty(str)){
		var splitArr = str.slice(str.indexOf('?') + 1).split('&');
		for (var i = 0; i < splitArr.length; i++) { 
			var temp = splitArr[i].split('=');
			var decodedUri = decodeURIComponent(temp[1]);
			arr.push(getTransformerByURI(decodedUri));
		}
	}
	return arr;
}

function getTransformerByURI(str) {
    for (var i = 0; i < transformers.length; i++) { 
		if (transformers[i].uri.value === str) {
            return transformers[i];
        }
    };
    return null;
}

///////////////////////////////
//      Add Pipeline         //
///////////////////////////////

$('#add-btn').click(function () {
    $('#loadingCover').hide().fadeIn(100);
	window.setTimeout(function() { 
		window.location = 'create.html' + getQueryString();
	}, 150);
});

///////////////////////////////
//      Delete Pipeline     //
//////////////////////////////

$('#delete-btn').click(function () {
    createConfirmDialog('Confirmation', 'Are you sure you want to delete "<b>' + replaceForHTML(selectedPipeline.title.value) + '</b>"?', 'deleteConfirmed()');
});

function deleteConfirmed() {
    closeDialog('confirmDialog');
    showLoadingCover();
	
    $.ajax({
        type: 'DELETE',
        url: selectedPipeline.child.value,
    }).done(function (response) {
		// check for HTTP_OK or HTTP_NO_CONTENT
        refreshPage();
    }).fail(function (xhr, textStatus, errorThrown) {
		hideLoadingCover();
        window.setTimeout(function() { 
			createAlertDialog(textStatus); 
		}, 400);
    });
}