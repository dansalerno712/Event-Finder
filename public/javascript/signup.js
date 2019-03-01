$(document).ready(function() {
    // getting HTML elements
    var usernameInput = document.getElementById("username")
    var emailInput = document.getElementById("email")
    var passwordInput =  document.getElementById("password")
    var confirmPasswordInput =  document.getElementById("confirmPassword")
    var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;


    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');

    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function(form) {
      form.addEventListener('submit', function(event) {
        // reset validity of any inputs with further checks
        confirmPasswordInput.setCustomValidity("");
        emailInput.setCustomValidity("");

        // default validity check
        if (form.checkValidity() === false) {
            // if form is not valid, prevent submission
            event.preventDefault();
            event.stopPropagation();
        } else{
            // make sure both passwords match
            if (passwordInput.value !== confirmPasswordInput.value) {
                event.preventDefault();
                confirmPasswordInput.setCustomValidity("Passwords do not match");
                document.getElementById("invalidConfirmPassword").innerHTML = "Passwords do not match."
            }

            // better email regex check as fallback
            if (!(email.value).match(emailRegex)) {
                event.preventDefault();
                emailInput.setCustomValidity("Invalid email");
            }
        }
        // Bootstrap's way of validating a form if everything validates correctly
        form.classList.add('was-validated');
      }, false);
    });
});
