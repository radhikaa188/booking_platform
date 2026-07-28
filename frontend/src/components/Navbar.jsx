import { useNavigate, Link } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  if (!isLoggedIn) return null;

  return (
    <nav className="navbar">
      <Link to="/events" className="navbar-link navbar-link-events">Events</Link>
      {localStorage.getItem("role") === "admin" && (
        <Link to="/admin" className="navbar-link navbar-link-admin">Admin</Link>
      )}
      <button onClick={handleLogout} className="navbar-btn-logout">Logout</button>
    </nav>
  );
}

export default Navbar;