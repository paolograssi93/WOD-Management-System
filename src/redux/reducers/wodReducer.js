const initialState = {
    library: [], //In questa libreria abbiamo i wod presenti in server/db.json
    userActivities: [], //Qui abbiamo i wod scelti dall'utente con gli stati: assigned/pending/completed
    isLoading: false, //utilizzata per gestire il caricamento dell'intefaccia utente in fase di caricamento
    error: null //registriamo eventuali errori
}

const wodReducer = (actualState = initialState, action) => {
    switch (action.type) {
        case 'SET_WODS_LOADING':
            //condizione di caricamento dei wods e prima del lancio della richiesta fetch
            return{...actualState, isLoading: true}
            
        case 'SET_LIBRARY':
            //viene lanciato quando la fetch ha successo
            return{...actualState, library:action.payload, isLoading:false}

        case 'SET_USER_ACTIVITIES':
            //Utilizzato durante il caricamento dei wods di un utente specifico
            return {
                ...actualState, 
                userActivities: action.payload, //carico i wods assegnati o scelti dall'utente
                isLoading: false
             }
        
        case 'ADD_ACTIVITY':
            //Viene lanciato dopo il submit dell'utente a seguito della scelta del wod
            return{
                ...actualState,
                userActivities: [...actualState.userActivities, action.payload] //creo un array includento tutto ciò che era presente e aggiungendo i nuovi wod alla fine
            }

        case 'UPDATE_ACTIVITY':
            //Viene lanciato dopo il submit dell'utente a seguito della scelta del wod
            return{
                ...actualState,
                //Per gestire il cambiamento di stato di un wod sovrascrivo un array creandone uno nuovo
                userActivities: actualState.userActivities.map((activity) => activity.id === action.payload.id ? action.payload : activity)
                //durante il ciclo cerco l'id dell'attività interessata per la modifica di stato. Se l'id è quello interessato copio l'attività con la modifica di stato, altrimenti se l'ID non è l'interessato lo copio così com'è
            }
            
        case 'WODS_ERROR':
            //Gestisco eventuali errori
            return{
                ...actualState,
                error: action.payload,
                isLoading: false
            }
    
        default:
            return actualState;
    }
}

export default wodReducer