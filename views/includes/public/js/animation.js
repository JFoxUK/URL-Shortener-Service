$(document).ready(function(){
    $(".login_button").addEventListener('click', function(e){
       $(".form-box").addClass("hidden")
       $(".login-box").removeClass("hidden")
    }) 
    $(".back_button").addEventListener('click', function(e){
        $(".login-box").addClass("hidden")
        $(".form-box").removeClass("hidden")
     })
});