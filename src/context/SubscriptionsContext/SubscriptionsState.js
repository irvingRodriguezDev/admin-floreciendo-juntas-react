import React, { useReducer } from "react";
import Swal from "sweetalert2";
import SubscriptionsContext from "./SubscriptionsContext";
import SubscriptionsReducer from "./SubscriptionsReducer";
import MethodGet from "../../config/Service";
import clienteAxios from "../../config/Axios";
import {
    SUBSCRIPTIONS_ACTIVE,
    SUBSCRIPTIONS_PASTDUE,
    SUBSCRIPTIONS_ERROR
} from "../../types";

const SubscriptionsState = (props) => {
    const initialState = {
        subscriptionsActive: [],
        subscriptionsPastDue: [],
        paginationActive: {},
        paginationPastDue: {},
        loading: true,
        error: null,
    };

    const [state, dispatch] = useReducer(SubscriptionsReducer, initialState);

    // Obtener todas las suscripciones activas
    const getSubscriptionsActive = async (page) => {
        try {
            const res = await MethodGet(
                `subscriptions/active?limit=15&page=${page}`);
            dispatch({
                type: SUBSCRIPTIONS_ACTIVE,
                payload: res.data,
            });
        } catch (error) {
            dispatch({
                type: SUBSCRIPTIONS_ERROR,
                payload:
                    error.response?.data?.message ||
                    "Error al cargar suscripciones activas",
            });
        }
    };

    const getSubscriptionsPastDue = async (page) => {
        try {
            const res = await MethodGet(
                `subscriptions/past-due?limit=15&page=${page}`
            );
            dispatch({
                type: SUBSCRIPTIONS_PASTDUE,
                payload: res.data,
            });

        } catch (error) {
            dispatch({
                type: SUBSCRIPTIONS_ERROR,
                payload:
                    error.response?.data?.message ||
                    "Error al cargar suscripciones vencidas",
            });
        }
    };


    return (
        <SubscriptionsContext.Provider
            value={{
                subscriptionsActive: state.subscriptionsActive,
                subscriptionsPastDue: state.subscriptionsPastDue,
                paginationActive: state.paginationActive,
                paginationPastDue: state.paginationPastDue,
                loading: state.loading,
                error: state.error,
                getSubscriptionsActive,
                getSubscriptionsPastDue,
            }}
        >
            {props.children}
        </SubscriptionsContext.Provider>
    );
};

export default SubscriptionsState;