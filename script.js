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
const signupButton = document.getElementById("signupBtn");
const formMessage = document.getElementById("formMessage");
const welcomeUser = document.getElementById("welcomeUser");
const logoutButton = document.getElementById("logoutBtn");

function showMessage(message, type) {
    if (!formMessage) return;

    formMessage.textContent = message;

    if (type === "success") {
        formMessage.style.color = "#16a34a";
    } else if (type === "error") {
        formMessage.style.color = "#dc2626";
    } else {
        formMessage.style.color = "#2563eb";
    }
}

function showHero(user) {
    if (signupSection) {
        signupSection.style.display = "none";
    }

    if (heroSection) {
        heroSection.style.display = "flex";
    }

    if (welcomeUser) {
        welcomeUser.textContent =
            "Welcome, " + (user.displayName || user.email || "User");
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

        console.log("Signup record saved.");
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

        const name = nameInput ? nameInput.value.trim() : "";
        const email = emailInput
            ? emailInput.value.trim().toLowerCase()
            : "";
        const password = passwordInput
            ? passwordInput.value
            : "";

        if (name.length === 0) {
            showMessage("Please enter your full name.", "error");
            return;
        }

        if (email.length === 0) {
            showMessage("Please enter your email address.", "error");
            return;
        }

        if (password.length < 6) {
            showMessage(
                "Password must contain at least 6 characters.",
                "error"
            );
            return;
        }

        if (signupButton) {
            signupButton.disabled = true;
            signupButton.textContent = "Creating Account...";
        }

        showMessage("Creating your account...", "info");

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

            showHero(user);

            await saveSignup(user, name, email);

        } catch (error) {
            console.error("Signup error:", error);

            let message = "Unable to create your account.";

            switch (error.code) {
                case "auth/email-already-in-use":
                    message =
                        "This email is already registered. Please use another email.";
                    break;

                case "auth/invalid-email":
                    message =
                        "Please enter a valid email address.";
                    break;

                case "auth/weak-password":
                    message =
                        "Password must contain at least 6 characters.";
                    break;

                case "auth/operation-not-allowed":
                    message =
                        "Email/password signup is not enabled in Firebase.";
                    break;

                case "auth/network-request-failed":
                    message =
                        "Network error. Please check your internet connection.";
                    break;

                default:
                    message =
                        error.message || "Unable to create your account.";
            }

            showMessage(message, "error");

            if (signupButton) {
                signupButton.disabled = false;
                signupButton.textContent = "Create Account";
            }
        }
    });
}

if (logoutButton) {
    logoutButton.addEventListener("click", async function () {
        try {
            await signOut(auth);
            showSignup();

            if (signupForm) {
                signupForm.reset();
            }

            showMessage("You have been logged out.", "info");

        } catch (error) {
            console.error("Logout error:", error);
            showMessage("Logout failed. Please try again.", "error");
        }
    });
}

onAuthStateChanged(auth, function (user) {
    if (user) {
        showHero(user);
    } else {
        showSignup();
    }
});
```
