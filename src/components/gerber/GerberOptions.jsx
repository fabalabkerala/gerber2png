import ImageIcon from "../icons/ImageIcon"
import { useEffect, useState } from "react";
import Select from "../ui/Select";
import ThreeWaySlider from "../ui/ThreeWaySlider";
import { motion } from "motion/react";
import { useGerberLayer, useGerberSettings, useGerberView } from "../context/GerberContext";
import { cn } from "../../utils/cn";
import { updateToolWidth } from "../../utils/svgConverter/svgUtils";

const SelectOptions = [
    { id: "generate-all", label: "Generate All" },
    { id: "generate-for-carvera", label: "Generate for Carvera" },
    { id: "top-trace", label: "Top Trace" },
    { id: "top-drill", label: "Top Drill" },
    { id: "top-outline", label: "Top Cut" },
    { id: "bottom-trace", label: "Bottom Trace" },
    { id: "bottom-drill", label: "Bottom Drill" },
    { id: "bottom-outline", label: "Bottom Cut" },
    { id: "custom", label: "Custom" },
];
  
const toolOption = [
    { id: "0.8", label: "0.8", correction: 3 },
    { id: "1", label: "1", correction: 3.9 },
    { id: "2", label: "2", correction: 7.6 },
    { id: "0.0", label: "0.0", correction: 0 },
];

const copperModeOptions = [
    { id: "top", label: "Top" },
    { id: "bottom", label: "Bottom" },
    { id: "double", label: "2-Side" },
];

const GerberOptions = () => {
    const { topstack, bottomstack, fullLayers } = useGerberLayer();
    const { setBoardMode, handlePngConversion } = useGerberView();
    const { boardSide, stackConfig, changeSelect, setChangeSelect, doubleSide, applyQuickSetup } = useGerberSettings()

    const [ toolSelected, setToolSelected ] = useState(toolOption[0].id);

    useEffect(() => {
        if (boardSide === 'top' && changeSelect.startsWith('bottom')) {
            setChangeSelect('generate-all');
        }

        if (boardSide === 'bottom' && changeSelect.startsWith('top')) {
            setChangeSelect('generate-all');
        }
    }, [boardSide, changeSelect, setChangeSelect]);

    const handleToolWidth = (width) => {
        const svgs = [
            { stack: topstack, name:'toplayer' }, 
            { stack: bottomstack, name:'bottomlayer' }, 
            { stack: { id: 'fullstack', svg: fullLayers }, name:'fullstack' }
        ];
        const selectedToolOption = toolOption.find((option) => option.id === width);
        const newSvgDimensions = updateToolWidth(svgs, width, stackConfig, selectedToolOption?.correction ?? 0);
    }

    const isOptionDisabled = (value) => {
        if (boardSide === 'top') return value.startsWith('bottom');
        if (boardSide === 'bottom') return value.startsWith('top');
        return false;
    };

    const handleBoardModeChange = (mode) => {
        handleToolWidth(mode === 'double' ? toolSelected : '0.0')
        setBoardMode(mode);
        setChangeSelect('generate-all');
    };

    return (
        <>
            <div className="bg-white border border-slate-200 rounded-xl transition-colors dark:bg-slate-900 dark:border-slate-800">
                {/* Heading */}
                <div className="px-4 py-2 bg-slate-50 rounded-t-xl dark:bg-slate-950/80">
                    <p className="font-medium text-sm ps-0.5 text-gray-700 dark:text-slate-100">Options</p>
                </div>

                <div className="p-4 py-2">
                    <p className="text-xs text-gray-700 pt-3 pb-1 px-1 dark:text-slate-300">Quick Setup</p>

                    <div className="flex gap-3 text-sm">
                        <Select 
                            options={SelectOptions} 
                            setSelected={setChangeSelect} 
                            selected={changeSelect} 
                            onSelect={(value) => {
                                if (isOptionDisabled(value)) return;
                                if (value === 'generate-all' || value === 'custom' || value === 'generate-for-carvera') {
                                    setChangeSelect(value)
                                } else {
                                    applyQuickSetup(value)
                                }
                            }} 
                            getOptionClass={(value) => isOptionDisabled(value) ? "opacity-40 cursor-not-allowed pointer-events-none" : "" }

                        />

                        <motion.button 
                            className="flex justify-center items-center gap-1 bg-gradient-to-r from-[#D3346E] to-[#B81D50] hover:from-[#B81D50] hover:to-[#D3346E] pr-2 ps-1 rounded-lg shadow transition-all duration-300 ease-in-out" 
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handlePngConversion(changeSelect, boardSide)}
                        >
                            <ImageIcon width={20} height={18} strokeWidth={6} stroke={"white"} />
                            <p className="text-white text-xs text-nowrap">Generate PNG</p>
                        </motion.button>
                    </div>
                </div>

                {/* <div className="w-full h-px bg-zinc-100 my-3" /> */}

                <div className="p-3">
                    <div className="flex flex-col gap-4 text-sm bg-slate-50 p-3 py-3 rounded-lg dark:bg-slate-950/60">
                        <div className="flex flex-col gap-1">
                            <p className="text-xs leading-3 dark:text-slate-200 font-semibold">Copper Mode</p>
                            <p className="text-[10px] mb-1 leading-3 text-slate-500 dark:text-slate-400">
                                Choose the copper side to focus on.
                            </p>
                            <ThreeWaySlider
                                options={copperModeOptions}
                                valueSync={boardSide}
                                onChange={handleBoardModeChange}
                                size="compact"
                            />
                        </div>

                        <div 
                            className={cn(
                                "flex items-center gap-2",
                                doubleSide ? 'opacity-1' : ' opacity-40 pointer-events-none'
                            )}
                        >
                            <p className="text-xs text-nowrap dark:text-slate-200 w-64">Tool Width</p>
                            <Select options={toolOption} setSelected={setToolSelected} selected={toolSelected} onSelect={handleToolWidth} />
                        </div>
                    </div>  
                </div>
            </div>
        </>
    )
}
export default GerberOptions;
