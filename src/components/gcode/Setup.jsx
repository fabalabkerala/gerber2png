import { AdjustmentsHorizontalIcon, PhotoIcon, PlusCircleIcon, SquaresPlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react"
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useGerberView } from "../context/GerberContext";
import ModalHeader from "../ui/ModalHeader";
import ImageSelect from "../ui/ImageSelect";
import ImageLayout from "../ui/ImageLayout";
import { useApp } from "../context/AppContext";
import { cn } from "../../utils/cn";

const Setup = ({ showSetup, setShowSetup }) => {
    const { pngFiles, machineConf, selectedMachine, setSelectedMachine } = useApp();
    const [ selectedPng, setSelectedPng ] = useState('Choose an Image');
    const [ generating, setGenerating ] = useState(false);
    const [ config, setConfig ] = useState({
        row: 1,
        column: 1,
        spacing: 1,
        pcb: 1,
        background: 'black'
    });
    const [ machine, setMachine ] = useState({
        machine: null,
        width: 100,
        height: 100
    })

    const totalSlots = config.row * config.column;
    const [visibleSlots, setVisibleSlots] = useState(
        Array(totalSlots).fill(true)
    );

    const toggleSlot = (index) => {
        setVisibleSlots((prev) =>
            prev.map((v, i) => (i === index ? !v : v))
        );
    };

    const handleClose = () => {
        setShowSetup(false);
        setSelectedPng('Choose an Image');
    }

    // Update visibleSlots if totalSlots changes
    useEffect(() => {
        setVisibleSlots((prev) => {
            const newSlots = Array(totalSlots).fill(true);
            for (let i = 0; i < Math.min(prev.length, newSlots.length); i++) {
                newSlots[i] = prev[i];
            }
            return newSlots;
        });
    }, [totalSlots]);

    useEffect(() => {
        if (selectedPng.url) {
            if (isNaN(selectedPng.height) || isNaN(selectedPng.width)) return;

            const maxCol = Math.floor((machine.width + config.spacing)  / (selectedPng.width + config.spacing));
            const maxRow = Math.floor((machine.height + config.spacing) / (selectedPng.height + config.spacing));

            setConfig(prev => ({
                ...prev,
                row: maxRow,
                column: maxCol,
                pcb: maxRow * maxCol
            }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [machine, selectedPng])

    const machineOptions = machineConf.map(item => ({ name: item.machine, url: item.image, ...item }));

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
                                <p className="text-xs px-2 text-gray-700">Initial Setup</p>
                                <motion.button 
                                    whileTap={{ scale: 0.97, background: '#ef4444' }}
                                    onClick={ () => setShowSetup(false) }
                                    className="py-1.5 px-1 rounded-tr shadow-sm border bg-red-400 border-red-300"
                                >
                                    <XMarkIcon width={20} height={14} strokeWidth={2} className="text-white" />
                                </motion.button>
                            </div>
                            <div className="flex items-center bg-neutral-50 rounded-tl-md rounded-tr-md">
                                <motion.button 
                                    whileTap={{ scale: 0.97, background: '#ef4444' }}
                                    // onClick={ () => setInitialSetup(false) }
                                    className="py-1.5 px-3 text-xs bg-white border-t border-[#e57345]"
                                >
                                    Machine
                                </motion.button>
                                <motion.button 
                                    whileTap={{ scale: 0.97, background: '#ef4444' }}
                                    // onClick={ () => setInitialSetup(false) }
                                    className="py-1.5 px-3 rounded-tr text-xs border-t border-t-neutral-50 border-r"
                                >
                                    PCB Configuration
                                </motion.button>
                                <motion.button 
                                    whileTap={{ scale: 0.97, background: '#ef4444' }}
                                    // onClick={ () => setInitialSetup(false) }
                                    className="py-1.5 px-3 text-xs border-t border-neutral-50"
                                >
                                    Tool Library
                                </motion.button>
                            </div>
                            
                            
                            <div className="overflow-y-auto custom-scrollbar h-full">
                                <div className="flex gap-3 px-6 py-3">
                                    <div className="flex flex-col gap-3 w-full">
                                        <div className="py-1">
                                            <div className="w-1/3">
                                                <p className="text-xs px-1 py-1 text-gray-700">Choose Machine</p>
                                                <ImageSelect
                                                    options={machineOptions}
                                                    selected={selectedMachine}
                                                    setSelected={setSelectedMachine}
                                                    onSelect={(value) => {
                                                        if (value.name.includes('drill')) {
                                                            setConfig(prev => ({ ...prev, background: 'white'}))
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="py-2 flex gap-4 justify-center items-center">
                                            <div className="w-1/3 h-36 p-3 flex flex-col items-center justify-center">
                                                { selectedMachine.url ? (
                                                    <>
                                                        <img src={selectedMachine.url} alt="dsdfsd" className="h-full object-contain" />
                                                    </>
                                                ): (
                                                    <>
                                                        <PhotoIcon width={20} height={20} strokeWidth={2} stroke="gray" />
                                                        <p className="text-xs font-medium">No Preview Available</p>
                                                    </>
                                                )}
                                            </div>
                                            <div className="w-2/3 h-full px-4 py-3 bg-zinc-50 rounded">
                                                <p className="text-sm border- pb-0.5 font-medium">Bedsize<span className="text-[10px] text-gray-600 font-normal"></span></p>
                                                <div className="flex flex-col gap-2 justify-between rounded mt-3">
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-xs w-20 text-black">Width</label>
                                                        <p className="px-4 py-1 border-b text-xs font-medium">{ selectedMachine.width } <span className="font-normal text-gray-500 text-[10px]">mm</span></p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-xs w-20 text-black">Height</label>
                                                        <p className="px-4 py-1 border-b text-xs font-medium">{ selectedMachine.height } <span className="font-normal text-gray-500 text-[10px]">mm</span></p>
                                                    </div>
                                                   
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-3">
                                    <div className="flex items-center gap-1 border-b py-1">
                                        <AdjustmentsHorizontalIcon width={15} height={15} strokeWidth={1} stroke="gray" />
                                        <p className="text-xs px-1 py-1 text-gray-700">Tool Configuration</p>

                                        <motion.button
                                            className="flex ms-auto justify-center items-center gap-1 border-[#e57345] px-2 py-1 rounded " 
                                            whileTap={{ scale: 0.98 }}
                                            // onClick={() => handleGeneration(selectedPng.url)}
                                        >
                                            
                                            <p className="text-xs ps-0.5 text-[#e57345] tracking-wider font-medium">Add</p>
                                            <PlusCircleIcon width={14} height={14} strokeWidth={2} stroke="#e57345" />
                                        </motion.button>
                                    </div>
                                    <div className="w-full">
                                        {/* Header row */}
                                        <div className="flex items-baseline gap-4 w-full border-b border-gray-100 pt-4 mb-3">
                                            <p className="text-xs py-1 text-gray-700 font-semibold w-6">No.</p>
                                            <div className="flex-1">
                                            <p className="text-xs px-1 py-1 text-gray-700 font-semibold">Tool</p>
                                            </div>
                                            <div className="flex-1">
                                            <p className="text-xs px-1 py-1 text-gray-700 font-semibold">Diameter / Angle</p>
                                            </div>
                                            <div className="flex-1">
                                            <p className="text-xs px-1 py-1 text-gray-700 font-semibold">Operation</p>
                                            </div>
                                            <div className="w-6"></div>
                                        </div>

                                        {/* Data rows */}
                                        {Array.from({ length: 4 }).map((_, index) => (
                                            <div key={index} className="flex items-baseline gap-6 w-full pb-3">
                                            <p className="text-xs px-1 py-1 text-gray-700 mt-auto font-medium">{index + 1}.</p>

                                            <div className="flex-1">
                                                <ImageSelect
                                                options={machineOptions}
                                                selected={selectedMachine}
                                                setSelected={setSelectedMachine}
                                                onSelect={(value) => {
                                                    if (value.name.includes('drill')) {
                                                    setConfig(prev => ({ ...prev, background: 'white' }));
                                                    }
                                                }}
                                                />
                                            </div>

                                            <div className="flex-1">
                                                <ImageSelect
                                                options={machineOptions}
                                                selected={selectedMachine}
                                                setSelected={setSelectedMachine}
                                                onSelect={(value) => {
                                                    if (value.name.includes('drill')) {
                                                    setConfig(prev => ({ ...prev, background: 'white' }));
                                                    }
                                                }}
                                                />
                                            </div>

                                            <div className="flex-1">
                                                <ImageSelect
                                                options={machineOptions}
                                                selected={selectedMachine}
                                                setSelected={setSelectedMachine}
                                                onSelect={(value) => {
                                                    if (value.name.includes('drill')) {
                                                    setConfig(prev => ({ ...prev, background: 'white' }));
                                                    }
                                                }}
                                                />
                                            </div>

                                            <motion.button
                                                className="flex justify-center mt-auto h-fit items-center gap-1 px-1.5 py-1.5 rounded shadow bg-red-500 border border-red-300"
                                                whileTap={{ scale: 0.96 }}
                                            >
                                                <TrashIcon width={16} height={16} strokeWidth={2} stroke="white" />
                                            </motion.button>
                                            </div>
                                        ))}
                                    </div>

                                </div>

                            </div>

















                            <AnimatePresence>
                                { generating && (
                                    <motion.div
                                        key="loader"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.25, ease: "easeOut" }}
                                        className="absolute inset-0 bg-white/40 backdrop-blur- flex items-center justify-center z-[9999]"
                                    >
                                        <motion.div
                                            className="w-12 h-12 border-4 border-[#e57345] border-t-transparent rounded-full"
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

Setup.propTypes = {
    showSetup: PropTypes.bool,
    setShowSetup: PropTypes.func
}
export default Setup;