/* eslint-disable react-refresh/only-export-components */
import PropTypes from "prop-types";
import {
    createContext,
    useContext,
    useMemo, 
    useState
} from "react";

const GCodeContext = createContext();

export const GCodeProvider = ({ children }) => {
    const [ currentPngFile, setCurrentPngFile ] = useState(null);

    const layerValues = useMemo(() => ({
        currentPngFile,
        setCurrentPngFile
    }), [currentPngFile]);

    return (
        <GCodeContext.Provider value={layerValues}>
            { children }
        </GCodeContext.Provider>
    )
};

GCodeProvider.propTypes = {
    children: PropTypes.node.isRequired
}

export const useGcode = () => useContext(GCodeContext);