import { ArrowRightEndOnRectangleIcon, CheckBadgeIcon, PlayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react"
import PropTypes from "prop-types";
import { useState } from "react";
import Machine from "./Machine";
import ToolLibrary from "./ToolLib";
import PcbConfiguration from "./PcbConf";
import { cn } from "../../../utils/cn";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

const tabs = [
    { id: 'machine', label: 'Machine' },
    { id: 'pcb', label: 'PCB Configuration' },
    { id: 'tool', label: 'Tool Library' },
]

const toolJob = [
    { job: 'trace', toolDia: 0.39624 },
    { job: 'drill', toolDia: 0.8 },
    { job: 'outline', toolDia: 0.8 }
]

const Setup = ({ showSetup, setShowSetup }) => {
    const navigate = useNavigate()
    const { setupCompleted, markSetupComplete, pngFiles, setPngFiles, toolLib } = useApp();
    const [ selectedTab, setSelectedTab ] = useState(tabs[0]);
    const isFirstTime = !setupCompleted

    const handleNext = () => {
        const currentIndex = tabs.findIndex(t => t.id === selectedTab.id);
        if (currentIndex < tabs.length - 1) {
            setSelectedTab(tabs[currentIndex + 1]);
        }
    };
      
    const handleBack = () => {
        const currentIndex = tabs.findIndex(t => t.id === selectedTab.id);
        if (currentIndex > 0) {
            setSelectedTab(tabs[currentIndex - 1]);
        }
    };

    const handleFinish = () => {
        const updatedPng = pngFiles.map(png => {
            if (png.job === 'trace') {
                const selectedTool = toolLib
                    .filter(tool => tool.diameter >= 0.3 && tool.diameter <= 0.8)
                    .sort((a, b) => a.diameter - b.diameter)[0] || null;


                return {
                    ...png,
                    tool: selectedTool.id || null   // in case nothing matches
                }; 
            } else if (png.job === 'drill' || png.job === 'outline') {
                const selectedTool = toolLib
                    .filter(tool => tool.diameter >= 0.3 && tool.diameter <= 0.8)
                    .sort((a, b) => b.diameter - a.diameter)[0] || null;

                return {
                    ...png,
                    tool: selectedTool.id || null,   // in case nothing matches
                    offsetNumber: 1
                }; 
            }

            return png
        })
        setPngFiles(updatedPng);

        markSetupComplete();
        setShowSetup(false);
        setSelectedTab(tabs[0])
    };

    return (
        <>
            <AnimatePresence>
                {showSetup && (
                    <motion.div
                        className="fixed inset-0 bg-black/10 bg-blend-color-burn flex justify-center items-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-md shadow-xl flex flex-col overflow-hidden relative h-[80vh] w-1/2 min-w-96"
                            initial={{ y: -30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -30, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            
                            <div className="flex justify-between items-center bg-neutral-100 rounded-tl-md rounded-tr-md border-b">
                                <p className="text-sm px-3 py-1 text-gray-900">Setup</p>
                                { !isFirstTime && 
                                    <motion.button 
                                        whileTap={{ scale: 0.97, background: '#ef4444' }}
                                        onClick={ () => setShowSetup(false) }
                                        className="py-2 px-2 rounded-tr shadow-sm border bg-red-400 border-red-300"
                                    >
                                        <XMarkIcon width={20} height={14} strokeWidth={2} className="text-white" />
                                    </motion.button>
                                }
                            </div>
                            <div className="flex items-center bg-neutral-50 rounded-tl-md rounded-tr-md">
                                { tabs.map((tab, index)=> (
                                    <motion.button 
                                        key={index}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={ () => setSelectedTab(tab) }
                                        className={cn(
                                            "py-1.5 px-3 text-xs capitalize",
                                            selectedTab.id === tab.id ? "bg-white border-t border-[#e57345]" : "border-t border-t-neutral-50 border-r"
                                        )}
                                    >
                                        {tab.label}
                                    </motion.button>
                                ))}
                            </div>
                            
                            
                            <div className="overflow-y-auto custom-scrollbar h-full">
                                { selectedTab.id === 'machine' && <Machine />}
                                { selectedTab.id === 'pcb' && <PcbConfiguration />}
                                { selectedTab.id === 'tool' && <ToolLibrary />}
                            </div>

                            { isFirstTime &&
                                <div className="w-full bg-white bottom-0 flex gap-2 justify-between p-3">
                                    <div>
                                        { selectedTab.id !== 'machine' &&
                                            <motion.button
                                                className="flex justify-center items-center gap-1  px-2 py-1.5 rounded" 
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleBack}
                                            >
                                                <PlayIcon width={16} height={16} strokeWidth={2} className="rotate-180 text-gray-700" />
                                                <p className="text-xs text-gray-700 font-medium ">Back</p>
                                            </motion.button>
                                        }
                                    </div>
                                    <div className="flex gap-2">
                                        <motion.button
                                            className="flex justify-center items-center gap-1 border border-[#e57345] bg-zinc-50 px-3 py-1.5 rounded shadow" 
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => navigate("/")}
                                        >
                                            <p className="text-xs ps-0.5 text-[#e57345] tracking-wider">Cancel</p>
                                            {/* <ArrowRightEndOnRectangleIcon width={16} height={16} strokeWidth={2} stroke="white" /> */}
                                        </motion.button>
                                        { selectedTab.id === 'tool' ? (
                                            <motion.button
                                                className="flex justify-center items-center gap-1 bg-sky-500 px-3 py-1.5 rounded shadow" 
                                                whileTap={{ scale: 0.98 }}
                                                onClick={(handleFinish)}
                                            >
                                                <p className="text-xs ps-0.5 text-white tracking-wider">Finish</p>
                                                <CheckBadgeIcon width={16} height={16} strokeWidth={2} stroke="white" />
                                            </motion.button>
                                        ):(
                                            <>
                                                <motion.button
                                                    className="flex justify-center items-center gap-1 bg-[#e57345] px-3 py-1.5 rounded shadow" 
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={handleNext}
                                                >
                                                    <p className="text-xs ps-0.5 text-white tracking-wider">Next</p>
                                                    <ArrowRightEndOnRectangleIcon width={16} height={16} strokeWidth={2} stroke="white" />
                                                </motion.button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            }
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

Setup.propTypes = {
    showSetup: PropTypes.bool,
    setShowSetup: PropTypes.func
}
export default Setup;