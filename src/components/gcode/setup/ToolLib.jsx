import { useApp } from "../../context/AppContext"
import { useState } from "react";
import PropTypes from "prop-types";
import VBitIcon from "../../icons/VBitIcon";
import NormalBitIcon from "../../icons/NormalBitIcon";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { cn } from "../../../utils/cn";
import ToolSettings from "./ToolSettings";
import { Reorder } from "motion/react";


const ToolLibrary = () => {
    const { toolLib, setToolLib, machineConf } = useApp();
    const [ selectedToolID , setSelectedToolID ] = useState(null);


    return (
        <>
            <div className="flex gap-3 p-3 h-full">
                <div className="flex-1 flex flex-col px-2">
                    <p className="text-sm pb-1 border-b px-1 py-1 font-medium text-gray-700">Tool Library</p>
                    <div className=" bg-zinc-0 flex-1  mt-3 flex flex-col gap-1 rounded h-full overflow-y-auto custom-scrollbar">
                        <Reorder.Group
                            axis="y"
                            values={toolLib}
                            onReorder={setToolLib}
                            className=" bg-zinc-0 flex-1  mt-3 flex flex-col gap-1 rounded h-full overflow-y-auto custom-scrollbar"
                        >
                            { toolLib.map((tool, index) => (
                                tool.machine === machineConf.id && (
                                    <Reorder.Item 
                                        key={tool.id || tool.toolNo} 
                                        id={tool.id}
                                        value={tool}
                                        className={cn(
                                            "flex gap-2 items-center border-l-2 border  px-2 py-2.5 cursor-pointer rounded",
                                            selectedToolID === tool.id ? 'bg-slate-100 border-l-orange-500 hover:bg-zinc-100' : 'hover:bg-zinc-100'
                                        )}
                                        onClick={() => setSelectedToolID(tool.id)}
                                    >
                                        <p className="text-xs text-zinc-900 leading-none">{index + 1} </p>
                                        { tool.type === 'normal' ? (
                                            <NormalBitIcon className={'w-4 h-4 mr-2'}  />
                                        ):(
                                            <VBitIcon className={'w-4 h-4 mr-2'} angle={tool.angle} />
                                        )}
                                        <p className="text-[10px] px-2 py-1 bg-zinc-100 rounded leading-none border"> T-{tool.toolNo}</p>
                                        <p className="text-sm px-2 leading-none"> {tool.name}</p>
                                    </Reorder.Item>
                                )
                            ))}
                        </Reorder.Group>
                    </div>
                </div>
                <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                    { selectedToolID !== null ? (
                        <>
                            <ToolSettings tool={toolLib.find(tool => tool.id === selectedToolID)} toolID={selectedToolID} setToolLib={setToolLib} />
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