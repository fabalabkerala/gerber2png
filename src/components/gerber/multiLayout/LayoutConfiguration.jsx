import { useState } from "react";
import Select from "../../ui/Select";
import PropTypes from "prop-types";

const machineOption = [
    { id: 'mdx', label: 'Rolland MDX Mill', width: 300, height: 300 }, 
    { id: 'carvera', label: 'Makera Carvera', width: 300, height: 250 }, 
    { id: 'custom', label: 'Custom', width: null, height: null }, 
]

const LayoutConfiguration = ({
    machine, 
    setMachine, 
    // config, 
    // setConfig
}) => {
    const [ selectedMachine, setSelectedMachine ] = useState('Choose Machine');

    const handleInput = (name, value) => {
        const updatedVal = { ...machine, [name]: Number(value) < 400 ? Number(value) : 400 }

        const matchedMachine = machineOption.find(opt => opt.width === updatedVal.width && opt.height === updatedVal.height);
        const machineObj = matchedMachine || { id: 'custom', label: 'Custom', ...updatedVal };

        setMachine({ ...updatedVal, machine: machineObj.id });
        setSelectedMachine(machineObj.id);
    }

    const handleSelect = (value) => {
        if (value === 'mdx') {
            setMachine(prev => ({ ...prev, machine: 'mdx', width: 300, height: 300 }));
        } else if (value === 'carvera') {
            setMachine(prev => ({ ...prev, machine: 'carvera', width: 300, height: 250 }));
        } else {
            setMachine(prev => ({ ...prev, machine: 'custom'}));
        }
    }

    return (
        <>
            <p className="px-3 font-medium text-xs">CONFIGURATION<span className="text-xs text-gray-600 font-normal"></span></p>
            <div className="bg-slate-100 flex-1 p-4 mx-2 my-1 flex flex-col rounded-xl">
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 flex-1">
                        <p className="text-xs w-24 text-black text-nowrap">Machine</p>
                        <div className="w-36">
                            <Select 
                                options={machineOption} 
                                selected={selectedMachine} 
                                setSelected={setSelectedMachine} 
                                onSelect={handleSelect}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-3">
                    <div className="flex items-center gap-2">
                    <label className="text-xs w-24 text-black">Width <span className="text-gray-500 font-normal">(mm)</span></label>
                        <input 
                            className="rounded-lg w-32 focus:outline-none text-center text-xs py-1.5 border" 
                            type="number"
                            value={machine.width}
                            onInput={(e) => {
                                handleInput('width', e.target.value);
                            }} 
                        />
                    </div>
                    <div className="flex items-center gap-2">
                    <label className="text-xs w-24 text-black">Height <span className="text-gray-500 font-normal">(mm)</span></label>
                        <input 
                            className="rounded-lg w-32 focus:outline-none text-center text-xs py-1.5 border" 
                            type="number" 
                            value={machine.height}
                            onInput={(e) => {
                                handleInput('height', e.target.value);
                            }} 
                        />
                    </div>
                </div>

                {/* <div className="flex gap-4 mt-3">
                    <div className="flex items-center gap-2">
                    <label className="text-xs w-24 text-black text-nowrap font-medium">Number of PCBs </label>
                        <input 
                            className="rounded w-32 focus:outline-none text-center text-xs py-1 border" 
                            type="number"
                            value={ config.pcb }
                            onInput={(e) => {
                                const value = Number(e.target.value)
                                setConfig(prev => ({ ...prev, pcb: value }))
                            }} 
                        />
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-2">
                        <label className="text-xs text-black">
                            <span className="pr-3">Layout :</span> 
                            <span className="text-sm font-medium">{ config.row } <span className="text-[10px] font-normal text-gray-500">Rows</span></span>
                            <span className="text-gray-500 font-medium px-2 ">X</span>
                            <span className="text-sm font-medium">{ config.column } <span className="text-[10px] font-normal text-gray-500">Columns</span></span>
                        </label>
                        <div className="relative">
                            <motion.button
                                // onClick={handleDeleteAll}
                                className="flex justify-center items-center gap-1 px-1 py-1 rounded shadow bg-[#e57345] border border-red-300" 
                                whileTap={{ scale: 0.96 }}
                            >
                                <ArrowPathRoundedSquareIcon width={14} height={14} strokeWidth={2} stroke="white" />
                            </motion.button>
                        </div>
                    </div>
                </div> */}
            </div>
        </>
    )
}

LayoutConfiguration.propTypes = {
    machine: PropTypes.shape({ 
        machine: PropTypes.string.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired
    }),
    setMachine: PropTypes.func.isRequired,
    config: PropTypes.shape({
        row: PropTypes.number,
        column: PropTypes.number,
        pcb: PropTypes.number
    }),
    setConfig: PropTypes.func
}

export default LayoutConfiguration

