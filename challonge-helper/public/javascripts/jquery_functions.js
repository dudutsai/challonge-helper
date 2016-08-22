$(document).ready(function(){
	$('#orgBool').click(function() {
		if ($(this).hasClass('active')) {
			$(this).removeClass('active');
		}
		else {
			$(this).addClass('active');
		}
		$('#orgField').toggle();
	    // TODO: insert whatever you want to do with $(this) here
	});
});