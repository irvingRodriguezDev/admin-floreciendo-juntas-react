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
      const formData = new FormData();
      formData.append('title', datos.title);
      formData.append('description', datos.description);
      formData.append('level', datos.level);
      formData.append('system_id', datos.system_id);
      formData.append('has_certificate', datos.hasCertificate ? true : false);

      if (datos.coverImage instanceof File) {
        formData.append('coverImage', datos.coverImage);
      }

      if (datos.certificate instanceof File) {
        formData.append('certificate', datos.certificate);
      }

      if (datos.workbook instanceof File) {
        formData.append('workbook', datos.workbook);
      }

      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]); // Verifica lo que se envía
      }

      await MethodPost('/courses', formData);

      Swal.fire({
        title: 'Éxito',
        text: 'Curso creado correctamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo crear el curso',
        icon: 'error',
      });
    }
  };


  const actualizarCurso = async (id, datos) => {
    try {
      const formData = new FormData();

      formData.append('title', datos.title);
      formData.append('description', datos.description);
      formData.append('level', datos.level);
      formData.append('system_id', datos.system_id);
      formData.append('has_certificate', datos.hasCertificate ? true : false);

      if (datos.coverImage instanceof File) {
        formData.append('coverImage', datos.coverImage);
      }

      if (datos.certificate instanceof File) {
        formData.append('certificate', datos.certificate);
      }

      if (datos.workbook instanceof File) {
        formData.append('workbook', datos.workbook);
      }

      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]); // Log de verificación
      }

      await MethodPut(`/courses/${id}`, formData);

      Swal.fire({
        title: "Éxito",
        text: "Curso actualizado correctamente",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "No se pudo actualizar el curso",
        icon: "error",
      });
    }
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
