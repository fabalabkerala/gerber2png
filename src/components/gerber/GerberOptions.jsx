import ImageIcon from "../icons/ImageIcon"
import { useState } from "react";
import Select from "../ui/Select";
import SwitchToggle from "../ui/Switch";

const options = ["Custom", "Top Trace", "Top Drill", "Top Cut"];
const toolOption = ["0.8", "0.7", "0.5"];

const GerberOptions = () => {
    const [selected, setSelected] = useState(options[0]);
    return (
        <>
            <div className="flex flex-col bg-white pb-3 rounded">
                {/* Heading */}
                <div className="flex justify-between items-center bg-[#F5F5F5] px-2 py-1 rounded-tl-md rounded-tr-md">
                    <p className="font-medium text-md ps-0.5">Options</p>
                    <button className="flex items-center h-fit gap-1 bg-white px-1 rounded-sm">
                        <p className="text-xs py-0.5 ps-1">Preview</p>
                        <ImageIcon width={14} height={14} strokeWidth={4} stroke={"black"} />
                    </button>
                </div>

                <div className="px-2">

                    <p className="text-xs font-medium text-gray-700 pt-3 pb-2 px-1">Quick Setup</p>

                    <div className="flex gap-1 text-sm">
                        <Select options={options} setSelected={setSelected} selected={selected} />

                        <button className="flex justify-center items-center gap-1 bg-[#EF4444] pr-2 ps-1 py-1 rounded">
                            <ImageIcon width={20} height={20} strokeWidth={8} stroke={"white"} />
                            <p className="text-white text-xs font-medium text-nowrap">Generate PNG</p>
                        </button>
                    </div>
                    
                </div>

                <div className="w-full h-px bg-zinc-100 my-3" />

                <div className="px-3">
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-medium">Double Side PCB</p>
                            <SwitchToggle />
                        </div>

                        <div className="flex items-center gap-2 flex-1">
                            <p className="text-xs text-nowrap">Tool Width</p>
                            <Select options={toolOption} setSelected={setSelected} selected={selected} />
                        </div>
                    </div>  
                </div>
            </div>
        </>
    )
}
export default GerberOptions;
