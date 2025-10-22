import { useEffect, useRef, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import PreviewTab from "../ui/PreviewTab";
import FileDropZone from "../ui/FileDropZone";
import { AnimatePresence } from "motion/react";
import { useGerber } from "../context/GerberContext";
import convertToSvg from "../../utils/svgConverter/convertToSvg";
import { motion } from "motion/react";

const MainView = () => {
    const { setTopStack, setBottomStack, setFullLayers, mainSvg, setMainSvg, setLayerType, setStackConfig, setSide, canvasBg } = useGerber();
    // const [ preview, setPreview ] = useState(false);
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
                                style={{ filter: "drop-shadow(0px 2px 6px rgba(0,0,0,0.3))", background: canvasBg }}
                            ></div>
                        </AnimatePresence>
                    </TransformComponent>
                </TransformWrapper>
            </motion.div>

            {/* { preview &&
                <div className="absolute top-3 left-3 w-[300px] bg-white rounded-md shadow-xl border border-gray-200 z-50">
                    <PreviewTab
                        blobUrl="https://images.unsplash.com/photo-1594868116409-083f2a48b14c?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8NHx8fGVufDB8fHx8fA%3D%3D"
                        closeWindow={setPreview}
                    />
                </div>
            } */}
        </>
    )
}
export default MainView;