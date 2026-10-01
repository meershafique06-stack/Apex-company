```javascript
// =========================================
// APEX COMPANY
// USER SIGNUP + FIREBASE
// =========================================

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

// =========================================
// HTML ELEMENTS
// =========================================

const signupSection = document.getElementById("signupSection");
const heroSection = document.getElementById("heroSection");
const signupForm = document.getElementById("signupForm");
const signupBtn = document.getElementById("signupBtn");
const formMessage = document.getElementById("formMessage");
const welcomeUser = document.getElementById("welcomeUser");
const logoutBtn = document.getElementById("logoutBtn");

// =========================================
// SHOW MESSAGE
// =========================================

function showMessage(message, color) {
    if (!formMessage) return;

    formMessage.textContent = message;
    formMessage.style.color = color;
}

// =========================================
// SAVE SIGNUP TO FIRESTORE
// =========================================

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

        console.log("Signup saved successfully.");
    } catch (error) {
        console.error("Firestore signup error:", error);
    }
}

// =========================================
// SHOW HERO
// =========================================

function showHero(user) {
    if (signupSection) {
        signupSection.style.display = "none";
    }

    if (heroSection) {
        heroSection.style.display = "flex";
    }

    if (welcomeUser) {
        const displayName =
            user.displayName ||
            user.email ||
            "User";

        welcomeUser.textContent =
            "Welcome, " + displayName;
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// =========================================
// SHOW SIGNUP
// =========================================

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

// =========================================
// USER SIGNUP
// =========================================

if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document
            .getElementById("userName")
            .value
            .trim();

        const email = document
            .getElementById("userEmail")
            .value
            .trim()
            .toLowerCase();

        const password = document
            .getElementById("userPassword")
            .value;

        // ---------------------------------
        // VALIDATION
        // ---------------------------------

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

        // ---------------------------------
        // BUTTON
        // ---------------------------------

        signupBtn.disabled = true;
        signupBtn.textContent = "Creating Account...";

        showMessage(
            "Creating your account...",
            "#2563eb"
        );

        try {
            // ---------------------------------
            // CREATE FIREBASE ACCOUNT
            // ---------------------------------

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;

            // ---------------------------------
            // SAVE USER NAME
            // ---------------------------------

            await updateProfile(user, {
                displayName: name
            });

            // ---------------------------------
            // SHOW HERO IMMEDIATELY
            // ---------------------------------

            signupForm.reset();

            showMessage(
                "Account created successfully!",
                "#16a34a"
            );

            showHero(user);

            // ---------------------------------
            // SAVE ADMIN RECORD
            // ---------------------------------

            await saveSignup(
                user,
                name,
                email
            );

        } catch (error) {
            console.error("Signup error:", error);

            let message =
                "Unable to create your account.";

            if (
                error.code ===
                "auth/email-already-in-use"
            ) {
                message =
                    "This email is already registered. Please use another email.";
            }

            else if (
                error.code ===
                "auth/invalid-email"
            ) {
                message =
                    "Please enter a valid email address.";
            }

            else if (
                error.code ===
                "auth/weak-password"
            ) {
                message =
                    "Password is too weak. Use at least 6 characters.";
            }

            else if (
                error.code ===
                "auth/operation-not-allowed"
            ) {
                message =
                    "Email/password signup is not enabled in Firebase Authentication.";
            }

            else if (
                error.code ===
                "auth/network-request-failed"
            ) {
                message =
                    "Network error. Please check your internet connection.";
            }

            showMessage(
                message,
                "#dc2626"
            );

            signupBtn.disabled = false;
            signupBtn.textContent = "Create Account";
        }
    });
}

// =========================================
// LOGOUT
// =========================================

if (logoutBtn) {
    logoutBtn.addEventListener("click", async function () {
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
            console.error("Logout error:", error);

            showMessage(
                "Logout failed. Please try again.",
                "#dc2626"
            );
        }
    });
}

// =========================================
// CHECK LOGIN STATE
// =========================================

onAuthStateChanged(auth, function (user) {
    if (user) {
        showHero(user);
    } else {
        showSignup();
    }
});
```
