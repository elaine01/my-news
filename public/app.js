$('.submit-comment').on('click', function(e) {

	e.preventDefault();

	let thisID = $(this).attr('data-article-id');

	const comment = $('.comment-text').val();

	// console.log(thisID)

	// Run a post request, using what's entered in the comconsole.log(ment section
	$.ajax({
		method: 'POST',
		url: '/article/comment/' + thisID,
		data: {
			comment
		}
	})
	.done(function(data) {
		console.log(data);
		// empty the comment section
		$('.comment-text').val(data.comment);
	})
	// $('.comment-text').val('');

});


$('.comment-delete-btn').on('click', function(e) {

	e.preventDefault();

	let thisID = $(this).attr('data-comment-id');

	$.ajax({
		method: 'POST',
		url: '/delete/comment/:id' + thisID
	})
});