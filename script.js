// =========================================
// APEX COMPANY
// FIREBASE GOOGLE LOGIN
// =========================================

import {
  auth,
  googleProvider,
  db
} from "./firebase-config.js";

import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// =========================================
// ELEMENTS
// =========================================

const signupSection =
  document.getElementById("signupSection");

const heroSection =
  document.getElementById("heroSection");

const googleLoginBtn =
  document.getElementById("googleLoginBtn");

const googleLogoutBtn =
  document.getElementById("googleLogoutBtn");

const formMessage =
  document.getElementById("formMessage");

const userEmail =
  document.getElementById("userEmail");


// =========================================
// SAVE ACTIVITY TO FIRESTORE
// =========================================

async function saveActivity(user, action) {

  try {

    await addDoc(
      collection(db, "userActivity"),
      {

        uid: user.uid,

        name:
          user.displayName || "Google User",

        email:
          user.email || "",

        action: action,

        date:
          new Date().toLocaleDateString(),

        time:
          new Date().toLocaleTimeString(),

        createdAt:
          serverTimestamp()

      }
    );

    console.log(
      "Activity saved:",
      action
    );

  } catch (error) {

    console.error(
      "Firestore error:",
      error
    );

  }

}


// =========================================
// SHOW HERO
// =========================================

function showHero(user) {

  signupSection.style.display = "none";

  heroSection.style.display = "flex";

  userEmail.textContent =
    user.email || "Google User";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// =========================================
// SHOW LOGIN
// =========================================

function showLogin() {

  signupSection.style.display = "flex";

  heroSection.style.display = "none";

  userEmail.textContent = "—";

}


// =========================================
// GOOGLE LOGIN
// =========================================

googleLoginBtn.addEventListener(
  "click",
  async function() {

    try {

      formMessage.textContent =
        "Opening Google login...";

      formMessage.style.color =
        "#2563eb";


      const result =
        await signInWithPopup(
          auth,
          googleProvider
        );


      const user =
        result.user;


      await saveActivity(
        user,
        "Login"
      );


      formMessage.textContent =
        "Google login successful!";

      formMessage.style.color =
        "#16a34a";


      showHero(user);


    } catch (error) {

      console.error(
        "Google login error:",
        error
      );


      formMessage.textContent =
        "Google login was cancelled or could not be completed.";

      formMessage.style.color =
        "#dc2626";

    }

  }
);


// =========================================
// GOOGLE LOGOUT
// =========================================

googleLogoutBtn.addEventListener(
  "click",
  async function() {

    try {

      await signOut(auth);

      showLogin();

      formMessage.textContent =
        "You have been logged out.";

      formMessage.style.color =
        "#2563eb";


    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

    }

  }
);


// =========================================
// CHECK LOGIN STATE
// =========================================

onAuthStateChanged(
  auth,
  function(user) {

    if (user) {

      showHero(user);

    } else {

      showLogin();

    }

  }
);