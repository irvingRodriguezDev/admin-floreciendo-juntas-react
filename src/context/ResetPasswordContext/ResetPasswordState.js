import React, { useReducer } from 'react';
import ResetPasswordReducer from './ResetPasswordReducer';
import ResetPasswordContext from './ResetPasswordContext';
import { FORGOT_PASSWORD, RESET_PASSWORD } from '../../types';
import { MethodPost } from "../../config/Service";
import Swal from 'sweetalert2';


const ResetPasswordState = (props) => {

    //initial state
    const initialState = {
        sendLink: false,
        setUserPassword: false,
    };

    const [state, dispatch] = useReducer(ResetPasswordReducer, initialState);

    //funcion para ennviar el restablecimiento de contrasña por correo
    const sendResetLinkEmail = (email) => {
        let url = "/auth/reset-password";
        MethodPost(url, email)
            .then((res) => {
                Swal.fire({
                    icon: 'success',
                    title: res.data.message,
                    text: 'Verifica tu bandeja de entrada de tu correo',
                });
                //alert(res.data.message);
                dispatch({
                    type: FORGOT_PASSWORD,
                });
            }).catch((error) => {
                alert(error.res.data.error);
            });
    };

    //funcion que se encarga del cambio de contraseña
    const resetPassword = (data) => {
        let url = "/auth/reset-password";
        MethodPost(url, data)
            .then((res) => {
                Swal.fire({
                    icon: 'success',
                    title: res.data.message,
                    timer: 2500,
                    showConfirmButton: false
                });
                //alert(res.data.message);
                dispatch({
                    type: RESET_PASSWORD,
                });
            })
            .catch((error) => {
                alert(error.response.data.error)
            });
    };

    return (
        <ResetPasswordContext.Provider
            value={{
                sendLink: state.sendLink,
                setUserPassword: state.setUserPassword,
                sendResetLinkEmail,
                resetPassword,
            }}
        >
            {props.children}
        </ResetPasswordContext.Provider>
    );
};

export default ResetPasswordState;
