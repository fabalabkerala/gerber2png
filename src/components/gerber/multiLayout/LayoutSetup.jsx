import { useEffect, useState } from "react";
import Select from "../../ui/Select";
import PropTypes from "prop-types";
import { DocumentDuplicateIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import { cn } from "../../../utils/cn";
import { generatePngLayout, generateSingleOutlineLayout } from "../../../utils/svgConverter/svg2png";
import { DocumentCheckIcon } from "@heroicons/react/24/outline";
import JSZip from "jszip";
import { useApp } from "../../context/AppContext";
import { useGerberSettings } from "../../context/GerberContext";

const options = [
    { id: 'black', label: 'Black' }, 
    { id: 'white', label: 'White' }, 
];

const isTopOutlinePng = (png) =>
    png?.job === "outline" &&
    (
        png?.directory === "toplayer" ||
        png?.name === "outline_toplayer"
    );

const getLayoutDimensions = (png, config) => ({
    width: png.width * config.column + config.spacing * (config.column - 1),
    height: png.height * config.row + config.spacing * (config.row - 1),
});

const LayoutSetup = ({config, setConfig, selectedPng, visibleSlots, machine, singleOutlineEnabled, generating, setGenerating}) => {
    const [ layoutBg, setLayoutBg ] = useState('black');
    const { pngFiles } = useApp()
    const { doubleSide, outlineToolWidth } = useGerberSettings();


    const handleInput = (name, value) => {
        let val;
        const wThreshold = Math.floor(machine.width / selectedPng.width);
        const hThreshold = Math.floor(machine.height / selectedPng.height);

        if (name === 'spacing') val = value > 5 ? 5 : value < 0 ? 0 : value;
        else if (name === 'row') val = value > wThreshold ? wThreshold : value > 20 ? 20 : value < 1 ? 1 : value;
        else if (name === 'column') val = value > hThreshold ? hThreshold : value > 20 ? 20 : value < 1 ? 1 : value;
        
        setConfig(prev => ({ 
            ...prev, 
            [name]: value === "" ? "" : parseInt(val, 10) ,
        }));
    }

    // useEffect(() => setConfig(prev => ({ ...prev, pcb: prev.column * prev.row })), [config, setConfig])

    const buildLayoutBlob = async (png) => {
        const shouldGenerateSingleOutline =
            singleOutlineEnabled &&
            doubleSide &&
            isTopOutlinePng(png);

        if (shouldGenerateSingleOutline) {
            const layoutDimension = getLayoutDimensions(png, config);
            const toolWidth = Math.max(parseFloat(outlineToolWidth) || 0, 0);

            return generateSingleOutlineLayout(
                layoutDimension.width,
                layoutDimension.height,
                toolWidth,
                layoutBg
            );
        }

        const canvasBG = (png.job).includes('drill') ? 'white' : 'black';

        return generatePngLayout(
            png.url,
            config.row,
            config.column,
            config.spacing,
            png === selectedPng ? layoutBg : canvasBG,
            visibleSlots,
            singleOutlineEnabled,
            outlineToolWidth
        );
    }

    const handleGeneration =  async (png) => {
        try {
            setGenerating(true);
            const blobUrl = await buildLayoutBlob(png);

            const link = document.createElement("a");
            link.href = blobUrl.url;
            link.download = `layout_${config.row}x${config.column}_${png.name}.png`;
            document.body.appendChild(link);
            link.click()

            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl.url)

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

            const blobPromises = pngFiles.map(async (png) => {
                const { blob } = await buildLayoutBlob(png);

                const filename = `layout_${png.name}_${config.row}x${config.column}.png`;

                zip.file(filename, blob);
            });

            await Promise.all(blobPromises);

            const zipBlob = await zip.generateAsync({ type: 'blob' });

            const url = window.URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `layout_g2p_files_${pngFiles.length}.zip`);
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

    // eslint-disable-next-line react/prop-types
    useEffect(() => setLayoutBg(config.background), [config.background])

    return (
        <>
            <p className="px-3 font-medium text-xs mt-5 dark:text-slate-200">Number of PCBs <span className="text-[10px] text-gray-600 font-normal dark:text-slate-400">(Rows X Columns)</span></p>
            <div className="bg-slate-100 flex-1 p-4 px-4 mx-2 my-1 flex flex-col rounded-xl dark:bg-slate-950/60">
                <div className="flex gap-4 justify-between">
                    <div className="flex items-center gap-2">
                        <label className="text-xs w-24 text-black dark:text-slate-200">Rows</label>
                        <input 
                            className="rounded-lg w-32 focus:outline-none text-center text-xs py-1.5 border dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" 
                            type="number"
                            value={config.row}
                            onInput={(e) => {
                                handleInput('row', e.target.value);
                            }} 
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs w-24 text-black dark:text-slate-200">Columns</label>
                        <input 
                            className="rounded-lg w-32 focus:outline-none text-center text-xs py-1.5 border dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" 
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
                        <label className="text-xs w-24 text-black dark:text-slate-200">Spacing <span className="text-gray-500 font-normal dark:text-slate-400">(mm)</span></label>
                        <input 
                            className="rounded-lg w-32 focus:outline-none text-center text-xs py-1.5 border dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" 
                            type="number" 
                            value={config.spacing}
                            onInput={(e) => {
                                handleInput('spacing', e.target.value);
                            }} 
                        />
                    </div>
                    <div className="flex items-center justify-between gap-2 flex-1">
                        <p className="text-xs w-24 text-black text-nowrap dark:text-slate-200">Layout BG</p>
                        <div className="bg-transparent w-32">
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

                    
                <div className={cn("flex flex-1 gap-2 items-center mt-5", selectedPng.url ? "opacity-100 pointer-events-auto" : "opacity-60 pointer-events-none")}>
                    <div className={cn(
                        "flex items-end justify-center gap-1 bg-white border border-white py-1 px-1 rounded h-fit mr-auto dark:bg-slate-900 dark:border-slate-700",
                        selectedPng.url ? "opacity-100" : "opacity-0"
                    )}>
                        <DocumentCheckIcon width={15} height={15} strokeWidth={2} stroke="green" />
                        <p className="text-[10px] text-gray-500 max-w-[140px] truncate dark:text-slate-400">layout_{config.row}_x_{config.column}_{selectedPng.name}.png</p>
                    </div>
                    <motion.button
                        className="flex justify-center items-center gap-1 border bg-white rounded-lg overflow-hidden dark:bg-slate-900 dark:border-slate-700" 
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGenerateAll}
                    >
                        <div className="bg-gray-100 h-full flex items-center justify-center px-2 py-1.5 rounded-lg border-2 border-white dark:bg-slate-800 dark:border-slate-900">
                            <DocumentDuplicateIcon width={12} height={12} strokeWidth={2} stroke="#D3346E" />
                        </div>
                        <p className="text-xs text-[#D3346E] tracking-wider pr-3 py-1.5">Generate All</p>
                    </motion.button>
                    <motion.button
                        className="flex justify-center items-center gap-1 px-2 py-1.5 rounded-lg shadow bg-gradient-to-r from-[#D3346E] to-[#B81D50] hover:from-[#B81D50] hover:to-[#D3346E]" 
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleGeneration(selectedPng)}
                    >
                        <PhotoIcon width={18} height={18} strokeWidth={2} stroke="white" />
                        <p className="font-medium text-xs ps-0.5 text-white tracking-wider ">{ generating ? 'Generating..' : 'Download PNG' }</p>
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
