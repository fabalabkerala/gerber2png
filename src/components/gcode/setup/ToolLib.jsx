import { useApp } from "../../context/AppContext"
import PCB from "./PCB";
import { useState } from "react";
import Select from "../../ui/Select";
import PropTypes from "prop-types";
import VBitIcon from "../../icons/VBitIcon";
import NormalBitIcon from "../../icons/NormalBitIcon";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { cn } from "../../../utils/cn";

const ToolLibrary = () => {
    const { pcbConf, setPCBConf, toolLib } = useApp();
    const [ selectedTool , setSelectedTool ] = useState(null)

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
                                    "flex gap-2 items-center border-l  px-2 py-2.5 transition-all hover:bg-zinc-100 cursor-pointer rounded",
                                    selectedTool === tool ? 'bg-sky-100 hover:bg-sky-100' : ''
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
                <div className="flex-1 p-3">
                    { selectedTool ? (
                        <>
                            <div className="flex-1 h-44 flex items-center justify-center">
                                { selectedTool.type === 'normal' ? (
                                    <NormalBitIcon className={'w-auto h-28'} />
                                ):(
                                    <VBitIcon className={'w-auto h-28'} />
                                )}
                            </div>
                            <div className=" bg-zinc-50 flex-1 p-4  flex flex-col gap-3 rounded ">
                                <InputField 
                                    name={'length'} 
                                    label={'Length'} 
                                    value={pcbConf.length.value}
                                    maxValue={pcbConf.length.maxValue} 
                                    handleInput={handleInput}
                                />
                                <InputField 
                                    name={'width'} 
                                    label={'Width'} 
                                    value={pcbConf.width.value} 
                                    maxValue={pcbConf.width.maxValue} 
                                    handleInput={handleInput}
                                />
                                <InputField 
                                    name={'thickness'} 
                                    label={'Thickness'} 
                                    value={pcbConf.thickness.value} 
                                    maxValue={pcbConf.thickness.maxValue} 
                                    defaultValue={2} 
                                    handleInput={handleInput}
                                />
                                <InputField 
                                    name={'copperThickness'} 
                                    label={'Copper Thickness'} 
                                    value={pcbConf.copperThickness.value} 
                                    maxValue={pcbConf.copperThickness.maxValue}
                                    defaultValue={0.035} 
                                    handleInput={handleInput}
                                />
                                <InputField 
                                    name={'cutOffset'} 
                                    label={'Additional Cut Offset'} 
                                    value={pcbConf.cutOffset.value} 
                                    maxValue={pcbConf.cutOffset.maxValue} 
                                    defaultValue={0.3}
                                    handleInput={handleInput}
                                />
                            </div>
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