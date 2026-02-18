import React, { useReducer } from 'react';
import CertificationContext from './CertificationContext';
import CertificationReducer from './CertificationReducer';
import MethodGet, { MethodDelete, MethodPost, MethodPut } from '../../config/Service';
import Swal from 'sweetalert2';
import {
    OBTENER_CERTIFICATIONS,
    CREAR_CERTIFICATION,
    ACTUALIZAR_CERTIFICATION,
    ELIMINAR_CERTIFICATION,
    OBTENER_CERTIFICATION,  
} from '../../types';

const CertificationState = (props) => {
    const initialState = {
        certifications: [],
        certification: null,
        loading: false,
        error:null,
    };

    const [state, dispatch] = useReducer(CertificationReducer, initialState);
    
    // Obtener todas las certificaciones
    const getCertifications = async () => {
        try {
            const { data } = await MethodGet('/certifications/active');
            dispatch({ type: OBTENER_CERTIFICATIONS, payload: data });
        } catch (error) {
            console.error(error);
        }
    };

    // Crear una nueva certificación
    const createCertification = async (certificationData) => {
        try {
            const {data} = await MethodPost('/certifications', certificationData);
            dispatch({ type: CREAR_CERTIFICATION, payload: data});
            await Swal.fire({
                title: 'Certificación creada',
                text: 'La certificación se ha creado correctamente',
                icon: 'success',
                confirmButton: 'Aceptar',
            });
        } catch (error) {
            console.error(error);
        }
    };

    // Actualizar una certificación existente
    const updateCertification = async (id, certificationData) => {
        try {
            const {data} = await MethodPut(`/certifications/${id}`, certificationData);
            dispatch({ type: ACTUALIZAR_CERTIFICATION, payload: data});
            await Swal.fire({
                title: 'Cetificación actualziada',
                text: 'La certificación se ha actualizado correctamente',
                icon: 'success',
                confirmButton: 'Aceptar',
            });
        } catch (error) {
            console.error(error);
        }
        };

    // Eliminar una certificación
    const deleteCertification = async (id) => {
        try {
            await MethodDelete(`/certifications/${id}`);
            dispatch({ type: ELIMINAR_CERTIFICATION, payload: id});
            await Swal.fire({
                title: 'Cetificación eliminada',
                text: 'La certificación se ha elimaado correctamente',
                icon: 'success',
                confirmButton: 'Aceptar',
            });
        } catch (error) {
            console.error(error);
        }
    };

    // Obtener una certificación por ID
    const getCertificationById = async (id) => {
        try {
            const { data } = await MethodGet(`/certifications/${id}`);
            dispatch({ type: OBTENER_CERTIFICATION, payload: data });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <CertificationContext.Provider
            value={{
                certifications: state.certifications,
                certification: state.certification,
                loading: state.loading,
                error: state.error,
                getCertifications,
                createCertification,
                updateCertification,
                deleteCertification,
                getCertificationById,
            }}
        >
            {props.children}
        </CertificationContext.Provider>
     );
};

export default CertificationState;