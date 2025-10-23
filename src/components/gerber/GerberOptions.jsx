import ImageIcon from "../icons/ImageIcon"
import { useState } from "react";
import Select from "../ui/Select";
import SwitchToggle from "../ui/Switch";
import { motion } from "motion/react";
import { useGerber } from "../context/GerberContext";
import generateOuterSvg from "../../utils/svgConverter/generateOuter";
import { cn } from "../../utils/cn";
import setUpConfig from "../../utils/svgConverter/quickSetup";
import svg2png from "../../utils/svgConverter/svg2png";
import { changeDpiBlob } from "changedpi";
import handleColorChange from "../../utils/svgConverter/svgColorChange";

const SelectOptions = [
    { id: "generate-all", label: "Generate All" },
    { id: "generate-for-carvera", label: "Generate for Carvera" },
    { id: "top-trace", label: "Top Trace" },
    { id: "top-drill", label: "Top Drill" },
    { id: "top-cut", label: "Top Cut" },
    { id: "bottom-trace", label: "Bottom Trace" },
    { id: "bottom-cut", label: "Bottom Cut" },
    { id: "custom", label: "Custom" },
];
  
const toolOption = [
    {id: "0.8", label: "0.8"},
    {id: "0.0", label: "0.0"},
];

const GerberOptions = () => {
    const { 
        mainSvg,
        setMainSvg,
        topstack, 
        bottomstack, 
        fullLayers, 
        handleToggleCick, 
        isToggled, 
        stackConfig, 
        layerType,
        setLayerType,
        pngUrls, 
        setPngUrls, 
        canvasBg, 
        setCanvasBg, 
        setIsToggled,
        setLoader,
        doubleSide, 
        setDoubleSide,
        changeSelect,
        setChangeSelect
    } = useGerber();

    // const [ selected, setSelected ] = useState('custom');
    const [ toolSelected, setToolSelected ] = useState(toolOption[0].id);
 
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


    // -----------------------
    // PNG Generation Function
    // -----------------------
    const handleSvg = (svg, option, setup, machine = 'general') => {
        console.log('machine : :: ",', machine)
        const [, gerberSvg] = svg.querySelectorAll('svg');

        gerberSvg.querySelectorAll('g').forEach(g => {
            
            if (g.hasAttribute('id')) {
                const id = g.getAttribute('id');
                g.style.display = id.includes(setup.layerid) ? 'block' : id.includes(setup.stack.id) ? 'none' : id.includes('drillMask') ? 'none' : '';

                if (option === 'top-cut' && machine === 'carvera') {
                    g.style.display = id.includes('drill') ? 'block' : g.style.display;
                }

            }
        })

        const clipPath = gerberSvg.querySelector('clipPath');
        if (clipPath) clipPath.style.display = setup.layerid === 'outline' ? 'block' : 'none';

        const outerG = svg.querySelector(`#${ setup.stack === topstack ? 'toplayer': 'bottomlayer' }outer`);
        outerG.style.display = option === 'top-cut' ? doubleSide ? 'block' : 'none' : 'none';
    }

    const generatePNG = async (targetSvg, twoSide, name, canvasBg, layertype) => {
        return new Promise((resolve, reject) => {
            const [outerSvg, gerberSvg] = targetSvg.querySelectorAll('svg');
            const svg = twoSide ? targetSvg : gerberSvg;

            const drillPath = gerberSvg.querySelector('#drillMask path');
            drillPath.setAttribute('fill', layertype === 'bw' ? '#ffffff' : '#000000');
            outerSvg.setAttribute('style', `opacity: ${ twoSide ? 1 : 0}; fill:${ canvasBg === 'black' ? '#ffffff' : '#000000' }`);

            const svgString = new XMLSerializer().serializeToString(svg);
            const width = parseFloat(svg.getAttribute('width'));
            const height = parseFloat(svg.getAttribute('height'));

            svg2png(svgString, width, height, canvasBg).then(canvas => {
                canvas.setAttribute('style', 'width: 100%; height: 100%;');
                canvas.toBlob(pngBlob => {
                    changeDpiBlob(pngBlob, 1000).then((changeBlob) => {
                        const finalBlob = new Blob([changeBlob], { type: 'image/png' });
                        const blobUrl = (window.URL || window.webkitURL || window).createObjectURL(finalBlob);

                        resolve({ name: name, url: blobUrl });
                    })
                }, 'image/png');
            }).catch(err => { 
                console.error('Error converting svg to png :', err)
                reject(err);
            });     
            
        })
        
    }

    const handlePngConversion = async () => {
        // console.log('quicksetup :', selected);
        setLoader(true)
        if (changeSelect === 'generate-all' || changeSelect === 'generate-for-carvera') {
            const newUrls = []
            for (const option in setUpConfig(topstack, bottomstack)) {
                const setup = setUpConfig(topstack, bottomstack)[option];

                if (!doubleSide && setup.stack !== topstack) continue;
                if (changeSelect === 'generate-for-carvera' && option === 'top-drill') continue;

                const svg = setup.stack.svg.cloneNode(true);
                handleSvg(svg, option, setup, changeSelect === "generate-for-carvera" ? 'carvera' : 'general');
                handleColorChange({ color: setup.color, id: topstack.id, svgs:[svg] });
                console.log('Side : ', svg, setup)
                const newUrl = await generatePNG(svg, doubleSide, setup.id, setup.canvas, setup.color);
                // console.log( 'newURLS : ',{ name: newUrl.name, url: newUrl.url })
                newUrls.push({ name: newUrl.name, url: newUrl.url });
            }

            // console.log('newUrls', newUrls)
            setPngUrls([...pngUrls, ...newUrls]);
            setLoader(false);
            return
        }

        const targetSvg = mainSvg.svg === fullLayers ? topstack.svg.cloneNode(true) : mainSvg.svg.cloneNode(true); 
        // console.log('TargetSVG : ', targetSvg)
        const blob = await generatePNG(targetSvg, doubleSide, mainSvg.id, canvasBg, layerType);
        // console.log( 'newURLS : ',{ name: blob.name, url: blob.url })
        setPngUrls([...pngUrls, { name: blob.name, url: blob.url }]);
        setLoader(false);
    }

    // -----------
    // Quick Setup
    // -----------
    const handleQuickSetup = (option) => {
        const setupConfig = setUpConfig(topstack, bottomstack)
        const setup = setupConfig[option];
        const toggleButtons = setupConfig[option].toggleButtons;

        setIsToggled(prevObject => {
            let updatedState = { ...prevObject };

            // Update the state of the selected button
            updatedState = {
                ...updatedState,
                [setup.side]: {
                    ...updatedState[setup.side],
                    [setup.button]: false,
                }
            }

            // Update the state of the buttons to be toggled
            toggleButtons.forEach(button => {
                // console.log('button to hide : ', button)
                updatedState = {
                    ...updatedState,
                    [button.side]: {
                        ...updatedState[button.side],
                        [button.button]: true,
                    }
                }
            })

            return updatedState;
        });
        
        setCanvasBg(setup.canvas);
        setMainSvg({id: setup.id, svg: setup.stack.svg })
        setLayerType(setup.color);


        setTimeout(() => {
            handleSvg(setup.stack.svg, option, setup);
            handleColorChange({ color: setup.color, id: topstack.id, svgs: [topstack.svg, bottomstack.svg] }); 
        }, 300);  
    }

    return (
        <>
            <div className="flex flex-col bg-white pb-3 rounded shadow">
                {/* Heading */}
                <div className="flex justify-between items-center bg-[#F5F5F5] px-2 py-1 rounded-tl-md rounded-tr-md relative">
                    <p className="font-medium text-sm ps-0.5 text-gray-700">Options</p>
                </div>

                <div className="px-2">

                    <p className="text-xs font-medium text-gray-700 pt-3 pb-2 px-1">Quick Setup</p>

                    <div className="flex gap-1 text-sm">
                        <Select 
                            options={SelectOptions} 
                            setSelected={setChangeSelect} 
                            selected={changeSelect} 
                            onSelect={(value) => {
                                if (!doubleSide && value.startsWith("bottom")) return; // disable click
                                if (value === 'generate-all' || value === 'custom' || value === 'generate-for-carvera') {
                                    setChangeSelect(value)
                                } else {
                                    handleQuickSetup(value);
                                }
                            }} 
                            getOptionClass={(value) => !doubleSide && value.startsWith("bottom") ? "opacity-40 cursor-not-allowed pointer-events-none" : "" }

                        />

                        <motion.button 
                            className="flex justify-center items-center gap-1 bg-[#EF4444] pr-2 ps-1 rounded bord" 
                            whileTap={{ scale: 0.96 }}
                            onClick={handlePngConversion}
                        >
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
