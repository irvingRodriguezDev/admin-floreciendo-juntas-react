import {
    GET_FORMATIONS,
    ADD_FORMATION,
    DELETE_FORMATION,
    UPDATE_FORMATION,
    FORMATION_ERROR,
    SET_LOADING,
    GET_PENDING_DELIVERIES,
    REVIEW_DELIVERY,
    DELIVERY_ERROR,
} from "../../types";

const FormationReducer = (state, action) => {
    switch (action.type) {
        case GET_FORMATIONS:
            return { ...state, formations: action.payload, cargando: false, error: null };

        case ADD_FORMATION:
            return { ...state, formations: [...state.formations, action.payload], cargando: false, success: true, error: null };

        case UPDATE_FORMATION:
            return {
                ...state,
                formations: state.formations.map((f) => f.id === action.payload.id ? action.payload : f),
                cargando: false, success: true, error: null,
            };

        case DELETE_FORMATION:
            return { ...state, formations: state.formations.filter((f) => f.id !== action.payload), cargando: false, error: null };

        // ✅ Nuevos casos
        case GET_PENDING_DELIVERIES:
            return { ...state, pendingDeliveries: action.payload, cargando: false, error: null };

        case REVIEW_DELIVERY:
            return {
                ...state,
                pendingDeliveries: {
                    ...state.pendingDeliveries,
                    deliveries: state.pendingDeliveries.deliveries.filter(
                        (d) => d.id !== action.payload
                    ),
                },
                cargando: false,
                error: null,
            };

        case DELIVERY_ERROR:
            return { ...state, error: action.payload, cargando: false };

        case FORMATION_ERROR:
            return { ...state, error: action.payload, cargando: false };

        case SET_LOADING:
            return { ...state, cargando: true };

        default:
            return state;
    }
};

export default FormationReducer;