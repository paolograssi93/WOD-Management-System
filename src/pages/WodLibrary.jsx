import { useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row, Badge } from "react-bootstrap"; // Aggiunto Badge
import { useDispatch, useSelector } from "react-redux";
import { HashLoader } from "react-spinners";
import { useNavigate } from "react-router-dom"; 
import { addWodToPlan, getLibraryAction, getUserActivities } from "../redux/actions/wodActions";

function WodLibrary() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Prelevo i dati dallo stato 'wod' e 'auth'
  const { library = [], userActivities = [], isLoading } = useSelector((state) => state.wod || {});
  const { currentUser } = useSelector((state) => state.auth || {});

  const [filterType, setFilterType] = useState("");
  const [filterDuration, setFilterDuration] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    dispatch(getLibraryAction());
    if (currentUser && currentUser.id) { //se sono presenti sua il currentUser che l'id
      dispatch(getUserActivities(currentUser.id)); //effettuo il dispatch dell'id
    }
  }, [dispatch, currentUser]); //attivo lo useEffect al cambiamento dell'utente e del dispatch su getLibraryAction nelle wodActions di redux

  // Logica filtri
  //filtro la library in base ai filtri impostati nel menu a tendina
  const filteredWods = library.filter((wod) => {
    const matchType = filterType === "" || wod.type === filterType;
    let matchDuration = true;
    if (filterDuration === "short") matchDuration = wod.duration <= 10;
    if (filterDuration === "medium") matchDuration = wod.duration > 10 && wod.duration <= 20;
    if (filterDuration === "long") matchDuration = wod.duration > 20;
    return matchType && matchDuration;
  });

  //implemento handle per il bottone AGGIUNGI AL PIANO/RIPETI IL WOD
  const handleAddToPlan = (wod) => {
    if (!currentUser) return; //se l'utente non è loggato non eseguo altre operazioni
    
    //inizializzo una nuova attività presa in carico (stato: "Assigned")
    const newActivity = {
      userID: currentUser.id,
      wodId: wod.id,
      wodName: wod.name,
      exercises: wod.exercises,
      status: "Assigned",
      score: "",
      timeElapsed: "",
      date: new Date().toLocaleDateString() //utilizzo la data che poi servirà per ordinare la vista in ordine cronologico
    };
    dispatch(addWodToPlan(newActivity)); //effettuo il dispatch per aggiungere il wod alla lista dell'atleta
    setShowAlert(true); //visualizzo un banner di alert
    setTimeout(() => setShowAlert(false), 3000); //imposto il tempo di visualizzazione del banner di 3 secondi
  };


  //implemento funzione per prelevare i risultati dei wod precedenti in stato Completed
  const getPreviousResult = (wodName) => {
    return userActivities.find(act => act.wodName === wodName && act.status === "Completed");
  };

  //spinner in fase di caricamento dei dati
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "5rem" }}>
        <HashLoader color="#007bff" size={60} />
        <p className="mt-3">Caricamento libreria...</p>
      </div>
    );
  }


  // ----- PANNELLO WOD LIBRARY -----
  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 className="mb-4">WOD Library</h2>

      {/* Sezione Filtri */}
      <div className="p-4 mb-4" style={{ backgroundColor: "#f8f9fa", borderRadius: "12px" }}>
        <Row>
          <Col md={6} className="mb-3 mb-md-0">
            <Form.Group>
              {/* --- FILTRI PER TYPE ---*/}
              <Form.Label className="fw-bold">Tipo di WOD</Form.Label>
              <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">Tutti i tipi</option>
                <option value="Hero WOD">Hero WOD</option>
                <option value="AMRAP">AMRAP</option>
                <option value="For Time">For Time</option>
                <option value="EMOM">EMOM</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              {/* --- FILTRI PER DURATION ---*/}
              <Form.Label className="fw-bold">Durata stimata (RX)</Form.Label>
              <Form.Select value={filterDuration} onChange={(e) => setFilterDuration(e.target.value)}>
                <option value="">Qualsiasi durata</option>
                <option value="short">Breve (sotto 10')</option>
                <option value="medium">Media (10'-20')</option>
                <option value="long">Lunga (oltre 20')</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </div>


      {/* Griglia WOD */}
      <Row>
        {filteredWods.map((wod) => {
          const prevResult = getPreviousResult(wod.name); //prelevo il nome del wod
          return (
            <Col key={wod.id} xs={12} md={6} lg={4} className="mb-4">
              <div style={{ 
                border: "1px solid #dee2e6", 
                padding: "1.5rem", 
                borderRadius: "10px", 
                height: "100%",
                display: "flex", 
                flexDirection: "column", 
                backgroundColor: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h4 style={{ color: "#007bff", fontSize: "1.2rem" }} className="mb-0">{wod.name}</h4>
                    <Badge bg="secondary">{wod.duration}'</Badge> {/* Visualizzo la durata come badge */}
                  </div>
                  <p className="text-muted small fw-bold mb-3">{wod.type}</p> {/* Visualizzo il tipo del wod*/}
                  
                  {/* IMPOSTO UNA VISTA CONDIZIONALE a seconda se il wod è stato già completato o meno */}
                  {prevResult && (
                    <Badge bg="success" className="mb-3">COMPLETATO ✅</Badge>
                  )}
                  
                  {/* elenco i primi 3 esercizi del wod */}
                  <ul className="list-unstyled mb-4" style={{ fontSize: "0.85rem" }}>
                    {wod.exercises && wod.exercises.slice(0, 3).map((ex, i) => (
                      <li key={i} className="mb-1">• {ex}</li>
                    ))}
                    {wod.exercises?.length > 3 && <li className="text-muted italic">...e altri</li>}
                  </ul>
                </div>

                <div className="d-grid gap-2">
                  <Button 
                    variant="info" 
                    className="text-white fw-bold"
                    onClick={() => navigate(`/wods/${wod.id}`)}
                  >
                    VEDI DETTAGLI
                  </Button>

                  {/* Vista condizionale in base allo stato del wod */}
                  <Button 
                    variant={prevResult ? "outline-dark" : "primary"} 
                    className="fw-bold"
                    onClick={() => handleAddToPlan(wod)}
                  >
                    {prevResult ? "RIPETI IL WOD" : "AGGIUNGI AL PIANO"}
                  </Button>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>


        {/* Alert dopo aver preso in carico il wod */}
        {showAlert && (
          <Alert variant="success" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
            WOD aggiunto alla tua Dashboard! 💪
          </Alert>
        )}
    </div>
  );
}

export default WodLibrary;