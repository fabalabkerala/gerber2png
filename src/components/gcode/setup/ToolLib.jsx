import { useApp } from "../../context/AppContext"
import { useEffect, useState } from "react";
import Select from "../../ui/Select";
import PropTypes from "prop-types";
import VBitIcon from "../../icons/VBitIcon";
import NormalBitIcon from "../../icons/NormalBitIcon";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { cn } from "../../../utils/cn";
import { AnimatePresence, motion } from "motion/react";
import ToolSettings from "./ToolSettings";

const options = [
    { id: 'vbit', label: 'V-Bit' }, 
    { id: 'normal', label: 'Normal Bit' }, 
];

const ToolLibrary = () => {
    const { pcbConf, setPCBConf, toolLib } = useApp();
    const [ selectedTool , setSelectedTool ] = useState(null);
    const [ toolType, setToolType ] = useState('Select Bit');
    const [fillEnabled, setFillEnabled] = useState(false);

    const handleInput = (name, value, maxValue) => {
        if (value === '') {
            setPCBConf(prev => ({ ...prev, [name]: { ...prev[name], value: '' }}));
            return;
        }

        let num = parseFloat(value);
        if (num > maxValue) num = maxValue;

        num = Math.round(num * 100) / 100;

        setPCBConf(prev => ({
            ...prev,
            [name]: { ...prev[name], value: num }
        }));
    }

    useEffect(() => {
        console.log('udpate  :', toolType)
    }, [toolType])

    return (
        <>
            <div className="flex gap-3 p-3 h-full">
                <div className="flex-1 flex flex-col px-2">
                    <p className="text-sm pb-1 border-b px-1 py-1 font-medium text-gray-700">Tool Library</p>
                    <div className=" bg-zinc-0 flex-1  mt-3 flex flex-col gap-1 rounded h-full overflow-y-auto custom-scrollbar">
                        { toolLib.map((tool, index) => (
                            <div 
                                key={index} 
                                className={cn(
                                    "flex gap-2 items-center border-l-2  px-2 py-2.5 transition-all  cursor-pointer rounded",
                                    selectedTool === tool ? 'bg-zinc-100 border-orange-500 hover:bg-zinc-100' : 'hover:bg-zinc-100'
                                )}
                                onClick={() => setSelectedTool(tool)}
                            >
                                <p className="text-xs text-zinc-900 leading-none">{index + 1} </p>
                                { tool.type === 'normal' ? (
                                    <NormalBitIcon className={'w-4 h-4 mr-2'} />
                                ):(
                                    <VBitIcon className={'w-4 h-4 mr-2'} />
                                )}
                                <p className="text-[10px] px-2 py-1 bg-zinc-100 rounded leading-none border"> T-{tool.toolNo}</p>
                                <p className="text-sm px-2 leading-none"> {tool.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                    { selectedTool ? (
                        <>
                            <ToolSettings tool={selectedTool} />
                            {/* <div className="flex-1 h-44 flex items-center justify-center">
                                { selectedTool.type === 'normal' ? (
                                    <NormalBitIcon className={'w-auto h-28'} />
                                ):(
                                    <VBitIcon className={'w-auto h-28'} />
                                )}
                            </div>
                            <div className="bg-slate-100 flex-1 p-4  flex flex-col gap-2 rounded ">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-black w-24 font-medium">Name</p>
                                    <input 
                                        value={selectedTool.name}
                                        className="rounded flex-1 focus:outline-none text-xs py-1 border px-2 focus:border-l-2 focus:border-l-orange-500" 
                                        type="text"
                                        min={0}
                                        step={0.1}
                                        onInput={(e) => {
                                            let value = e.target.value;
                                            if (value < 0) value = 0;  
                                            // handleInput(name, value, maxValue)
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === '' || isNaN(e.target.value)) {
                                                // handleInput(name, defaultValue, maxValue);
                                            }
                                        }}  
                                    />
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center justify-between flex-1">
                                        <p className="text-xs w-24 text-black text-nowrap font-medium">Bit Type</p>
                                        <div className="bg-white w-36">
                                            <Select 
                                                options={options} 
                                                selected={toolType} 
                                                setSelected={setToolType} 
                                                onSelect={(value) => {
                                                    // setConfig(prev => ({ ...prev, background: value }))
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center gap-2  border-b border-white pb-3">
                                    <label className="text-xs text-black font-medium">Tool Number</label>
                                    <input 
                                        value={selectedTool.toolNo}
                                        className="rounded w-36 text-center focus:outline-none text-xs py-1 border px-2 focus:border-l-2 focus:border-l-orange-500" 
                                        type="number"
                                        min={0}
                                        step={0.1}
                                    />
                                </div>

                                <AnimatePresence>
                                    { toolType === 'vbit' && (
                                        <motion.div 
                                            className="flex justify-between items-center gap-2"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <label className="text-xs text-black">Angle <span className="text-gray-500 font-normal text-[10px]">(deg)</span></label>
                                            <input 
                                                value={selectedTool.angle}
                                                className="rounded w-36 text-center focus:outline-none text-xs py-1 border px-2 focus:border-l-2 focus:border-l-orange-500" 
                                                type="number"
                                                min={0}
                                                step={0.1} 
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex justify-between items-center gap-2">
                                    <label className="text-xs text-black">Diameter <span className="text-gray-500 font-normal text-[10px]">(mm)</span></label>
                                    <input 
                                        value={selectedTool.diameter}
                                        className="rounded w-36 text-center focus:outline-none text-xs py-1 border px-2 focus:border-l-2 focus:border-l-orange-500" 
                                        type="number"
                                        min={0}
                                        step={0.1}
                                    />
                                </div>

                                <div className="flex justify-between items-center gap-2">
                                    <label className="text-xs text-black">Maximum Cut Depth <span className="text-gray-500 font-normal text-[10px]">(mm)</span></label>
                                    <input 
                                        value={selectedTool.maxCutDepth}
                                        className="rounded w-36 text-center focus:outline-none text-xs py-1 border px-2 focus:border-l-2 focus:border-l-orange-500" 
                                        type="number"
                                        min={0}
                                        step={0.1}
                                    />
                                </div>

                                <div className="flex justify-between items-center gap-2">
                                    <label className="text-xs text-black">Offset Step Over</label>
                                    <input 
                                        value={selectedTool.offsetStepOver}
                                        className="rounded w-36 text-center focus:outline-none text-xs py-1 border px-2 focus:border-l-2 focus:border-l-orange-500" 
                                        type="number"
                                        min={0}
                                        step={0.1}
                                    />
                                </div>

                                <div className="flex justify-between items-center gap-2">
                                    <div className="flex items-center">
                                        <label className="text-xs text-black">Offset Number</label>
                                        <motion.button
                                            onClick={() => setFillEnabled((prev) => !prev)}
                                            whileTap={{ scale: 0.9 }}
                                            className="relative w-4 h-4 ml-4 flex items-center justify-center border rounded bg-white border-gray-400 hover:border-orange-500 transition-colors"
                                            >
                                            <motion.div
                                                initial={false}
                                                animate={{
                                                    // scale: fillEnabled ? 1 : 0,
                                                    scale: selectedTool.offsetNum === 0 ? 1 : 0,
                                                    // opacity: fillEnabled ? 1 : 0,
                                                    opacity: selectedTool.offsetNum === 0 ? 1 : 0,
                                                }}
                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                className="absolute w-3 h-3 bg-orange-500 rounded-sm"
                                            />
                                        </motion.button>

                                        <span className="text-xs pl-1 font-medium text-black tracking-wider">Fill</span>
                                    </div>
                                    <input
                                        className={`rounded w-36 text-center focus:outline-none text-xs py-1 border px-2 transition-all duration-300 focus:border-l-2 focus:border-l-orange-500 ${
                                            fillEnabled ? "opacity-90 cursor-not-allowed border-white" : ""
                                        }`}
                                        type="number"
                                        min={0}
                                        step={0.1}
                                        value={selectedTool.offsetNum}
                                        disabled={fillEnabled}
                                    />
                                </div>

                                <div className="flex justify-between items-center gap-2">
                                    <label className="text-xs text-black">Feed Rate <span className="text-gray-800 font-normal text-[10px]">(mm/s)</span></label>
                                    <input 
                                        value={selectedTool.feedRate}
                                        className="rounded w-36 text-center focus:outline-none text-xs py-1 border px-2 focus:border-l-2 focus:border-l-orange-500" 
                                        type="number"
                                        min={0}
                                        step={0.1}
                                    />
                                </div>

                                <div className="flex justify-between items-center gap-2">
                                    <label className="text-xs text-black">Plunge Rate <span className="text-gray-800 font-normal text-[10px]">(mm/s)</span></label>
                                    <input 
                                        value={selectedTool.plungeRate}
                                        className="rounded w-36 text-center focus:outline-none text-xs py-1 border px-2 focus:border-l-2 focus:border-l-orange-500" 
                                        type="number"
                                        min={0}
                                        step={0.1}
                                    />
                                </div>

                                <div className="flex justify-between items-center gap-2">
                                    <label className="text-xs text-black">RPM <span className="text-gray-800 font-normal text-[10px]">(mm/s)</span></label>
                                    <input 
                                        value={selectedTool.rpm}
                                        className="rounded w-36 text-center focus:outline-none text-xs py-1 border px-2 focus:border-l-2 focus:border-l-orange-500" 
                                        type="number"
                                        min={0}
                                        step={0.1}
                                    />
                                </div>
                            </div> */}
                        </>
                    ):(
                        <>
                            <div className="flex-1 flex flex-col items-center justify-center w-full h-full">
                                <PhotoIcon width={20} height={20} strokeWidth={2} stroke="gray" />
                                <p>No Preview Available</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}
export default ToolLibrary;

const InputField = ({name, label, value, maxValue, handleInput, defaultValue = 0}) => {
    return (
        <>
            <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-black">{ label } <span className="text-gray-500 font-normal text-[10px]">(mm)</span></label>
                <input 
                    value={value}
                    className="rounded w-32 focus:outline-none text-center text-xs py-1 border" 
                    type="number"
                    min={0}
                    step={0.1}
                    onInput={(e) => {
                        let value = e.target.value;
                        if (value < 0) value = 0;  
                        handleInput(name, value, maxValue)
                    }}
                    onBlur={(e) => {
                        if (e.target.value === '' || isNaN(e.target.value)) {
                            handleInput(name, defaultValue, maxValue);
                        }
                    }}  
                />
            </div>
        </>
    )
}
InputField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    value: PropTypes.number.isRequired,
    maxValue: PropTypes.number,
    handleInput: PropTypes.func.isRequired,
    defaultValue: PropTypes.number
}