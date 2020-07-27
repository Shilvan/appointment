
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
			$("#login").text("LOGIN");
			$("#register-form").css("display", "none");
			$("#confirm-passwd").css("display", "none");
			$("#passwd-reset").css("display", "flex"); //the normal display is flex
			$(this).text("Create account");
		}
		
	});

	/*FOOTER BUTTONS*/
	$("#confirmbtn").on("click", function(event){
		/*send data to python*/
		console.log("save data to the database");

		//var readable_date = weekdays[clickedDate.getDay()]+", "+clickedDate.getDate()+" "+months[clickedDate.getMonth()]+" "+clickedDate.getFullYear();
		var postgres_date = clickedDate.getFullYear() + "-" + (clickedDate.getMonth()+1) + "-" + clickedDate.getDate();
		var time =  $("input[name='A']:checked").val();
		var name = $("input[name='name']").val();
		var email = $("input[name='email']").val();
		var phone = $("input[name='phone']").val();
		var service = $('#service-dropdown-title').data("service");
		var provider = $('#provider-dropdown-title').data("provider");

		var data = {'date': postgres_date, 'time': time, 'name': name, 'email': email, 'phone': phone, 'service': service, 'provider': provider};
		
		$.ajax({
			url: '/appointment',
			type: 'POST',
			data: JSON.stringify(data),
			dataType: 'json'
		}).done(function(data){
			$("header").css("display", "none");
			$("main").css("display", "none");
			$(".confirmed-view").css("display", "grid");
		});
	
		/*display confirmed page
		$("header").css("display", "none");
		$("main").css("display", "none");
		$(".confirmed-view").css("display", "grid");*/
	});

	$("#login").on("click", function(event){
		if ($(this).text() == "LOGIN") {

			console.log("login");

			
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
				window.location.href = response.redirect;


			});

		} else if ($(this).text() == "REGISTER") {
			console.log("register");

		}

	});



};

$(document).ready(main);

