$(window).on("load", function(){
    $(".login_button").on("click", function() {
       $(".form-box").addClass("hidden")
       $(".login-box").removeClass("hidden")
    }) 
    $(".back_button").on("click", function() {
        $(".login-box").addClass("hidden")
        $(".form-box").removeClass("hidden")
     })
});