let currentPage = 1;
let totalPages = 1;
let currentSort = "username";
let currentOrder = "ASC";

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.split("/").pop();

  if (path === "main.html" || path === "") {
    initAuthForms();
  } else if (path === "user.html") {
    initUserPage();
  } else if (path === "admin.html") {
    initAdminPage();
  }
});

function initAuthForms() {
  document
    .getElementById("register")
    .addEventListener("submit", handleRegister);
  document.getElementById("login").addEventListener("submit", handleLogin);
}

function initUserPage() {
  document.getElementById("logout").addEventListener("click", logout);
}

function initAdminPage() {
  document.getElementById("logout").addEventListener("click", logout);
  document
    .getElementById("add-user")
    .addEventListener("click", showAddUserModal);
  document.getElementById("sort-by").addEventListener("change", (e) => {
    currentSort = e.target.value;
    loadUsers();
  });
  document.getElementById("sort-order").addEventListener("change", (e) => {
    currentOrder = e.target.value;
    loadUsers();
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("user-modal").style.display = "none";
  });
  document
    .getElementById("user-form")
    .addEventListener("submit", handleUserFormSubmit);

  loadUsers();
}

async function handleRegister(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("http://localhost:3000/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (response.ok) {
      localStorage.setItem("token", result.token);
      redirectAfterAuth(data.username);
    } else {
      alert(result.error);
    }
  } catch (error) {
    alert("Registration failed");
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("http://localhost:3000/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (response.ok) {
      localStorage.setItem("token", result.token);
      redirectAfterAuth(result.username);
    } else {
      alert(result.error);
    }
  } catch (error) {
    alert("Login failed");
  }
}

function redirectAfterAuth(username) {
  window.location.href = username === "admin" ? "admin.html" : "user.html";
}
function logout() {
  localStorage.removeItem("token");
  window.location.href = "main.html";
}

async function loadUsers(page = 1) {
  currentPage = page;
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "main.html";
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/users?page=${page}&limit=10&sortBy=${currentSort}&order=${currentOrder}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 401) {
      logout();
      return;
    }

    const data = await response.json();
    totalPages = Math.ceil(data.count / 10);
    renderUsers(data.rows);
    renderPagination();
  } catch (error) {
    console.error("Failed to load users", error);
  }
}

function renderUsers(users) {
  const userList = document.getElementById("user-list");
  userList.innerHTML = "";

  users.forEach((user) => {
    const userCard = document.createElement("div");
    userCard.className = "user-card";
    userCard.innerHTML = `
      <div>
        <h3>${user.username}</h3>
        <p>${user.first_name} ${user.last_name}</p>
        <p>${user.gender} | ${new Date(user.birthdate).toLocaleDateString()}</p>
      </div>
      <div class="user-actions">
        <button onclick="showEditUserModal('${user.id}')">Edit</button>
        <button onclick="deleteUser('${user.id}')">Delete</button>
      </div>
    `;
    userList.appendChild(userCard);
  });
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  if (totalPages > 1) {
    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement("button");
      button.textContent = i;
      if (i === currentPage) {
        button.style.backgroundColor = "#4CAF50";
        button.style.color = "white";
      }
      button.addEventListener("click", () => loadUsers(i));
      pagination.appendChild(button);
    }
  }
}

function showAddUserModal() {
  const modal = document.getElementById("user-modal");
  document.getElementById("modal-title").textContent = "Add New User";
  document.getElementById("user-form").reset();
  document.getElementById("user-id").value = "";
  modal.style.display = "block";
}

function showEditUserModal(userId) {
  const token = localStorage.getItem("token");
  fetch(`http://localhost:3000/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((response) => response.json())
    .then((user) => {
      const modal = document.getElementById("user-modal");
      document.getElementById("modal-title").textContent = "Edit User";
      document.getElementById("user-id").value = user.id;
      document.getElementById("username").value = user.username;
      document.getElementById("first_name").value = user.first_name;
      document.getElementById("last_name").value = user.last_name;
      document.getElementById("gender").value = user.gender;
      document.getElementById("birthdate").value = user.birthdate;
      modal.style.display = "block";
    })
    .catch((error) => console.error("Failed to load user", error));
}

async function handleUserFormSubmit(e) {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const userId = document.getElementById("user-id").value;
  const url = userId
    ? `http://localhost:3000/users/${userId}`
    : "http://localhost:3000/users";
  const method = userId ? "PUT" : "POST";

  const formData = {
    username: document.getElementById("username").value,
    first_name: document.getElementById("first_name").value,
    last_name: document.getElementById("last_name").value,
    gender: document.getElementById("gender").value,
    birthdate: document.getElementById("birthdate").value,
  };

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      document.getElementById("user-modal").style.display = "none";
      loadUsers(currentPage);
    } else {
      const error = await response.json();
      alert(error.error);
    }
  } catch (error) {
    console.error("Failed to save user", error);
  }
}

async function deleteUser(userId) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`http://localhost:3000/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      loadUsers(currentPage);
    } else {
      const error = await response.json();
      alert(error.error);
    }
  } catch (error) {
    console.error("Failed to delete user", error);
  }
}

window.showEditUserModal = showEditUserModal;
window.deleteUser = deleteUser;
