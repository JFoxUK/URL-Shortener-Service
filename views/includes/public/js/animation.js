$(document).ready(function(){
    $(".login_button").click(function() {
       $(".form-box").addClass("hidden")
       $(".login-box").removeClass("hidden")
    }) 
    $(".back_button").click(function() {
        $(".login-box").addClass("hidden")
        $(".form-box").removeClass("hidden")
     })
});