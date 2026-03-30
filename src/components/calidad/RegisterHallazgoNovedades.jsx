import { useRegisterHallazgoNovedad } from "../../hooks/calidad/useRegisterHallazgoNovedad"

export default function RegisterHallazgoNovedades() {
  const {
      formData,
        error,
        loading,
        handleChange,
        handleSubmit,
        handleUpdate,
  } = useRegisterHallazgoNovedad();


  return (
    <div>RegisterHallazgoNovedades</div>
  )
}
