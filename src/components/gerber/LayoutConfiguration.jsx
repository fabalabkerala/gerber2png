import { useState } from "react";
import Select from "../ui/Select";
import PropTypes from "prop-types";

const machineOption = [
    { id: 'mdx', label: 'Rolland MDX Mill', width: 300, height: 300 }, 
    { id: 'carvera', label: 'Makera Carvera', width: 300, height: 250 }, 
    { id: 'custom', label: 'Custom', width: null, height: null }, 
]

const LayoutConfiguration = ({machine, setMachine}) => {
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
            <div className="bg-zinc-100 flex-1 p-4 mx-2 my-1 flex flex-col rounded">
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 flex-1">
                        <p className="text-xs w-20 text-black text-nowrap">Machine</p>
                        <div className="bg-white w-36">
                            <Select 
                                options={machineOption} 
                                selected={selectedMachine} 
                                setSelected={setSelectedMachine} 
                                onSelect={handleSelect}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-3">
                    <div className="flex items-center gap-2">
                    <label className="text-xs w-20 text-black">Width <span className="text-gray-500 font-normal">(mm)</span></label>
                        <input 
                            className="rounded w-36 focus:outline-none text-center text-xs py-1 border" 
                            type="number"
                            value={machine.width}
                            onInput={(e) => {
                                handleInput('width', e.target.value);
                            }} 
                        />
                    </div>
                    <div className="flex items-center gap-2">
                    <label className="text-xs w-20 text-black">Height <span className="text-gray-500 font-normal">(mm)</span></label>
                        <input 
                            className="rounded w-36 focus:outline-none text-center text-xs py-1 border" 
                            type="number" 
                            value={machine.height}
                            onInput={(e) => {
                                handleInput('height', e.target.value);
                            }} 
                        />
                    </div>
                </div>
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
    setMachine: PropTypes.func.isRequired
}

export default LayoutConfiguration

