import {
  GET_SYSTEMS,
  ADD_SYSTEM,
  UPDATE_SYSTEM,
  DELETE_SYSTEM,
  SYSTEM_ERROR,
} from "../../types";

export default (state, action) => {
  switch (action.type) {
    // 📦 Obtener todos los sistemas
    case GET_SYSTEMS:
      return {
        ...state,
        systems: action.payload,
        loading: false,
      };

    // ➕ Agregar un nuevo sistema
    case ADD_SYSTEM:
      return {
        ...state,
        systems: [action.payload, ...state.systems],
        loading: false,
      };

    // ✏️ Actualizar sistema existente
    case UPDATE_SYSTEM:
      return {
        ...state,
        systems: state.systems.map((system) =>
          system.id === action.payload.id ? action.payload : system
        ),
        loading: false,
      };

    // 🗑️ Eliminar sistema
    case DELETE_SYSTEM:
      return {
        ...state,
        systems: state.systems.filter(
          (system) => system.id !== action.payload
        ),
        loading: false,
      };

    // ⚠️ Error en API
    case SYSTEM_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    // Estado por defecto
    default:
      return state;
  }
};
