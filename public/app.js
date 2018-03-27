$('.submit-comment').on('submit', function(e) {

	e.preventDefault();

	let thisID = $(this).attr('data-id');

	console.log("thisID ", thisID);

	// Run a post request, using what's entered in the comment section
	$.ajax({
		method: 'POST',
		url: '/article/comment/' + thisID,
		data: {
			comment: $('.comment-text').val()
		}
	})
	.done(function(data) {
		console.log(data);
		// empty the comment section
		$('.comment-text').val(data.comment);
	})
	// $('.comment-text').val('');

});