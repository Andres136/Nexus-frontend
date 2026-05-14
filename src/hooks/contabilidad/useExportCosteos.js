import { costeosService } from "../../services/contabilidadService";

export const useExportCosteos = (params = {}) => {
    const exportCosteos = async () => {
        try {
            const response =
                await costeosService.exportExcel(params);

            const blob = new Blob(
                [response.data],
                {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                }
            );

            const url =
                window.URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            const fecha = new Date()
                .toISOString()
                .split("T")[0];

            link.href = url;

            link.setAttribute(
                "download",
                `costeos_${fecha}.xlsx`
            );

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error(
                "Error al exportar los costeos:",
                error
            );

            if (
                error.response?.status === 401
            ) {
                window.location.href =
                    "/auth/login";
            }

            throw error;
        }
    };

    return {
        exportCosteos,
    };
};