
var main = function(){
	"use strict";

	


	$("#register").on("click", function(event){
		if ($("#register-form").css("display") == "none") {
			$("#login").text("REGISTER");
			$("#register-form").css("display", "block");
			$("#confirm-passwd").css("display", "block");
			$("#passwd-reset").css("display", "none"); //the normal display is flex
			$(this).text("Go back to login page");
		} 
		else{
			$("#login").text("LOG IN");
			$("#register-form").css("display", "none");
			$("#confirm-passwd").css("display", "none");
			$("#passwd-reset").css("display", "flex"); //the normal display is flex
			$(this).text("Create account");
		}
		
	});



	$("#login").on("click", function(event){
		if ($(this).text() == "LOG IN") {

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
				console.log(data);
				console.log("function done");
				$("#login-section").css("display", "none")


			});

		} else if ($(this).text() == "REGISTER") {
			console.log("register");

		}

	});



};

$(document).ready(main);

