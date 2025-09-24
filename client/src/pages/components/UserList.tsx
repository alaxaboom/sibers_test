import React, { useState, useEffect } from "react";
import { User, UsersResponse } from "../../types";
import { authService } from "../../services/authService";
import { Link } from "react-router-dom";

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof User>("username");
  const [order, setOrder] = useState<"ASC" | "DESC">("ASC");
  const [genderFilter, setGenderFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const currentUser = authService.getCurrentUserSync();
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    loadUsers();
  }, [currentPage, sortBy, order, search, genderFilter, roleFilter]);

  const loadUsers = async () => {
    const query = new URLSearchParams({
      page: currentPage.toString(),
      limit: "10",
      sortBy,
      order,
      ...(search && { search }),
      ...(genderFilter && { gender: genderFilter }),
      ...(roleFilter && { role: roleFilter }),
    }).toString();

    try {
      const data: UsersResponse = await authService.getUsersQuery(query);
      setTotalPages(Math.ceil(data.count / 10));
      setUsers(data.rows); // Теперь сервер фильтрует
    } catch (error) {
      console.error("Failed to load users", error);
    }
  };

  return (
    <div className="user-list-container">
      <h2>All Users</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
        >
          <option value="">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as keyof User)}
        >
          <option value="username">Sort by Username</option>
          <option value="first_name">First Name</option>
          <option value="birthdate">Birthdate</option>
          <option value="role">Role</option>
        </select>
        <select
          value={order}
          onChange={(e) => setOrder(e.target.value as "ASC" | "DESC")}
        >
          <option value="ASC">Ascending</option>
          <option value="DESC">Descending</option>
        </select>
      </div>

      <div className="user-grid">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <div className="user-info">
              <h3>{user.username}</h3>
              <p>
                {user.first_name} {user.last_name}
              </p>
              <p>{user.email}</p>
            </div>
            <Link to={`/profile/${user.id}`} className="btn btn-primary">
              {isAdmin ? "Edit" : "Details"} // Кнопка "Edit" для админа
            </Link>
          </div>
        ))}
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={page === currentPage ? "active" : ""}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserList;
