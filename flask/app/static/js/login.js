
var main = function(){
	"use strict";

	
	

	$("#register").on("click", function(event){
		if ($("#register-form").css("display") == "none") {
			$("#login-public").text("REGISTER");
			$(".login-form").css("display", "none");

			$("#register-form").css("display", "block");
			$("#confirm-passwd").css("display", "block");
			$("#passwd-reset").css("display", "none"); //the normal display is flex
			$(this).text("Go back to login page");
		} 
		else{
			$("#login-public").text("LOG IN");
			$(".login-form").css("display", "block");

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
				url: '/cuttem/booking/login',
				type: 'POST',
				data: JSON.stringify(data),
				dataType: 'json'
			}).done(function(data){

				if (data.msg == "Successful") {
					location.replace('/cuttem/booking');
				}else{
					alert("INCORRECT PASSWORD OR USERNAME");
				}
				

			});

		} else if ($("#login-public").text() == "REGISTER") {
			console.log("register");

			var empty_field = false;


			console.log($("form#register-form :input"));
			$("form#register-form :input").each(function(){
				console.log($(this).val());
				if ($(this).val() == "") {
					empty_field = true;
				}

			});

			console.log(empty_field);

			if (empty_field || $("input[name='new-password']").val() != $("input[name='confirm-password']").val()) {
				if (empty_field) {
					alert("Complete all the fields");
				}
				else{
					alert("Passwords don't match");
				}
			}
			else{
				var firstname =  $("input[name='fname']").val();
				var lastname =  $("input[name='lname']").val();
				var email =  $("input[name='email']").val();
				var phone =  $("input[name='phone']").val();

				var username =  $("input[name='new-username']").val();
				var password = $("input[name='new-password']").val();

				var data = {'firstname': firstname, 'lastname': lastname, 'username': username, 'password': password, 'email': email, 'phone': phone};

				$.ajax({
					url: '/cuttem/booking/register',
					type: 'POST',
					data: JSON.stringify(data),
					dataType: 'json'
				}).done(function(data){

					if (data.msg == "Successful") {
						location.replace('/cuttem/booking');
					}else{
						alert("Error");
					}
					
				});
			}

			
			

		}
	};


	$('#login-form-client').on('keydown', 'input', function (event) {
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

	    	if (index == 7) {
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

			console.log(data);

			$.ajax({
				url: '/cuttem/dashboard/login',
				type: 'POST',
				data: JSON.stringify(data),
				dataType: 'json'
			}).done(function(data){

				console.log("Result returning from flask");

				if (data.msg == "Successful") {
					location.replace('/cuttem/dashboard');
				}else{
					alert("INCORRECT PASSWORD OR USERNAME");
				}
				

			});

		} else if ($("#login-dashboard").text() == "REGISTER") {
			console.log("register");

		}
	};

	$('#login-form-emp').on('keydown', 'input', function (event) {
	    if (event.which == 13) {
	    	event.preventDefault();
		    var $this = $(event.target);
		    var index = parseFloat($this.attr('data-index'));

	    	if (index == 2) {
	    		console.log("Enter sent to login");
	    		login_dashboard();


	    	} else{
	    		
		        $('[data-index="' + (index + 1).toString() + '"]').focus();
	    	}
	        
	    }
	});



};

$(document).ready(main);

