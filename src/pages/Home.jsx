import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, ListGroup, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; 


function Home() {
  const navigate = useNavigate()

  
  // Leggiamo i dati da redux/reducers/authReducer.js
  const currentUser = useSelector((state) => state.auth.currentUser);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  //inizializzo le statistiche feedback
  const [stats, setStats] = useState({
    totalWods: 0,
    activeUsers: 0,
    latestActivity: [] 
  });


  //EFFETTUO LE FETCH PER POPOLARE LA SEZIONE FEEDBACK ATLETI
  useEffect(() => {
    // Se non è autenticato, non facciamo le fetch per risparmiare tempo e operazioni non utili
    if (isAuthenticated) { //verifico se l'utente è autenticato (isAuthenticated=True)
      const fetchHomeData = async () => { //se si, eseguo le fetch previste per la home: wods, users, user_activities
        try {
          //utilizzo Promise per avviare le fetch dei dati utili. Uso Promise in quanto tutte le fetch devono dare esito positivo per popolare corretatmente la sezione
          const [resLibrary, resUsers, resActs] = await Promise.all([ 
            fetch("http://localhost:3001/wods"),
            fetch("http://localhost:3001/users"),
            fetch("http://localhost:3001/user_activities")
          ]);
          
          const library = await resLibrary.json();
          const users = await resUsers.json();
          const acts = await resActs.json();

          //da tutte lee attività prelevate estraggo le ultime 5 per dare il feedback delle ultime 5 attività del box
          const activitiesWithNames = acts.slice(-5).reverse().map(activity => {
            //verifico se l'id dell'utente estratto corrisponde a quello dei wod effettuati e presenti su user_activities del db.json
            const user = users.find(u => u.id === activity.userID); 
            return {
              ...activity,
              userName: user.name,
              durationWod: activity.timeElapsed || "---",
              wodStatus: activity.status
            };
          });

          //setto le statistiche richieste
          setStats({
            totalWods: library.length,
            activeUsers: users.length,
            latestActivity: activitiesWithNames
          });
        } catch (error) {
          console.error("Errore caricamento dati:", error);
        }
      };
      fetchHomeData();
    }
  }, [isAuthenticated]); //lo useEffect si avvia se l'utente è autenticato


  //Implemento useEffect per impedire all'utente di tornare indietro dopo il login
  useEffect(() => {
  // Aggiunge una entry fittizia alla cronologia
  window.history.pushState(null, null, window.location.pathname);

  const handleBackButton = () => {
    // Blocca il ritorno indietro e "spinge" l'utente a restare qui
    window.history.pushState(null, null, window.location.pathname);
    alert("Sessione attiva: usa il tasto Logout per uscire in sicurezza."); //messaggio alert che appare se l'utente torna indietro
  };

  window.addEventListener('popstate', handleBackButton); //popstate per l'uscita accidentale

  return () => {
    window.removeEventListener('popstate', handleBackButton);
  };
}, []);


  // --- RENDERING PER UTENTE NON LOGGATO ---
  if (!isAuthenticated) {
    return (
      <Container className="text-center py-5">
        <Card className="p-5 shadow border-0 bg-light">
          <h1 className="display-3">🏋️‍♀️ Benvenuto al Box!</h1>
          <p className="lead mb-4">Accedi per visualizzare la Wod Library, i tuoi progressi e i risultati degli altri atleti.</p>
          <div>
            <Button variant="primary" size="lg" onClick={() => navigate("/login")}>
              Accedi al Profilo
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  // --- RENDERING PER UTENTE AUTENTICATO ---
  return (
    <Container className="py-5">
      <header className="text-center mb-5 p-5 bg-dark text-white rounded shadow border-bottom border-primary border-5">
        <h1 className="display-4 fw-bold text-uppercase">Ciao, {currentUser.name}!</h1>
        <Badge bg={currentUser.role === 'admin' ? 'warning' : 'info'} className="text-dark"> {/* Setto il colore badge in base al ruolo */}
          Accesso {currentUser.role === 'admin' ? 'Coach' : 'Atleta'} {/* Modifico il titolo a seconda del ruolo */}
        </Badge>
      </header>


      {/* -- SEZIONE FEEDBACK ATTIVITA' BOX -- */}
      <Row>
        <Col lg={currentUser.role === "admin" ? 8 : 12}>
          <h4 className="fw-bold mb-3">Feed Attività Recenti</h4>
          <ListGroup className="shadow-sm">
            {stats.latestActivity.map((act, index) => ( //effettuo la lettura dell'array stats.latestActivity
              <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center py-3">
                <div>
                  {  //-- modifico il comportamento di visualizzazione feedback a seconda se lo stato è Assigned o Completed --
                  act.wodStatus == "Assigned" ? ( 
                    <>
                  <span className="fw-bold text-primary">{act.userName}</span>
                  <span className="mx-1">deve iniziare il wod</span>
                  <span className="fw-bold">{act.wodName}</span>
                  </>
                  ) : (
                  <>
                  <span className="fw-bold text-primary">{act.userName}</span>
                  <span className="mx-1">ha fatto</span>
                  <span className="fw-bold">{act.wodName}</span>
                  <span className="mx-1">in</span>
                  <span className="fw-bold">{act.durationWod}</span>
                  {act.durationWod > "01:00" ? (
                    <span className="fw-bold"> minuti</span>
                  ) : act.durationWod == "0" ? (
                    <span className="fw-bold"> ok</span>
                  ) : (
                    <span className="fw-bold"> secondi</span>
                  )}
                </>
                )
                  }
                </div>
                
              
                <Badge bg="dark">{act.score}</Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        {/* Visualizzazione condizionale basata sul ruolo salvato nel reducer */}
        {currentUser.role === "admin" && ( //se il ruolo è coach faccio visualizzare il Pannello Coach e feedback del box
          <Col lg={4}>
            <Card className="p-4 shadow-sm border-0 bg-warning text-dark">
              <h5>Pannello Coach</h5>
              <p className="small">Gestisci la programmazione settimanale e gli atleti.</p>
              <Button variant="dark" onClick={() => navigate("/admin")}>Configura Box</Button>
            </Card>
          </Col>
        )}
      </Row>

      {currentUser.role === "athlete" && ( // Se è Atleta visualizza solo la sezione feedback con i tasti ESPLORA WOD LIBRARY E DIARIO PERFORMANCE
        <Row className="mt-4 g-3">
          <Col md={6}>
            <Button variant="outline-primary" className="w-100 py-4 fs-4 fw-bold" onClick={() => navigate("/WodLibrary")}>
              ESPLORA WOD LIBRARY
            </Button>
          </Col>
          <Col md={6}>
            <Button variant="outline-success" className="w-100 py-4 fs-4 fw-bold" onClick={() => navigate("/UserProfile")}>
              DIARIO PERFORMANCE
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default Home;