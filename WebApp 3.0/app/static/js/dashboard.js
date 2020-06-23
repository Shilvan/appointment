
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

	displayBookings(activeDate);


	setInterval(function() { displayBookings(clickedDate); }, 5000);



	function displayBookings(d){

		if (typeof(d) == "undefined"){
			d = activeDate;
		}

		console.log("Refresh");
		fetch('/booked_slots/' + d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate()).then(function(response){
			response.json().then(function(data){
				$(".time-list").empty();
				for(let booking of data.bookings){
					$(".time-list").append('<li><span class="dot">&middot;</span><div><div class="time-list-time">' + booking.time_start +' - '+ booking.time_end + '</div> <div class="time-list-description">'+ booking.service + ' <span>&middot; </span>' + booking.client + '</div></div><a class="general-btn details-btn">Details ></a></li>');
				}

				$("#bookings-text").text(weekdays[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear());

			});

		});

	};

	


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

			displayBookings(clickedDate); //fetch available dates in clickeddate and populate times.

		}
		else {
			console.log("already selected");
		}

	};



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

