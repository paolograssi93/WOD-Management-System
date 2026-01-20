import { useEffect, useState } from "react";
import { Container, Row, Col, Card, ListGroup, Button, Badge, Modal, Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function UserProfile() {
  const navigate = useNavigate();

  
  // 1. Dati dall'AuthReducer di Redux
  const currentUser = useSelector((state) => state.auth.currentUser);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // 2. Stati per attività e gestione Note
  const [activities, setActivities] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentAct, setCurrentAct] = useState(null);
  const [tempNote, setTempNote] = useState("");

  // 3. Caricamento attività dal database (filtrate per l'utente loggato)
const fetchMyActivities = async () => {
  // Aggiungo un controllo di sicurezza: se non c'è l'utente, non procedere
  if (!currentUser || !currentUser.id) return;

  try {
    const res = await fetch(`http://localhost:3001/user_activities?userID=${currentUser.id}`);
    
    if (!res.ok) throw new Error("Errore nel recupero dati");

    const data = await res.json();
    // Ordino le attività per data (i più recenti in alto)
    setActivities(data.reverse());
  } catch (error) {
    console.error("Errore nel caricamento del diario:", error);
  }
};


// 4. useEffect per prelevare le attività dell'utente autenticato
useEffect(() => {
  if (isAuthenticated && currentUser) {
    fetchMyActivities();
  } else if (!isAuthenticated) {
    navigate("/login");
  }
  //disabilito il controllo ESLint per fetchMyActivities non dichiarata nelle dipendenze (rischio loop)
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isAuthenticated, currentUser?.id]); // Ascolta specificamente il cambiamento dell'ID utente


  // 4. handle Eliminazione della singola sessione
  const handleDelete = async (id) => {
    if (window.confirm("Vuoi eliminare questa sessione dal tuo storico?")) {
      try {
        await fetch(`http://localhost:3001/user_activities/${id}`, { method: "DELETE" });
        setActivities(activities.filter(act => act.id !== id));
      } catch (error) {
        alert("Errore durante l'eliminazione: ", error);
      }
    }
  };

  // 5. handle Salvataggio Nota
  const handleSaveNote = async () => {
    try {
      await fetch(`http://localhost:3001/user_activities/${currentAct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: tempNote })
      });
      setShowNoteModal(false);
      fetchMyActivities(); // Rinfresca i dati per vedere la nota aggiornata
    } catch (error) {
      alert("Errore nel salvataggio della nota: ", error);
    }
  };

  // 6. LOGICA DI RAGGRUPPAMENTO: Trasforma l'array in un oggetto { "NomeWod": [sessioni] }
  // se l'atleta ha effettuato più volte lo stesso wod lo vedrà sotto lo stesso gruppo con tutti i risultati
  const groupedActivities = activities.reduce((acc, act) => {
    const name = act.wodName;
    if (!acc[name]) acc[name] = [];
    acc[name].push(act);
    return acc;
  }, {});

  if (!currentUser) return null;

  return (
    <Container className="py-5">
      <Row>
        {/* ----- CARD PROFILO ATLETA ----- */}
        <Col lg={4} className="mb-4">
          <Card className="shadow border-0 text-center p-4 sticky-top" style={{ top: "20px" }}>
            <div className="bg-primary rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center text-white fw-bold" 
                 style={{ width: "80px", height: "80px", fontSize: "2rem" }}>
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <Card.Title className="h3 fw-bold mb-0">{currentUser.name}</Card.Title>
            <Card.Text className="text-muted">{currentUser.email}</Card.Text>
            <hr />
            <div className="text-start mb-3">
              <p className="mb-1"><strong>Ruolo:</strong> <Badge bg="info">{currentUser.role}</Badge></p>
              <p className="mb-0"><strong>Sessioni Totali:</strong> {activities.length}</p>
            </div>
            <Button variant="outline-danger" size="sm" onClick={() => navigate("/dashboard")}>Torna ad allenarti!</Button>
          </Card>
        </Col>

        {/* DIARIO RAGGRUPPATO */}
        <Col lg={8}>
          <h2 className="fw-bold mb-4">Il Mio Diario Allenamenti 📓</h2>
          
          {Object.keys(groupedActivities).length > 0 ? (
            Object.keys(groupedActivities).map((wodName) => (
              <Card key={wodName} className="mb-4 shadow-sm border-0 overflow-hidden">
                <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center py-3">
                  <h5 className="m-0 fw-bold text-uppercase">{wodName}</h5>
                  <Badge bg="primary" pill>{groupedActivities[wodName].length} Volte</Badge>
                </Card.Header>
                
                <ListGroup variant="flush">
                  {groupedActivities[wodName].map((session) => (
                    <ListGroup.Item key={session.id} className="py-3 border-bottom">
                      <Row className="align-items-center g-3">
                        <Col xs={12} md={4}>
                          <small className="d-block text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Data</small>
                          <div className="fw-bold">{session.date}</div>
                        </Col>

                        {/* VISTA CONDIZIONALE IN BASE ALLO STATO DEL WOD */}
                        {session.status === "Assigned" ? (
                        <>
                        <Col xs={12} md={4}>
                          <small className="d-block text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Stato</small>
                          <div className="fw-bold">{session.status}</div>
                        </Col>
                        <Col xs={12} md={2} className="justify-content-center align-items-center">
                          <Button variant="link" className="p-1 text-info" 
                                  onClick={() => navigate("/Dashboard")}>
                            🫵🏻 Inizia il WOD!
                          </Button>
                          </Col>
                          <Col xs={12} md={2} className="text-end">
                          <Button variant="link" className="p-1 text-danger" 
                                  onClick={() => handleDelete(session.id)}>
                            🗑️ Cancella attività
                          </Button>
                        </Col>
                        </>
                        ) : (
                        <>
                        <Col xs={6} md={4}>
                          <small className="d-block text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Stato</small>
                          <div className="fw-bold">{session.status}</div>
                        </Col>
                        <Col xs={6} md={3}>
                          <small className="d-block text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Risultato</small>
                          <div className="text-primary fw-bold">{session.score}</div>
        
                          <small className="d-block text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Tempo</small>
                          <div>{session.timeElapsed || session.duration} min</div>
                        </Col>
                        <Col xs={12} md={2} className="justify-content-center align-items-center">
                          <Button variant="link" className="p-1 text-info" 
                                  onClick={() => { setCurrentAct(session); setTempNote(session.notes || ""); setShowNoteModal(true); }}>
                            📝 Aggiungi nota
                          </Button>
                          </Col>
                          <Col xs={12} md={2} className="text-end">
                          <Button variant="link" className="p-1 text-danger" 
                                  onClick={() => handleDelete(session.id)}>
                            🗑️ Cancella attività
                          </Button>
                        </Col>
                        </>
                        )}                       
                      </Row>

                      {/* Nota della sessione */}
                      {session.notes && (
                        <div className="mt-2 p-2 bg-light border-start border-3 border-warning rounded small fst-italic">
                          " {session.notes} "
                        </div>
                      )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            ))
          ) : (
            <div className="text-center py-5 bg-light rounded border border-dashed">
              <p className="text-muted">Ancora nessun WOD nel tuo diario.</p>
              <Button onClick={() => navigate("/WodLibrary")}>Sfoglia la Library</Button>
            </div>
          )}
        </Col>
      </Row>

      {/* --- MODALE NOTE --- */}
      <Modal show={showNoteModal} onHide={() => setShowNoteModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Note Sessione: {currentAct?.wodName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Sensazioni o dettagli tecnici (es. Scalato peso a 40kg)</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={tempNote} 
              onChange={(e) => setTempNote(e.target.value)}
              placeholder="Inserisci una nota..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNoteModal(false)}>Annulla</Button>
          <Button variant="primary" onClick={handleSaveNote}>Salva Nota</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default UserProfile;