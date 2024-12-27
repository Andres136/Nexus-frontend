import { useContext } from "react"
import SystemContext from "../context/SytemContext"

const useSystem = () => {
    return useContext(SystemContext)
}
export default useSystem