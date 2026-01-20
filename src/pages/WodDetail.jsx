import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, ListGroup, Badge, Spinner, Modal, Form } from "react-bootstrap";
import { getLibraryAction, addWodToPlan, getUserActivities, updateWodStatus } from "../redux/actions/wodActions";
import { HashLoader } from "react-spinners";

function WodDetail() {
    const { wodId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Preleviamo i dati usando lo stesso selettore della Library
    const { library = [], userActivities = [], isLoading } = useSelector((state) => state.wod || {});
    const { currentUser } = useSelector((state) => state.auth || {});

    const [seconds, setSeconds] = useState(0);
    const [activeTimerId, setActiveTimerId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [score, setScore] = useState("");
    const [showTimerModal, setShowTimerModal] = useState(false);
  
  
    //Chiedo a redux di scaricare le attività dell'atleta dal db.json
    useEffect(() => {
      if (currentUser?.id) {
        dispatch(getUserActivities(currentUser.id));
      }
    }, [dispatch, currentUser?.id]); //Eseguo il codice ogni volta che l'utente cambia
  
    
    //useEffect per l'avvio del timer
    useEffect(() => {
      let interval = null;
      if (activeTimerId) {
        interval = setInterval(() => {
          setSeconds((prev) => prev + 1);
        }, 1000);
      } else {
        clearInterval(interval);
      }
      return () => clearInterval(interval);
    }, [activeTimerId]); //intercetto le modificiche sull'id del timer
  
  
    //formatto la visualizzazione del timer
    const formatTime = (totalSeconds) => {
      const mins = Math.floor(totalSeconds / 60); //calcolo i minuti
      const secs = totalSeconds % 60; //calcolo i secondi
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`; //restituisco la vista del timer
    };
  
  
    //handle per l'avvio del wod cliccando su START WOD
    const handleStart = (activity) => {
      if(!activity) return;
      setSeconds(0);
      setActiveTimerId(activity.id);
      setSelectedActivity(activity); // Memorizziamo il WOD corrente
      setShowTimerModal(true);  // Apriamo la modale
      dispatch(updateWodStatus(activity.id, { status: "In Progress" }));
    };
  
    //handle per la chiusura della modale
    const handleStopFromModal = () => {
      setShowTimerModal(false); // Chiudiamo il timer
      setShowModal(true);       // Apriamo la modale del salvataggio score
      setActiveTimerId(null);
    };
  
  
    //handle per il salvataggio del risultato dopo aver cliccato su STOP & SAVE
    const handleSaveResult = () => {
      if(selectedActivity) {
        dispatch(updateWodStatus(selectedActivity.id, {
          status: "Completed",
          score: score,
          timeElapsed: formatTime(seconds)
        }));
        // Reset stati
        setShowModal(false);
        setScore("");
        setSeconds(0);
        setActiveTimerId(null); 
      }
    };

  // Carichiamo la library se l'utente ricarica la pagina direttamente qui
  useEffect(() => {
    if (library.length === 0) {
      dispatch(getLibraryAction());
    }
  }, [dispatch, library.length]);

  // Cerchiamo il WOD (confronto sicuro tra stringhe)
  const wod = library.find((w) => String(w.id) === String(wodId));

  // Recuperiamo lo storico usando 'userActivities' come nella WodLibrary
  const pastSessionsCompleted = userActivities.filter((s) => 
    s.wodName === wod?.name && s.status === "Completed"
  );

  const pastSessionsAssigned = userActivities.filter((s) => 
    s.wodName === wod?.name && s.status === "Assigned"
  );

  //handle per quando l'atleta clicca su AGGIUNGI AL PIANO
  const handleAddToPlan = () => {
    const newActivity = {
      userID: currentUser.id,
      wodId: wod.id,
      wodName: wod.name,
      exercises: wod.exercises,
      status: "Assigned",
      score: "",
      timeElapsed: "",
      date: new Date().toLocaleDateString()
    };
    dispatch(addWodToPlan(newActivity));
    navigate("/Dashboard");
  };

  //Spinner in fase di caricamento
  if (isLoading) return <div style={{ textAlign: "center", padding: "2rem" }}>
    <HashLoader color="#007bff" size={60} /> Loading...</div>


  //se non viene trovato il wod
  if (!wod) return (
    <Container className="py-5 text-center">
      <h3>WOD non trovato</h3>
      <Button onClick={() => navigate("/WodLibrary")}>Torna alla Library</Button>
    </Container>
  );

  // ----- COMPONENTE WOD DETAIL -----
  return (
    //Tasto per dare la possibilità di tornare alla pagina precedente
    <Container className="py-5">
      <Button variant="outline-secondary" onClick={() => navigate(-1)} className="mb-4"> 
        ← Torna Indietro
      </Button>

      {/* ----- SEZIONE DETTAGLI WOD -----*/}
      <Row>
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center py-3">
              <h2 className="mb-0">{wod.name}</h2>
              <Badge bg="info" className="p-2">{wod.type} - TEMPO RX: {wod.duration} minuti</Badge>
            </Card.Header>
            <Card.Body>
              <h5 className="fw-bold mb-3">Esercizi:</h5>
              <ListGroup variant="flush" className="mb-4">
                {/* Gestisco gli esercizi come array di stringhe come nella WodLibrary */}
                {wod.exercises.map((ex, index) => (
                  <ListGroup.Item key={index} className="py-3">
                    <span className="me-2">🔥</span> {ex}
                  </ListGroup.Item>
                ))}
              </ListGroup>

              {wod.coachNotes && ( //se sono presenti note del coach le visualizzo nella card sotto gli esercizi
                <div className="bg-light p-3 border-start border-4 border-warning rounded">
                  <h6 className="fw-bold">Note del Coach:</h6>
                  <p className="mb-0 italic small">{wod.coachNotes}</p> 
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>


        {/* --- SE IL WOD E' STATO GIA' EFFETTUATO DALL'ATLETA LOGGATO --- */}
        {/* lo faccio visualizzare, come storico (con i risultati e data) nella card a destra */}
        <Col lg={4}>
          <Card className="shadow-sm mb-4 text-center border-0">
            <Card.Body className="py-4">
              <h4 className="fw-bold">Il tuo Storico</h4>
              <div className="my-4">
                <p className="display-4 fw-bold text-primary mb-0">{pastSessionsCompleted.length}</p>
                <p className="text-muted small uppercase">Allenamenti completati</p>
              </div>

              {pastSessionsAssigned.length ? (
                <div className="text-start mb-3">
                  <h6 className="fw-bold small mb-3 text-center">WOD assegnato ma non effettuato!</h6>
                  <Button variant="success" className="w-100 fw-bold py-2" onClick={() => handleStart(pastSessionsAssigned[0])}> 
                    INIZIA ORA!
                  </Button>
                </div>
              ) : pastSessionsCompleted.length > 0 ? (
                <div className="text-start mb-3">
                  <h6 className="fw-bold small mb-3">Ultimi Risultati:</h6>
                  <ListGroup variant="flush" className="small mb-4">
                    {pastSessionsCompleted.slice(-3).reverse().map((s, i) => (
                      <ListGroup.Item key={i} className="px-0 py-2 d-flex justify-content-between bg-transparent">
                        <span>📅 {s.date}</span>
                        <strong className="text-success">{s.score || s.timeElapsed}</strong>
                      </ListGroup.Item>
                    ))}

                    {/* Se il wod è presente nella cronologia, l'utente vedrà il pulsante RIPETI WOD */}
                  </ListGroup>
                  <Button variant="success" className="w-100 fw-bold py-2" onClick={handleAddToPlan}> 
                    RIPETI WOD
                  </Button>
                </div>
              ) : (
                //Altrimenti, se non presente, verà il pulsante AGGIUNGI AL PIANO
                <div className="py-3">
                  <p className="text-muted small italic mb-4">Non hai ancora mai provato questo WOD.</p>
                  <Button variant="primary" className="w-100 fw-bold py-2" onClick={handleAddToPlan}>
                    AGGIUNGI AL PIANO
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>



{/* ---------------------------  MODALE TIMER (FULL SCREEN) ------------------------------------------------------------------------------------------- */}                  
                      <Modal show={showTimerModal} backdrop="static" keyboard={false} centered size="lg">
                        <Modal.Body style={{ textAlign: "center", padding: "3rem", backgroundColor: "#1a1a1a", color: "white", borderRadius: "8px" }}>
                          <h2 style={{ color: "#007bff" }}>{selectedActivity?.wodName}</h2>
                          <p>Allenamento in corso...</p>
                          
                          <div style={{ fontSize: "6rem", fontWeight: "bold", margin: "2rem 0", fontFamily: "monospace" }}>
                            {formatTime(seconds)}
                          </div>

                          <div style={{ textAlign: "left", backgroundColor: "#333", padding: "1rem", borderRadius: "8px", marginBottom: "2rem" }}>
                            <ul style={{ listStyle: "none", padding: 0 }}>
                              {selectedActivity?.exercises?.map((ex, i) => (
                                <li key={i} style={{ fontSize: "1.2rem", marginBottom: "5px" }}>• {ex}</li>
                              ))}
                            </ul>
                          </div>

                          <Button variant="danger" size="lg" onClick={handleStopFromModal} style={{ width: "100%", fontWeight: "bold", padding: "15px" }}>
                            STOP & FINISH
                          </Button>
                        </Modal.Body>
                      </Modal>

                      {/* ----- MODALE SALVATAGGIO WOD ESEGUITO ----- */}
                      {/* Disabilito il tasto X per chiudere la modale e attivo il bottone solo se l'atleta ha inserito il punteggio nel campo score */}
                      {/* Questo per evitare chiusure accidentali, non cambiando lo satato al wod come completed */}
                      <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static" keyboard={false}>
                        <Modal.Header>
                          <Modal.Title>WOD Terminato!</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          <p style={{ textAlign: "center" }}>Tempo finale: <strong>{formatTime(seconds)}</strong></p>
                          <Form.Group>
                            <Form.Label>Risultato (es: 15 round, Rx, 80kg):</Form.Label>
                            <Form.Control 
                              type="text" 
                              value={score} 
                              onChange={(e) => setScore(e.target.value)}
                              placeholder="Inserisci il tuo punteggio..."
                            />
                          </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                          <Button variant="success" onClick={handleSaveResult} disabled={!score} style={{ width: "100%" }}>
                            SALVA RISULTATO
                          </Button>
                        </Modal.Footer>
                      </Modal>
{/* ------------------------------------------------- FINE MODALE ---------------------------------------------------------- */}

    </Container>
  );
}

export default WodDetail;