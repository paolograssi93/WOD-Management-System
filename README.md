***********************************************************************************************
    -- APP CREATA A SOLO SCOPO DI DIMOSTRARE LE CONOSCENZE FRONT-END IN FASE DI ESAME 
         PER IL PROGRAMMA 'FRONT-END PROGRAMMING' DI EPICODE INSTITUTE OF TECHNOLOGY --    
***********************************************************************************************

WOD Management System 🏋️‍♂️💪
Una piattaforma completa progettata per la gestione degli allenamenti all'interno di un Box CrossFit o palestra. Il sistema permette una comunicazione fluida tra Coach e Atleti, monitorando i progressi e le performance in tempo reale.

### 🛠️ Architettura e Gestione Dati
Per questo progetto è stata simulata un'infrastruttura **REST API** utilizzando `json-server`. 
I dati presenti in `db.json` sono esposti a scopo dimostrativo per permettere il test delle seguenti funzionalità Front-End:
* **CRUD Operations**: Creazione, lettura, aggiornamento e cancellazione dei dati (Atleti/WOD).
* **State Management**: Gestione globale dello stato tramite Redux Toolkit.
* **Async Logic**: Gestione delle chiamate asincrone e dei tempi di caricamento (loading states).

🚀 Caratteristiche Principali
👤 Area Atleta
WodLibrary: Accesso completo a tutti i WOD pubblici e quelli creati specificamente dal Coach.

Sistema di Gestione Stati:

[Assigned]: L'atleta prende in carico un allenamento.

[In_Progress]: Avvio di un timer interattivo a tutto schermo tramite modale per tracciare la durata del workout (avviabile dalla pagina WodDetail)

[Completed]: Salvataggio dei risultati (score/tempo/round) e spostamento automatico nello storico.

Diario Performance: Un'area dedicata per visualizzare la cronologia, inserire note personali e gestire la propria lista di attività.

📋 Area Coach (Admin)
Monitoraggio Atleti: Visualizzazione completa delle attività e dei progressi di tutti gli utenti registrati al box.

Wod Creator: Strumento per creare e pubblicare nuovi WOD nella library.

Accesso Multilivello: Il coach mantiene tutte le funzionalità dell'atleta per la gestione dei propri allenamenti.

🛠 Stack Tecnologico
Frontend: React (Vite)

State Management: Redux con gestione asincrona (Actions/Reducers)

Interfaccia Utente: React-Bootstrap per un design responsive e componenti modali.

Routing: React Router DOM per la navigazione dinamica.

Backend: JSON Server (simulazione API REST).

Icone & Spinners: React Spinners & React Icons.

📂 Struttura del Progetto

src/
├── pages/           # Dashboard, WodLibrary, Admin, WodDetail, Home, Login, UserProfile, NotFound
├── redux/           # Store, Reducers e Actions per la logica WOD e Auth
├── server/          # Backend simulato (db.json)
└── layout/          # Strutture comuni delle pagine (Navbar, Footer, Layout)

⚙️ Installazione e Avvio

1. Setup del Backend (JSON Server)
Apri un terminale dedicato:

Bash

cd src/server
npm install
npm run dev
Il server sarà attivo su: http://localhost:3001

2. Setup del Frontend
Apri un secondo terminale:

Bash

npm install
npm run dev
L'applicazione sarà disponibile su: http://localhost:5173/

🔐 Logica di Sicurezza e Protezione Rotte
L'applicazione implementa un sistema di controllo accessi basato sui ruoli definiti nel db.json.

Ruolo Atleta: Può visualizzare solo le proprie attività nella Dashboard e accedere alla Library.

Ruolo Admin (Coach): Ha accesso esclusivo alla pagina Admin, dove può monitorare l'intero box e creare nuovi contenuti.

Persistenza: Grazie a Redux, lo stato dell'utente viene mantenuto durante la navigazione, garantendo che le informazioni sensibili non vengano mostrate ad utenti non autorizzati.

⏱️ Logica del Workout Timer
Il cuore dell'esperienza utente è la gestione dinamica del workout, gestita tramite uno stato centralizzato:

Avvio: Al click su "INIZIA ORA", il sistema invia una dispatch updateWodStatus che imposta il WOD su In Progress.

Esecuzione: Un useEffect dedicato gestisce il cronometro con precisione al secondo, visualizzato in una modale "focus mode" per eliminare le distrazioni durante l'allenamento.

Chiusura: La funzione handleStopFromModal interrompe il timer e apre immediatamente la finestra di salvataggio.

Salvataggio: I dati (tempo finale + punteggio inserito) vengono inviati al server, aggiornando definitivamente l'attività in Completed e salvando il wod nel db.json


📊 Struttura del Database (db.json)
Il progetto utilizza json-server per gestire un database mock. Di seguito la struttura principale degli oggetti:

🏃 Activities (userActivities)
Rappresenta il legame tra un utente e un WOD, tracciandone lo stato e i risultati.

JSON

{
  "id": "1",
  "userID": 1,
  "wodId": "101",
  "wodName": "Fran",
  "exercises": ["21-15-9 Thrusters", "21-15-9 Pull-ups"],
  "status": "Assigned | In Progress | Completed",
  "score": "3:45",
  "timeElapsed": "03:45",
  "date": "20/10/2023"
}

🏋️ Library (WODs)
Contiene la definizione tecnica di ogni allenamento.

JSON

{
  "id": "101",
  "name": "Fran",
  "type": "For Time",
  "duration": "10",
  "exercises": ["Thrusters", "Pull-ups"],
  "coachNotes": "Keep a steady pace, break only if necessary."
}


👥 Users
Gestisce l'autenticazione e i ruoli.

JSON

{
  "id": "1",
  "name": "Coach Pierluigi",
  "email": "admin@box.com",
  "password": "123",
  "role": "admin"
},
{
  "id": "2",
  "name": "Atleta Paolo",
  "email": "paolo@box.com",
  "password": "123",
  "role": "athlete"
}
