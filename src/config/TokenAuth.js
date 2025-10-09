import clienteAxios from './Axios';

const tokenAuth = token => {

    if (token) {
        clienteAxios.defaults.headers.Authorization = token;
    } else {
        delete clienteAxios.defaults.headers.Authorization;
    }

}

export default tokenAuth;