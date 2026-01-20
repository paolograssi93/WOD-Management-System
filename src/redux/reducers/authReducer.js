const initialState = {
    currentUser: null,
    isAuthenticated: false,
    role: null,
    error: null
}

const authReducer = (actualState = initialState, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return{
                ...actualState,
                currentUser: action.payload,
                isAuthenticated: true,
                role: action.payload.role,
                error: null
            };

        case 'LOGIN_ERROR':
            return{
                ...actualState,
                error: action.payload
            };

        case 'LOGOUT':
            return initialState;

        default:
            return actualState;
    }
};

export default authReducer;