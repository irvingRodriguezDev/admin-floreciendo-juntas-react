import {
    GET_USERS,
    ADD_USER,
    UPDATE_USER,
    DELETE_USER,
    USER_ERROR,
} from "../../types";

export default (state, action) => {
    switch (action.type) {
        case GET_USERS:
            return {
                ...state,
                users: action.payload,
                loading: false,
            };

        case ADD_USER:
            return {
                ...state,
                users: [action.payload, ...state.users],
                loading: false,
            };

        case UPDATE_USER:
            return {
                ...state,
                users: state.users.map((u) =>
                    u.id === action.payload.id ? action.payload : u
                ),
                loading: false,
            };

        case DELETE_USER:
            return {
                ...state,
                users: state.users.filter((u) => u.id !== action.payload),
                loading: false,
            };

        case USER_ERROR:
            return {
                ...state,
                error: action.payload,
                loading: false,
            };

        default:
            return state;
    }
};
