import ImageIcon from "../icons/ImageIcon"
import { useState } from "react";
import Select from "../ui/Select";
import SwitchToggle from "../ui/Switch";
import { motion } from "motion/react";
import { useGerberLayer, useGerberSettings, useGerberView } from "../context/GerberContext";
import { cn } from "../../utils/cn";
import { updateToolWidth } from "../../utils/svgConverter/svgUtils";

const SelectOptions = [
    { id: "generate-all", label: "Generate All" },
    { id: "generate-for-carvera", label: "Generate for Carvera" },
    { id: "top-trace", label: "Top Trace" },
    { id: "top-drill", label: "Top Drill" },
    { id: "top-cut", label: "Top Cut" },
    { id: "bottom-trace", label: "Bottom Trace" },
    { id: "bottom-drill", label: "Bottom Drill" },
    { id: "bottom-cut", label: "Bottom Cut" },
    { id: "custom", label: "Custom" },
];
  
const toolOption = [
    {id: "0.8", label: "0.8"},
    {id: "0.0", label: "0.0"},
];

const GerberOptions = () => {
    const { topstack, bottomstack, fullLayers } = useGerberLayer();
    const { toggleDoubleSide, handlePngConversion } = useGerberView();
    const { stackConfig, isToggled, changeSelect, setChangeSelect, doubleSide, applyQuickSetup } = useGerberSettings()

    const [ toolSelected, setToolSelected ] = useState(toolOption[0].id);
    const handleToolWidth = (width) => {
        const svgs = [
            { stack: topstack, name:'toplayer' }, 
            { stack: bottomstack, name:'bottomlayer' }, 
            { stack: { id: 'fullstack', svg: fullLayers }, name:'fullstack' }
        ];
        updateToolWidth(svgs, width, stackConfig);
    }

    return (
        <>
            <div className="flex flex-col bg-white pb-3 rounded shadow">
                {/* Heading */}
                <div className="flex justify-between items-center bg-[#F5F5F5] px-2 py-1 rounded-tl-md rounded-tr-md relative">
                    <p className="font-medium text-sm ps-0.5 text-gray-700">Options</p>
                </div>

                <div className="px-2">

                    <p className="text-xs text-gray-700 pt-3 pb-1 px-1">Quick Setup</p>

                    <div className="flex gap-3 text-sm">
                        <Select 
                            options={SelectOptions} 
                            setSelected={setChangeSelect} 
                            selected={changeSelect} 
                            onSelect={(value) => {
                                if (!doubleSide && value.startsWith("bottom")) return;
                                if (value === 'generate-all' || value === 'custom' || value === 'generate-for-carvera') {
                                    setChangeSelect(value)
                                } else {
                                    applyQuickSetup(value)
                                }
                            }} 
                            getOptionClass={(value) => !doubleSide && value.startsWith("bottom") ? "opacity-40 cursor-not-allowed pointer-events-none" : "" }

                        />

                        <motion.button 
                            className="flex justify-center items-center gap-1 bg-[#ef4444] pr-2 ps-1 rounded bord" 
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handlePngConversion(changeSelect, doubleSide)}
                        >
                            <ImageIcon width={20} height={20} strokeWidth={6} stroke={"white"} />
                            <p className="text-white text-xs text-nowrap">Generate PNG</p>
                        </motion.button>
                    </div>
                </div>

                <div className="w-full h-px bg-zinc-100 my-3" />

                <div className="px-3">
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center justify-between gap-1">
                            <p className="text-xs">Double Side PCB</p>
                            <SwitchToggle onChange={(enabled) => toggleDoubleSide(enabled, isToggled)} enabled={doubleSide} />
                        </div>

                        <div 
                            className={cn(
                                "flex items-center gap-2 flex-1",
                                doubleSide ? 'opacity-1' : ' opacity-40 pointer-events-none'
                            )}
                        >
                            <p className="text-xs text-nowrap">Tool Width</p>
                            <Select options={toolOption} setSelected={setToolSelected} selected={toolSelected} onSelect={handleToolWidth} />
                        </div>
                    </div>  
                </div>
            </div>
        </>
    )
}
export default GerberOptions;
