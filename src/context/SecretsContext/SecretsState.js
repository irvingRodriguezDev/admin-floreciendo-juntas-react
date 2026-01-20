import React, {useReducer} from 'react';
import SecretsContext from './SecretsContext';
import SecretsReducer from './SecretsReducer';
import {
    GET_SECRETS,
    ADD_SECRET,
    UPDATE_SECRET,
    DELETE_SECRET,
} from '../../types';
import MethodGet, { MethodPost, MethodPut, MethodDelete} from '../../config/Service';
import Swal from 'sweetalert2';

const SecretsState = (props) => {

    //initial state
    const initialState = {
        secrets: [],
        loading: true,
    };

    const [state, dispatch] = useReducer(SecretsReducer, initialState);

    //funcion para obtener los secretos
    const getSecrets = () => {
        let url = "/secrets"
        MethodGet(url)
            .then((res) => {
                dispatch({
                    type:GET_SECRETS,
                    payload: res.data,
                })
            }).catch((error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response.data.error,
                })
                });
    };

    //funcion para agregar un secreto
    const addSecret = (secret) => {
        let url = "/secret"
        MethodPost(url, secret)
            .then((res) => {
                dispatch({
                    type: ADD_SECRET,
                    payload: res.data,
                })
            }).catch((error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response.data.error,
                })
            });
    }

    //funcion para actualizar un secreto
    const updateSecret = (secret) => {
        let url = `secret/${secret.id}`
        MethodPut(url, secret)
            .then((res) => {
                dispatch({
                    type: UPDATE_SECRET,
                    payload: res.data,
                    })
                }).catch((error) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.response.data.error,
                         })
            });
    }

    //funcion para eliminar un secreto
    const deleteSecret = (id) => {
        let url = `secret/${id}`
        MethodDelete(url)
            .then((res) => {
                dispatch({
                    type: DELETE_SECRET,
                    payload: id,
                })
            }).catch((error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response.data.error,
                })
            });

    };

    return (
        <SecretsContext.Provider
            value={{
                secrets: state.secrets,
                loading: state.loading,
                getSecrets,
                addSecret,
                updateSecret,
                deleteSecret,
            }}
            >
            {props.children}
        </SecretsContext.Provider>
    );
};

export default SecretsState;