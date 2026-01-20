import { useEffect, useState } from "react";
import { Accordion, Badge, Button, Container, Form, Modal, Row, Col, Table } from "react-bootstrap";

function Admin() {
  const [users, setUsers] = useState([]);
  const [allActivities, setAllActivities] = useState([]);
  
  // Setto lo stato iniziale della modale bootstrap
  const [showModal, setShowModal] = useState(false);

  // Stato per il nuovo WOD
  const [newWod, setNewWod] = useState({
    name: "",
    type: "",
    duration: "",
    exercises: [""],
    coachNotes: ""
  });

  //funzione chiamata quando clicco su Annulla nella modale di aggiunta nuovo wod 
  const handleClose = () => {
    setShowModal(false);
    setNewWod({ name: "", type: "", duration: "", exercises: [""], coachNotes: "" }); //resetto i parametri
  };

  const handleShow = () => setShowModal(true); //funzione richiamata quando apro la modale

  // useEffect utilizzata dal Pannello Coach per rilevare le attività e stato attività per ogni utente
  // saranno annidate in tab utilizzando bootstrap
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Effettuo le fetch per prelevare tutti gli utenti e attività dal db.json
        const responseUser = await fetch("http://localhost:3001/users"); //rilevo gli atleti
        const dataUsers = await responseUser.json();
        setUsers(dataUsers); //setto Users con i valori json prelevati

        const responseAct = await fetch("http://localhost:3001/user_activities"); //prelevo tutte le attività svolte dagli atleti
        const dataAct = await responseAct.json();
        setAllActivities(dataAct); //setto tutte le attività degli atleti
      } catch (error) {
        console.log("Errore nel caricamento dei dati: ", error);
      }
    };
    fetchData();
    //Effettuo un pooling ogni 3 secondi per verificare eventuali aggiornamenti di stato dei wod nel Pannello di Controllo
    const interval = setInterval(fetchData, 3000)

    //Elimino il timer all'uscita della pagina
    return() => clearInterval(interval)
  }, []);

  //Gestisce l'aggiornamento dell'esercizio all'interno dell'array del nuovo wod
  const handleExercisesChange = (index, value) => {
    const updateExercises = [...newWod.exercises];
    updateExercises[index] = value;
    // Usiamo lo spread operator (...) per mantenere tutte le altre proprietà (name, type, duration)
    // e sovrascriviamo solo la proprietà 'exercises' con il nostro nuovo array aggiornato.
    setNewWod({ ...newWod, exercises: updateExercises });
  };

  // Funzione per aggiungere righe di esercizi in fase di creazione Nuovo WOD
  const addExerciseField = () => {
    setNewWod({ ...newWod, exercises: [...newWod.exercises, ""] });
  };

  //funzione richiamata nel submit del form
  const handleSubmitWod = async (e) => {
    e.preventDefault();

    if (!newWod.type) {
      return alert("Attenzione! Scegliere il tipo di WOD!"); //alert in caso non venisse scelto il tipo di wod dal menu a tendina. RICHIESTO
    }

    try {
      //effettuo una post con i dati inseriti nella modale
      const response = await fetch("http://localhost:3001/wods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWod) //invio un campo json a db.json
      });

      if (response.ok) {
        alert("WOD salvato con successo nella WOD Library");
        handleClose();
      }
    } catch (error) {
      console.log("Errore nel salvataggio:", error);
    }
  };

  // Funzione utilizzata per raggruppare più risultati dello stesso wod nella vista pannello di controllo
const getGroupedActivities = (userId) => {
  // Verifichiamo se allActivities contiene dati
  if (!allActivities || allActivities.length === 0) return {}; //se allActivities è vuoto o nullo restituisce un array vuoto

  return allActivities
    //filtro le attività per atleta
    .filter(act => {
      // Estraggo l'ID utente dell'attività corrente
      const idAttivita = act.userID;
      // Confronto l'id dell'atleta con quello dell'attività in esame
      return idAttivita === userId;
    })
    .reduce((acc, act) => {
      // Riduco l'array filtrato in un oggetto in cui setto il nome del WOD come chiave (o act.name se act.wodName è vuoto)
      const nomeWod = act.wodName || act.name; 
      if (!acc[nomeWod]) { //se nell'accumulatore non esiste ancora una chiave con questo nome
        acc[nomeWod] = []; //creo un nuovo array vuoto per quel wod
      }
      acc[nomeWod].push(act); //aggiungo l'attività corrente all'array wod corrispondente
      return acc; // restituisco l'accumulatore acc aggiornato
    }, {}); //Inizializzo l'accumulatore acc come oggetto vuoto
};


  // ----- PANNELLO ADMIN -----
  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="fw-bold">Pannello Admin</h1>
        <Button variant="primary" onClick={handleShow} className="px-4 shadow-sm">
          ＋ Nuovo WOD
        </Button>
      </div>

      {/* --- MODALE PER L'INSERIMENTO DEL NUOVO WOD CREATO --- */}
      {/* Sono richiesti tutti i campi, tranne le note coach che sono facoltative */}
      <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>AGGIUNGI NUOVO ALLENAMENTO NEL WOD LIBRARY</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitWod}>
          <Modal.Body>
            <Row className="mb-3">
              <Form.Group as={Col} md={6} controlId="formWodName">
                <Form.Label className="fw-bold">Nome WOD:</Form.Label>
                <Form.Control 
                  required 
                  type="text" 
                  placeholder="Es: Grace, Cindy..." 
                  value={newWod.name}
                  onChange={(e) => setNewWod({...newWod, name: e.target.value})}
                />
              </Form.Group>

              <Form.Group as={Col} md={3} controlId="formWodType">
                <Form.Label className="fw-bold">Tipo:</Form.Label>
                <Form.Select 
                  required 
                  value={newWod.type}
                  onChange={(e) => setNewWod({...newWod, type: e.target.value})}
                >
                  <option value="" disabled>Scegli...</option>
                  <option value="For Time">For Time</option>
                  <option value="AMRAP">AMRAP</option>
                  <option value="Hero WOD">Hero WOD</option>
                </Form.Select>
              </Form.Group>

              <Form.Group as={Col} md={3} controlId="formWodDuration">
                <Form.Label className="fw-bold">Time Cap (min):</Form.Label>
                <Form.Control 
                  required 
                  type="number" 
                  placeholder="Es: 15" 
                  value={newWod.duration}
                  onChange={(e) => setNewWod({...newWod, duration: e.target.value})}
                />
              </Form.Group>
            </Row>

            {/* Sezione in cui vengono inseriti gli esercizi come elementi di array */}
            <div className="bg-light p-3 rounded border">
              <Form.Label className="fw-bold">Esercizi</Form.Label>
              {newWod.exercises.map((ex, index) => (
                <Form.Control 
                  key={index} 
                  type="text" 
                  className="mb-2" 
                  placeholder={`Esercizio ${index + 1}`}
                  value={ex} 
                  onChange={(e) => handleExercisesChange(index, e.target.value)}
                  required
                />
              ))}
              <Button variant="outline-dark" size="sm" onClick={addExerciseField}>
                ＋ Aggiungi esercizio
              </Button>
            </div>

            <Row className="mt-3">
              <Form.Group as={Col} md={15} controlId="formWodName">
                <Form.Label className="fw-bold">Note del Coach:</Form.Label>
                <Form.Control  
                  type="text" 
                  placeholder="Es: Pesi rx: 60kg uomo/40kg donna" 
                  value={newWod.coachNotes}
                  onChange={(e) => setNewWod({...newWod, coachNotes: e.target.value})}
                />
              </Form.Group>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Annulla</Button>
            <Button variant="success" type="submit">Salva nella WOD Library</Button>
          </Modal.Footer>
        </Form>
      </Modal>


      {/* --- SEZIONE PANNELLO DI CONTROLLO ATLETI -- */}
      {/* Verifico la cronologia dei wod degli atleti e il loro stato. Visualizzazione condizionale in base allo stato wod*/}
      <h3 className="mb-4">Attività Atleti</h3>
      <Accordion>
        {users.map((user) => { //effettuo la lettura dell'array users prelevando il nome degli atleti
          const grouped = getGroupedActivities(user.id); 
          return (

            /*Utilizzo Accordion di Bootstrap per creare una lista espandibile
            'eventKey' è fondamentale per React-Bootstrap per sapere quale elemento aprire/chiudere.
            'key' serve a React per gestire correttamente la lista (usando l'ID univoco dell'utente). */
            <Accordion.Item eventKey={user.id} key={user.id} className="mb-2 shadow-sm"> 
              <Accordion.Header>
                <strong>{user.name.toUpperCase()}</strong>
                <Badge bg="dark" pill className="ms-auto me-3">
                  {Object.keys(grouped).length} WOD Trovati {/* Object.keys(grouped).length' conta quante chiavi (WOD diversi) ci sono nell'oggetto raggruppato. */}
                </Badge>
              </Accordion.Header>

              {/* -- Vista quando espando la lista -- */}
              <Accordion.Body>
                {Object.keys(grouped).length === 0 ? (
                  <p className="text-muted text-center py-3">Nessun dato registrato.</p> //Se la cronologia wod è vuota
                ) : (
                  <Table striped hover responsive className="mb-0 align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>WOD</th>
                        <th>Storico Performance</th>
                      </tr>
                    </thead>
                    <tbody>

                      {/* Object.entries trasforma l'oggetto 'grouped' in un array di coppie [chiave, valore].
                        Destrutturiamo: 'wodName' è la chiave (es: "Fran"), 'records' è l'array di tutte le volte che è stato fatto. */}
                      {Object.entries(grouped).map(([wodName, records]) => ( 
                        <tr key={wodName}>
                          <td>
                            <div className="fw-bold text-primary">{wodName}</div>
                            <small className="text-muted">{records[0]?.type}</small>
                          </td>
                          <td>
                            {records.map((r, i) => (
                              <div key={i} className="d-flex justify-content-between py-1 border-bottom small">
                                <span>📅 {r.date}</span>

                                {/* Logica condizionale per le icone: 
                                - Se completato mette il trofeo e il punteggio.
                                - Se in corso o assegnato mette icone diverse. */}
                                <strong>{r.status === "Completed" ? `🏆 ${r.score}` : r.status === "In Progress" ? `💪 ${r.status}` : `🕐 ${r.status}`}</strong>
                                
                                {/* Se il tempo è registrato lo mostro all'interno di un badge*/}
                                {r.timeElapsed && <span className="badge bg-light text-dark border ms-2">{r.timeElapsed}</span>} 
                              </div>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </Container>
  );
}

export default Admin;