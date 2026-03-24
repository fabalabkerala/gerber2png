import { ArrowRightEndOnRectangleIcon, CheckBadgeIcon, DocumentCheckIcon, PhotoIcon, ArrowRightIcon, CheckCircleIcon  } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react"
import PropTypes from "prop-types";
import { useRef, useState } from "react";
import ModalHeader from "../../ui/ModalHeader";
import Select from "../../ui/Select";
import { cn } from "../../../utils/cn";
import { useGerberSettings } from "../../context/GerberContext";

const machineOption = [
    { id: 'mdx', label: 'Rolland MDX Mill', program: 'programs/machines/Roland/SRM-20+mill/mill+2D+PCB' }, 
    { id: 'carvera', label: 'Makera Carvera', program: 'programs/machines/Makera/Carvera' }, 
]

const ModsPanel = ({showModsPanel, setShowModsPanel, selectedPng}) => {
    const [ modsStatus, setModsStatus ] = useState('initial');
    const { 
        doubleSide,
        modsMachine,
        setModsMachine,
        toolConfig,
        updateToolConfig,
        saveSettings
     } = useGerberSettings();
    const [currentStep, setCurrentStep] = useState(0);

    const [isDirty, setIsDirty] = useState(false);
    const [saved, setSaved] = useState(false);

    const processSteps = doubleSide
        ? [
            { label: "Top Trace", desc: "Copper Top" },
            { label: "Drill", desc: "Holes" },
            { label: "Flip", desc: "Align Board" },
            { label: "Bottom Trace", desc: "Copper Bottom" },
            { label: "Outline", desc: "Cut Board" },
            ]
        : [
            { label: "Trace", desc: "Copper Paths" },
            { label: "Drill", desc: "Holes" },
            { label: "Outline", desc: "Cut Board" },
        ];

    const modsWindowRef = useRef(null);

    const handleToolChange = (step, key, value) => {
        updateToolConfig(step, key, value);
        setIsDirty(true);
        setSaved(false);
    };

    const handleSave = () => {
        saveSettings();
        setIsDirty(false);
        setSaved(true);

        setTimeout(() => setSaved(false), 1500);
    };

    const openMods = async (modsMachine) => {
        if (!selectedPng?.url) return;

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

        modsWindowRef.current = { window: modsWindow, machine: machine, image: selectedPng.url };
        
        const buffer = await fetch(selectedPng.url).then(res => res.arrayBuffer());
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

    const updateMods = async (mods) => {
        if (mods.window && !mods.window.closed) {
            const buffer = await fetch(selectedPng.url).then(res => res.arrayBuffer());

            mods.window.postMessage(
                { type: 'png', data: buffer }, 
                'https://modsproject.org'
            );
            mods.window.focus();
            setShowModsPanel(false);
        }
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
                            className="bg-white rounded-xl shadow-xl flex flex-col overflow-hidden relative max-h-[80vh]"
                            initial={{ y: -30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -30, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ModalHeader title="Layout Setup" onClose={() => setShowModsPanel(false)} />
                            
                            <div className="overflow-y-auto custom-scrollbar">
                                <div className="flex flex-col gap-3 p-3 pb-8">
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
                                            { modsWindowRef.current?.window && (
                                                <div className="mb-3 flex items-center gap-2 py-2 px-2 rounded-xl bg-teal-50 border border-dashed border-green-200 w-full">
                                                    <CheckBadgeIcon width={16} height={16} strokeWidth={2} stroke="green" />
                                                    <p className="text-xs text-green-700 font-medium">Mods is Connected</p>
                                                </div>
                                            )}
                                            { modsWindowRef.current?.window && (
                                                <motion.div
                                                whileHover={{ y: -2 }}
                                                className="
                                                    flex gap-4 items-center bg-gradient-to-br from-blue-50 to-white mb-3
                                                    border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition
                                                "
                                            >
                                            {/* Preview */}
                                            <div className="flex items-center px-3 py-3 bg-white border border-dashed border-blue-200 rounded-lg gap-3">
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                    <p className="text-[11px] text-indigo-900 leading-tight">Current</p>
                                                    <div className="w-14 h-14 bg-white border rounded-lg flex items-center justify-center overflow-hidden shadow-md">
                                                        {modsWindowRef.current?.image ? (
                                                            <img src={modsWindowRef.current.image} className="w-full h-full object-contain" />
                                                        ):(
                                                            <PhotoIcon className="w-6 h-6 text-indigo-400"/>
                                                        )}
                                                    </div>
                                                </div>

                                                <ArrowRightIcon className="w-4 h-4 text-gray-400  mt-3"/>
                                                
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                    <p className="text-[11px] text-indigo-900 leading-tight">Update With</p>
                                                    <div className="w-16 h-14 bg-white border rounded-lg flex items-center justify-center overflow-hidden shadow-md">
                                                        {selectedPng.url ? (
                                                            <img src={selectedPng.url} className="w-full h-full object-contain" />
                                                        ):(
                                                            <PhotoIcon className="w-6 h-6 text-gray-400"/>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="flex flex-col flex-1 min-w-72">
                                                <p className="text-md font-semibold text-gray-800">{modsWindowRef.current?.machine.label}</p>
                                                <div className="flex items-center gap-1 text-xs text-green-600 mb-1">
                                                    <CheckCircleIcon className="w-3 h-3"/>
                                                    Connected
                                                </div>                                                
                                            </div>

                                            </motion.div>
                                            )}
                                            <div className="bg-slate-100 flex-1 p-4 flex flex-col rounded-xl">
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

                                            <div className={cn("flex gap-2 items-center mt-5", selectedPng.url ? "opacity-100 pointer-events-auto" : "opacity-60 pointer-events-none")}>
                                                <div className={cn(
                                                    "flex items-end justify-center gap-1 bg-white border border-white py-1 rounded h-fit mr-auto pr-20",
                                                    selectedPng.url ? "opacity-100" : "opacity-0"
                                                )}>
                                                    <DocumentCheckIcon width={15} height={15} strokeWidth={2} stroke="green" />
                                                    <p className="text-[10px] text-gray-500 max-w-[140px] truncate">{selectedPng.name}.png</p>
                                                </div>
                                                <motion.button
                                                    className="flex justify-center items-center gap-2 px-2 py-1.5 rounded-lg shadow bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-500" 
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => openMods(modsMachine)}
                                                >
                                                    <p className="font-medium text-xs ps-0.5 text-white tracking-wider ">{ modsWindowRef.current?.window ? 'Update In Mods' : 'Open Mods' }</p>
                                                    <ArrowRightEndOnRectangleIcon width={18} height={18} strokeWidth={2} stroke="white" />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
<motion.div
  className="px-4 pb-4"
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
>
  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">

    {/* Header */}
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-semibold text-gray-600 tracking-wide">
        TOOL CONFIGURATION
      </p>

      <div className="flex items-center gap-2">
        {saved && (
          <span className="text-[11px] text-green-600">✓ Saved</span>
        )}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleSave}
          className="
            text-[11px] px-3 py-1.5 rounded-md
            bg-indigo-600 text-white
            hover:bg-indigo-700 transition
          "
        >
          Save
        </motion.button>
      </div>
    </div>

    {/* Status */}
    <p className="text-[11px] text-gray-400 mb-3">
      {isDirty ? "Unsaved changes" : "All changes saved"}
    </p>

    {/* Dynamic Config */}
    {(() => {
      const stepKey = processSteps[currentStep].label.toLowerCase();

      let configKey = "trace";
      if (stepKey.includes("drill")) configKey = "drill";
      if (stepKey.includes("outline")) configKey = "outline";

      const config = toolConfig[modsMachine][configKey];

      return (
        <div className="grid grid-cols-2 gap-3">

          {Object.entries(config).map(([key, value]) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-500 capitalize">
                {key}
              </label>

              <input
                type={typeof value === "number" ? "number" : "text"}
                value={value}
                onChange={(e) =>
                  handleToolChange(
                    configKey,
                    key,
                    typeof value === "number"
                      ? parseFloat(e.target.value)
                      : e.target.value
                  )
                }
                className="
                  text-xs px-2 py-1.5 rounded-md
                  border border-gray-300
                  focus:outline-none focus:ring-1 focus:ring-indigo-500
                "
              />
            </div>
          ))}

        </div>
      );
    })()}

  </div>
</motion.div>
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