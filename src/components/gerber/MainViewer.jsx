import { useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import FileDropZone from "../ui/FileDropZone";
import { AnimatePresence } from "motion/react";
import { useGerberLayer, useGerberSettings, useGerberView } from "../context/GerberContext";
import convertToSvg from "../../utils/svgConverter/convertToSvg";
import { motion } from "motion/react";
import { cn } from "../../utils/cn";

const MainView = () => {
    const { setTopStack, setBottomStack, setFullLayers } = useGerberLayer();
    const { setLayerType, setStackConfig, stackConfig } = useGerberSettings();
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
        console.log(mainSvg)
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
                animate={{ opacity: mainSvg.svg ? 1 : 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={cn(
                    "w-full h-full bg-zinc-100 border-2 border-white rounded-md shadow",
                )}
            >
                <TransformWrapper initialScale={1} minScale={.5} limitToBounds={ false }>
                    <TransformComponent
                        contentStyle={{  margin:'auto', transition: 'transform 0.3s ease', position: 'relative' }} 
                        wrapperStyle={{ width: '100%', height: '100%', overflow:'hidden', display:'flex'}} 
                    >
                        <AnimatePresence mode="wait">
                            <div 
                                ref={resultRef}
                                className="flex items-center h-full justify-center  relative"
                                style={{ filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.5))", }}
                            >
                            </div>
                            <div className="absolute top-0 -right-7 w-px h-full bg-zinc-300 mx-3" />
                            <p className=" absolute top-1/2 -translate-y-1/2 -right-[3rem] bg-zinc-100 px-2 text-sm -rotate-90 font-medium rounded">
                                {/* {dimension.height} */}
                                {stackConfig.height}
                                <span className="text-gray-500 font-normal"> mm</span>
                            </p>

                            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-full h-px bg-zinc-300 my-3" />
                            <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-zinc-100 px-2 text-sm font-medium rounded">
                                {/* {dimension.width} */}
                                {stackConfig.width}
                                <span className="text-gray-500 font-normal"> mm</span>
                            </p>
                        </AnimatePresence>
                    </TransformComponent>
                </TransformWrapper>
            </motion.div>
        </>
    )
}
export default MainView;