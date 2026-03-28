import { useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import FileDropZone from "../ui/FileDropZone";
import { useGerberLayer, useGerberSettings, useGerberView } from "../context/GerberContext";
import convertToSvg from "../../utils/svgConverter/convertToSvg";
import { motion } from "motion/react";
import { cn } from "../../utils/cn";
import handleZip from "../../utils/svgConverter/jsZip";
import toast from "react-hot-toast";
import { useApp } from "../context/AppContext";
import AppToaster from "../ui/AppToaster";

const MainView = () => {
    const { setTopStack, setBottomStack, setFullLayers } = useGerberLayer();
    const { setLayerType, setStackConfig, stackConfig } = useGerberSettings();
    const { mainSvg, setMainSvg, setSide } = useGerberView();
    const { theme } = useApp();

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
            <AppToaster top={100} />
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
                   "w-full h-full bg-white border border-slate-200 rounded-xl relative overflow-hidden transition-colors dark:bg-slate-900 dark:border-slate-800",
                    "bg-[linear-gradient(#e5e7eb5e_1px,transparent_1px),linear-gradient(90deg,#e5e7eb5e_1px,transparent_1px)]",
                    "bg-[size:20px_20px] dark:bg-[linear-gradient(rgba(51,65,85,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(51,65,85,0.35)_1px,transparent_1px)]"
                )}
            >
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_45%,white_85%)] dark:bg-[radial-gradient(circle_at_center,transparent_35%,rgba(8,16,24,0.92)_85%)]" />
                <TransformWrapper initialScale={1} minScale={.5} limitToBounds={ false }>
                    <TransformComponent
                        contentStyle={{  margin:'auto', transition: 'transform 0.3s ease', position: 'relative' }} 
                        wrapperStyle={{ width: '100%', height: '100%', overflow:'hidden', display:'flex'}} 
                    >
                        <div 
                            ref={resultRef}
                            className="flex items-center h-full justify-center relative dark:text-slate-800"
                            style={{
                                filter:
                                    theme === "dark"
                                        ? "drop-shadow(0px 18px 32px rgba(8,15,23,0.85)) drop-shadow(0px 0px 18px rgba(56,189,248,0.18))"
                                        : "drop-shadow(0px 10px 22px rgba(15,23,42,0.22))",
                            }}
                        >
                        </div>
                        <div className="absolute top-0 -right-7 w-px h-full bg-[linear-gradient(to_top,#d4d4d8_0%,#ffffff_35%,#ffffff_65%,#d4d4d8_100%)] mx-3 dark:bg-[linear-gradient(to_top,#334155_0%,#0f172a_35%,#0f172a_65%,#334155_100%)]" />
                        <p className=" absolute top-1/2 -translate-y-1/2 -right-[2.7rem] px-2 text-[9px] -rotate-90 font-medium rounded text-nowrap dark:text-slate-200">
                            {stackConfig.height}
                            <span className="text-gray-500 font-normal dark:text-slate-400"> mm</span>
                        </p>


                        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-full h-px bg-[linear-gradient(to_left,#d4d4d8_0%,#ffffff_35%,#ffffff_65%,#d4d4d8_100%)] my-3 dark:bg-[linear-gradient(to_left,#334155_0%,#0f172a_35%,#0f172a_65%,#334155_100%)]" />
                        <p className="absolute -bottom-[1.4rem] left-1/2 -translate-x-1/2 px-2 text-[9px] font-medium rounded text-nowrap dark:text-slate-200">
                            {stackConfig.width}
                            <span className="text-gray-500 font-normal dark:text-slate-400"> mm</span>
                        </p>
                    </TransformComponent>
                </TransformWrapper>
            </motion.div>
        </>
    )
}
export default MainView;
