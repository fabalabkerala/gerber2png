import { AdjustmentsHorizontalIcon, PlusCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useApp } from "../../context/AppContext"
import ImageSelect from "../../ui/ImageSelect"
import { motion } from "motion/react";

const ToolLibrary = () => {
    const { machineConf, selectedMachine, setSelectedMachine } = useApp();
    const machineOptions = machineConf.map(item => ({ name: item.machine, url: item.image, ...item }));

    return (
        <>
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
                            />
                        </div>

                        <div className="flex-1">
                            <ImageSelect
                            options={machineOptions}
                            selected={selectedMachine}
                            setSelected={setSelectedMachine}
                            />
                        </div>

                        <div className="flex-1">
                            <ImageSelect
                            options={machineOptions}
                            selected={selectedMachine}
                            setSelected={setSelectedMachine}
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
        </>
    )
}
export default ToolLibrary;