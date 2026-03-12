import { useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import FileDropZone from "../ui/FileDropZone";
import { useGerberLayer, useGerberSettings, useGerberView } from "../context/GerberContext";
import convertToSvg from "../../utils/svgConverter/convertToSvg";
import { motion } from "motion/react";
import { cn } from "../../utils/cn";
import handleZip from "../../utils/svgConverter/jsZip";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

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
        if (resultRef.current && mainSvg.svg) {  
            resultRef.current.innerHTML = '';
            resultRef.current.appendChild(mainSvg.svg);
        }
    },[mainSvg])

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const { port, token, source } = Object.fromEntries(params.entries());

        const processZip = async (blob) => {
            const file = new File([blob], "gerber.zip");
            const extractedFiles = await handleZip(file, { gerberOnly: true });
            handleInputFiles(extractedFiles);
        }

        const loadFromUrl = async (url, loadingMsg, successMsg) => {
            const toastId = toast.loading(loadingMsg);
            try {
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const blob = await response.blob();
                await processZip(blob);
                toast.success(successMsg, { id: toastId });
            } catch (error) {
                console.error('Error loading files from URL:', error);
                toast.error('Failed to load files from URL', { id: toastId });
            }
        }

        if (source) {
            loadFromUrl(source, 'Loading from URL...', 'Successfully Loaded from URL!');
            return;
        }
        if (port && token) {
            loadFromUrl(`http://localhost:${port}/file?token=${token}`, 'Connecting to the kicad plugin...', 'Successfully Loaded From Kicad!');
        }
    }, []);

    return (
        <>
            <Toaster
                position="top-right"
                containerStyle={{ top: 100 }}
                toastOptions={{
                    className: "relative overflow-hidden border bg-white text-gray-700  !shadow-md",

                    error: { className: "!border !border-dashed !border-red-200 !bg-red-50 !text-gray-800 !shadow-sm !px-4 !py-4 !rounded-2xl" },
                    success: { className: "!border !border-dashed !border-green-200 !bg-green-50 !text-gray-800 !shadow-sm !px-4 !py-4 !rounded-2xl" },
                    loading: { className: "!border !border-dashed !border-blue-200 !bg-blue-50 !text-gray-800 !shadow-sm !px-4 !py-4 !rounded-2xl" },
                }}
            />
            {/* Drag & Drop Zone */}
            { !mainSvg.svg &&
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
            }

            {/* SVG Display */}
            <motion.div
                key={'converted'}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: mainSvg.svg ? 1 : 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={cn(
                   "w-full h-full bg-white border border-slate-200 rounded-xl relative overflow-hidden",
                    "bg-[linear-gradient(#e5e7eb5e_1px,transparent_1px),linear-gradient(90deg,#e5e7eb5e_1px,transparent_1px)]",
                    "bg-[size:20px_20px]"
                )}
            >
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_45%,white_85%)]" />
                <TransformWrapper initialScale={1} minScale={.5} limitToBounds={ false }>
                    <TransformComponent
                        contentStyle={{  margin:'auto', transition: 'transform 0.3s ease', position: 'relative' }} 
                        wrapperStyle={{ width: '100%', height: '100%', overflow:'hidden', display:'flex'}} 
                    >
                        <div 
                            ref={resultRef}
                            className="flex items-center h-full justify-center  relative"
                            style={{ filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.5))", }}
                        >
                        </div>
                        <div className="absolute top-0 -right-7 w-px h-full bg-[linear-gradient(to_top,#d4d4d8_0%,#ffffff_35%,#ffffff_65%,#d4d4d8_100%)] mx-3" />
                        <p className=" absolute top-1/2 -translate-y-1/2 -right-[2.7rem] px-2 text-[9px] -rotate-90 font-medium rounded text-nowrap">
                            {stackConfig.height}
                            <span className="text-gray-500 font-normal"> mm</span>
                        </p>


                        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-full h-px bg-[linear-gradient(to_left,#d4d4d8_0%,#ffffff_35%,#ffffff_65%,#d4d4d8_100%)] my-3" />
                        <p className="absolute -bottom-[1.4rem] left-1/2 -translate-x-1/2 px-2 text-[9px] font-medium rounded text-nowrap">
                            {stackConfig.width}
                            <span className="text-gray-500 font-normal"> mm</span>
                        </p>
                    </TransformComponent>
                </TransformWrapper>
            </motion.div>
        </>
    )
}
export default MainView;