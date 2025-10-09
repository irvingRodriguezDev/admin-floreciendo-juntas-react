import { FORGOT_PASSWORD, RESET_PASSWORD } from "../../types";

export default function ResetPasswordReducer(state, action) {
    switch (action.type) {
        case FORGOT_PASSWORD:
            return {
                ...state,
                sendLink: true,
            };

        case RESET_PASSWORD:
            return {
                ...state,
                setUserPassword: true,
            }

        default:
            return state;
    }
}