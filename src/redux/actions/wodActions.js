//1. carico la libreria dei wod da server/db.json
export const getLibraryAction = () => {
    return async (dispatch) => {
        dispatch({type: 'SET_WODS_LOADING'})

        try {
            const response = await fetch('http://localhost:3001/wods') //faccio la fetch dei wods su server/db.json
            const data = await response.json()

            if(data.length > 0){
                //se la risposta da parte del server è positiva
                dispatch({
                    type: 'SET_LIBRARY',
                    payload: data
                })
            }else{
                throw new Error("Errore nel caricamento della libreria") //gestisco un nuovo errore
            }
        } catch (error) {
            //in caso di errore invio una risposta al reducer con dispatch
            dispatch({
                type: 'WODS_ERROR',
                payload: error.message
            })
            
        }
    }
}

//2. Azione per aggiungere il wod nella lista dell'atleta
export const addWodToPlan = (newActivity) => {
    return async (dispatch) => {
        try {
            const response = await fetch('http://localhost:3001/user_activities', { //effettuo una post dell'attività selezionata
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newActivity) //inizialmente conterrà lo stato Assigned
            })

            const data = await response.json()

            if(data.length > 0){
                dispatch({
                    type: 'ADD_ACTIVITY',
                    payload: data
                })
                alert("WOD aggiunto con successo!")
            }
            
        } catch (error) {
            console.log(error)
            
        }
    }
}

//3. Azione per filtrare i WOD di un'atleta effettuando una get filtrata
export const getUserActivities = (userId) => {
    return async(dispatch) => {
        dispatch({type: 'SET_WODS_LOADING'})

        try {
            const response = await fetch(`http://localhost:3001/user_activities?userID=${userId}`) //filtro le attività svolte dall'utente userId
            const data = await response.json()

            if(data){
                dispatch({
                    type: 'SET_USER_ACTIVITIES',
                    payload: data
                })
            }
            
        } catch (error) {
            dispatch({
                type: 'WODS_ERROR',
                payload: 'Impossibile recuperare i tuoi wods. ERRORE: ' + error
            })
            
        }
    }
}

//4. Azione per Start/Stop e Salvataggio dei risultati
export const updateWodStatus = (activityId, updateData) => {
    return async (dispatch) =>{
        try{
            const response = await fetch(`http://localhost:3001/user_activities/${activityId}`, {
                method: 'PATCH', //Aggiorno solo i campi che subiscono la modifica
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify(updateData)
            })
            const data = await response.json()

            if(data && data.id){
                dispatch({
                    type: 'UPDATE_ACTIVITY',
                    payload: data
                })
            }
        } catch (error){
            console.log("Errore: " + error)
        }
    }
}