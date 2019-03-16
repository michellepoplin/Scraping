$.getJSON('/articles', function (data) {
    for (var i = 0; i < data.length; i++) {
        $('#articles').append('<p data-id='' + data[i]._id + ''>' + data[i].title + '<br />' + data[i].link + '</p>');
    }
});


$(document).on('click', 'p', function () {
    $('#notes').empty();
    var thisId = $(this).attr('data-id');

    $.ajax({
        method: 'GET',
        url: '/articles/' + thisId
    })
});

$(document).on('click', '#savenote', function () {
    var thisId = $(this).attr('data-id');

    $.ajax({
        method: 'POST',
        url: '/articles/' + thisId,
        data: {
            title: $('#titleInput').val(),
            body: $('#bodyInput').val()
        }
    })
        .then(function (data) {
            console.log(data);
            $('#notes').empty();
        });

    $('#titleInput').val('');
    $('#bodyInput').val('');
});
