/* =========================================================
APEX COMPANY
USER PAGE JAVASCRIPT
========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", function () {

```
const signupForm = document.getElementById("signupForm");
const formMessage = document.getElementById("formMessage");
const logoutBtn = document.getElementById("logoutBtn");
const userEmail = document.getElementById("userEmail");

const signupSection = document.getElementById("signupSection");
const heroSection = document.getElementById("heroSection");

const STORAGE_KEY = "apexCompanyUsers";
const CURRENT_USER_KEY = "apexCompanyCurrentUser";


/* ---------------------------------------------------------
   HELPERS
--------------------------------------------------------- */

function getUsers() {
    try {
        const users = JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        );

        return Array.isArray(users) ? users : [];

    } catch (error) {
        return [];
    }
}


function saveUsers(users) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(users)
    );
}


function getCurrentUser() {
    try {
        return JSON.parse(
            localStorage.getItem(CURRENT_USER_KEY)
        );

    } catch (error) {
        return null;
    }
}


function showMessage(message, type) {

    if (!formMessage) {
        return;
    }

    formMessage.textContent = message;

    if (type === "success") {
        formMessage.style.color = "#15803d";
    } else {
        formMessage.style.color = "#dc2626";
    }
}


/* ---------------------------------------------------------
   SHOW LOGGED-IN USER
--------------------------------------------------------- */

function showUser(user) {

    document.body.classList.add("user-logged-in");

    if (signupSection) {
        signupSection.style.display = "none";
    }

    if (heroSection) {
        heroSection.style.display = "flex";
    }

    if (userEmail && user.email) {
        userEmail.textContent =
            "Connected account: " + user.email;
    }
}


/* ---------------------------------------------------------
   SHOW SIGNUP
--------------------------------------------------------- */

function showSignup() {

    document.body.classList.remove("user-logged-in");

    if (signupSection) {
        signupSection.style.display = "flex";
    }

    if (heroSection) {
        heroSection.style.display = "none";
    }

    if (userEmail) {
        userEmail.textContent = "";
    }
}


/* ---------------------------------------------------------
   CHECK EXISTING SESSION
--------------------------------------------------------- */

const currentUser = getCurrentUser();

if (currentUser) {
    showUser(currentUser);
} else {
    showSignup();
}


/* ---------------------------------------------------------
   SIGNUP
--------------------------------------------------------- */

if (signupForm) {

    signupForm.addEventListener("submit", function (event) {

        event.preventDefault();


        const nameInput =
            document.getElementById("fullName");

        const emailInput =
            document.getElementById("email");

        const passwordInput =
            document.getElementById("password");

        const signupBtn =
            document.getElementById("signupBtn");


        const fullName =
            nameInput.value.trim();

        const email =
            emailInput.value.trim().toLowerCase();

        const password =
            passwordInput.value;


        if (!fullName || !email || !password) {

            showMessage(
                "Please complete all fields.",
                "error"
            );

            return;
        }


        if (password.length < 6) {

            showMessage(
                "Password must contain at least 6 characters.",
                "error"
            );

            return;
        }


        const users = getUsers();


        const existingUser =
            users.find(function (user) {
                return user.email === email;
            });


        if (existingUser) {

            showMessage(
                "An account with this email already exists.",
                "error"
            );

            return;
        }


        if (signupBtn) {
            signupBtn.disabled = true;
            signupBtn.textContent = "Creating Account...";
        }


        const newUser = {

            id:
                Date.now().toString(),

            fullName:
                fullName,

            email:
                email,

            signupDate:
                new Date().toISOString()

        };


        users.push(newUser);

        saveUsers(users);


        localStorage.setItem(
            CURRENT_USER_KEY,
            JSON.stringify(newUser)
        );


        signupForm.reset();


        showMessage(
            "Account created successfully.",
            "success"
        );


        setTimeout(function () {

            showUser(newUser);

        }, 500);

    });
}


/* ---------------------------------------------------------
   LOGOUT
--------------------------------------------------------- */

if (logoutBtn) {

    logoutBtn.addEventListener("click", function () {

        localStorage.removeItem(
            CURRENT_USER_KEY
        );

        showSignup();

        if (formMessage) {
            formMessage.textContent = "";
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });
}
```

});
