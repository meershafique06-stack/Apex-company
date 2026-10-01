import { auth, db } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// ==========================================
// ADMIN SETTINGS
// ==========================================

// IMPORTANT:
// Create this same email as an Admin user
// inside Firebase Authentication.

const ADMIN_EMAIL = "admin@apexcompany.com";


// ==========================================
// ELEMENTS
// ==========================================

const adminLoginSection =
    document.getElementById("adminLoginSection");

const adminDashboardSection =
    document.getElementById("adminDashboardSection");

const adminLoginForm =
    document.getElementById("adminLoginForm");

const adminEmail =
    document.getElementById("adminEmail");

const adminPassword =
    document.getElementById("adminPassword");

const adminLoginBtn =
    document.getElementById("adminLoginBtn");

const adminLoginMessage =
    document.getElementById("adminLoginMessage");

const adminLogoutBtn =
    document.getElementById("adminLogoutBtn");

const totalSignups =
    document.getElementById("totalSignups");

const latestSignup =
    document.getElementById("latestSignup");

const signupTableBody =
    document.getElementById("signupTableBody");

const dashboardMessage =
    document.getElementById("dashboardMessage");

const refreshBtn =
    document.getElementById("refreshBtn");


// ==========================================
// MESSAGE FUNCTION
// ==========================================

function showLoginMessage(message, color) {

    if (!adminLoginMessage) {
        return;
    }

    adminLoginMessage.textContent = message;
    adminLoginMessage.style.color = color;

}


// ==========================================
// SHOW LOGIN
// ==========================================

function showAdminLogin() {

    if (adminLoginSection) {
        adminLoginSection.style.display = "flex";
    }

    if (adminDashboardSection) {
        adminDashboardSection.style.display = "none";
    }

}


// ==========================================
// SHOW DASHBOARD
// ==========================================

function showAdminDashboard() {

    if (adminLoginSection) {
        adminLoginSection.style.display = "none";
    }

    if (adminDashboardSection) {
        adminDashboardSection.style.display = "block";
    }

}


// ==========================================
// LOGIN
// ==========================================

if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email =
                adminEmail.value.trim().toLowerCase();

            const password =
                adminPassword.value;


            if (!email || !password) {

                showLoginMessage(
                    "Please enter email and password.",
                    "#dc2626"
                );

                return;
            }


            if (adminLoginBtn) {

                adminLoginBtn.disabled = true;

                adminLoginBtn.textContent =
                    "Signing In...";

            }


            showLoginMessage(
                "Checking admin account...",
                "#2563eb"
            );


            try {

                const result =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user = result.user;


                // ------------------------------------------
                // CHECK ADMIN EMAIL
                // ------------------------------------------

                if (
                    user.email.toLowerCase() !==
                    ADMIN_EMAIL.toLowerCase()
                ) {

                    await signOut(auth);

                    showLoginMessage(
                        "This account is not authorized as an admin.",
                        "#dc2626"
                    );

                    if (adminLoginBtn) {

                        adminLoginBtn.disabled = false;

                        adminLoginBtn.textContent =
                            "Login to Dashboard";

                    }

                    return;
                }


                // ------------------------------------------
                // ADMIN VERIFIED
                // ------------------------------------------

                showAdminDashboard();

                await loadSignupRecords();


            } catch (error) {

                console.error(
                    "Admin login error:",
                    error
                );


                let message =
                    "Admin login failed. Please try again.";


                switch (error.code) {

                    case "auth/invalid-credential":

                        message =
                            "Invalid admin email or password.";

                        break;


                    case "auth/user-not-found":

                        message =
                            "Admin account was not found.";

                        break;


                    case "auth/wrong-password":

                        message =
                            "Incorrect admin password.";

                        break;


                    case "auth/invalid-email":

                        message =
                            "Please enter a valid admin email.";

                        break;


                    case "auth/too-many-requests":

                        message =
                            "Too many attempts. Please try again later.";

                        break;


                    case "auth/network-request-failed":

                        message =
                            "Network error. Check your internet connection.";

                        break;


                    default:

                        if (error.message) {
                            message = error.message;
                        }

                }


                showLoginMessage(
                    message,
                    "#dc2626"
                );


                if (adminLoginBtn) {

                    adminLoginBtn.disabled = false;

                    adminLoginBtn.textContent =
                        "Login to Dashboard";

                }

            }

        }
    );

}


// ==========================================
// LOAD SIGNUP RECORDS
// ==========================================

async function loadSignupRecords() {

    if (!signupTableBody) {
        return;
    }


    signupTableBody.innerHTML = `
        <tr>
            <td colspan="5" class="loading-cell">
                Loading signup records...
            </td>
        </tr>
    `;


    if (dashboardMessage) {
        dashboardMessage.textContent = "";
    }


    try {

        const signupQuery =
            query(
                collection(db, "userActivity"),
                orderBy("createdAt", "desc")
            );


        const snapshot =
            await getDocs(signupQuery);


        const records = [];


        snapshot.forEach(function (doc) {

            records.push({
                id: doc.id,
                ...doc.data()
            });

        });


        // ------------------------------------------
        // TOTAL SIGNUPS
        // ------------------------------------------

        if (totalSignups) {

            totalSignups.textContent =
                records.length;

        }


        // ------------------------------------------
        // LATEST SIGNUP
        // ------------------------------------------

        if (latestSignup) {

            if (records.length > 0) {

                const latest =
                    records[0];

                latestSignup.textContent =
                    latest.email ||
                    latest.name ||
                    "User";

            } else {

                latestSignup.textContent =
                    "No records";

            }

        }


        // ------------------------------------------
        // NO RECORDS
        // ------------------------------------------

        if (records.length === 0) {

            signupTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-cell">
                        No signup records found.
                    </td>
                </tr>
            `;

            return;
        }


        // ------------------------------------------
        // BUILD TABLE
        // ------------------------------------------

        signupTableBody.innerHTML = "";


        records.forEach(
            function (record, index) {

                const row =
                    document.createElement("tr");


                const numberCell =
                    document.createElement("td");

                numberCell.textContent =
                    index + 1;


                const nameCell =
                    document.createElement("td");

                nameCell.textContent =
                    record.name || "N/A";


                const emailCell =
                    document.createElement("td");

                emailCell.textContent =
                    record.email || "N/A";


                const dateCell =
                    document.createElement("td");

                dateCell.textContent =
                    record.date || "N/A";


                const timeCell =
                    document.createElement("td");

                timeCell.textContent =
                    record.time || "N/A";


                row.appendChild(numberCell);

                row.appendChild(nameCell);

                row.appendChild(emailCell);

                row.appendChild(dateCell);

                row.appendChild(timeCell);


                signupTableBody.appendChild(row);

            }
        );


    } catch (error) {

        console.error(
            "Dashboard data error:",
            error
        );


        if (signupTableBody) {

            signupTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="error-cell">
                        Unable to load signup records.
                    </td>
                </tr>
            `;

        }


        if (dashboardMessage) {

            dashboardMessage.textContent =
                "Please check your Firestore database and security rules.";

            dashboardMessage.style.color =
                "#dc2626";

        }

    }

}


// ==========================================
// REFRESH BUTTON
// ==========================================

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        async function () {

            refreshBtn.disabled = true;

            refreshBtn.textContent =
                "Refreshing...";


            await loadSignupRecords();


            refreshBtn.disabled = false;

            refreshBtn.textContent =
                "Refresh";

        }
    );

}


// ==========================================
// LOGOUT
// ==========================================

if (adminLogoutBtn) {

    adminLogoutBtn.addEventListener(
        "click",
        async function () {

            try {

                await signOut(auth);

                showAdminLogin();

                if (adminLoginForm) {
                    adminLoginForm.reset();
                }

                showLoginMessage(
                    "You have been logged out.",
                    "#2563eb"
                );


            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            }

        }
    );

}


// ==========================================
// AUTH STATE
// ==========================================

onAuthStateChanged(
    auth,
    async function (user) {

        if (!user) {

            showAdminLogin();

            return;

        }


        // Only authorized admin can see dashboard.

        if (
            user.email.toLowerCase() !==
            ADMIN_EMAIL.toLowerCase()
        ) {

            await signOut(auth);

            showAdminLogin();

            showLoginMessage(
                "This account is not authorized as an admin.",
                "#dc2626"
            );

            return;
        }


        showAdminDashboard();

        await loadSignupRecords();

    }
);
