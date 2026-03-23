
import { useMutation } from "@tanstack/react-query";
import { RespuestasInspeccionesService } from "../../services/hseqService";
import { showToast } from "../../helpers/utils/showToast";
import { useQueryClient } from "@tanstack/react-query";


export const useRegistrarRespuestasInspeccion = () => {
const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
    
  RespuestasInspeccionesService.createRespuestaInspeccion(data),
    onSuccess: (res) => {
     showToast('success', res.data.message );
      queryClient.invalidateQueries(["inspecciones"]); // Invalida la caché después de guardar las respuestas
    },


    onError: (error) => {
      console.error("❌ Error al guardar respuestas:", error);
    },
  });
};