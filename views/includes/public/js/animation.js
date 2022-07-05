$(window).on("load", function(){
    $(".tooltip-info").on("click", function() {
       $(".tooltip-container-info").addClass("hidden")
       $(".tooltip-container-back").removeClass("hidden")
       $(".form-container-info").addClass("hidden")
       $(".url-container").removeClass("hidden")
    }) 
    $(".tooltip-back").on("click", function() {
      $(".tooltip-container-back").addClass("hidden")
      $(".tooltip-container-info").removeClass("hidden")
      $(".form-container-info").removeClass("hidden")
      $(".url-container").addClass("hidden")
   }) 
});

