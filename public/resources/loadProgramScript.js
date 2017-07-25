$(document).ready(function(){


	$('#submitProgram').click(
	        function(){
	            sendReq('load', $('#programInput').val());
	        }
	);

	//submit code to be compiled
	function sendReq(command, data)
	{
		$.ajax({
  			url:'/api',
  			type:'GET',
  			data:{'command':command, 'data':data},
  			success: function(res){

			$('#programInput').val(res);
		}
		});

	}

	$('#factorial').click(
		function(){sendReq('getprog', 'fact.x')}
	);
	
	$('#wink').click(
		function(){sendReq('getprog', 'test.x')}
	);

	$('#welcome').click(
		function(){sendReq('getprog', 'welcome.x')}
	);

	$('#reaction').click(
		function(){sendReq('getprog', 'reaction.x')}
	);
	
	$('#pong').click(
		function(){sendReq('getprog', 'pong.x')}
	);
	
	$('#david').click(
		function(){sendReq('getprog', 'rotating_text.x')}
	);
	
	$('#faces').click(
                function(){sendReq('getprog', 'inputFaces.x')}
        );

	$('#nyan').click(
		function(){sendReq('getprog','nyan.x')}
	);

	$('#ca').click(
		function(){sendReq('getprog','ca.x')}
	);

	$('#christmas').click(
                function(){sendReq('getprog','christmas.x')}
        );

        $('#tree').click(
                function(){sendReq('getprog','tree.x')}
        );
	
});


