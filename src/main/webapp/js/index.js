var data;
var selectedPipeline;
var transformers;
var edit;
var url;

$(document).ready(function () {
    createProgressDialog();
    createAlertDialog();
    createAddDialog();

    url = location.protocol + '//' + location.hostname + ':' + location.port + '/';

    refreshContainers();
});

function refreshContainers(uri) {
    openDialog('progressDialog');

    $.ajax({
        type: 'GET',
        url: url + 'services/resources/get'
    }).done(function (json) {
        data = json;

        var pipelineListContent = '';
        var transformerListContent = '';
        var first = isEmpty(uri);

        jQuery.each(data.pipelines, function (i, pipeline) {
            var name = replaceForHTML(pipeline.name);
            if (name.length > 25) {
                name = name.substring(0, 24) + '...';
            }
            if (first || pipeline.uri === uri) {
                selectedPipeline = pipeline;

                pipelineListContent += '<a title="' + pipeline.description + '" href="#" onclick="refreshContainers(\'' + pipeline.uri + '\');" class="list-group-item list-group-item-info"><span class="badge">' + pipeline.transformers.length + '</span><b>' + name + '</b></a>';

                jQuery.each(pipeline.transformers, function (j, transformer) {
                    transformerListContent += '<tr title="' + transformer.description + '"><td>' + (j + 1) + '</td><td>' + replaceForHTML(transformer.name) + '</td><td>' + replaceForHTML(transformer.uri) + '</td></tr>';
                });

                first = false;
            }
            else {
                pipelineListContent += '<a title="' + pipeline.description + '"href="#" onclick="refreshContainers(\'' + pipeline.uri + '\');" class="list-group-item"><span class="badge">' + pipeline.transformers.length + '</span>' + name + '</a>';
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

        initAddPipeline();
        edit = false;

        window.setTimeout(function () {
            closeDialog('progressDialog');
        }, 200);
    }).fail(function (xhr, textStatus, errorThrown) {
        closeDialog('progressDialog');
        $('#alertDialogErrorText').text(textStatus);
        openDialog('alertDialog');
    });
}

///////////////////////////////
//    Add/Edit Pipeline     //
//////////////////////////////

function addPipeline() {
    clearDialog();
    edit = false;
    openDialog('addDialog');
}

function editPipeline() {
    $('#pipeline-name').val(selectedPipeline.name);
    $('#save-btn').attr("disabled", true);
    var initListContent = '';
    edit = true;
    var found = false;
    jQuery.each(transformers, function (i, transformer) {
        found = false;
        jQuery.each(selectedPipeline.transformers, function (j, transformer2) {
            if (transformer.uri === transformer2.uri) {
                found = true;
            }
        });

        if (found) {
            var uri = transformer.uri;
            if (uri.length > 75) {
                uri = uri.substring(0, 74) + '...';
            }

            initListContent += '<li class="list-group-item">' +
                    '<table style="width:100%;"><tr><td style="width: 95%;">' +
                    '<p class="index" style="display:none;">' + i + '</p>' +
                    '<b class="list-group-item-heading">' + transformer.name + '</b>' +
                    '<p class="list-group-item-text" style="font-size: .80em;">' + uri + '</p>' +
                    '</td><td style="width: 15%; text-align: right;">' +
                    '<a class="remove-icon" style="visibility: visible;" href="#" onclick="removeMe(this);"><span class="glyphicon glyphicon-remove"></span></a></td></tr></table>' +
                    '</li>';
        }
    });
    $('#sortable').html(initListContent);

    createSortable();

    openDialog('addDialog');
}

$('#save-btn').click(function () {
    openDialog('progressDialog');

    var name = $('#pipeline-name').val();
    var description = $('#pipeline-description').val();
    var selected = new Array();
    $('#sortable').find('.index').each(function () {
        var index = $(this).text();
        selected.push(transformers[index]);
    });

    if (edit) {
        $.ajax({
            type: 'POST',
            url: url + 'services/resources/edit',
            //contentType:"application/x-www-form-urlencoded",
            data: {
                'name': name,
                'description': description,
                'uri': selectedPipeline.uri,
                'selected': JSON.stringify(selected)
            }
        }).done(function (response) {
            if (response === 'OK') {
                closeDialog('addDialog');
                clearDialog();
                refreshContainers();
            }
            else {
                closeDialog('progressDialog');
                $('#alertDialogErrorText').text(response);
                openDialog('alertDialog');
            }
        }).fail(function (xhr, textStatus, errorThrown) {
            closeDialog('progressDialog');
            $('#alertDialogErrorText').text(textStatus);
            openDialog('alertDialog');
        });
    }
    else {
        $.ajax({
            type: 'POST',
            url: url + 'services/resources/add',
            //contentType:"application/x-www-form-urlencoded",
            data: {
                'name': name,
                'description': description,
                'selected': JSON.stringify(selected)
            }
        }).done(function (response) {
            if (response === 'OK') {
                closeDialog('addDialog');
                clearDialog();
                refreshContainers();
            }
            else {
                closeDialog('progressDialog');
                $('#alertDialogErrorText').text(response);
                openDialog('alertDialog');
            }
        }).fail(function (xhr, textStatus, errorThrown) {
            closeDialog('progressDialog');
            $('#alertDialogErrorText').text(textStatus);
            openDialog('alertDialog');
        });
    }
});

$('#clear-btn').click(function () {
    clearDialog();
});

$('#pipeline-name').keyup(function () {
    checkIfValid();
});

function clearDialog(){
    $('#pipeline-name').val('');
    $('#pipeline-description').val('');
    $('#sortable').empty();
    $('#save-btn').attr("disabled", true);
}

function removeMe(target) {
    $(target).closest('li').slideUp("normal", function () {
        $(this).remove();
        checkIfValid();
    });
}

function removeHelper(){
    $('#draggables .ui-sortable-helper').remove();
    $('#sortable .ui-sortable-placeholder').remove();
    $('#sortable .list-group-item').show();
}

function initAddPipeline() {
    var initListContent = '';
    transformers = new Array();
    jQuery.each(data.transformers, function (i, transformer) {
        transformers[i] = transformer;

        var uri = transformer.uri;
        if (uri.length > 75) {
            uri = uri.substring(0, 74) + '...';
        }

        initListContent += '<li title="' + transformer.description + '" class="list-group-item">' +
                '<table style="width:100%;"><tr><td style="width: 95%;">' +
                '<p class="index" style="display:none;">' + i + '</p>' +
                '<b class="list-group-item-heading">' + transformer.name + '</b>' +
                '<p class="list-group-item-text" style="font-size: .80em;">' + uri + '</p>' +
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

    createSortable();
}

function createSortable() {
    $('#sortable').sortable({
        revert: true,
        update: function (event, ui) {
            console.log('update');
            removeHelper();
            checkIfValid();
        },
        receive: function (event, ui) {
            console.log('receive');
            removeHelper();
            $('#sortable > li table tr td a').css('visibility', 'visible');
            checkIfValid();
        }
    });
    $('#sortable').droppable({
        drop: function (event, ui) {
            console.log('drop');
        }
    });
    $('#sortable').disableSelection();
    $('#draggables li').draggable({
        connectToSortable: '#sortable',
        helper: 'clone',
        revert: 'invalid',
        cursor: 'move',
        items: '> li:not(.pin)'
    });
    $('#draggables').disableSelection();

}

function createAddDialog() {
    $("#addDialog").dialog({
        modal: true,
        autoOpen: false,
        resizable: false,
        width: 1000,
        zIndex: 9000,
        position: {
            my: "center",
            at: "center",
            of: 'body',
            collision: 'fit'
        },
        show: {
            duration: 300
        },
        hide: {
            duration: 300
        }
    }).dialog("widget").removeClass('ui-widget');
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

function validatePipeline(uri) {
    $.ajax({
        type: 'GET',
        url: uri
    }).done(function (data) {
        console.log(data);
    }).fail(function (xhr, textStatus, errorThrown) {
        console.log(xhr);
        console.log(textStatus);
        console.log(errorThrown);
    });

}

///////////////////////////////
//      Delete Pipeline     //
//////////////////////////////

function deletePipeline() {
    createConfirmDialog('Confirmation', 'Are you sure you want to delete "<b>' + replaceForHTML(selectedPipeline.name) + '</b>"?', 'deleteConfirmed()');
}

function deleteConfirmed() {
    closeDialog('confirmDialog');
    openDialog('progressDialog');

    $.ajax({
        type: 'POST',
        url: url + 'services/resources/delete',
//        contentType:"application/json",
        data: {
            'uri': selectedPipeline.uri
        }
    }).done(function (response) {
        if (response == 'OK') {
            refreshContainers();
        }
        else {
            closeDialog('progressDialog');
            $('#alertDialogErrorText').text(response);
            openDialog('alertDialog');
        }
    }).fail(function (xhr, textStatus, errorThrown) {
        closeDialog('progressDialog');
        $('#alertDialogErrorText').text(textStatus);
        openDialog('alertDialog');
    });
}