$(document).ready(function(){


	$('#submitProgram').click( function(){
		askServerForAccessToAPI( function() {
	            sendReq('loadassembly', $('#programInput').val());
	        });
		});

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

function updateQueueUI(place) {
    if(place == '0') {
        $('#queueUI').text('Your position in the queue is: ' + place + '. Use this power wisely.');
    }
    else {
        $('#queueUI').text('Your position in the queue is: ' + place);
    }
}
