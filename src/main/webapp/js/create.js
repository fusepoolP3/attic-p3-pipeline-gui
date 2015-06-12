var data;
var selectedPipeline;
var transformers;

$(document).ready(function () {
    setURIParameters(refreshPage);
});

function refreshPage() {
    var query = 'PREFIX dc: <http://purl.org/dc/terms/> '
            + 'PREFIX pt: <http://vocab.fusepool.info/pipeline-transformer#> '
			+ 'PREFIX trldpc: <http://vocab.fusepool.info/trldpc#> '
            + 'PREFIX ldp: <http://www.w3.org/ns/ldp#> '
            + 'SELECT * WHERE { '
            + ' <' + transformerRegistryURI + '> ldp:contains ?child . '
            + ' ?child dc:title ?title . '
            + ' ?child trldpc:transformer ?uri . '
            + '     OPTIONAL { '
			+ ' 		?child pt:transformers ?list . '
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

        var initListContent = '';

        jQuery.each(transformers, function (i, transformer) {
            var uri = isEmpty(transformer.list) ? transformer.uri.value : transformer.uri.value + '?config=' + transformer.child.value;
            var description = uri;
			if (description.length > 100) {
                description = description.substring(0, 99) + '...';
            }

            initListContent += '<li title="' + transformer.uri.value + '" class="list-group-item">' +
                    '<table style="width:100%;"><tr><td style="width: 95%;">' +
                    '<p class="index" style="display:none;">' + i + '</p>' +
                    '<b class="list-group-item-heading">' + transformer.title.value + '</b>' +
                    '<p class="list-group-item-text" style="font-size: .80em;">' + description + '</p>' +
                    '<span class="uri hidden">' + uri + '</span>' +
                    '</td><td style="width: 15%; text-align: right;">' +
                    '<a class="remove-icon" style="visibility: hidden;" href="#" onclick="removeMe(this);"><span class="glyphicon glyphicon-remove"></span></a></td></tr></table>' +
                    '</li>';
        });

        if (!isEmpty(initListContent)) {
            $('#draggables').html(initListContent);
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
                element: function (currentItem) {
                    return $('<li class="list-item-placeholder"></li>')[0];
                },
                update: function (container, p) {
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
        window.setTimeout(function () {
            createAlertDialog(textStatus);
        }, 400);
    });
}

$('#save-btn').click(function () {  
	showLoadingCover();
	
	var name = $('#pipeline-name').val();
    var description = $('#pipeline-description').val();

	var count = 0;
    var uris = '';
    $('#sortable').find('.uri').each(function () {
        uris += '<' + $(this).text() + '> ';
		count++;
    });

    var data = '@prefix dcterms: <http://purl.org/dc/terms/> . '
            + '@prefix trldpc: <http://vocab.fusepool.info/trldpc#> . '
            + '@prefix pt: <http://vocab.fusepool.info/pipeline-transformer#> .'
            + '<> a trldpc:TransformerRegistration; '
            + 'trldpc:transformer <' + pipelineBaseURI + '>; '
            + 'dcterms:title "' + name + '"@en; '
            + 'dcterms:description "' + description + '" ; '
			+ 'pt:length "' + count + '" ; '
            + 'pt:transformers (' + uris + ') .';

    $.ajax({
        type: 'POST',
        headers: {
            'Content-Type': 'text/turtle'
        },
        url: transformerRegistryURI,
        data: data
    }).done(function (response) {
        clearDialog();
        $('#loadingCover').hide().fadeIn(100);
        window.setTimeout(function () {
            window.location = 'index.html' + getQueryString();
        }, 150);
    }).fail(function (xhr, textStatus, errorThrown) {
        hideLoadingCover();
        window.setTimeout(function () {
            createAlertDialog(textStatus);
        }, 400);
    });
});

$('#clear-btn').click(function () {
    clearDialog();
});

$('#back-btn').click(function () {
    $('#loadingCover').hide().fadeIn(100);
    window.setTimeout(function () {
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