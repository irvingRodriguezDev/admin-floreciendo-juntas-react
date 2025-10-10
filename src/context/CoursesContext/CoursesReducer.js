import {
    OBTENER_COURSES,
    OBTENER_COURSE,
    AGREGAR_COURSE,
    ACTUALIZAR_COURSE,
    ELIMINAR_COURSE,} from "../../types";

export default (state, action) => {
    switch (action.type) {
        case OBTENER_COURSES:
            return {
                ...state,
                courses: action.payload,
                cargando: false,
            };

        case AGREGAR_COURSE:
            return {
                ...state,
                courses: [...state.courses, action.payload],
                success: true,
            };

        case ACTUALIZAR_COURSE:
            return {
                ...state,
                courses: state.courses.map((course) =>
                    course.id === action.payload.id ? action.payload : course
                ),
                success: true,
            };

        case ELIMINAR_COURSE:
            return {
                ...state,
                courses: state.courses.filter((course) => course.id !== action.payload),
                success: true,
            };

        case OBTENER_COURSE:
            return {
                ...state,
                course: action.payload,
                cargando: false,
            };

        default:
            return state;
    }
};
