import { useState } from "react";
import NormalBitIcon from "../../icons/NormalBitIcon";
import VBitIcon from "../../icons/VBitIcon";
import Select from "../../ui/Select";
import { AnimatePresence, motion } from "motion/react";
import PropTypes from "prop-types";
import { useApp } from "../../context/AppContext";


const options = [
    { id: 'vbit', label: 'V-Bit' }, 
    { id: 'normal', label: 'Normal Bit' }, 
];

const ToolSettings = ({ tool, index, setToolLib }) => {
    const [ toolType, setToolType ] = useState(tool.type || 'Choose Bit');
    
    return (
        <>
            <div className="flex-1 h-44 flex items-center justify-center">
                { tool.type === 'normal' ? (
                    <NormalBitIcon className={'w-auto h-28'} />
                ):(
                    <VBitIcon className={'w-auto h-28'} />
                )}
            </div>
            <div className="bg-slate-100 flex-1 p-4  flex flex-col gap-2 rounded ">
                <div className="flex justify-between items-center">
                    <p className="text-xs text-black w-24 font-medium">Name</p>
                    <input 
                        value={tool.name}
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
                                selected={tool.type} 
                                setSelected={setToolType} 
                                onSelect={(value) => {
                                    console.log(value)
                                    // setTool(prev => ({ ...prev, type: value }))
                                    setToolLib(prev => 
                                        prev.map((t, id) => id === index ? { ...t, type: value } : t)
                                    )
                                    // setConfig(prev => ({ ...prev, background: value }))
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center gap-2  border-b border-white pb-3">
                    <label className="text-xs text-black font-medium">Tool Number</label>
                    <input 
                        value={tool.toolNo}
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
                                value={tool.angle}
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
                        value={tool.diameter}
                        className="rounded w-36 text-center focus:outline-none text-xs py-1 border px-2 focus:border-l-2 focus:border-l-orange-500" 
                        type="number"
                        min={0}
                        step={0.1}
                    />
                </div>

                <div className="flex justify-between items-center gap-2">
                    <label className="text-xs text-black">Maximum Cut Depth <span className="text-gray-500 font-normal text-[10px]">(mm)</span></label>
                    <input 
                        value={tool.maxCutDepth}
                        className="rounded w-36 text-center focus:outline-none text-xs py-1 border px-2 focus:border-l-2 focus:border-l-orange-500" 
                        type="number"
                        min={0}
                        step={0.1}
                    />
                </div>

                <div className="flex justify-between items-center gap-2">
                    <label className="text-xs text-black">Offset Step Over</label>
                    <input 
                        value={tool.offsetStepOver}
                        className="rounded w-36 text-center focus:outline-none text-xs py-1 border px-2 focus:border-l-2 focus:border-l-orange-500" 
                        type="number"
                        min={0}
                        step={0.1}
                    />
                </div>

                <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center">
                        <label className="text-xs text-black">Offset Number</label>
                        {/* Animated checkbox */}
                        <motion.button
                            // onClick={() => setFillEnabled((prev) => !prev)}
                            whileTap={{ scale: 0.9 }}
                            className="relative w-4 h-4 ml-4 flex items-center justify-center border rounded bg-white border-gray-400 hover:border-orange-500 transition-colors"
                            >
                            {/* Check mark */}
                            <motion.div
                                initial={false}
                                animate={{
                                    // scale: fillEnabled ? 1 : 0,
                                    scale: tool.offsetNum === 0 ? 1 : 0,
                                    // opacity: fillEnabled ? 1 : 0,
                                    opacity: tool.offsetNum === 0 ? 1 : 0,
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="absolute w-3 h-3 bg-orange-500 rounded-sm"
                            />
                        </motion.button>

                        <span className="text-xs pl-1 font-medium text-black tracking-wider">Fill</span>
                    </div>
                    <input
                        className={`rounded w-36 text-center focus:outline-none text-xs py-1 border px-2 transition-all duration-300 focus:border-l-2 focus:border-l-orange-500 ${
                            tool.offsetNum === 0 ? "opacity-90 cursor-not-allowed border-white" : ""
                        }`}
                        type="number"
                        min={0}
                        step={0.1}
                        value={tool.offsetNum}
                        disabled={tool.offsetNum === 0}
                    />
                </div>

                <div className="flex justify-between items-center gap-2">
                    <label className="text-xs text-black">Feed Rate <span className="text-gray-800 font-normal text-[10px]">(mm/s)</span></label>
                    <input 
                        value={tool.feedRate}
                        className="rounded w-36 text-center focus:outline-none text-xs py-1 border px-2 focus:border-l-2 focus:border-l-orange-500" 
                        type="number"
                        min={0}
                        step={0.1}
                    />
                </div>

                <div className="flex justify-between items-center gap-2">
                    <label className="text-xs text-black">Plunge Rate <span className="text-gray-800 font-normal text-[10px]">(mm/s)</span></label>
                    <input 
                        value={tool.plungeRate}
                        className="rounded w-36 text-center focus:outline-none text-xs py-1 border px-2 focus:border-l-2 focus:border-l-orange-500" 
                        type="number"
                        min={0}
                        step={0.1}
                    />
                </div>

                <div className="flex justify-between items-center gap-2">
                    <label className="text-xs text-black">RPM <span className="text-gray-800 font-normal text-[10px]">(mm/s)</span></label>
                    <input 
                        value={tool.rpm}
                        className="rounded w-36 text-center focus:outline-none text-xs py-1 border px-2 focus:border-l-2 focus:border-l-orange-500" 
                        type="number"
                        min={0}
                        step={0.1}
                    />
                </div>
            </div>
        </>
    )
}

export default ToolSettings;

ToolSettings.propTypes = {
    tool: PropTypes.shape({
        name: PropTypes.string,
        toolNo: PropTypes.number,
        type: PropTypes.string,
        angle: PropTypes.number,
        diameter: PropTypes.number,
        feedRate: PropTypes.number,
        plungeRate: PropTypes.number,
        rpm: PropTypes.number,
        maxCutDepth: PropTypes.number,
        offsetStepOver: PropTypes.number,
        offsetNum: PropTypes.number
    }),
    index: PropTypes.number.isRequired,
    setToolLib: PropTypes.func
}