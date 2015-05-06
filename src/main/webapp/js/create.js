var data;
var selectedPipeline;
var transformers;

$(document).ready(function () {
	setURIParameters(refreshPage);
});

function refreshPage() {	
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
    }).done(function (json) {
        transformers = json.results.bindings;

        var pipelineListContent = '';
        var transformerListContent = '';
		var initListContent = '';
        var first = true;

        jQuery.each(transformers, function (i, transformer) {
			var uri = transformer.uri.value;
			if (uri.length > 75) {
				uri = uri.substring(0, 74) + '...';
			}

			initListContent += '<li title="' + transformer.uri.value + '" class="list-group-item">' +
					'<table style="width:100%;"><tr><td style="width: 95%;">' +
					'<p class="index" style="display:none;">' + i + '</p>' +
					'<b class="list-group-item-heading">' + transformer.title.value + '</b>' +
					'<p class="list-group-item-text" style="font-size: .80em;">' + uri + '</p>' +
					'<span class="uri hidden">' + transformer.uri.value + '</span>' +
					'</td><td style="width: 15%; text-align: right;">' +
					'<a class="remove-icon" style="visibility: hidden;" href="#" onclick="removeMe(this);"><span class="glyphicon glyphicon-remove"></span></a></td></tr></table>' +
					'</li>';
		});
		
		if (!isEmpty(initListContent)) {
			$('#draggables').html(initListContent);
		}
		else {
			$('#draggables').html('<li class="pin" style="height:35px;margin:15px;"><i>No avaliable transformer...</i></li>');
		}

		// create sortable list
		$('#sortable').sortable({
			forcePlaceholderSize: true,
			tolerance: "pointer",
			revert: 100,
			update: function (event, ui) {
				removeHelper();
				checkIfValid();
			},
			receive: function (event, ui) {
				removeHelper();
				$('#sortable > li table tr td a').css('visibility', 'visible');
				checkIfValid();
			},
			placeholder: {
				element: function(currentItem) {
					return $('<li class="list-item-placeholder"></li>')[0];
				},
				update: function(container, p) {
					return;
				}
			}
		});
		$('#sortable').disableSelection();
		
		// create draggable list
		$('#draggables li').draggable({
			connectToSortable: '#sortable',
			helper: 'clone',
			revert: 'invalid',
			revertDuration: 100,
			zIndex: 100,
			cursor: 'move',
			items: '> li:not(.pin)'
		});
		$('#draggables').disableSelection();

		hideLoadingCover();
        
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

$('#save-btn').click(function () {
	var name = $('#pipeline-name').val();
    var description = $('#pipeline-description').val();
	
	var first = true;
	var uri = pipelineBaseURI;
    $('#sortable').find('.uri').each(function () {
        if(first){
			uri += '?t=';
			first = false;
		}
		else{
			uri += '&t=';
		}
		var temp = $(this).text();
		uri += encodeURIComponent(temp);
    });
	
	var pipeline = getTransformerByURI(uri);
	
	if(isEmpty(pipeline)){
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
			url: transformerRegistryURI,
			data: data
		}).done(function (response) {
			clearDialog();
			window.location = 'index.html';
		}).fail(function (xhr, textStatus, errorThrown) {
			hideLoadingCover();
			window.setTimeout(function() { 
				createAlertDialog(textStatus);  
			}, 400);
		});
	}
	else{
		createAlertDialog('This pipeline already exists under the name "<b>' + pipeline.title.value + '</b>"!'); 
	}
});

$('#clear-btn').click(function () {
    clearDialog();
});

$('#back-btn').click(function () {
    $('#loadingCover').hide().fadeIn(100);
	window.setTimeout(function() { 
		window.location = 'index.html' + getQueryString();
	}, 150);
});

$('#pipeline-name').keyup(function () {
    checkIfValid();
});

function clearDialog() {
    $('#pipeline-name').val('');
    $('#pipeline-description').val('');
    $('#sortable').empty();
	$('#pipeline-description').css('height', '34px');
    $('#save-btn').attr("disabled", true);
}

function removeMe(target) {
    $(target).closest('li').slideUp("normal", function () {
        $(this).remove();
        checkIfValid();
    });
}

function removeHelper() {
    $('#draggables .ui-sortable-helper').remove();
    $('#sortable .ui-sortable-placeholder').remove();
    $('#sortable .list-group-item').show();
}

function checkIfValid() {
    var name = $('#pipeline-name').val();
    var count = $("#sortable li").length;

    if (!isEmpty(name) && count > 0) {
        $('#save-btn').attr("disabled", false);
    }
    else {
        $('#save-btn').attr("disabled", true);
    }
}