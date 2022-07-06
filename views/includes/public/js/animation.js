$(window).on("load", function () {
	$(".tooltip-info").on("click", function () {
		$(".tooltip-container-info").addClass("hidden");
		$(".tooltip-container-back").removeClass("hidden");
		$(".form").addClass("hidden");
		$(".url-container").removeClass("hidden");
	});
	$(".tooltip-back").on("click", function () {
		$(".tooltip-container-back").addClass("hidden");
		$(".tooltip-container-info").removeClass("hidden");
		$(".form").removeClass("hidden");
		$(".url-container").addClass("hidden");
	});
   $( "#createURLButton" ).on("submit", function () {
      alert( "Handler for .submit() called." );
    });
});
