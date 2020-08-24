
var main = function(){
	"use strict";

	$("#close-work").on("click", function(){
		$(".work-display-wrapper").css("display", "none");


	});

	$(".project-link").on("click", function(){
		$(".work-display-wrapper").css("display", "grid");


	});


	

};

$(document).ready(main);

