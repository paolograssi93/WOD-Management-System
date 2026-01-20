import { useDispatch, useSelector } from "react-redux"
import { NavLink, useNavigate } from "react-router" // o react-router-dom a seconda della versione
import { logoutUser } from "../redux/actions/authActions"

function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  // Preleviamo lo stato dell'utente per personalizzare la barra
  const { currentUser, isAuthenticated } = useSelector((state) => state.auth)

  const linkStyle = {
    marginRight: "1rem",
    color: "#444",
    textDecoration: "none",
  }

  const activeStyle = {
    color: "#007bff",
    fontWeight: "bold",
  }

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate("/")
  }

  return (
    <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc", display: "flex", justifyContent: "space-between" }}>
      <div>
        <NavLink to="/" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
          Home
        </NavLink>
        
        {/* Mostriamo Dashboard e Library solo se loggato */}
        {isAuthenticated && (
          <>
            <NavLink to="/Dashboard" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
              Dashboard
            </NavLink>
            <NavLink to="/WodLibrary" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
              WOD Library
            </NavLink>
            <NavLink to="/UserProfile" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
              Diario Performance & Profilo
            </NavLink>
          </>
        )}

        {/* Mostriamo Admin solo se l'utente ha il ruolo adatto */}
        {currentUser?.role === "admin" && (
          <NavLink to="/Admin" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
            Admin
          </NavLink>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {isAuthenticated ? (
          <>
            <span style={{ fontSize: "0.9rem", color: "#666" }}>Ciao, {currentUser.name}</span>
            <button onClick={handleLogout} style={{ cursor: "pointer" }}>Logout</button>
          </>
        ) : (
          <NavLink to="/Login" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
            Login
          </NavLink>
        )}
      </div>
    </nav>
  )
}

export default Navbar