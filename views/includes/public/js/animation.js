$(window).on("load", function () {
	$(".tooltip-info").on("click", function () {
		$(".tooltip-container-info").addClass("hidden");
		$(".tooltip-container-back").removeClass("hidden");
		$(".form").addClass("hidden");
      $(".error-message").addClass("hidden");
      $(".info-short-url-message").addClass("hidden");
      $(".short-url-message").addClass("hidden");
		$(".url-container").removeClass("hidden");
	});
	$(".tooltip-back").on("click", function () {
		$(".tooltip-container-back").addClass("hidden");
		$(".tooltip-container-info").removeClass("hidden");
      $(".form").removeClass("hidden");
		$(".error-message").removeClass("hidden");
      $(".info-short-url-message").removeClass("hidden");
      $(".short-url-message").removeClass("hidden");
      $(".toast-message").removeClass("hidden");
		$(".url-container").addClass("hidden");
	});
   $(".copy-button").on("click", function () {
      $(".copy-button").html("Copied!");
   });
});
