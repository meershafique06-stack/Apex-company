```javascript
import { auth, db } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const signupSection = document.getElementById("signupSection");
const heroSection = document.getElementById("heroSection");
const signupForm = document.getElementById("signupForm");
const signupBtn = document.getElementById("signupBtn");
const formMessage = document.getElementById("formMessage");
const welcomeUser = document.getElementById("welcomeUser");
const logoutBtn = document.getElementById("logoutBtn");


function showMessage(message, color) {
    if (!formMessage) return;

    formMessage.textContent = message;
    formMessage.style.color = color;
}


function showHero(user) {
    if (signupSection) {
        signupSection.style.display = "none";
    }

    if (heroSection) {
        heroSection.style.display = "flex";
    }

    if (welcomeUser) {
        const name = user.displayName || user.email || "User";
        welcomeUser.textContent = "Welcome, " + name;
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function showSignup() {
    if (signupSection) {
        signupSection.style.display = "flex";
    }

    if (heroSection) {
        heroSection.style.display = "none";
    }

    if (welcomeUser) {
        welcomeUser.textContent = "";
    }
}


async function saveSignup(user, name, email) {
    try {
        await addDoc(collection(db, "userActivity"), {
            uid: user.uid,
            name: name,
            email: email,
            action: "Signup",
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            createdAt: serverTimestamp()
        });

        console.log("Signup record saved successfully.");

    } catch (error) {
        console.error("Firestore record error:", error);
    }
}


if (signupForm) {

    signupForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const nameInput = document.getElementById("userName");
        const emailInput = document.getElementById("userEmail");
        const passwordInput = document.getElementById("userPassword");

        const name = nameInput
            ? nameInput.value.trim()
            : "";

        const email = emailInput
            ? emailInput.value.trim().toLowerCase()
            : "";

        const password = passwordInput
            ? passwordInput.value
            : "";


        if (!name) {
            showMessage(
                "Please enter your full name.",
                "#dc2626"
            );
            return;
        }


        if (!email) {
            showMessage(
                "Please enter your email address.",
                "#dc2626"
            );
            return;
        }


        if (password.length < 6) {
            showMessage(
                "Password must contain at least 6 characters.",
                "#dc2626"
            );
            return;
        }


        if (signupBtn) {
            signupBtn.disabled = true;
            signupBtn.textContent = "Creating Account...";
        }

        showMessage(
            "Creating your account...",
            "#2563eb"
        );


        try {

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;


            await updateProfile(user, {
                displayName: name
            });


            signupForm.reset();


            /*
             * IMPORTANT:
             * Hero opens immediately after successful
             * Firebase Authentication.
             */
            showHero(user);


            /*
             * Save signup information for admin page.
             * If Firestore fails, the hero still remains open.
             */
            await saveSignup(
                user,
                name,
                email
            );


        } catch (error) {

            console.error(
                "Firebase signup error:",
                error
            );

            let message =
                "Unable to create your account.";


            if (error.code === "auth/email-already-in-use") {

                message =
                    "This email is already registered. Please use another email.";

            } else if (error.code === "auth/invalid-email") {

                message =
                    "Please enter a valid email address.";

            } else if (error.code === "auth/weak-password") {

                message =
                    "Password must contain at least 6 characters.";

            } else if (error.code === "auth/operation-not-allowed") {

                message =
                    "Email/password signup is not enabled in Firebase.";

            } else if (error.code === "auth/network-request-failed") {

                message =
                    "Network error. Please check your internet connection.";

            } else if (error.message) {

                message = error.message;
            }


            showMessage(
                message,
                "#dc2626"
            );


            if (signupBtn) {
                signupBtn.disabled = false;
                signupBtn.textContent = "Create Account";
            }
        }

    });
}


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function () {

            try {

                await signOut(auth);

                showSignup();

                if (signupForm) {
                    signupForm.reset();
                }

                showMessage(
                    "You have been logged out.",
                    "#2563eb"
                );


            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

                showMessage(
                    "Logout failed. Please try again.",
                    "#dc2626"
                );
            }
        }
    );
}


onAuthStateChanged(
    auth,
    function (user) {

        if (user) {
            showHero(user);
        } else {
            showSignup();
        }

    }
);
```
