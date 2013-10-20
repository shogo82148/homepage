$(function() {
	$("#btnlogin").click(function() {
		$("#res").html('<img src="./ajax-loader.gif" /> mixiにログイン中...');
		$("#res").load('../../../cgi-bin/mixi2iCal/login.cgi', {
			'email': $('#email').val(),
			'pass' : $('#pass').val()
		});
		return false;
	});
});
