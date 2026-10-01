// =========================================
// APEX COMPANY
// FIREBASE ADMIN LOGIN + DASHBOARD
// =========================================

import {
  db
} from "./firebase-config.js";

import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// =========================================
// ADMIN CREDENTIALS
// =========================================

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";


// =========================================
// HTML ELEMENTS
// =========================================

const adminLoginSection =
  document.getElementById("adminLoginSection");

const adminDashboard =
  document.getElementById("adminDashboard");

const adminLoginForm =
  document.getElementById("adminLoginForm");

const adminLoginMessage =
  document.getElementById("adminLoginMessage");

const adminLogoutBtn =
  document.getElementById("adminLogoutBtn");

const totalUsers =
  document.getElementById("totalUsers");

const totalActivities =
  document.getElementById("totalActivities");

const latestActivity =
  document.getElementById("latestActivity");

const usersTableBody =
  document.getElementById("usersTableBody");

const emptyState =
  document.getElementById("emptyState");

const clearUsersBtn =
  document.getElementById("clearUsersBtn");


// =========================================
// SHOW DASHBOARD
// =========================================

async function showDashboard() {

  adminLoginSection.style.display = "none";

  adminDashboard.style.display = "block";

  await displayRecords();

}


// =========================================
// SHOW LOGIN
// =========================================

function showLogin() {

  adminLoginSection.style.display = "flex";

  adminDashboard.style.display = "none";

}


// =========================================
// ADMIN LOGIN
// =========================================

adminLoginForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();

    const email =
      document
        .getElementById("adminEmail")
        .value
        .trim()
        .toLowerCase();

    const password =
      document
        .getElementById("adminPassword")
        .value;

    if (
      email === ADMIN_EMAIL &&
      password === ADMIN_PASSWORD
    ) {

      sessionStorage.setItem(
        "apexAdminLoggedIn",
        "true"
      );

      adminLoginMessage.textContent =
        "Admin login successful.";

      adminLoginMessage.style.color =
        "#16a34a";

      adminLoginForm.reset();

      await showDashboard();

      return;

    }

    adminLoginMessage.textContent =
      "Invalid admin email or password.";

    adminLoginMessage.style.color =
      "#dc2626";

  }
);


// =========================================
// GET FIRESTORE ACTIVITY
// =========================================

async function getActivity() {

  try {

    const activityCollection =
      collection(
        db,
        "userActivity"
      );

    const snapshot =
      await getDocs(
        activityCollection
      );

    const records = [];

    snapshot.forEach(
      function(documentSnapshot) {

        records.push({

          id:
            documentSnapshot.id,

          ...documentSnapshot.data()

        });

      }
    );

    // Latest first

    records.sort(
      function(a, b) {

        const timeA =
          a.createdAt &&
          typeof a.createdAt.toMillis === "function"
            ? a.createdAt.toMillis()
            : 0;

        const timeB =
          b.createdAt &&
          typeof b.createdAt.toMillis === "function"
            ? b.createdAt.toMillis()
            : 0;

        return timeB - timeA;

      }
    );

    return records;

  } catch (error) {

    console.error(
      "Firestore read error:",
      error
    );

    alert(
      "Could not load Firebase records. Check Firestore Rules."
    );

    return [];

  }

}


// =========================================
// DISPLAY RECORDS
// =========================================

async function displayRecords() {

  const activity =
    await getActivity();


  // Clear old rows

  usersTableBody.innerHTML = "";


  // Total activities

  totalActivities.textContent =
    activity.length;


  // Unique users

  const uniqueEmails =
    new Set();

  activity.forEach(
    function(record) {

      if (record.email) {

        uniqueEmails.add(
          record.email
        );

      }

    }
  );

  totalUsers.textContent =
    uniqueEmails.size;


  // No records

  if (activity.length === 0) {

    emptyState.style.display =
      "block";

    latestActivity.textContent =
      "—";

    return;

  }


  emptyState.style.display =
    "none";


  // Latest activity

  latestActivity.textContent =
    activity[0].time || "—";


  // Add rows

  activity.forEach(
    function(record, index) {

      const row =
        document.createElement("tr");

      row.innerHTML = `

        <td>${index + 1}</td>

        <td>
          ${escapeHTML(record.name)}
        </td>

        <td>
          ${escapeHTML(record.email)}
        </td>

        <td>
          ${escapeHTML(record.action)}
        </td>

        <td>
          ${escapeHTML(record.date)}
        </td>

        <td>
          ${escapeHTML(record.time)}
        </td>

      `;

      usersTableBody.appendChild(row);

    }
  );

}


// =========================================
// ESCAPE HTML
// =========================================

function escapeHTML(value) {

  const div =
    document.createElement("div");

  div.textContent =
    String(value ?? "");

  return div.innerHTML;

}


// =========================================
// CLEAR FIRESTORE RECORDS
// =========================================

clearUsersBtn.addEventListener(
  "click",
  async function() {

    const activity =
      await getActivity();


    if (activity.length === 0) {

      alert(
        "There are no records to clear."
      );

      return;

    }


    const confirmed =
      confirm(
        "Are you sure you want to delete all user activity records?"
      );


    if (!confirmed) {

      return;

    }


    clearUsersBtn.disabled =
      true;

    clearUsersBtn.textContent =
      "Clearing...";


    try {

      for (
        const record of activity
      ) {

        await deleteDoc(
          doc(
            db,
            "userActivity",
            record.id
          )
        );

      }

      alert(
        "All activity records have been deleted."
      );

      await displayRecords();

    } catch (error) {

      console.error(
        "Delete error:",
        error
      );

      alert(
        "Could not delete records. Check Firestore Rules."
      );

    }


    clearUsersBtn.disabled =
      false;

    clearUsersBtn.textContent =
      "Clear Records";

  }
);


// =========================================
// ADMIN LOGOUT
// =========================================

adminLogoutBtn.addEventListener(
  "click",
  function() {

    sessionStorage.removeItem(
      "apexAdminLoggedIn"
    );

    showLogin();

  }
);


// =========================================
// CHECK ADMIN SESSION
// =========================================

if (
  sessionStorage.getItem(
    "apexAdminLoggedIn"
  ) === "true"
) {

  showDashboard();

} else {

  showLogin();

}