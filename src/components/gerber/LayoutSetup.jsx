import { useEffect, useState } from "react";
import Select from "../ui/Select";
import PropTypes from "prop-types";
import { DocumentDuplicateIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import { cn } from "../../utils/cn";
import { generatePngLayout } from "../../utils/svgConverter/svg2png";
import { DocumentCheckIcon } from "@heroicons/react/24/outline";
import { useGerberView } from "../context/GerberContext";
import JSZip from "jszip";

const options = [
    { id: 'black', label: 'Black' }, 
    { id: 'white', label: 'White' }, 
];

const LayoutSetup = ({config, setConfig, selectedPng, visibleSlots, machine, generating, setGenerating}) => {
    const [ layoutBg, setLayoutBg ] = useState('black');
    const { pngUrls } = useGerberView();


    const handleInput = (name, value) => {
        let val;
        const wThreshold = Math.floor(machine.width / selectedPng.width);
        const hThreshold = Math.floor(machine.height / selectedPng.height);

        if (name === 'spacing') val = value > 5 ? 5 : value
        else if (name === 'row') val = value > wThreshold ? wThreshold : value > 20 ? 20 : value;
        else if (name === 'column') val = value > hThreshold ? hThreshold : value > 20 ? 20 : value;
        
        setConfig(prev => ({ 
            ...prev, 
            [name]: value === "" ? "" : parseInt(val, 10) ,
        }));
    }

    useEffect(() => setConfig(prev => ({ ...prev, pcb: prev.column * prev.row })), [config, setConfig])

    const handleGeneration =  async (url) => {
        try {
            setGenerating(true);
            const blobUrl = await generatePngLayout(
                url, 
                config.row, 
                config.column, 
                config.spacing, 
                layoutBg, 
                visibleSlots
            );

            const link = document.createElement("a");
            link.href = blobUrl.url;
            link.download = `layout_${config.row}x${config.column}_${selectedPng.name}.png`;
            document.body.appendChild(link);
            link.click()

            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl)

        } catch (error) {
            console.log('ERROR : Generating layout : ', error)
        } finally {
            setGenerating(false);
        }
    }

    const handleGenerateAll =  async () => {
        try {
            setGenerating(true);

            const zip = new JSZip();

            const blobPromises = pngUrls.map(async (png) => {
                const { blob } = await generatePngLayout(
                    png.url, 
                    config.row, 
                    config.column, 
                    config.spacing, 
                    layoutBg, 
                    visibleSlots
                );

                const filename = `layout_${png.name}_${config.row}x${config.column}.png`;

                zip.file(filename, blob);
            });

            await Promise.all(blobPromises);

            const zipBlob = await zip.generateAsync({ type: 'blob' });

            const url = window.URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `layout_g2p_files_${pngUrls.length}.zip`);
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.log('ERROR : Generating layout : ', error)
        } finally {
            setGenerating(false);
        }
    }



    return (
        <>
            <p className="px-3 font-medium text-xs mt-5">Number of PCBs <span className="text-[10px] text-gray-600 font-normal">(Rows X Columns)</span></p>
            <div className="bg-zinc-100 flex-1 p-4 px-4 mx-2 my-1 flex flex-col rounded">
                <div className="flex gap-4 justify-between">
                    <div className="flex items-center gap-2">
                        <label className="text-xs w-24 text-black">Rows</label>
                        <input 
                            className="rounded w-32 focus:outline-none text-center text-xs py-1 border" 
                            type="number"
                            value={config.row}
                            onInput={(e) => {
                                handleInput('row', e.target.value);
                            }} 
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs w-24 text-black">Columns</label>
                        <input 
                            className="rounded w-32 focus:outline-none text-center text-xs py-1 border" 
                            type="number" 
                            value={config.column}
                            onInput={(e) => {
                                handleInput('column', e.target.value);
                            }} 
                        />
                    </div>
                </div>
                <div className="flex gap-4 justify-between mt-3">
                    <div className="flex items-center gap-2 flex-1">
                        <label className="text-xs w-24 text-black">Spacing <span className="text-gray-500 font-normal">(mm)</span></label>
                        <input 
                            className="rounded w-32 focus:outline-none text-center text-xs py-1 border" 
                            type="number" 
                            value={config.spacing}
                            onInput={(e) => {
                                handleInput('spacing', e.target.value);
                            }} 
                        />
                    </div>
                    <div className="flex items-center justify-between gap-2 flex-1">
                        <p className="text-xs w-24 text-black text-nowrap">Layout BG</p>
                        <div className="bg-white w-32">
                            <Select 
                                options={options} 
                                selected={layoutBg} 
                                setSelected={setLayoutBg} 
                                onSelect={(value) => {
                                    setConfig(prev => ({ ...prev, background: value }))
                                }}
                            />
                        </div>
                    </div>
                </div>

                    
                <div className={cn("flex flex-1 gap-1 items-center mt-5", selectedPng.url ? "opacity-100 pointer-events-auto" : "opacity-60 pointer-events-none")}>
                    <div className={cn(
                        "flex items-end justify-center gap-1 bg-white border border-white py-1 px-1 rounded h-fit mr-auto ",
                        selectedPng.url ? "opacity-100" : "opacity-0"
                    )}>
                        <DocumentCheckIcon width={15} height={15} strokeWidth={2} stroke="green" />
                        <p className="text-[10px] text-gray-500 max-w-[140px] truncate">layout_{config.row}_x_{config.column}_{selectedPng.name}.png</p>
                    </div>
                    <motion.button
                        className="flex justify-center items-center gap-1 border bg-white rounded overflow-hidden" 
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGenerateAll}
                    >
                        <div className="bg-gray-100 h-full flex items-center justify-center px-2 py-1.5 rounded-s border-2 border-white">
                            <DocumentDuplicateIcon width={12} height={12} strokeWidth={2} stroke="#e57345" />
                        </div>
                        <p className="text-xs text-[#e57345] tracking-wider pr-3 py-1.5">Generate All</p>
                    </motion.button>
                    <motion.button
                        className="flex justify-center items-center gap-1 bg-[#e57345] px-3 py-1.5 rounded shadow" 
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleGeneration(selectedPng.url)}
                    >
                        
                        <PhotoIcon width={18} height={18} strokeWidth={2} stroke="white" />
                        <p className="font-medium text-xs ps-0.5 text-white tracking-wider">{ generating ? 'Generating..' : 'Download PNG' }</p>
                    </motion.button>
                </div>
            </div>
        </>
    )
}

LayoutSetup.propTypes = {
    config: PropTypes.shape({ 
        row: PropTypes.number.isRequired,
        column: PropTypes.number.isRequired,
        spacing: PropTypes.number.isRequired,
        pcb: PropTypes.number.isRequired,
    }),
    setConfig: PropTypes.func.isRequired,
    selectedPng: PropTypes.shape({ 
        name: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired
    }),
    machine: PropTypes.shape({ 
        machine: PropTypes.string.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired
    }),
    visibleSlots: PropTypes.array,
    autoLayout: PropTypes.func,
    generating: PropTypes.bool, 
    setGenerating:PropTypes.func
}

export default LayoutSetup