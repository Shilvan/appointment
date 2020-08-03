
var main = function(){
	"use strict";

	
	

	$("#register").on("click", function(event){
		if ($("#register-form").css("display") == "none") {
			$("#login-public").text("REGISTER");
			$("#login-form").css("display", "none");

			$("#register-form").css("display", "block");
			$("#confirm-passwd").css("display", "block");
			$("#passwd-reset").css("display", "none"); //the normal display is flex
			$(this).text("Go back to login page");
		} 
		else{
			$("#login-public").text("LOG IN");
			$("#login-form").css("display", "block");

			$("#register-form").css("display", "none");
			$("#confirm-passwd").css("display", "none");
			$("#passwd-reset").css("display", "flex"); //the normal display is flex
			$(this).text("Create account");
		}
		
	});


	$("#login-public").on("click", login_public);

	function login_public(){
		if ($("#login-public").text() == "LOG IN") {

			console.log("log in");

			
			var username =  $("input[name='username']").val();
			var password = $("input[name='password']").val();

			var data = {'username': username, 'password': password};

			$.ajax({
				url: '/appointment/login',
				type: 'POST',
				data: JSON.stringify(data),
				dataType: 'json'
			}).done(function(data){

				if (data.msg == "Successful") {
					location.replace('/appointment');
				}else{
					alert("INCORRECT PASSWORD OR USERNAME");
				}
				

			});

		} else if ($("#login-public").text() == "REGISTER") {
			console.log("register");

		}
	};


	$('#login-form').on('keydown', 'input', function (event) {
	    if (event.which == 13) {
	    	event.preventDefault();
		    var $this = $(event.target);
		    var index = parseFloat($this.attr('data-index'));

	    	if (index == 2) {
	    		login_public();

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
	    		login_public();

	    	} else{
	    		
		        $('[data-index="' + (index + 1).toString() + '"]').focus();
	    	}
	        
	    }
	});


/**/
	$("#login-dashboard").on("click", login_dashboard);

	function login_dashboard(){
		if ($("#login-dashboard").text() == "LOG IN") {
			
			var username =  $("input[name='username']").val();
			var password = $("input[name='password']").val();

			var data = {'username': username, 'password': password};

			console.log("sending data to flask");

			$.ajax({
				url: '/dashboard/login',
				type: 'POST',
				data: JSON.stringify(data),
				dataType: 'json'
			}).done(function(data){

				console.log("Result returning from flask");

				if (data.msg == "Successful") {
					location.replace('/dashboard');
				}else{
					alert("INCORRECT PASSWORD OR USERNAME");
				}
				

			});

		} else if ($("#login-dashboard").text() == "REGISTER") {
			console.log("register");

		}
	};



};

$(document).ready(main);

