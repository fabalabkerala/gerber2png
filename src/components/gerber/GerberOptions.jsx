import ImageIcon from "../icons/ImageIcon"
import { useState } from "react";
import Select from "../ui/Select";
import SwitchToggle from "../ui/Switch";
import { motion } from "motion/react";
import { useGerber } from "../context/GerberContext";
import generateOuterSvg from "../../utils/svgConverter/generateOuter";

import { cn } from "../../utils/cn";

const options = ["Custom", "Top Trace", "Top Drill", "Top Cut"];
const toolOption = ["0.8", "0.0"];

const GerberOptions = () => {
    const { 
        topstack, 
        bottomstack, 
        fullLayers, 
        handleToggleCick, 
        isToggled, 
        stackConfig, 
    } = useGerber();

    const [selected, setSelected] = useState(options[0]);
    const [ toolSelected, setToolSelected ] = useState(toolOption[0]);
    const [ doubleSide, setDoubleSide ] = useState(false);
 
    // -----------------------
    // Double Side PCB Options
    // -----------------------
    const handleDoubleSide = (enabled) => {
        setDoubleSide(!doubleSide);

        if (!enabled && !isToggled['commonlayer']['outlayer'] || enabled && isToggled['commonlayer']['outlayer']) {
            handleToggleCick('commonlayer', 'outlayer');
        }

        topstack.svg.querySelector('#toplayerouter').style.display = doubleSide ? 'none' : 'block';
        bottomstack.svg.querySelector('#bottomlayerouter').style.display = doubleSide ? 'none' : 'block';
        fullLayers.querySelector('#fullstackouter').style.display = doubleSide ? 'none' : 'block';
    }

    const handleToolWidth = (width) => {
        const toolwidth = parseFloat(width);
        const svgs = [
            {
                stack: topstack, 
                name:'toplayer'
            }, 
            {
                stack: bottomstack, 
                name:'bottomlayer'
            }, 
            {
                stack: { 
                    id: 'fullstack', 
                    svg: fullLayers 
                }, 
                name:'fullstack'
            }
        ];

        svgs.forEach(({stack, name}) => {
            const outer = stack.svg.querySelector(`#${name}outer`);
            const main = stack.svg.querySelector(`#${name}MainG`);

            const newOuter = generateOuterSvg(stackConfig.width, stackConfig.height, toolwidth, { viewboxX: stackConfig.viewbox.viewboxX, viewboxY: stackConfig.viewbox.viewboxY }, name === 'bottomlayer');
            newOuter.svg.setAttribute('id', `${name}outer-svg`);
            stack.svg.setAttribute('width', `${newOuter.width}mm`);
            stack.svg.setAttribute('height', `${newOuter.height}mm`);
            outer.querySelector('svg').replaceWith(newOuter.svg);
            main.setAttribute('transform', `translate(${ toolwidth === 0 ? 0 : 3 } ${ toolwidth === 0 ? 0 : 3 })`);
        })
    }

    return (
        <>
            <div className="flex flex-col bg-white pb-3 rounded shadow">
                {/* Heading */}
                <div className="flex justify-between items-center bg-[#F5F5F5] px-2 py-1 rounded-tl-md rounded-tr-md relative">
                    <p className="font-medium text-sm ps-0.5 text-gray-700">Options</p>
                    <button className="flex items-center h-fit gap-1 bg-white px-1 rounded-sm">
                        <p className="text-xs py-[1px] ps-1">Preview</p>
                        <ImageIcon width={14} height={14} strokeWidth={4} stroke={"black"} />
                    </button>

                </div>

                <div className="px-2">

                    <p className="text-xs font-medium text-gray-700 pt-3 pb-2 px-1">Quick Setup</p>

                    <div className="flex gap-1 text-sm">
                        <Select options={options} setSelected={setSelected} selected={selected} />

                        <motion.button className="flex justify-center items-center gap-1 bg-[#EF4444] pr-2 ps-1 rounded bord" whileTap={{ scale: 0.96 }}>
                            <ImageIcon width={20} height={20} strokeWidth={8} stroke={"white"} />
                            <p className="text-white text-xs font-medium text-nowrap">Generate PNG</p>
                        </motion.button>
                    </div>
                    
                </div>

                <div className="w-full h-px bg-zinc-100 my-3" />

                <div className="px-3">
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-medium">Double Side PCB</p>
                            <SwitchToggle onChange={handleDoubleSide} enabled={doubleSide} />
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
