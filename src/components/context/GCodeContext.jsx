/* eslint-disable react-refresh/only-export-components */
import PropTypes from "prop-types";
import {
    createContext,
    useContext,
    useMemo, 
    useState
} from "react";
import { useApp } from "./AppContext";

const GCodeContext = createContext();

export const GCodeProvider = ({ children }) => {
    const { machineConf, pcbConf, toolLib } = useApp();
    const [ currentPngFile, setCurrentPngFile ] = useState(null);

    const handleGeneration = (png) => {
        const tool = toolLib.find(tool => tool.id === png.tool) || null;
        console.log('Gnenre : ', png, tool, machineConf, pcbConf)
    };

    const layerValues = useMemo(() => ({
        currentPngFile,
        setCurrentPngFile,
        handleGeneration
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