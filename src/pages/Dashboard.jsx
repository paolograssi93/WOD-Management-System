import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserActivities} from "../redux/actions/wodActions";
import { Button} from "react-bootstrap";
import { HashLoader } from "react-spinners";
import { useNavigate } from "react-router";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);
  const { userActivities, isLoading } = useSelector((state) => state.wod);

  const [activeTab, setActiveTab] = useState("Assigned") //Tab di default all'avvio


  //Chiedo a redux di scaricare le attività dell'atleta dal db.json
  useEffect(() => {
    if (currentUser) {
      dispatch(getUserActivities(currentUser.id));
    }
  }, [dispatch, currentUser]); //Eseguo il codice ogni volta che l'utente cambia

  //imposto i filtri (visualizzazione tab) per selezionare Tutti, Assegnati o Completati
  //Non considero In Progress in quanto l'utente dovrà per forza passare dalla modale
  const filteredActivities = userActivities.filter((act) => {
    if (activeTab === "Tutti") return true
    return act.status === activeTab
  })

  //Imposto lo stile dei tab per filtrare i wod in base allo stato
  const tabStyle = (tabName) => ({
    padding: "10px 20px",
    cursor: "pointer",
    borderBottom: activeTab === tabName ? "3px solid #007bff" : "3px solid transparent",
    color: activeTab === tabName ? "#007bff" : "#666",
    fontWeight: activeTab === tabName ? "bold" : "normal",
    transition: "all 0.3s"
  });


  //utilizzo lo spinner HashLoader in fase di caricamento
  if (isLoading) return <div style={{ textAlign: "center", padding: "2rem" }}>
    <HashLoader color="#007bff" size={60} /> Loading...</div>

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
        <h2>Dashboard</h2>
        <span style={{ padding: "5px 10px", background: "#333", color: "#fff", borderRadius: "5px" }}>
          Atleta: {currentUser?.name}
        </span>
      </div>

      {/*-- MENU TAB --*/}
      <div style={{ display: "flex", gap: "20px", borderBottom: "1px solid #ccc", marginBottom: "2rem" }}>
        <div style={tabStyle("Assigned")} onClick={() => setActiveTab("Assigned")}>Assegnati</div>
        <div style={tabStyle("Completed")} onClick={() => setActiveTab("Completed")}>Completati</div>
        <div style={tabStyle("Tutti")} onClick={() => setActiveTab("Tutti")}>Tutti</div>
      </div>


      {/* -- FILTRO LE ATTIVITà IN BASE AL TAB ATTIVO (PRIMO VISUALIZZATO DI DEFAULT: ASSIGNED) -- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {filteredActivities.length > 0 ? (
          filteredActivities.map((act) => ( //leggo l'array in base al filtro attivo
          <div key={act.id} style={{ 
            border: "1px solid #ccc", 
            padding: "1rem", 
            borderRadius: "8px",
            backgroundColor: act.status === 'Completed' ? '#f0f0f0' : '#ffffff' //vista card condizionale in base allo stato dei wod
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{act.wodName}</strong>
              <span style={{ fontSize: "0.8rem", color: act.status === 'Completed' ? 'green' : 'orange' }}> {/* vista stato in card condizionale in base allo stato dei wod */}
                {act.status}
              </span>
            </div>

            <ul style={{ fontSize: "0.9rem", marginTop: "10px" }}>
              {act.exercises && act.exercises.slice(0, 3).map((ex, i) => (
                <li key={i} className="mb-1">• {ex}</li>
              ))}
              {act.exercises?.length > 3 && <li className="text-muted italic">...e altri</li>}
            </ul>

            {/* Bottoni Dinamici */}
            <div className= "d-grid gap-2" style={{ marginTop: "15px"}}>
              {act.status === "Assigned" ? (
                <Button 
                  onClick={() => navigate(`/wods/${act.wodId}`)}
                  variant="primary"
                  className="fw-bold"
                >
                  STUDIA IL WOD E INIZIA!
                </Button>
              ) : (
              <Button 
                variant="info" 
                className="text-white fw-bold"
                onClick={() => navigate(`/wods/${act.wodId}`)}
              >
                VEDI DETTAGLI
              </Button>
              )}
            </div>
          </div>
        ))
      ) : (
        /* messaggio se non ci sono wod corrispondenti al filtro applicato*/
        <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "#888", border: "2px dashed #ccc", borderRadius: "10px" }}>
          <h4>Nessun allenamento trovato in questa sezione in {activeTab}</h4>
          <p style={{maxWidth: "400px", margin: "0 auto 1.5rem"}}>
            {activeTab === "Assigned" 
            ? "Il tuo piano di lavoro è vuoto. Scegli la tua prossima sfida dalla WOD Library!"
            : "Non sono presenti wod in questa sezione."}
          </p>
          {activeTab === "Assigned" && (
            <Button
            variant = "primary"
            onClick={() => navigate('/WodLibrary')}
            style={{fontWeight: "bold", padding: "10px 25px"}}
            >
              VAI ALLA WOD LIBRARY
            </Button>
          )}
        </div>
      )}
      </div>
    </div>
  );
  
}

export default Dashboard;