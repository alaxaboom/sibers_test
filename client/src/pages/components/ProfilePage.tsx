import React, { useState, useEffect } from "react";
import { User } from "../../types";
import { authService } from "../../services/authService";
import { useParams, useNavigate } from "react-router-dom";

interface ProfilePageProps {
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [error, setError] = useState("");

  const currentUser = authService.getCurrentUserSync();
  const isOwnProfile = !id || id === currentUser?.id;
  const isAdmin = currentUser?.role === "admin";
  const canEdit = isOwnProfile || isAdmin;
  const canDelete = isAdmin && !isOwnProfile; // Не удалять свой, чтобы избежать логаута

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = id
          ? await authService.getUserById(id)
          : await authService.getCurrentUser();
        setUser(userData);
        setFormData({
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          gender: userData.gender || "",
          birthdate: userData.birthdate || "",
        });
      } catch {
        navigate("/");
      }
    };
    fetchUser();
  }, [id, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user || !canEdit) return;
    try {
      const updatedUser = await authService.updateUser(user.id, formData);
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleDelete = async () => {
    if (!user || !canDelete) return;
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await authService.deleteUser(user.id);
        navigate("/users");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-page">
      {error && <div className="error">{error}</div>}
      <h2>👤 {user.username}</h2>
      <div className="card">
        <div className="profile-fields">
          <div className="profile-field">
            <label>Email</label>
            <span>{user.email}</span>
          </div>
          <div className="profile-field">
            <label>First Name</label>
            {isEditing ? (
              <input
                type="text"
                name="first_name"
                value={formData.first_name || ""}
                onChange={handleInputChange}
              />
            ) : (
              <span>{user.first_name || "—"}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Last Name</label>
            {isEditing ? (
              <input
                type="text"
                name="last_name"
                value={formData.last_name || ""}
                onChange={handleInputChange}
              />
            ) : (
              <span>{user.last_name || "—"}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Gender</label>
            {isEditing ? (
              <select
                name="gender"
                value={formData.gender || ""}
                onChange={handleInputChange}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <span>{user.gender || "—"}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Birthdate</label>
            {isEditing ? (
              <input
                type="date"
                name="birthdate"
                value={formData.birthdate || ""}
                onChange={handleInputChange}
              />
            ) : (
              <span>
                {user.birthdate
                  ? new Date(user.birthdate).toLocaleDateString()
                  : "—"}
              </span>
            )}
          </div>
          <div className="profile-field">
            <label>Role</label>
            <span style={{ textTransform: "capitalize" }}>{user.role}</span>
          </div>
        </div>

        {canEdit && (
          <div className="profile-actions">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="btn btn-primary">
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
              >
                Edit Profile
              </button>
            )}
            {canDelete && (
              <button onClick={handleDelete} className="btn btn-danger">
                Delete User
              </button>
            )}
          </div>
        )}
      </div>

      {isOwnProfile && (
        <div className="logout-section">
          <button onClick={onLogout} className="btn btn-danger">
            🚪 Log Out
          </button>
        </div>
      )}

      {!isOwnProfile && (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button onClick={() => navigate(-1)} className="btn btn-ghost">
            ← Back
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
