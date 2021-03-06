
var main = function(){
	"use strict";

	


	var weekdays=["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
	var months = ["Jan","Feb", "Mar","Apr", "May","Jun","Jul","Aug","Sep","Oct","Nov","Dec" ];
	
	var clickedDate;

	var today = new Date();
	var activeDate = new Date();
	var dayInTheMonth = new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 0).getDate();
	//if the last day is on a sunday put it on monday of the next month (next=>if the days left are disabled too)
	if (activeDate.getDay()==0 && dayInTheMonth == activeDate.getDate()){ //-CHANGE- (active date get date)
		activeDate.setMonth(activeDate.getMonth()+1);
	}




	setNewMonth(activeDate);//change it

	setBranches();

	function setBranches(){
		fetch('/get_branches').then(function(response){
			response.json().then(function(data){
				$("#branch-dropdown").empty();

				for(let branch of data.branches){
					$("#branch-dropdown").append('<li value="'+ branch.id +'">'+ branch.name + '</li>');
				}
			});
		});
	};

	$("#branch-dropdown").on("click", "li", function(event){
		$('#branch-dropdown-title').text($(this).text());
		$('#branch-dropdown-title').data("branch", $(this).val());

		/**/
		$('#service-dropdown-title').text("Service...");
		$('#provider-dropdown-title').text("Provider...");
		$('#provider-dropdown').empty();

		setServices($(this).val());
	});

	function setServices(branch){
		fetch('/get_services/' + branch).then(function(response){
			response.json().then(function(data){
				$("#service-dropdown").empty();

				for(let service of data.services){
					$("#service-dropdown").append('<li value="'+ service.id +'">'+ service.name + '</li>');
				}
			});
		});
	};

	

	$("#service-dropdown").on("click", "li", function(event){
	
		$('#service-dropdown-title').text($(this).text());
		$('#service-dropdown-title').data("service", $(this).val());

		


		var branch = $('#branch-dropdown-title').data("branch");
		setProviders(branch, $(this).val());
		/*remove the rest of drowpdowns preselected*/

	});

	

	function setProviders(branch, service){
		fetch('/get_providers/' + branch + '/' + service).then(function(response){
			response.json().then(function(data){
				$("#provider-dropdown").empty();
				
				if (data.providers.length > 1) {
					//$("#provider-dropdown").append('<li>Any</li>');
				}
				

				var provider_existed = false;
				for(let provider of data.providers){
					$("#provider-dropdown").append('<li value="'+ provider.id +'">'+ provider.name + '</li>');

					if(provider.name == $('#provider-dropdown-title').text()){
						provider_existed = true;
					}
				}


				if (provider_existed == false) {
					/**/
					$('#provider-dropdown-title').text("Provider...");

				}
				else{
					setNewMonth(activeDate);
					if (typeof clickedDate != "undefined") {
						populateTimes(clickedDate);

					}

				}

			});

		});

	};

	$("#provider-dropdown").on("click", "li", function(event){
		$('#provider-dropdown-title').text($(this).text());
		$('#provider-dropdown-title').data("provider", $(this).val());
		setNewMonth(activeDate); /**/
		if (typeof clickedDate != "undefined") {
			populateTimes(clickedDate);

		}

	});


	function setNewMonth(d){	

		//SET THE CALENDAR HEADER
		$(".month").text(months[d.getMonth()]);
		$(".year").text(d.getFullYear());

		//SET THE FIRST DAY POSITION
		var firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
		jQuery.cssNumber.gridColumnStart = true;
		if(firstDay.getDay()==0){
			$(".number:nth-child(8)").css("grid-column-start", 7 );	
		}
		else{
			$(".number:nth-child(8)").css("grid-column-start", firstDay.getDay());
		}

		//SET THE NUMBER OF DAYS IN A MONTH
		$(".number:nth-child(38)").css("visibility", "visible");
		$(".number:nth-child(37)").css("visibility", "visible");
		$(".number:nth-child(36)").css("visibility", "visible");
		var dayInAMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
		if(dayInAMonth == 30){
			$(".number:nth-child(38)").css("visibility", "hidden");
		}
		else if(dayInAMonth == 29){
			$(".number:nth-child(38)").css("visibility", "hidden");
			$(".number:nth-child(37)").css("visibility", "hidden");
		}
		else if(dayInAMonth == 28){
			$(".number:nth-child(38)").css("visibility", "hidden");
			$(".number:nth-child(37)").css("visibility", "hidden");
			$(".number:nth-child(36)").css("visibility", "hidden");

		}

		
		unavailableDays(d);

	};

	function unavailableDays(d){
		$(".number:nth-child(n)").css("color", "lightgray");
		$(".number:nth-child(n)").css("cursor", "default");
		$(".number:nth-child(n)").off();
		//var first_available_day = 1;

		var days = [];
		$("#dropdown-list > label > input:checked").each(function(){
			days.push($(this).val());
		});


		
		//console.log(days);
		
		//DATABASE
		$(".number:nth-child(n)").css("background-color", "transparent");
		var branch = $('#branch-dropdown-title').data("branch");
		var service = $('#service-dropdown-title').data("service");
		var provider = $('#provider-dropdown-title').data("provider");
		console.log("Service ID:", service);
		var year = d.getFullYear();
		var month = d.getMonth()+ 1;
		var time_lower = ($("#time-lower").val() != "") ? $("#time-lower").val() : $("#time-lower").attr("placeholder");
		var time_upper = ($("#time-upper").val() != "") ? $("#time-upper").val() : $("#time-upper").attr("placeholder");

		
		fetch('/available_days_in/' + branch + '/' + service + '/' + provider + '/' + year + '/' + month + '/' + days + '/' + time_lower + '/' + time_upper).then(function(response){
			response.json().then(function(data){
				//console.log("Fetch available days", data)
				//first_available_day = data.available_days[0];
				$(".number").each(function(){
					if ($.inArray(parseInt($(this).text()), data.available_days) != -1) {
						//make day active
						$(this).css("cursor", "pointer");
						$(this).css("color","black");
						$(this).on("click", clickHandler);
						$(this).on("mouseenter", mouseenterHandler);
						$(this).on("mouseleave", mouseleaveHandler);

						if (typeof(clickedDate) != "undefined" && clickedDate.getDate() == parseInt($(this).text()) && clickedDate.getMonth() == d.getMonth() && clickedDate.getFullYear() == d.getFullYear()) {
							//there's an elemenent clicked
							$(this).css("background-color", "lightgray");
							$(this).off("mouseenter mouseleave");	
						}	

					} else{
						//Inactive Days
						if (typeof(clickedDate) != "undefined" && clickedDate.getDate() == parseInt($(this).text()) && clickedDate.getMonth() == d.getMonth() && clickedDate.getFullYear() == d.getFullYear()) {
							//there's an elemenent clicked
							$(".time-wrapper").css("display","none");
							clickedDate = undefined;
						}	
					}

				});
			});
		});
		
	};
	
	var mouseenterHandler = function() {
		$(this).css("background-color", "#eeeeee");
	};

	var mouseleaveHandler = function() {
		$(this).css("background-color", "transparent");
	};

	var clickHandler = function(){
		var selectedDate = new Date(activeDate.getFullYear(), activeDate.getMonth(), $(this).text());
			
		if (typeof(clickedDate) == "undefined" || selectedDate.getDate() != clickedDate.getDate() || selectedDate.getMonth() != clickedDate.getMonth() || selectedDate.getFullYear() != clickedDate.getFullYear()) {
		
			activeDate = new Date(selectedDate.getFullYear(),selectedDate.getMonth());
			clickedDate = selectedDate;
			console.log(clickedDate);

			$(".number:nth-child(n)").css("background-color", "transparent");
			$(this).css("background-color", "lightgray");	
			$(this).off("mouseenter mouseleave");

			populateTimes(clickedDate); //fetch available dates in clickeddate and populate times.

		}
		else {
			console.log("already selected");
		}

	};

	


	function populateTimes(d){
		var branch = $('#branch-dropdown-title').data("branch");
		var service = $('#service-dropdown-title').data("service");
		var provider = $('#provider-dropdown-title').data("provider");
		var date = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate();

		var time_lower = ($("#time-lower").val() != "") ? $("#time-lower").val() : $("#time-lower").attr("placeholder");
		var time_upper = ($("#time-upper").val() != "") ? $("#time-upper").val() : $("#time-upper").attr("placeholder");

		fetch('/available_slots/' + branch + '/' + service + '/' + provider + '/' + date + '/' + time_lower + '/' + time_upper).then(function(response){
			response.json().then(function(data){
				//CHANGE THIS
				$(".time-block-left").empty();
				$(".time-block-right").empty();
				$(".time-wrapper").css("display","block");
				$(".time-title").text("Select a time");
				$(".time-form").css("display", "flex");
				$("#time-user-aid").css("display", "none");

				for(let time of data.slots){
					var position;
					if (parseInt(time.substr(0,2)) < 13) {
						position = "left";
					}
					else{
						position = "right";
					}

					$(".time-block-" + position).append('<label class="label-filter"><input type="checkbox" name="A" value="'+ time + '"><span class="custom-checkbox"></span>' + time + '</label>');

				}

			});
		});
	};




	$(".time-form").on("click", "input[name='A']", function(event){
		if (this.checked) {
			var activeCheckbox = $(this);

			$(".time-title").text(activeCheckbox.val());

			$("input[name='A']").each(function () {
	            if ($(this).val() != activeCheckbox.val()) {
	            	$(this).prop("checked", false);
	            }       
	       	});


			//hide time checkboxes
			$(".time-form").css("display", "none");
			$("#time-user-aid").css("display", "block");

		}

	});


	//CHECK THIS
	$("#time-header-toggle").on("click", function(event){
		if ($(".time-form").css("display") =="none") {
			$(".time-title").text("Select a time");
			$(".time-form").css("display", "flex");
			$("#time-user-aid").css("display", "none");
		}
		else{
			if (typeof($("input[name='A']:checked").val()) != "undefined") {
				$(".time-title").text($("input[name='A']:checked").val());
				$(".time-form").css("display", "none");
				$("#time-user-aid").css("display", "block");
			}
			
		}

	});


	$("#nextmonth").on("click", function(event){
		activeDate.setMonth(activeDate.getMonth()+1);
		setNewMonth(activeDate);
	});

	$("#previousmonth").on("click", function(event){
		if ((activeDate.getMonth()-1) >= today.getMonth() || activeDate.getFullYear() > today.getFullYear()) {
			activeDate.setMonth(activeDate.getMonth()-1);
			setNewMonth(activeDate);
		}
		
	});


	//-------filter
	$("#filter-toggle").on("click", function(event){
			//onclick=""
			if ($(".filter-options-wrapper").css("display") =="block") {
				$(".filter-options-wrapper").css("display", "none");
			}
			else{
				$(".filter-options-wrapper").css("display", "block");
			}
			
	});

	/*FOOTER BUTTONS*/



	$("#confirmbtn").on("click", function(event){
		/*send data to python*/


		
		var time =  $("input[name='A']:checked").val();
		var service = $('#service-dropdown-title').data("service");
		var provider = $('#provider-dropdown-title').data("provider");


		if (time == null || service == "" || provider == "" || typeof clickedDate == "undefined") {
			//an error has occured
			if (service == "" || provider == "") {
				alert("Set the branch information");
			} else if (typeof clickedDate == "undefined") {
				alert("No day has been chosen");
			} else if (time == null) {
				alert("No time has been chosen");
			}
			else{
				alert("Error");
			}

		} else{


			console.log("save data to the database");


			var postgres_date = clickedDate.getFullYear() + "-" + (clickedDate.getMonth()+1) + "-" + clickedDate.getDate();
			var data = {'date': postgres_date, 'time': time, 'service': service, 'provider': provider};
			
			$.ajax({
				url: '/cuttem/booking',
				type: 'POST',
				data: JSON.stringify(data),
				dataType: 'json'
			}).done(function(data){
				$("header").css("display", "none");
				$("main").css("display", "none");
				$(".confirmed-view").css("display", "grid");
			});

		}

	});

	$("#nextbtn").on("click", function(event){
		var readable_date = weekdays[clickedDate.getDay()]+", "+clickedDate.getDate()+" "+months[clickedDate.getMonth()]+" "+clickedDate.getFullYear();
		var postgres_date = clickedDate.getFullYear() + "-" + (clickedDate.getMonth()+1) + "-" + clickedDate.getDate();
		var time =  $("input[name='A']:checked").val();
		var name = $("input[name='name']").val();
		var email = $("input[name='email']").val();
		var phone = $("input[name='phone']").val();

		//check each variable and send the appropiate error messages

		//clean all these values before
		$("#datetxt").text(readable_date);
		$("#timetxt").text(time);
		$("#nametxt").text(name);
		$("#emailtxt").text(email);
		$("#phonetxt").text(phone);


		//TOGGLE
		$("#nextbtn").css("display", "none");
		$("#user-data").css("display", "none");
		$("#date-and-time").css("display", "none");

		$("#review-data").css("display", "block");
		$("#confirmbtn").css("display", "block");
		$("#editbtn").css("display", "block");
		$(".page-header").text("CONFIRM BOOKING");

	});

	$("#editbtn").on("click", function(event){
		$("#nextbtn").css("display", "block");
		$("#user-data").css("display", "block");
		$("#date-and-time").css("display", "block");
		$(".page-header").text("BOOK BOOKING");

		$("#review-data").css("display", "none");
		$("#confirmbtn").css("display", "none");
		$("#editbtn").css("display", "none");
	});

	

	/*NAVBAR*/
	$("#open-nav").on("click", function(event){
		$('.mobile-nav').css("display", "block");
		$('html').css("overflow", "hidden");
		$('.mobile-nav').css("overflow", "auto");

	});

	$("#close-nav").on("click", function(event){
		$('.mobile-nav').css("display", "none");
		$('html').css("overflow", "auto");
	});


	/*FILTERS*/
	$("#applyBtn").on("click", function(event){

		var time_lower = ($("#time-lower").val() != "") ? $("#time-lower").val() : $("#time-lower").attr("placeholder");
		var time_upper = ($("#time-upper").val() != "") ? $("#time-upper").val() : $("#time-upper").attr("placeholder");
		var t_lower = new Date('July 1, 1999 ' + time_lower);
		var t_upper = new Date('July 1, 1999 ' + time_upper);

		var time =  $("input[name='A']:checked").val();
		var service = $('#service-dropdown-title').data("service");
		var provider = $('#provider-dropdown-title').data("provider");

		if (service == "" || provider == "" || $("#dropdown-list > label > input:checked").length == 0 || t_lower > t_upper) {
			if (service == "" || provider == ""){
				alert("Set the branch information");
			} else if ($("#dropdown-list > label > input:checked").length == 0) {
			alert("No days of the week has been chosen to be filtered");
			} else if(t_lower > t_upper){
				alert("Time filter reversed error")

			}
		} else{
			unavailableDays(activeDate);

			if (typeof clickedDate != "undefined") {
				populateTimes(clickedDate);
			}

		}
		
	});

	$("#clearBtn").on("click", function(event){

		$(".days-checkbox").prop("checked", true);
		$(".time-input").val("");

		var time =  $("input[name='A']:checked").val();
		var service = $('#service-dropdown-title').data("service");
		var provider = $('#provider-dropdown-title').data("provider");

		if (service == "" || provider == "") {
			alert("Set the branch information");
		} else{
			unavailableDays(activeDate);

			if (typeof clickedDate != "undefined") {
				populateTimes(clickedDate);
			}

		}


		

	});





};

$(document).ready(main);

