// ======================================
// FIREBASE INIT (vem do HTML)
// ======================================

const db = window.firebaseDB;
const api = window.firebaseAPI;

const votesRef = api.collection(db, "votes");

// ======================================
// ESTADO LOCAL
// ======================================

let votes = [];

// ======================================
// ELEMENTOS
// ======================================

const form = document.getElementById("presence-form");

const nameInput = document.getElementById("name");
const statusInput = document.getElementById("status");
const guestsInput = document.getElementById("guests");

const goingCount = document.getElementById("going-count");
const maybeCount = document.getElementById("maybe-count");
const notGoingCount = document.getElementById("not-going-count");

const goingSummary = document.getElementById("going-summary");
const maybeSummary = document.getElementById("maybe-summary");
const notGoingSummary = document.getElementById("not-going-summary");

const adminButton = document.getElementById("admin-button");
const adminModal = document.getElementById("admin-modal");
const closeAdmin = document.getElementById("close-admin");
const adminLogin = document.getElementById("admin-login");
const adminPassword = document.getElementById("admin-password");
const clearVotes = document.getElementById("clear-votes");

// ======================================
// FIREBASE REALTIME LISTENER
// ======================================

api.onSnapshot(votesRef, (snapshot) => {

    votes = [];

    snapshot.forEach(doc => {
        votes.push(doc.data());
    });

    render();
});

// ======================================
// RENDER
// ======================================

function render() {
    renderTotals();
}

function renderTotals() {

    const going = votes.filter(v => v.status === "going");
    const maybe = votes.filter(v => v.status === "maybe");
    const notGoing = votes.filter(v => v.status === "not-going");

    goingCount.textContent = countPlayers(going);
    maybeCount.textContent = countPlayers(maybe);
    notGoingCount.textContent = countPlayers(notGoing);

    goingSummary.innerHTML = "";
    maybeSummary.innerHTML = "";
    notGoingSummary.innerHTML = "";

    renderNames(going, goingSummary);
    renderNames(maybe, maybeSummary);
    renderNames(notGoing, notGoingSummary);
}

function countPlayers(list) {
    let total = 0;

    list.forEach(v => {
        total += 1 + (Number(v.guests) || 0);
    });

    return total;
}

function renderNames(list, container) {

    list.forEach(vote => {

        const person = document.createElement("div");
        person.textContent = vote.name;

        container.appendChild(person);

        const guests = Number(vote.guests) || 0;

        for (let i = 1; i <= guests; i++) {

            const guest = document.createElement("div");

            guest.textContent = `↳ Convidado de ${vote.name} ${i}`;

            guest.style.paddingLeft = "15px";
            guest.style.opacity = "0.8";

            container.appendChild(guest);
        }

    });

}

// ======================================
// SAVE VOTE (FIREBASE)
// ======================================

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name = nameInput.value.trim();

    if (!name) return;

    const vote = {
        name,
        status: statusInput.value,
        guests: Number(guestsInput.value) || 0
    };

    await api.setDoc(
        api.doc(db, "votes", name.toLowerCase()),
        vote
    );

    form.reset();
    guestsInput.value = 0;

    resetUI();
});

// ======================================
// ADMIN
// ======================================

adminButton.addEventListener("click", () => {
    adminModal.classList.remove("hidden");
});

closeAdmin.addEventListener("click", () => {
    adminModal.classList.add("hidden");
});

adminLogin.addEventListener("click", () => {

    if (adminPassword.value === "clocktower") {
        alert("Login OK");
        clearVotes.style.display = "block";
    } else {
        alert("Senha incorreta");
    }

});

clearVotes.addEventListener("click", async () => {

    const ok = confirm("Apagar todos os votos?");

    if (!ok) return;

    const snapshot = await api.getDocs(votesRef);

    snapshot.forEach(async (d) => {
        await api.deleteDoc(api.doc(db, "votes", d.id));
    });

    render();
});

// ======================================
// UI BUTTONS (STATUS)
// ======================================

document.querySelectorAll("[data-status]").forEach(btn => {

    btn.addEventListener("click", () => {

        statusInput.value = btn.dataset.status;

        document.querySelectorAll("[data-status]")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

    });

});

// ======================================
// UI BUTTONS (GUESTS)
// ======================================

document.querySelectorAll("[data-guests]").forEach(btn => {

    btn.addEventListener("click", () => {

        guestsInput.value = btn.dataset.guests;

        document.querySelectorAll("[data-guests]")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

    });

});

// ======================================
// RESET UI
// ======================================

function resetUI() {

    statusInput.value = "going";
    guestsInput.value = "0";

    document.querySelectorAll("[data-status]")
        .forEach(b => b.classList.remove("active"));

    document.querySelector('[data-status="going"]')
        .classList.add("active");

    document.querySelectorAll("[data-guests]")
        .forEach(b => b.classList.remove("active"));

    document.querySelector('[data-guests="0"]')
        .classList.add("active");
}

// init default UI state
resetUI();