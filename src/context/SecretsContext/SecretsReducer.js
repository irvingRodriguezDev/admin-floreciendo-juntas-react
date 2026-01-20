// import { 
//     GET_SECRETS,
//     ADD_SECRET,
//     UPDATE_SECRET,
//     DELETE_SECRET 
// } from "../../types";

// export default (state, action) => {
//     switch (action.type) {
//         case GET_SECRETS:
//             return {
//                 ...state,
//                 secrets: action.payload,
//             };

//         case ADD_SECRET:
//             return {
//                 ...state,
//                 secrets: [action.payload, ...state.secrets],
//             }

//         case UPDATE_SECRET:
//             return {
//                 ...state,
//                 secrets: state.secrets.map(secret => 
//                     secret.id === action.payload.id ? action.payload :secret
//                 ),
//             }

//         case DELETE_SECRET:
//             return {
//                 ...state,
//                 secrets: state.secrets.filter(secret => secret.id !== action.payload),
//             }

//         // Estado por defecto
//         default:
//             return state;
//     }
// }