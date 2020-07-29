
var main = function(){
	"use strict";

	
	

	$("#register").on("click", function(event){
		if ($("#register-form").css("display") == "none") {
			$("#login").text("REGISTER");
			$("#login-form").css("display", "none");

			$("#register-form").css("display", "block");
			$("#confirm-passwd").css("display", "block");
			$("#passwd-reset").css("display", "none"); //the normal display is flex
			$(this).text("Go back to login page");
		} 
		else{
			$("#login").text("LOG IN");
			$("#login-form").css("display", "block");

			$("#register-form").css("display", "none");
			$("#confirm-passwd").css("display", "none");
			$("#passwd-reset").css("display", "flex"); //the normal display is flex
			$(this).text("Create account");
		}
		
	});


	$("#login").on("click", login);

	function login(){
		if ($("#login").text() == "LOG IN") {

			console.log("log in");

			
			var username =  $("input[name='username']").val();
			var password = $("input[name='password']").val();

			var data = {'username': username, 'password': password};

			$.ajax({
				url: '/login',
				type: 'POST',
				data: JSON.stringify(data),
				dataType: 'json'
			}).done(function(data){

				//console.log(window.location);
				//console.log(window.location.origin)

			

				if (data.msg == "Successful") {
					//$("#login-section").css("display", "none");
					location.replace('/appointment');
					//window.navigate("{{ url_for('index') }}");
				}else{
					alert("INCORRECT PASSWORD OR USERNAME");
				}
				

			});

		} else if ($("#login").text() == "REGISTER") {
			console.log("register");

		}

	};


	$('#login-form').on('keydown', 'input', function (event) {
	    if (event.which == 13) {
	    	event.preventDefault();
		    var $this = $(event.target);
		    var index = parseFloat($this.attr('data-index'));

	    	if (index == 2) {
	    		login();

	    	} else{
	    		
		        $('[data-index="' + (index + 1).toString() + '"]').focus();
	    	}
	        
	    }
	});

	$('#register-form').on('keydown', 'input', function (event) {
	    if (event.which == 13) {
	    	event.preventDefault();
		    var $this = $(event.target);
		    var index = parseFloat($this.attr('data-index'));

	    	if (index == 6) {
	    		login();

	    	} else{
	    		
		        $('[data-index="' + (index + 1).toString() + '"]').focus();
	    	}
	        
	    }
	});






};

$(document).ready(main);

