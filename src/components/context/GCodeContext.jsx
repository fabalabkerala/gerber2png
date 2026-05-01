/* eslint-disable react-refresh/only-export-components */
import PropTypes from "prop-types";
import {
    createContext,
    useContext,
    useMemo, 
    useState
} from "react";
import { useApp } from "./AppContext";
import { png2gcode } from "../../utils/png2code/png2gcode";

const GCodeContext = createContext();

export const GCodeProvider = ({ children }) => {
    const { machineConf, pcbConf, toolLib } = useApp();
    const [ currentPngFile, setCurrentPngFile ] = useState(null);

    async function loadImageDataFromUrl(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous"; // important if external

            img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            resolve(imageData);
            };

            img.onerror = reject;
            img.src = url;
        });
    }

    const handleGeneration = async (png) => {
        const tool = toolLib.find(tool => tool.id === png.tool) || null;
        console.log('Gnenre : ', png, tool, machineConf, pcbConf);
        const params = {
            dpi: 1000,               // realistic for PNG input
            invert: false,
            threshold: 128,
            flipY: true,

            // Tool
            toolDiameterMM: 0.4,   // common PCB engraving bit (0.2–0.5 range)

            // Isolation settings
            offsetNumber: 3,       // number of passes
            offsetStepOver: 0.5,   // 50% step-over

            // Cutting depth (VERY IMPORTANT)
            cutDepthMM: 0.1,       // slightly more than copper thickness

            // Safe height
            safeZMM: 2,            // no need for 5mm in PCB

            // Feed rates (in mm/s)
            xyFeedMMS: 5,          // = 300 mm/min (safe)
            zFeedMMS: 2,           // = 120 mm/min

            // Origin
            originXMM: 0,
            originYMM: 0,

            dryRun: false
        };
        
        const imgData = await loadImageDataFromUrl(png.url);
        const resull = png2gcode(imgData, params);
        console.log('Gcode result: ', resull);
    };

    
        // export interface CamParams {
        // // Image & scaling
        // dpi: number;          // e.g. 500
        // invert: boolean;      // if true: black = CUT (invert typical PCB art)
        // threshold: number;    // 0..255
        // flipY: boolean;       // flip Y axis when mapping to machine

        // // Tooling / offsets
        // toolDiameterMM: number;  // e.g. 0.4
        // offsetNumber: number;    // 0 = fill (keep stepping until filled)
        // offsetStepOver: number;  // 0..1 (1.0 = one full diameter step)

        // // Z & feeds
        // cutDepthMM: number;   // positive depth; we send negative for Z down
        // safeZMM: number;      // jog/safe Z (Z2)
        // xyFeedMMS: number;    // mm/s (will be converted to units/s for VS)
        // zFeedMMS: number;     // mm/s (converted to units/s for !VZ)

        // // Placement
        // originXMM: number;
        // originYMM: number;
        // dryRun?: boolean;     // if true, do not go below safe Z
        // }


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
