import { useEffect, useState } from "react";
import clienteAxios from "../config/axios";


export function useEntregasProveedores(){



    const [proveedoresAll, setProveedoresAll] = useState([]);
    const [procesos, setProcesos] = useState([]);



   async function obtenerProveedores(){ 
       const token = localStorage.getItem("token");
       try {
           const res = await clienteAxios.get("/api/proveedores-all", {
               headers: { Authorization: `Bearer ${token}` },
           });
           setProveedoresAll(res.data.proveedores);
       } catch (error) {
           console.error("Error al obtener proveedores:", error);
       }
   }

   async function obtenerProcesos(){
       const token = localStorage.getItem("token");
       try {
           const res = await clienteAxios.get("/api/registrar-proceso-bolsa", {
               headers: { Authorization: `Bearer ${token}` },
           });
         //  console.log("Procesos obtenidos:", res.data);
           setProcesos(res.data);
       } catch (error) {
           console.error("Error al obtener procesos:", error);
       }
   }
    useEffect(() => {
         obtenerProveedores();
         obtenerProcesos();
    }, []);



    return {proveedoresAll,procesos};
    }

