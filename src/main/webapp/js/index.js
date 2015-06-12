var data;
var transformers;
var pipelines;
var selectedPipeline;
var selectedPipelineTranformers;

$(document).ready(function () {
    setURIParameters(refreshPage);
});

function refreshPage() {
    var query = 'PREFIX dc: <http://purl.org/dc/terms/> '
            + 'PREFIX trldpc: <http://vocab.fusepool.info/trldpc#> '
            + 'PREFIX ldp: <http://www.w3.org/ns/ldp#> '
            + 'SELECT * WHERE { '
            + ' <' + transformerRegistryURI + '> ldp:contains ?child . '
            + ' ?child dc:title ?title . '
            + ' ?child trldpc:transformer ?uri . '
            + '     OPTIONAL { '
            + '         ?child dc:description ?description . '
            + '         ?child dc:created ?date . '
            + '     }'
            + '}';
			
	$.ajax({
        type: 'POST',
        url: sparqlEndpointURI,
        headers: {
            'Accept': 'application/sparql-results+json',
            'Content-Type': 'application/sparql-query;charset=UTF-8'
        },
        data: query
    }).done(function (json) {
        transformers = json.results.bindings;
        
		query = 'PREFIX dc: <http://purl.org/dc/terms/> '
            + 'PREFIX pt: <http://vocab.fusepool.info/pipeline-transformer#> '
            + 'PREFIX trldpc: <http://vocab.fusepool.info/trldpc#> '
            + 'PREFIX ldp: <http://www.w3.org/ns/ldp#> '
            + 'SELECT * WHERE { '
            + ' <' + transformerRegistryURI + '> ldp:contains ?child . '
            + ' ?child dc:title ?title . '
            + ' ?child trldpc:transformer ?uri . '
			+ ' ?child pt:transformers ?list . '
            + '     OPTIONAL { '
            + '         ?child pt:length ?length . '
            + '         ?child dc:description ?description . '
            + '         ?child dc:created ?date . '
            + '     }'
            + '}';

		$.ajax({
			type: 'POST',
			url: sparqlEndpointURI,
			headers: {
				'Accept': 'application/sparql-results+json',
				'Content-Type': 'application/sparql-query;charset=UTF-8'
			},
			data: query
		}).done(function (json) {
			pipelines = json.results.bindings;
			refreshTable();

		}).fail(function (xhr, textStatus, errorThrown) {
			hideLoadingCover();
			window.setTimeout(function () {
				createAlertDialog(textStatus);
			}, 400);
		});

    }).fail(function (xhr, textStatus, errorThrown) {
        hideLoadingCover();
        window.setTimeout(function () {
            createAlertDialog(textStatus);
        }, 400);
    });
}

function refreshTable(uri) {
    var pipelineListContent = '';
    var transformerListContent = '';

	// if no URI was supplied select first
	if(isEmpty(uri)){
		uri = pipelines[0].child.value;
	}
	else{
		showLoadingCover();
	}
	
	var query = 'PREFIX pt: <http://vocab.fusepool.info/pipeline-transformer#> '
            + 'SELECT * WHERE { '
            + ' <' + uri + '> pt:transformers/rdf:rest*/rdf:first ?item '
            + '}';	
	
	$.ajax({
        type: 'POST',
        url: sparqlEndpointURI,
        headers: {
            'Accept': 'application/sparql-results+json',
            'Content-Type': 'application/sparql-query;charset=UTF-8'
        },
        data: query
    }).done(function (json) {
		selectedPipelineTranformers = json.results.bindings;
        jQuery.each(pipelines, function (i, pipeline) {
			// get pipeline name
			var name = replaceForHTML(pipeline.title.value);
			// get pipeline description
			var description = replaceForHTML(pipeline.description.value);
			
			if (pipeline.child.value === uri) {
				// set pipeline as selected
				selectedPipeline = pipeline;
				// add pipeline to the list as selected
				pipelineListContent += '<a title="' + description + '" href="#" onclick="refreshTable(\'' + pipeline.child.value + '\');" class="list-group-item list-group-item-info"><span class="badge">' + pipeline.length.value + '</span><span class="list-text"><b>' + name + '</b></span></a>';
				// loop through the transformers of the selected pipeline
				jQuery.each(selectedPipelineTranformers, function (j, child) {
					// get transformer by URI from the list of transformers
					var temp = getTransformerByURI(child.item.value);
					// if not found by URI try to find as pipeline
					if(temp == null){
						temp = getPipelineByURI(child.item.value);
					}
					if (temp == null) {
						// add transformer as unknown if not found
						transformerListContent += '<tr><td>' + (j + 1) + '</td><td><i><font>Unknown transformer</font></i></td><td>' + replaceForHTML(child.item.value) + '</td></tr>';
					}
					else {
						// add transformer
						transformerListContent += '<tr title="' + replaceForHTML(temp.description.value) + '"><td>' + (j + 1) + '</td><td>' + replaceForHTML(temp.title.value) + '</td><td>' + replaceForHTML(child.item.value) + '</td></tr>';
					}
				});
			}
			else {
				// add pipeline to the list
				pipelineListContent += '<a title="' + description + '"href="#" onclick="refreshTable(\'' + pipeline.child.value + '\');" class="list-group-item"><span class="badge">' + pipeline.length.value + '</span><span class="list-text">' + name + '</span></a>';
			}
		});
		// set the list of pipelines
		if (!isEmpty(pipelineListContent)) {
			$('#pipeline-list').html(pipelineListContent);
		}
		else {
			$('#pipeline-list').html('<div style="height:35px;margin:15px;"><i>No avaliable pipeline...</i></div>');
		}
		// set the selected transformers
		if (!isEmpty(transformerListContent)) {
			$('#transformer-list').html(transformerListContent);
		}
		else {
			$('#transformer-list').html('<tr><td colspan="3"><i>No transformer available...</i></td></tr>');
		}

		hideLoadingCover();

    }).fail(function (xhr, textStatus, errorThrown) {
        hideLoadingCover();
        window.setTimeout(function () {
            createAlertDialog(textStatus);
        }, 400);
    });
}

function getTransformerByURI(str) {
    for (var i = 0; i < transformers.length; i++) {
        if (transformers[i].uri.value === str) {
            return transformers[i];
        }
    }
    return null;
}

function getPipelineByURI(str) {
    for (var i = 0; i < pipelines.length; i++) {
        var temp = str.split('?config=');
		if(temp.length > 1) {
			if (pipelines[i].child.value === temp[1]) {
				return pipelines[i];
			}
		}
    }
    return null;
}

///////////////////////////////
//      Add Pipeline         //
///////////////////////////////

$('#add-btn').click(function () {
    $('#loadingCover').hide().fadeIn(100);
    window.setTimeout(function () {
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
        url: selectedPipeline.child.value
    }).done(function (response) {
        // check for HTTP_OK or HTTP_NO_CONTENT
        refreshPage();
    }).fail(function (xhr, textStatus, errorThrown) {
        hideLoadingCover();
        window.setTimeout(function () {
            createAlertDialog(textStatus);
        }, 400);
    });
}