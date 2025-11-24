import {
    GET_PRODUCTS,
    ADD_PRODUCT,
    UPDATE_PRODUCT,
    DELETE_PRODUCT,
    PRODUCT_ERROR,
} from "../../types";

export default (state, action) => {
    switch (action.type) {
        case "SET_LOADING":
            return {
                ...state,
                loading: action.payload
            };

        case GET_PRODUCTS:
            return {
                ...state,
                products: action.payload.products,
                pagination: action.payload.pagination,
                loading: false,
                error: null
            };

        case ADD_PRODUCT:
            return {
                ...state,
                products: [action.payload, ...state.products],
                loading: false,
                error: null
            };

        case UPDATE_PRODUCT:
            return {
                ...state,
                products: state.products.map(product =>
                    product.id === action.payload.id ? action.payload : product
                ),
                loading: false,
                error: null
            };

        case DELETE_PRODUCT:
            return {
                ...state,
                products: state.products.filter(product => product.id !== action.payload),
                loading: false,
                error: null
            };

        case PRODUCT_ERROR:
            return {
                ...state,
                error: action.payload,
                loading: false
            };

        default:
            return state;
    }
};