import { ArrowRightIcon, CheckBadgeIcon, CheckCircleIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react"
import PropTypes from "prop-types";
import { useEffect } from "react";
import ModalHeader from "../../ui/ModalHeader";
const ModsList = ({showConnectedMods, setShowConnectedMods, modsWindows, selectedPng, updateMods}) => {

    const activeMods = modsWindows.filter(m => !m.window?.closed);

    useEffect(() => {
        console.log('modsWindows :', modsWindows);
    }, [modsWindows])

    const handleFocus = (mods) => {
        if (mods.window && !mods.window.closed) {
            mods.window.focus();
        }
    }

    
    return (
        <>
            <AnimatePresence>
                {showConnectedMods && (
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
                            <ModalHeader title="Connected Mods" onClose={() => setShowConnectedMods(false)} />
                            
                            <div className="px-5 py-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                                {activeMods.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 min-w-96">
                                        <PhotoIcon className="w-8 h-8 mb-3"/>
                                        <p className="text-sm font-medium">No active Mods sessions</p>
                                        <p className="text-xs text-gray-400">
                                            Open Mods from the export panel to create a session.
                                        </p>
                                    </div>
                                )}
                                {activeMods.map((mods) => (
                                    <motion.div
                                        key={mods.id}
                                        whileHover={{ y: -2 }}
                                        className="
                                            flex gap-4 items-center bg-gradient-to-br from-gray-50 to-white
                                            border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition
                                        "
                                    >
                                    {/* Preview */}
                                    <div className="flex items-center px-3 py-3 bg-white border border-dashed rounded-lg gap-3">
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            <p className="text-[11px] text-indigo-900 leading-tight">Current</p>
                                            <div className="w-14 h-14 bg-white border rounded-lg flex items-center justify-center overflow-hidden shadow-md">
                                                {mods.image ? (
                                                    <img src={mods.image} className="w-full h-full object-contain" />
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
                                        <p className="text-md font-semibold text-gray-800">{mods.machine.label}</p>
                                        <div className="flex items-center gap-1 text-xs text-green-600 mb-1">
                                            <CheckCircleIcon className="w-3 h-3"/>
                                            Connected
                                        </div>
                                        <p className="text-xs text-gray-400">Id: {mods.id}</p>
                                        
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col items-end gap-2">
                                        
                                        <div className="flex gap-3">
                                            
                                            <button
                                                onClick={() => handleFocus(mods)}
                                                className="text-xs px-3 py-2 bg-gray-100 text-indigo-700 rounded-md hover:bg-gray-200 transition"
                                            >
                                            Focus
                                            </button>
                                             <button
                                                onClick={() => updateMods(mods)}
                                                className="text-xs px-3 py-2 rounded-lg text-white font-medium transition bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-500"
                                            >
                                                Update Mods
                                            </button>
                                        </div>
                                            
                                    </div>

                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

ModsList.propTypes = {
    showConnectedMods: PropTypes.bool,
    setShowConnectedMods: PropTypes.func,
    modsWindows: PropTypes.array
}
export default ModsList;