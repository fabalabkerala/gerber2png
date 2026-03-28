import { ArrowRightEndOnRectangleIcon, CheckBadgeIcon, DocumentCheckIcon, PhotoIcon, ArrowRightIcon, CheckCircleIcon  } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react"
import PropTypes from "prop-types";
import { useRef, useState } from "react";
import ModalHeader from "../../ui/ModalHeader";
import Select from "../../ui/Select";
import { cn } from "../../../utils/cn";
import { useGerberSettings } from "../../context/GerberContext";
import ProcessSteps from "./ProcessSteps";

const machineOption = [
    { id: 'mdx', label: 'Rolland MDX Mill', program: 'programs/machines/Roland/SRM-20+mill/mill+2D+PCB' }, 
    { id: 'carvera', label: 'Makera Carvera', program: 'programs/machines/Makera/Carvera' }, 
]

const ModsPanel = ({showModsPanel, setShowModsPanel, selectedPng, setSelectedPng}) => {
    const [ modsStatus, setModsStatus ] = useState('initial');
    const { modsMachine, setModsMachine } = useGerberSettings();

    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);

    const modsWindowRef = useRef(null);

    const openMods = async (modsMachine, file) => {
        if (!file?.url) return;

        let modsWindow = modsWindowRef.current?.window;
        const machine = machineOption.find(opt => opt.id === modsMachine);

        if (!modsWindow || modsWindow.closed) {
            const baseUrl = 'https://modsproject.org/?program=';
            modsWindow = window.open(baseUrl + machine.program, '_blank');
            setModsStatus('opening');

            if (!modsWindow) {
                setModsStatus('error');
                return;
            }
        }

        modsWindowRef.current = { window: modsWindow, machine: machine, image: file.url };
        
        const buffer = await fetch(file.url).then(res => res.arrayBuffer());
        setModsStatus('sending');

        const sendInterval = setInterval(() => {
            if (!modsWindowRef.current || modsWindowRef.current.window.closed) {
                clearInterval(sendInterval);
                setModsStatus('initial');
                modsWindowRef.current = null;
                return;
            } 
            modsWindowRef.current.window.postMessage(
                { type: 'png', data: buffer }, 
                'https://modsproject.org'
            );
            modsWindowRef.current.window.focus();
        }, 500);

        const handler = (event) => {
            if (event.origin !== "https://modsproject.org") return;

            if (event.data === "ready") {
                setModsStatus("connected");
                clearInterval(sendInterval);
                clearTimeout(timeout);
            }
        };
        window.addEventListener("message", handler);

        const timeout = setTimeout(() => {
            setModsStatus('error');
            window.removeEventListener("message", handler);
            if (modsWindowRef.current) {
                modsWindowRef.current.window.close();
                modsWindowRef.current = null;
            }
        }, 15000);

        const polling = setInterval(() => {
            if (modsWindow && modsWindow.closed) {
                setModsStatus('initial');
                modsWindowRef.current = null;
                clearInterval(polling);
            }
        }, 1000);
    }
    
    return (
        <>
            <AnimatePresence>
                {showModsPanel && (
                    <motion.div
                        className="fixed inset-0 bg-black/10 bg-blend-color-burn flex justify-center items-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-xl shadow-xl md:w-[900px] flex flex-col overflow-hidden relative max-h-[80vh]"
                            initial={{ y: -30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -30, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ModalHeader title="Mods Workflow" onClose={() => setShowModsPanel(false)} />
                            
                            <div className="overflow-y-auto custom-scrollbar">
                                <div className="flex flex-col gap-2 p-3 pb-8">
                                    <div className="flex gap-4 p-2">
                                        <div className="pt-6 pb-8 pl-8 pr-10 h-44 flex flex-col justify-center items-center border border-dashed rounded-xl">
                                            { selectedPng.url ? (
                                                <>
                                                <div className="flex h-full w-full">
                                                    <div className="relative h-full w-fit mx-auto">
                                                        <img src={selectedPng.url} alt="dsdfsd" className="h-full object-contain" />

                                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full h-px bg-zinc-300 my-3" />
                                                        <p className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white px-2 text-[10px] text-nowrap font-medium">
                                                            {/* {dimension.width} */}
                                                            {selectedPng.width}
                                                            <span className="text-gray-500 font-normal"> mm</span>
                                                        </p>

                                                        <div className="absolute top-0 -right-6 w-px h-full bg-zinc-300 mx-3" />
                                                        <p className="absolute top-1/2 -translate-y-1/2 -right-[48px] bg-white px-2 text-[10px] text-nowrap -rotate-90 origin-center font-medium">
                                                            {/* {dimension.height} */}
                                                            {selectedPng.height}
                                                            <span className="text-gray-500 font-normal"> mm</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                </>
                                                
                                            ): (
                                                <>
                                                    <PhotoIcon width={20} height={20} strokeWidth={2} stroke="gray" />
                                                    <p className="text-xs font-medium">No Preview Available</p>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col min-w-96">
                                            { modsWindowRef.current?.window && (
                                                <>
                                                    <div className="flex items-center justify-between">
                                                        <div className="py-2 px-3  bg-gradient-to-br rounded-xl mb-3">
                                                            <p className="text-base font-semibold text-gray-800">{modsWindowRef.current?.machine.label}</p>
                                                            <div className="flex items-center gap-1 w-full">
                                                                <CheckBadgeIcon width={14} height={14} strokeWidth={2} stroke="green" />
                                                                <p className="text-xs text-green-700 font-medium">Mods is Connected</p>
                                                            </div>
                                                        </div>
                                                        <motion.div
                                                            whileHover={{ y: -2 }}
                                                            className="flex gap-4 items-start mb-3 rounded-xl transition"
                                                        >
                                                            {/* Preview */}
                                                            <div className="flex items-center px-4 py-4 rounded-lg gap-3">
                                                                <div className="flex flex-col items-center justify-center gap-1">
                                                                    <div className="w-7 h-7 p-1 bg-white border rounded-lg flex items-center justify-center overflow-hidden shadow-md">
                                                                        {modsWindowRef.current?.image ? (
                                                                            <img src={modsWindowRef.current.image} className="w-full h-full object-contain" />
                                                                        ):(
                                                                            <PhotoIcon className="w-6 h-6 text-indigo-400"/>
                                                                        )}
                                                                    </div>
                                                                </div>
                        
                                                                <ArrowRightIcon className="w-3 h-3 text-gray-400"/>
                                                                
                                                                <div className="flex flex-col items-center justify-center gap-1">
                                                                    <div className="w-9 h-9 p-1 bg-white border rounded-lg flex items-center justify-center overflow-hidden shadow-md">
                                                                        {selectedPng.url ? (
                                                                            <img src={selectedPng.url} className="w-full h-full object-contain" />
                                                                        ):(
                                                                            <PhotoIcon className="w-6 h-6 text-gray-400"/>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    </div>
                                                </>
                                            )}
                                            <div className="bg-slate-50 flex-1 p-4 flex flex-col rounded-xl">
                                                <div className="flex gap-3">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <p className="text-xs w-24 text-black text-nowrap">Machine</p>
                                                        <div className={cn("w-full", modsWindowRef.current?.window ? "pointer-events-none opacity-60" : "")}>
                                                            <Select 
                                                                options={machineOption} 
                                                                selected={modsMachine} 
                                                                setSelected={setModsMachine} 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div> 
                                    </div>

                                    { !modsWindowRef.current?.window && (
                                        <div className={cn("flex gap-2 items-center mx-2 bg-gradient-to-br from-slate-50 to-teal-100 rounded-xl flex-1 px-3 py-3", selectedPng.url ? "opacity-100 pointer-events-auto" : "opacity-60 pointer-events-none")}>
                                            <div className={cn(
                                                "flex items-end justify-center gap-1 py-1 rounded h-fit mr-auto pr-20",
                                                selectedPng.url ? "opacity-100" : "opacity-0"
                                            )}>
                                                <DocumentCheckIcon width={15} height={15} strokeWidth={2} stroke="green" />
                                                <p className="text-[10px] text-gray-500 max-w-[140px] truncate">{selectedPng.name}.png</p>
                                            </div>
                                            <motion.button
                                                className="flex justify-center items-center gap-2 px-2 py-1.5 rounded-lg shadow bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-500" 
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => openMods(modsMachine, selectedPng)}
                                            >
                                                <p className="font-medium text-xs ps-0.5 text-white tracking-wider ">Open Mods</p>
                                                <ArrowRightEndOnRectangleIcon width={18} height={18} strokeWidth={2} stroke="white" />
                                            </motion.button>
                                        </div>
                                    )}

                                    <ProcessSteps 
                                        modsWindowRef={modsWindowRef}
                                        selectedPng={selectedPng} 
                                        openMods={openMods} 
                                        currentStep={currentStep} 
                                        completedSteps={completedSteps} 
                                        setCurrentStep={setCurrentStep} 
                                        setCompletedSteps={setCompletedSteps}
                                        setSelectedPng={setSelectedPng}
                                    />
                                </div>
                            </div>
                            <AnimatePresence>
                                { modsStatus === 'sending' && (
                                    <motion.div
                                        key="loader"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.25, ease: "easeOut" }}
                                        className="absolute inset-0 bg-white/40 flex items-center justify-center z-[9999]"
                                    >
                                        <motion.div
                                            className="w-12 h-12 border-4 border-[#5545e5] border-t-transparent rounded-full"
                                            animate={{
                                                rotate: [0, 360],
                                                scale: [1, 1.1, 1],
                                            }}
                                            transition={{
                                                rotate: {
                                                    repeat: Infinity,
                                                    duration: 1,
                                                    ease: "linear",
                                                },
                                                scale: {
                                                    repeat: Infinity,
                                                    duration: 1.2,
                                                    ease: "easeInOut",
                                                },
                                            }}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

ModsPanel.propTypes = {
    showModsPanel: PropTypes.bool,
    setShowModsPanel: PropTypes.func
}
export default ModsPanel;