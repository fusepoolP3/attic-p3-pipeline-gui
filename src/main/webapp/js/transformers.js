var transformers;
var selectedTransformer;

$(document).ready(function () {
	setURIParameters(refreshPage);
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
    }).done(function (data) {
        transformers = data.results.bindings;
		var transformerListContent = '';
		$("#transformer-table tbody").html('');
		
        if(transformers.length > 0) {
            jQuery.each(transformers.reverse(), function (i, transformer) {
				$("#transformer-table tbody").append($('<tr>')
                    .append($('<td>').text((transformers.length - i)))
                    .append($('<td>').text(transformer.title.value))
                    .append($('<td>').text(transformer.description.value))
                    .append($('<td>').text(transformer.uri.value))
                    .append($('<td>').append($('<a>').prop('href', 'javascript:deleteTransformer("' + transformer.uri.value + '")').append($('<span>').prop('class', 'glyphicon glyphicon-trash'))))
                );
            });
        }
        else {
            $("#transformer-table tbody").html('<tr><td colspan="5"><i>No transformer available...</i></td></tr>');
        }

		hideLoadingCover();
		
    }).fail(function (xhr, textStatus, errorThrown) {
        hideLoadingCover();
        window.setTimeout(function() { 
			createAlertDialog(textStatus);  
		}, 400);
    });
}

function deleteTransformer(uri) {
	selectedTransformer = getTransformerByURI(uri);
    createConfirmDialog('Confirmation', 'Are you sure you want to delete "<b>' + replaceForHTML(selectedTransformer.title.value) + '</b>"?', 'deleteConfirmed()');
}

function deleteConfirmed() {
	closeDialog('confirmDialog');
    showLoadingCover();
	
	$.ajax({
		type: 'DELETE',
		url: selectedTransformer.child.value,
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

function getTransformerByURI(str) {
    for (var i = 0; i < transformers.length; i++) { 
		if (transformers[i].uri.value === str) {
            return transformers[i];
        }
    };
    return null;
}

///////////////////////////////
//      Add Transformer      //
///////////////////////////////

$('#save-btn').click(function () {
	var name = $('#transformer-name').val();
    var description = $('#transformer-description').val();
	var uri = $('#transformer-uri').val();
	
	var transformer = getTransformerByURI(uri);
	
	if(isEmpty(transformer)){
		showLoadingCover();
		
		var data = '@prefix dcterms: <http://purl.org/dc/terms/> . '
			+ '@prefix trldpc: <http://vocab.fusepool.info/trldpc#> . '
			+ '<> a trldpc:TransformerRegistration; '
			+ 'trldpc:transformer <' + uri + '>; '
			+ 'dcterms:title "' + name + '"@en; '
			+ 'dcterms:description "' + description + '". ';

		$.ajax({
			type: 'POST',
			headers: { 
				'Content-Type': 'text/turtle'
			},
			url: tranformerRegistryURI,
			data: data
		}).done(function (response) {
			clearDialog();
			refreshPage();
		}).fail(function (xhr, textStatus, errorThrown) {
			hideLoadingCover();
			window.setTimeout(function() { 
				createAlertDialog(textStatus);  
			}, 400);
		});
	}
	else{
		createAlertDialog('This transformer already exists under the name "<b>' + transformer.title.value + '</b>"!'); 
	}
});

$('#clear-btn').click(function () {
    clearDialog();
});

function clearDialog() {
    $('#transformer-name').val('');
    $('#transformer-description').val('');
	$('#transformer-uri').val('');
	$('#transformer-description').css('height', '34px');
	$('#save-btn').attr("disabled", true);
}

function checkIfValid() {
    var name = $('#transformer-name').val();
	var uri = $('#transformer-uri').val();
	
    if (!isEmpty(name) && !isEmpty(uri)) {
        $('#save-btn').attr("disabled", false);
    }
    else {
        $('#save-btn').attr("disabled", true);
    }
}

$('#transformer-name').keyup(function () {
    checkIfValid();
});

$('#transformer-uri').keyup(function () {
    checkIfValid();
});