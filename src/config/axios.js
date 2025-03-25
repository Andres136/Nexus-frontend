import axios from "axios";

const clienteAxios = axios.create({
    baseURL:import.meta.env.VITE_API_URL,
    headers:{
        "Content-Type":"application/json; charset=utf-8",
        'X-Requested-With': 'XMLHttpRequest',
    }

})

export default clienteAxios