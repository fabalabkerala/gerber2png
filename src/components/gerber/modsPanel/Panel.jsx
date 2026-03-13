import { ArrowRightEndOnRectangleIcon, CheckBadgeIcon, DocumentCheckIcon, PhotoIcon, QueueListIcon, Square2StackIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react"
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import ModalHeader from "../../ui/ModalHeader";
import Select from "../../ui/Select";
import { cn } from "../../../utils/cn";
import ModsList from "./ModsList";

const machineOption = [
    { id: 'mdx', label: 'Rolland MDX Mill', program: 'programs/machines/Roland/SRM-20+mill/mill+2D+PCB' }, 
    { id: 'carvera', label: 'Makera Carvera', program: 'programs/machines/Makera/Carvera' }, 
]

const ModsPanel = ({showModsPanel, setShowModsPanel, selectedPng}) => {
    const [ selectedMachine, setSelectedMachine ] = useState(machineOption[0].id);
    const [ modsStatus, setModsStatus ] = useState('initial');
    const [ modsWindows, setModsWindows ] = useState([]);
    const [ showConnectedMods, setShowConnectedMods ] = useState(false);

    const openMods = async (selectedMachine) => {
        if (!selectedPng?.url) return;

        const machine = machineOption.find(opt => opt.id === selectedMachine);
        const baseUrl = 'https://modsproject.org/?program=';
        const modsWindow = window.open(baseUrl + machine.program, '_blank');
        setModsStatus('opening');

        if (!modsWindow) {
            setModsStatus('error');
            return;
        }
        
        setModsWindows(prev => [...prev, { id: `mods-${prev.length}`, machine: machine, window: modsWindow, image: selectedPng.url }]);


        const buffer = await fetch(selectedPng.url).then(res => res.arrayBuffer());
        setModsStatus('sending');

        const sendInterval = setInterval(() => {
            if (modsWindow.closed) {
                clearInterval(sendInterval);
                setModsStatus('initial');
                clearTimeout(timeout);
                setModsWindows(prev => prev.filter(win => win.window !== modsWindow));
                return;
            } 
            modsWindow.postMessage(
                { type: 'png', data: buffer }, 
                'https://modsproject.org'
            );
        }, 500);

        const handler = (event) => {
            if (event.origin !== "https://modsproject.org") return;

            if (event.data === "ready") {
                setModsStatus("connected");
                clearInterval(sendInterval);
                window.removeEventListener("message", handler);
                clearTimeout(timeout);
            }
        };
        window.addEventListener("message", handler);

        const timeout = setTimeout(() => {
            setModsStatus('error');
            window.removeEventListener("message", handler);
            if (modsWindow) {
                modsWindow.close();
                setModsWindows(prev => prev.filter(win => win.window !== modsWindow));
            }
        }, 15000);

        const polling = setInterval(() => {
            if (modsWindow && modsWindow.closed) {
                setModsWindows(prev => prev.filter(win => win.window !== modsWindow));
                setModsStatus('initial');
                clearInterval(polling);
            }
        }, 1000);
    }

    const updateMods = async (mods) => {
        if (mods.window && !mods.window.closed) {
            const buffer = await fetch(selectedPng.url).then(res => res.arrayBuffer());

            mods.window.postMessage(
                { type: 'png', data: buffer }, 
                'https://modsproject.org'
            );

            setModsWindows(prev => prev.map(m => {
                if (m.id === mods.id) {
                    return { ...m, image: selectedPng.url }
                }
                return m;
            }));

            mods.window.focus();
        }
    }
    
    useEffect(() => {
        console.log('modsStatus :', modsStatus);
        console.log('modsWindows :', modsWindows);
    }, [modsStatus, modsWindows])
    
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
                            className="bg-white rounded-xl shadow-xl flex flex-col overflow-hidden relative max-h-[80vh]"
                            initial={{ y: -30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -30, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ModalHeader title="Layout Setup" onClose={() => setShowModsPanel(false)} />
                            
                            <div className="overflow-y-auto custom-scrollbar">
                                <div className="flex gap-3 p-3 pb-8">
                                    <div className="flex gap-2 p-2">
                                        <div className="py-3 px-12  pl-3  h-48 flex flex-col justify-center items-center">
                                            { selectedPng.url ? (
                                                <>
                                                <div className="flex h-full w-full">
                                                    <div className="relative h-full w-fit mx-auto">
                                                        <img src={selectedPng.url} alt="dsdfsd" className="h-full object-contain" />

                                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full h-px bg-zinc-300 my-3" />
                                                        <p className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white px-2 text-xs font-medium">
                                                            {/* {dimension.width} */}
                                                            {selectedPng.width}
                                                            <span className="text-gray-500 font-normal"> mm</span>
                                                        </p>

                                                        <div className="absolute top-0 -right-6 w-px h-full bg-zinc-300 mx-3" />
                                                        <p className=" absolute top-1/2 -translate-y-1/2 -right-[48px] bg-white px-2 text-xs -rotate-90 origin-center font-medium">
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
                                            { modsWindows.length > 0 && (
                                                <div className="mb-3 flex items-center gap-2 py-2 px-2 rounded-xl bg-teal-50 border border-dashed border-green-200 w-full">
                                                    <CheckBadgeIcon width={16} height={16} strokeWidth={2} stroke="green" />
                                                    <p className="text-xs text-green-700 font-medium">Connected Mods Available</p>
                                                </div>
                                            )}
                                            <div className="bg-slate-100 flex-1 p-4 flex flex-col rounded-xl">
                                                <div className="flex gap-3">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <p className="text-xs w-24 text-black text-nowrap">Machine</p>
                                                        <div className={cn("w-full")}>
                                                            <Select 
                                                                options={machineOption} 
                                                                selected={selectedMachine} 
                                                                setSelected={setSelectedMachine} 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={cn("flex gap-2 items-center mt-5", selectedPng.url ? "opacity-100 pointer-events-auto" : "opacity-60 pointer-events-none")}>
                                                <div className={cn(
                                                    "flex items-end justify-center gap-1 bg-white border border-white py-1 rounded h-fit mr-auto pr-20",
                                                    selectedPng.url ? "opacity-100" : "opacity-0"
                                                )}>
                                                    <DocumentCheckIcon width={15} height={15} strokeWidth={2} stroke="green" />
                                                    <p className="text-[10px] text-gray-500 max-w-[140px] truncate">{selectedPng.name}.png</p>
                                                </div>
                                                <motion.button
                                                    className={cn(
                                                        "flex justify-center items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 text-indigo-700 hover:from-slate-100 hover:to-slate-100",
                                                        modsWindows.length > 0 ? "cursor-pointer" : "opacity-0 pointer-events-none"
                                                    )}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => setShowConnectedMods(prev => !prev) }
                                                >
                                                    <p className="font-medium text-xs ps-0.5  tracking-wider ">Use Connected Mods</p>
                                                    <QueueListIcon width={18} height={18} strokeWidth={2}  />
                                                </motion.button>
                                                <motion.button
                                                    className="flex justify-center items-center gap-2 px-2 py-1.5 rounded-lg shadow bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-500" 
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => openMods(selectedMachine)}
                                                >
                                                    <p className="font-medium text-xs ps-0.5 text-white tracking-wider ">Open In Mods</p>
                                                    <ArrowRightEndOnRectangleIcon width={18} height={18} strokeWidth={2} stroke="white" />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                            </div>
                            <ModsList 
                                showConnectedMods={showConnectedMods} 
                                setShowConnectedMods={setShowConnectedMods} 
                                modsWindows={modsWindows} 
                                selectedPng={selectedPng}
                                updateMods={updateMods}
                            />
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