$(window).on("load", function () {
	$(".tooltip-info").on("click", function () {
		$(".tooltip-container-info").addClass("hidden");
		$(".tooltip-container-back").removeClass("hidden");
		$(".form").addClass("hidden");
      $("toast-message").addClass("hidden");
		$(".url-container").removeClass("hidden");
	});
	$(".tooltip-back").on("click", function () {
		$(".tooltip-container-back").addClass("hidden");
		$(".tooltip-container-info").removeClass("hidden");
		$(".form").removeClass("hidden");
      $("toast-message").removeClass("hidden");
		$(".url-container").addClass("hidden");
	});
   $(".copy-button").on("click", function () {
      $(".copy-button").text() = 'Copied!';
   });
});
