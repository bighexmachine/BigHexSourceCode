$(document).ready(function(){


	$('#submitProgram').click(
	        function(){
	            sendReq('loadassembly', $('#programInput').val());
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
});
