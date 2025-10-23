import { useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import FileDropZone from "../ui/FileDropZone";
import { AnimatePresence } from "motion/react";
import { useGerberLayer, useGerberSettings, useGerberView } from "../context/GerberContext";
import convertToSvg from "../../utils/svgConverter/convertToSvg";
import { motion } from "motion/react";

const MainView = () => {
    const { setTopStack, setBottomStack, setFullLayers } = useGerberLayer();
    const { setLayerType, setStackConfig } = useGerberSettings();
    const { mainSvg, setMainSvg, setSide } = useGerberView();

    const resultRef = useRef(null);
    const dropAreaRef = useRef(null);

    const handleInputFiles = (files) => {
        convertToSvg(files, setTopStack, setBottomStack, setFullLayers, setMainSvg, setStackConfig).then(() => {
            setLayerType('original');
            setSide('top')
            dropAreaRef.current.style.display = 'none';
            resultRef.current.style.display = 'flex';
        })
    }

    useEffect(() => {
        if (resultRef.current && mainSvg.svg) {  
            resultRef.current.innerHTML = '';
            resultRef.current.appendChild(mainSvg.svg);
        }
    },[mainSvg])

    return (
        <>
            {/* Drag & Drop Zone */}
            <motion.div 
                ref={dropAreaRef}
                key={'dropzone'}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="h-full"
            >
                <FileDropZone onFilesSelect={handleInputFiles} multiple={true} />
            </motion.div>

            {/* SVG Display */}
            <motion.div
                key={'converted'}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full h-full"
            >
                <TransformWrapper initialScale={1} minScale={.5} limitToBounds={ false }>
                    <TransformComponent
                        contentStyle={{  margin:'auto', transition: 'transform 0.3s ease' }} 
                        wrapperStyle={{ width: '100%', height: '100%', overflow:'hidden', display:'flex'}} 
                    >
                        <AnimatePresence mode="wait">
                            <div 
                                ref={resultRef}
                                className="flex items-center h-full justify-center p-2"
                                style={{ filter: "drop-shadow(0px 2px 6px rgba(0,0,0,0.3))", }}
                            ></div>
                        </AnimatePresence>
                    </TransformComponent>
                </TransformWrapper>
            </motion.div>
        </>
    )
}
export default MainView;