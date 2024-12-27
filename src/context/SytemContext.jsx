import { createContext, useState } from "react";

const SystemContext = createContext();
const SystemProvider =({children}) => {
    const [darkMode, setDarkMode] = useState(false)
    const toggleDarkMode = () => setDarkMode(!darkMode)

    return (
        <SystemContext.Provider value={{

            darkMode,
            toggleDarkMode
        }}>
            {children}
        </SystemContext.Provider>
    )
}
export {SystemProvider} 
export default SystemContext