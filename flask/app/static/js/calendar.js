
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




	setNewMonth(activeDate);

	displayBookings("First Load");


	//setInterval(displayBookings, 10000);



	function displayBookings(){

		console.log("Refresh")
		var d = new Date(2020, 5, 3);//put the date in function
		fetch('/booked_slots/' + d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate()).then(function(response){
			response.json().then(function(data){
				$(".time-list").empty();
				for(let booking of data.bookings){
					$(".time-list").append('<li><span class="dot">&middot;</span><div><div class="time-list-time">' + booking.time_start +' - '+ booking.time_end + '</div> <div class="time-list-description">'+ booking.service + ' <span>&middot; </span>' + booking.client + '</div></div><a class="general-btn details-btn">Details ></a></li>');
				}

			});

		});

	};



	

	setBranches();
	setNewMonth(activeDate);

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
					$("#provider-dropdown").append('<li>Any</li>');
				}
				

				for(let provider of data.providers){
					$("#provider-dropdown").append('<li value="'+ provider.id +'">'+ provider.name + '</li>');
				}

			});

		});

	};

	$("#provider-dropdown").on("click", "li", function(event){
		$('#provider-dropdown-title').text($(this).text());
		$('#provider-dropdown-title').data("provider", $(this).val());
		setNewMonth(activeDate); /**/

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




		//DATABASE
		/*
		$(".number:nth-child(n)").css("background-color", "transparent");
		var year = d.getFullYear();
		var month = d.getMonth()+ 1;
		fetch('/available_days_in/' + year + '/' + month).then(function(response){
			response.json().then(function(data){
				$(".number").each(function(){
					if ($.inArray(parseInt($(this).text()), data.available_days) != -1) {
						//make day active
						$(this).css("color","black");
						$(this).on("click", clickHandler);
						$(this).on("mouseenter", mouseenterHandler);
						$(this).on("mouseleave", mouseleaveHandler);

						if (typeof(clickedDate) != "undefined" && clickedDate.getDate() == parseInt($(this).text()) && clickedDate.getMonth() == d.getMonth() && clickedDate.getFullYear() == d.getFullYear()) {
							//there's an elemenent clicked in this month
							$(this).css("background-color", "lightgray");
							$(this).off("mouseenter mouseleave");	
						}	
					} 
					else{
						//make day inactive
						$(this).css("color","lightgray");
						$(this).off("click mouseenter mouseleave");
					}
				});
			});
		});*/

		$(".number").each(function(){
			//make day active
			$(this).css("color","black");
			$(this).on("click", clickHandler);
			$(this).on("mouseenter", mouseenterHandler);
			$(this).on("mouseleave", mouseleaveHandler);
		});
	};

	
	var mouseenterHandler = function() {
    	$(this).css("cursor", "pointer");
		$(this).css("background-color", "#eeeeee");
	};

	var mouseleaveHandler = function() {
		$(this).css("background-color", "transparent");
	};

	var clickHandler = function(){
		var selectedDate = new Date(activeDate.getFullYear(), activeDate.getMonth(), $(this).text());
			
		if (typeof(clickedDate) == "undefined" || selectedDate.getDate() != clickedDate.getDate() || selectedDate.getMonth() != clickedDate.getMonth() || selectedDate.getFullYear() != clickedDate.getFullYear()) {
		
			console.log("selected");

			activeDate = new Date(selectedDate.getFullYear(),selectedDate.getMonth());
			clickedDate = selectedDate;

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
		

		fetch('/available_slots/' + branch + '/' + service + '/' + provider + '/' + date).then(function(response){
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
		$(".page-header").text("CONFIRM APPOINTMENT");

	});

	$("#editbtn").on("click", function(event){
		$("#nextbtn").css("display", "block");
		$("#user-data").css("display", "block");
		$("#date-and-time").css("display", "block");
		$(".page-header").text("BOOK APPOINTMENT");

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
};

$(document).ready(main);
