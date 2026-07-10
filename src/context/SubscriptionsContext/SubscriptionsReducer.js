import {
    SUBSCRIPTIONS_ACTIVE,
    SUBSCRIPTIONS_PASTDUE,
    SUBSCRIPTIONS_ERROR,
} from "../../types";

export default (state, action) => {
    switch (action.type) {

        case SUBSCRIPTIONS_ACTIVE:
            return {
                ...state,
                subscriptionsActive: action.payload.subscriptions,
                paginationActive: action.payload.pagination,
                loading: false,
            };

        case SUBSCRIPTIONS_PASTDUE:
            return {
                ...state,
                subscriptionsPastDue: action.payload.subscriptions,
                paginationPastDue: {
                    totalItems: action.payload.totalItems,
                    totalPages: action.payload.totalPages,
                    currentPage: action.payload.currentPage,
                    perPage: action.payload.perPage,
                },
                loading: false,
            };


        case SUBSCRIPTIONS_ERROR:
            return {
                ...state,
                error: action.payload,
                loading: false,
            };

        default:
            return state;
    }
};