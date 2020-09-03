
var main = function(){
	"use strict";

	$("#close-work").on("click", function(){
		$(".work-display-wrapper").css("display", "none");
		$(".tech-used").empty();
	});

	$("#booking").on("click", function(){
		$("#title").text("Booking");
		$("#description").text("A website that allows clients to make bookings, and employees to manage them.");
		$(".tech-used").append('<li>html</li>');
		$(".tech-used").append('<li>css</li>');
		$(".tech-used").append('<li>js</li>');
		$(".tech-used").append('<li>flask</li>');
		$(".tech-used").append('<li>python</li>');
		$(".tech-used").append('<li>postgres</li>');
		$(".tech-used").append('<li>vagrant</li>');
		$(".tech-used").append('<li>docker</li>');
		$(".tech-used").append('<li>git</li>');
		$("#more-details").text("Got invaluable experience from developing the front end to self-hosting the website on my Linux server. I would highlight designing the database and learning Flask as the most rewarding aspect.");

		$("#demo-btn").css("display", "inline-block");
		$("#demo-btn").attr("href", "http://www.shilvan.com/cuttem");
		
		$("#code-btn").css("display", "inline-block");
		$("#code-btn").attr("href", "https://www.github.com/shilvan/appointment");

		$(".work-display-wrapper").css("display", "grid");
		$(".work-display").scrollTop(0);

	});

	$("#ecommerce").on("click", function(){
		$("#title").text("E-Commerce");
		$("#description").text("An e-Commerce website.");
		$(".tech-used").append('<li>wordpress</li>');
		$(".tech-used").append('<li>woo-commerce</li>');
		$(".tech-used").append('<li>stripe api</li>');
		
		$("#more-details").text("Implemented a Woo-commerce template through Wordpress. It taught me a lot about the platform and its plugins.");

		$("#demo-btn").css("display", "inline-block");
		$("#demo-btn").attr("href","https://staging.vaxoo.co.uk");
		
		$("#code-btn").css("display", "none");
		$("#code-btn").attr("href", "https://www.github.com/shilvan");

		$(".work-display-wrapper").css("display", "grid");
		$(".work-display").scrollTop(0);
	});

	$("#calculator").on("click", function(){
		$("#title").text("C# Calculator");
		$("#description").text("An app that uses regex for string manipulation and coded mathematical order and operations to calculate user entries.");
		$(".tech-used").append('<li>c#</li>');
		$(".tech-used").append('<li>regex</li>');
		
		$("#more-details").text("Used Pluralsight courses to learn the basic concepts, best practices… This project instilled discipline in me, I used to learn c# before school at around 6 am.");

		$("#demo-btn").css("display", "none");

		$("#code-btn").css("display", "inline-block");
		$("#code-btn").attr("href", "https://www.github.com/shilvan/csharp-calculator");

		$(".work-display-wrapper").css("display", "grid");
		$(".work-display").scrollTop(0);
	});

	$("#portfolio").on("click", function(){
		$("#title").text("My Portfolio");
		$("#description").text("Portfolio website to display my projects.");
		$(".tech-used").append('<li>html</li>');
		$(".tech-used").append('<li>css</li>');
		$(".tech-used").append('<li>js</li>');
		$(".tech-used").append('<li>git</li>');
		
		$("#more-details").text("It helped me to learn what it takes to design a html template from zero and get used to version control.");

		$("#demo-btn").css("display", "inline-block");
		$("#demo-btn").attr("href", "https://shilvan.github.io/my-portfolio/");
		
		$("#code-btn").css("display", "inline-block");
		$("#code-btn").attr("href", "https://www.github.com/shilvan/my-portfolio");

		$(".work-display-wrapper").css("display", "grid");
		$(".work-display").scrollTop(0);

	});

};

$(document).ready(main);

