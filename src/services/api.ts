import axios from 'axios';
// https://hlplast.itgoldie.com.br/gc
// http://192.168.0.174/goldie_dev/system
const Apis = {
    api: axios.create({
        baseURL: 'https://hlplast.itgoldie.com.br/gc',
    }),
    apiPlugin: axios.create({
        baseURL: 'https://hlplast.itgoldie.com.br/gp',
    }),
};

export { Apis };