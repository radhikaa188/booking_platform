import { useNavigate, Link } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!isLoggedIn) return null;

  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid gray" }}>
      <Link to="/events" style={{ marginRight: "10px" }}>Events</Link>
      <button onClick={handleLogout}>Logout</button>
        {localStorage.getItem("role") === "admin" && (
    <Link to="/admin" style={{ marginRight: "10px" }}>Admin</Link>
    )}
    </nav>
  );
}

export default Navbar;