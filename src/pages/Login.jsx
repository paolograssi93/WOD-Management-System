import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { loginUser } from "../redux/actions/authActions";
import { Button, Form } from "react-bootstrap";

function Login(){
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const dispatch = useDispatch()
  const navigate = useNavigate()

  //Prelevo i dati dal reducer authReducer
  const {isAuthenticated, error} = useSelector((state) => state.auth)

  //se l'utente è già loggato (o si logga con successo) lo mandiamo nella pagina home
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", {replace: true})
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = (e) => {
    e.preventDefault() //blocco il ricaricamento della pagina
    dispatch(loginUser(email, password)) //eseguo il dispatch di email e password inseriti dall'utente
  }

  return (
    <div style={{ minHeight: "0px", paddingTop: "0px" }}>
      <div style = {{
        maxWidth: "400px",
        padding: "2rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        height: "fit-content"
      }}>
        <h2 style= {{textAlign:"center", marginBottom:"1.5rem"}}>Login Atleta</h2>

        {/* Mostro l'errore nel caso in cui la login fallisce */}
        {error && (
          <p style={{
            color: "red",
            backgroundColor: "#ffe6e6",
            padding: "10px",
            borderRadius: "4px",
            textAlign: "center" 
          }}>
            {error}
          </p>
        )}


        {/* -- SEZIONE FORM DI LOGIN -- */}
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom: "1rem"}}>
            <label style={{display:"block", marginBottom:"0.5rem", fontWeight:"bold"}}>
              Email
            </label>
            <Form.Control
              type="email"
              placeholder="paolo@box.it"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{marginBottom: "1rem"}}>
            <label style={{display:"block", marginBottom:"0.5rem", fontWeight:"bold"}}>
              Password
            </label>
            <Form.Control
              type="password"
              placeholder="123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            style={{width: "100%", padding:"10px", fontWeight:"bold"}}
          >
            ACCEDI
          </Button>
        </form>

        {/* -- A SOLO SCOPO DI TEST -- */}
        <div style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "#666", textAlign: "center", }}>
          <p>Email di test <b>atleta</b>: <strong><u>paolo@box.com</u></strong></p>
          <p>Password di test: <strong>123</strong></p>
        </div>
        <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#666", textAlign: "center", borderTop: "1px solid #000",  }}>
          <p>Email di test <b>admin</b>: <strong><u>admin@box.com</u></strong></p>
          <p>Password di test: <strong>123</strong></p>
        </div>
      </div>
    </div>
  )

}

export default Login