import {
    OBTENER_CERTIFICATIONS,
    CREAR_CERTIFICATION,
    ACTUALIZAR_CERTIFICATION,
    ELIMINAR_CERTIFICATION,
    OBTENER_CERTIFICATION,  
} from '../../types';

export default (state, action) => {
    switch (action.type) {
        case OBTENER_CERTIFICATIONS:
            return {
                ...state,
                certifications : action.payload,
                error:null,
            };
        case CREAR_CERTIFICATION:
            return {
                ...state,
                certifications: [...state.certifications, action.payload],
                error:null,
            };
        case ACTUALIZAR_CERTIFICATION:
            return {
                ...state,
                certifications: state.certifications.map(cert => 
                    cert.id === action.payload.id ? action.payload : cert
                ),
                error:null,
            };
        case ELIMINAR_CERTIFICATION:
            return {
                ...state,
                certifications: state.certifications.filter(cert => cert.id !== action.payload),
                error:null,
            };
        case OBTENER_CERTIFICATION:
            return {
                ...state,
                certification: action.payload,
                error:null,
            };
        default:
            return state;
    }
};