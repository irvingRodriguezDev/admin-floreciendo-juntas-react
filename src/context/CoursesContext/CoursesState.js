import React, { useReducer } from 'react';
import CoursesContext from './CoursesContext';
import CoursesReducer from './CoursesReducer';
import MethodGet, {
  MethodPost,
  MethodPut,
  MethodDelete,
} from '../../config/Service';
import Swal from 'sweetalert2';
import imageHeaders from '../../config/imageHeader';
import {
  SHOW_ERRORS_API,
  OBTENER_COURSES,
  OBTENER_COURSE,
  AGREGAR_COURSE,
  ACTUALIZAR_COURSE,
  ELIMINAR_COURSE,
} from '../../types';
import tokenAuth from '../../config/TokenAuth';

const CoursesState = (props) => {
  const initialState = {
    courses: [],
    course: null,
    cargando: true,
    success: false,
  };

  const [state, dispatch] = useReducer(CoursesReducer, initialState);

  // Obtener todos los cursos
  const obtenerCursos = async () => {
    try {
      const { data } = await MethodGet('/courses');
      dispatch({
        type: OBTENER_COURSES,
        payload: data,
      });
    } catch (error) {
      dispatch({ type: SHOW_ERRORS_API });
    }
  };

  // Crear un nuevo curso
  const crearCurso = async (datos) => {
    try {
      const { data } = await MethodPost('/courses', datos);
      Swal.fire({
        title: 'Éxito',
        text: 'Curso creado correctamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
      dispatch({
        type: AGREGAR_COURSE,
        payload: data,
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo crear el curso',
        icon: 'error',
      });
      dispatch({ type: SHOW_ERRORS_API });
    }
  };

  const actualizarCurso = async (id, datos) => {
    const formData = new FormData();
    formData.append('title', datos.title);
    formData.append('description', datos.description);
    formData.append('level', datos.level);
    formData.append('system_id', datos.system_id);
    formData.append('hasCertificate', datos.hasCertificate);

    if (datos.coverImage instanceof File) {
      formData.append('coverImage', datos.coverImage);
    }

    let url = `/courses/${id}`;
    MethodPut(url, formData) // ❌ sin imageHeaders
      .then((res) => {
        console.log(res, 'respuesta del servidor');
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Eliminar curso
  const eliminarCurso = async (id) => {
    try {
      await MethodDelete(`/courses/${id}`);
      Swal.fire({
        title: 'Eliminado',
        text: 'Curso eliminado correctamente',
        icon: 'success',
        timer: 1000,
        showConfirmButton: false,
      });
      dispatch({
        type: ELIMINAR_COURSE,
        payload: id,
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo eliminar el curso',
        icon: 'error',
      });
      dispatch({ type: SHOW_ERRORS_API });
    }
  };

  // Obtener un curso por ID
  const obtenerCursoPorId = async (id) => {
    try {
      const { data } = await MethodGet(`/courses/${id}`);
      dispatch({
        type: OBTENER_COURSE,
        payload: data,
      });
      return data; // <-- Retorna los datos
    } catch (error) {
      dispatch({ type: SHOW_ERRORS_API });
      return null; // <-- Retorna null en caso de error
    }
  };

  return (
    <CoursesContext.Provider
      value={{
        courses: state.courses,
        course: state.course,
        cargando: state.cargando,
        success: state.success,
        obtenerCursos,
        crearCurso,
        actualizarCurso,
        eliminarCurso,
        obtenerCursoPorId,
      }}
    >
      {props.children}
    </CoursesContext.Provider>
  );
};

export default CoursesState;
