export const loginUser = (email, password) => {
    return async dispatch => {
        try{
            //fetch per verificare se l'utente è presente nel server/db.json
            const response = await fetch(`http://localhost:3001/users?email=${email}&password=${password}`);
            const data = await response.json()

            if (data.length > 0){
                //Se l'utente viene trovato all'interno di server/db.json
                dispatch({type: 'LOGIN_SUCCESS', payload: data[0]})
            }
            else{
                //Se l'utente non viene trovato all'interno di server/db.json
                dispatch({type: 'LOGIN_ERROR', payload: 'Credenziali non valide'})
            };
        }
        catch (error){
            console.log(error)
            alert('INVALID CREDENTIALS')
        }
        
    }
}

export const logoutUser = () => ({
    type: 'LOGOUT'
});