function validateForm() {
    let email = document.forms['registerForm']['email'];
    let password = document.forms['registerForm']['password'];
    let confirmPassword = document.forms['registerForm']['confirmPassword'];
    let fname = document.forms['registerForm']['fname'];
    let lname = document.forms['registerForm']['lname'];
    let phone = document.forms['registerForm']['phone'];

    let errors = false;

    if (!validEmail(email.value)) {
        document.getElementById('emailMessage').style.display = "block";

        email.focus();
        errors = true;
    } else {
        document.getElementById('emailMessage').style.display = "none";
    }

    if (!validPassword(password.value)) {
        document.getElementById('passwordMessage').style.display = "block";
        if (!errors) {
            password.focus();
            errors = true;
        }

    } else {
        document.getElementById('passwordMessage').style.display = "none";
    }

    if (confirmPassword.value !== password.value) {
        document.getElementById('confirmMessage').style.display = "block";
        if (!errors) {
            confirmPassword.focus();
            errors = true;
        }

    } else {
        document.getElementById('confirmMessage').style.display = "none";
    }


    if (fname.value === '') {
        document.getElementById('fnameMessage').style.display = "block";
        if (!errors) {
            fname.focus();
            errors = true;
        }

    } else {
        document.getElementById('fnameMessage').style.display = "none";
    }

    if (lname.value === '') {
        document.getElementById('lnameMessage').style.display = "block";
        if (!errors) {
            lname.focus();
            errors = true;
        }

    } else {
        document.getElementById('lnameMessage').style.display = "none";
    }

    if (!validPhoneNumber(phone.value)) {
        document.getElementById('phoneMessage').style.display = "block";
        if (!errors) {
            phone.focus();
            errors = true;
        }

    } else {
        document.getElementById('phoneMessage').style.display = "none";
    }

    if (errors)
        return false;
    else
        return true;


}

function validEmail(email) {
    let emailRegEx = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    return emailRegEx.test(email);
}

function validPassword(password) {
    if (password === '' || password.length < 8)
        return false;
    else return true;

}

function validPhoneNumber(phone) {
    let usPhoneNumRegEx = /^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})$/;
    return usPhoneNumRegEx.test(phone);
}