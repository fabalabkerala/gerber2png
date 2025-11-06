import { useState } from "react";
import NormalBitIcon from "../../icons/NormalBitIcon";
import VBitIcon from "../../icons/VBitIcon";
import Select from "../../ui/Select";
import { AnimatePresence, motion } from "motion/react";
import PropTypes from "prop-types";
import { cn } from "../../../utils/cn";


const options = [
    { id: 'vbit', label: 'V-Bit' }, 
    { id: 'normal', label: 'Normal Bit' }, 
];

const angles = [
    { id: 30, label: '30deg' }, 
    { id: 60, label: '60deg' }, 
    { id: 90, label: '90deg' }, 
];

const ToolSettings = ({ tool, index, setToolLib }) => {
    const [ , setToolType ] = useState(tool.type || 'Choose Bit');
    const [ toolAngle, setToolAngle ] = useState(tool.angle || 'Choose Angle');

    const handleInput = (field, value) => {
        setToolLib(prev => 
            prev.map((t, i) => 
                i === index ? { ...t, [field]: value === "" ? "" : parseFloat(value) } : t
        ));
    };

    const cleanInput = (field, defaultVal = 0, min =0) => {
        setToolLib(prev => 
            prev.map((t, i) => {
                if (i !== index) return t;
                const current = t[field];
                const num = parseFloat(current);
                const val = isNaN(num) ? defaultVal : Math.max(num, min)

                return { ...t, [field]: val }
            })
        )
    }
    
    return (
        <>
            <div className="flex-1 h-44 flex items-center justify-center">
                { tool.type === 'normal' ? (
                    <NormalBitIcon className={'w-auto h-28'} />
                ):(
                    <VBitIcon className={'w-auto h-28'} angle={tool.angle} />
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
                            handleInput('name', value)
                        }}
                        onBlur={(e) => {
                            if (e.target.value === '') {
                                handleInput('name', 'unknown');
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
                                    setToolLib(prev => 
                                        prev.map((t, id) => id === index ? { ...t, type: value } : t)
                                    )
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
                    { tool.type === 'vbit' && (
                        <motion.div 
                            className="flex items-center justify-between gap-2" 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className="flex items-center justify-between flex-1">
                                <p className="text-xs w-24 text-black text-nowrap font-medium">Angle</p>
                                <div className="bg-white w-36">
                                    <Select 
                                        options={angles} 
                                        selected={toolAngle} 
                                        setSelected={setToolAngle} 
                                        onSelect={(value) => {
                                            setToolLib(prev => 
                                                prev.map((t, id) => id === index ? { ...t, angle: value } : t)
                                            )
                                        }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Input field={'diameter'} label={'Diameter'} value={tool.diameter} defaultVal={1} min={0.2} handleInput={handleInput} cleanInput={cleanInput}  />
                <Input field={'maxCutDepth'} label={'Maximum Cut Depth'} value={tool.maxCutDepth} defaultVal={1} min={0.2} handleInput={handleInput} cleanInput={cleanInput}  />
                <Input field={'offsetStepOver'} label={'Offset Step Over'} value={tool.offsetStepOver} defaultVal={1} min={0.2} handleInput={handleInput} cleanInput={cleanInput}  />

                <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center">
                        <label className="text-xs text-black">Offset Number</label>
                        <motion.button
                            onClick={() => handleInput("offsetNum", tool.offsetNum === 0 ? 1 : 0)}
                            whileTap={{ scale: 0.9 }}
                            className="relative w-4 h-4 ml-4 flex items-center justify-center border rounded bg-white border-gray-400 hover:border-orange-500 transition-colors"
                            >
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: tool.offsetNum === 0 ? 1 : 0,
                                    opacity: tool.offsetNum === 0 ? 1 : 0,
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="absolute w-3 h-3 bg-orange-500 rounded-sm"
                            />
                        </motion.button>

                        <span className="text-xs pl-1 font-medium text-black tracking-wider">Fill</span>
                    </div>
                    <input
                        className={cn(
                            "rounded w-36 text-center focus:outline-none text-xs py-1 border px-2 transition-all duration-300 focus:border-l-2 focus:border-l-orange-500",
                            tool.offsetNum === 0 ? "opacity-90 cursor-not-allowed border-white" : ""
                        )}
                        type="number"
                        min={1}
                        step={0.1}
                        value={tool.offsetNum}
                        onChange={e => handleInput('offsetNum', e.target.value)}
                        onBlur={() => cleanInput('offsetNum', 1, 1)}
                        disabled={tool.offsetNum === 0}
                    />
                </div>

                <Input field={'feedRate'} label={'Feed Rate'} value={tool.feedRate} defaultVal={1} min={0.2} handleInput={handleInput} cleanInput={cleanInput} suffix={'mm/s'}  />
                <Input field={'plungeRate'} label={'Plunge Rate'} value={tool.plungeRate} defaultVal={1} min={0.2} handleInput={handleInput} cleanInput={cleanInput} suffix={'mm/s'}  />
                <Input field={'rpm'} label={'RPM'} value={tool.rpm} defaultVal={600} min={100} handleInput={handleInput} cleanInput={cleanInput} suffix={'mm/s'}  />
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

// eslint-disable-next-line react/prop-types
const Input = ({ field, label, value, suffix, defaultVal, min, handleInput, cleanInput }) => (
    <motion.div 
        className="flex justify-between items-center gap-2"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
    >
        <label className="text-xs text-black">
            {label} {suffix && <span className="text-gray-500 text-[10px]">{`(${suffix})`}</span>}
        </label>
        <input
            value={value}
            type="number"
            min={min}
            step={0.1}
            onChange={e => handleInput(field, e.target.value)}
            onBlur={() => cleanInput(field, defaultVal, min)}
            className="rounded w-36 text-center text-xs py-1 border px-2 focus:outline-none focus:border-l-2 focus:border-l-orange-500"
        />
    </motion.div>
);
