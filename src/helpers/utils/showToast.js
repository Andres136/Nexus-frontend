// utils/toast.js
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Slide,Zoom,Flip,Bounce } from "react-toastify";

export const showToast = (type, message) => {
  const config = {
    position: "top-center", // Puedes cambiarlo: top-left, bottom-right, etc.
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    transition: Slide, // Puedes cambiar la animación: Slide, Zoom, Flip, Bounce
    theme: "colored", // opciones: "light", "dark", "colored"
    style: {
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "500",
      padding: "12px 16px",
      boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
    },
  };

  switch (type) {
    case "success":
      toast.success(message, config);
      break;
    case "error":
      toast.error(message, config);
      break;
    case "info":
      toast.info(message, config);
      break;
    case "warning":
      toast.warning(message, config);
      break;
    default:
      toast(message, config);
      break;
  }
};
