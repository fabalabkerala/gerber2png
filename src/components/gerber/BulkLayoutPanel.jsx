import { CheckIcon, ChevronDownIcon, PhotoIcon, DocumentCheckIcon, DocumentDuplicateIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { cn } from "../../utils/cn";
import { AnimatePresence, motion } from "motion/react"
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useGerberView } from "../context/GerberContext";
import { getPngDimensions } from "../../utils/svgConverter/svg2png";
import Select from "../ui/Select";
import ModalHeader from "../ui/ModalHeader";
import ImageSelect from "../ui/ImageSelect";

const options = [
    { id: 'black', label: 'Black' }, 
    { id: 'white', label: 'White' }, 
];

const BulkLayoutPanel = ({showBulkModal, setShowBulkModal}) => {
    const { pngUrls } = useGerberView();
    const [ selectedPng, setSelectedPng ] = useState('Choose an Image');
    const [ layoutBg, setLayoutBg ] = useState('black');
    const [ config, setConfig ] = useState({
        row: 1,
        column: 1,
        spacing: 1,
        pcb: 1
    });
    const [ dimension, setDimension ] = useState({ width: null, height: null })

    useEffect(() => {
        if (!selectedPng.url) return;

        const getDimension = async () => {
            const dimension = await getPngDimensions(selectedPng.url);
            setDimension(dimension)
        }
        getDimension();

        // return () => setselectedPng('Choose an Image');
        
    }, [selectedPng]);

    const totalSlots = config.row * config.column;
    const [visibleSlots, setVisibleSlots] = useState(
        Array(totalSlots).fill(true)
    );


    const handleConfig = (name, value) => {
        let val;

        if (name === 'spacing') val = value > 5 ? 5 : value
        else val = value > 10 ? 10 : value
        
        setConfig(prev => ({ 
            ...prev, 
            [name]: value === "" ? "" : parseInt(val, 10) ,
            pcb: config.row * config.column
        }));
    }

    const toggleSlot = (index) => {
        setVisibleSlots((prev) =>
            prev.map((v, i) => (i === index ? !v : v))
        );
    };

    const handleClose = () => {
        setShowBulkModal(false);
        setSelectedPng('Choose an Image');
    }

    // Update visibleSlots if totalSlots changes
    useEffect(() => {
        setVisibleSlots((prev) => {
            const newSlots = Array(totalSlots).fill(true);
            for (let i = 0; i < Math.min(prev.length, newSlots.length); i++) {
                newSlots[i] = prev[i];
            }
            return newSlots;
        });
    }, [totalSlots]);

    return (
        <>
            <AnimatePresence>
                {showBulkModal && (
                    <motion.div
                        className="absolute inset-0 bg-black/10 bg-blend-color-burn flex justify-center items-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded shadow-xl flex flex-col"
                            initial={{ y: -30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -30, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ModalHeader title="Layout Setup" onClose={ handleClose } />
                            
                            <div className="flex gap-3 p-3">
                                <div className="flex flex-col gap-2 p-2">
                                    <ImageSelect
                                        options={pngUrls}
                                        selected={selectedPng}
                                        setSelected={setSelectedPng}
                                    />
                                    <div className="pb-5 pr-6 mt-2 w-64 h-48 flex flex-col justify-center items-center">
                                        { selectedPng.url ? (
                                            <div className="flex h-full w-full">
                                                <div className="relative h-full w-fit mx-auto">
                                                    <img src={selectedPng.url} alt="dsdfsd" className="h-full object-contain" />

                                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full h-px bg-zinc-300 my-3" />
                                                    <p className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white px-2 text-xs font-medium">
                                                        {dimension.width}
                                                        <span className="text-gray-500 font-normal"> mm</span>
                                                    </p>

                                                    <div className="absolute top-0 -right-6 w-px h-full bg-zinc-300 mx-3" />
                                                    <p className=" absolute top-1/2 -translate-y-1/2 -right-[48px] bg-white px-2 text-xs -rotate-90 origin-center font-medium">
                                                        {dimension.height}
                                                        <span className="text-gray-500 font-normal"> mm</span>
                                                    </p>
                                                </div>
                                            </div>
                                        ): (
                                            <>
                                                <PhotoIcon width={20} height={20} strokeWidth={2} stroke="gray" />
                                                <p className="text-xs font-medium">No Preview Available</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-zinc-100 flex-1 p-3 px-5 m-2 flex flex-col">
                                    <p className="border-b mb-3 font-medium text-sm">Number of PCBs <span className="text-xs text-gray-600 font-normal">(Rows X Columns)</span></p>
                                    <div className="flex gap-3">
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs w-20 text-black">Rows</label>
                                            <input 
                                                className="rounded w-36 focus:outline-none text-center text-xs py-1 border" 
                                                type="number"
                                                value={config.row}
                                                onInput={(e) => {
                                                    handleConfig('row', e.target.value);
                                                }} 
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs w-20 text-black">Columns</label>
                                            <input 
                                                className="rounded w-36 focus:outline-none text-center text-xs py-1 border" 
                                                type="number" 
                                                value={config.column}
                                                onInput={(e) => {
                                                    handleConfig('column', e.target.value);
                                                }} 
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-3">
                                        <div className="flex items-center gap-2 flex-1">
                                            <label className="text-xs w-20 text-black">Spacing <span className="text-gray-500 font-normal">(mm)</span></label>
                                            <input 
                                                className="rounded w-36 focus:outline-none text-center text-xs py-1 border" 
                                                type="number" 
                                                value={config.spacing}
                                                onInput={(e) => {
                                                    handleConfig('spacing', e.target.value);
                                                }} 
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 flex-1">
                                            <p className="text-xs w-20 text-black text-nowrap">Layout BG</p>
                                            <div className="bg-white w-36">
                                                <Select 
                                                    options={options} 
                                                    selected={layoutBg} 
                                                    setSelected={setLayoutBg} 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col items-end justify-end gap-3 h-fit w-fit ms-auto pb-2">
                                        { selectedPng.url &&
                                            <div className="flex items-end justify-center gap-1 bg-white border border-white py-1 px-1 rounded">
                                                <DocumentCheckIcon width={17} height={17} strokeWidth={2} stroke="green" />
                                                <p className="text-xs text-gray-500">layout_{config.row}_x_{config.column}_{selectedPng.name}.png</p>
                                            </div>
                                        }
                                        <div className={cn("flex gap-1", selectedPng.url ? "opacity-100 pointer-events-auto" : "opacity-60 pointer-events-none")}>
                                            <motion.button
                                                className="flex justify-center items-center gap-1 border bg-white rounded overflow-hidden" 
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setShowBulkModal(false)}
                                            >
                                                <div className="bg-gray-100 h-full flex items-center justify-center px-2 py-1.5 rounded-s border-2 border-white">
                                                    <DocumentDuplicateIcon width={12} height={12} strokeWidth={2} stroke="#e57345" />
                                                </div>
                                                <p className="text-xs text-[#e57345] tracking-wider px-2 py-1.5">Generate All</p>
                                            </motion.button>
                                            <motion.button
                                                className="flex justify-center items-center gap-1 bg-[#e57345] px-3 py-1.5 rounded shadow" 
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setShowBulkModal(false)}
                                            >
                                                
                                                <PhotoIcon width={18} height={18} strokeWidth={2} stroke="white" />
                                                <p className="font-medium text-xs ps-0.5 text-white tracking-wider">Download PNG</p>
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Your bulk options go here */}
                            <div className="flex flex-col gap-2 p-3 overflow-hidden">
                                <div className="relative border-t mx-2">
                                    <p className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-2 text-sm text-gray-700">Preview</p>
                                </div>

                                <div className="flex">
                                    <div className="max-w-[550px] h-[300px] flex-1 mx-auto pb-6 pr-5 my-5">
                                        { selectedPng.url ? (
                                            <div
                                                className="relative grid w-fit mx-auto my-auto border"
                                                style={{
                                                    gridTemplateColumns: `repeat(${config.column}, auto)`,
                                                    gridTemplateRows: `repeat(${config.row}, auto)`,
                                                    gap: `${config.spacing}px`,
                                                    background: layoutBg,
                                                    height: config.row >= config.column ? '100%' : 'auto', // 👈 key fix
                                                }}
                                            >
                                                { Array.from({ length: totalSlots }).map((_, i) => (
                                                    <div
                                                    key={i}
                                                    className="relative flex items-center justify-center cursor-pointer overflow-hidden group"
                                                    onClick={() => toggleSlot(i)}
                                                    >
                                                    { visibleSlots[i] ? (
                                                        <>
                                                            <img
                                                                src={selectedPng.url}
                                                                alt={`slot-${i}`}
                                                                className="max-h-full max-w-full"
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                                                <EyeIcon className="text-white w-3.5 h-3.5" />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <img
                                                                src={selectedPng.url}
                                                                alt={`slot-${i}`}
                                                                className="max-h-full max-w-full opacity-0"
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                                                <EyeSlashIcon className="text-white w-3.5 h-3.5" />
                                                            </div>
                                                            <span className="absolute bottom-1 right-1 text-[10px] text-gray-400">
                                                                #{i + 1}
                                                            </span>
                                                        </>
                                                    )}
                                                    </div>
                                                ))}

                                                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-full h-px bg-zinc-300 my-3" />
                                                <p className="text-nowrap absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-2 text-xs font-medium">
                                                    {dimension.width * config.column + config.spacing * (config.column - 1)}
                                                    <span className="text-gray-500 font-normal"> mm</span>
                                                </p>

                                                <div className="absolute top-0 -right-7 w-px h-full bg-zinc-300 mx-3" />
                                                    <p className="text-nowrap absolute top-1/2 -translate-y-1/2 -right-[50px] bg-white px-2 text-xs -rotate-90 origin-center font-medium">
                                                        {dimension.height * config.row + config.spacing * (config.row - 1)}
                                                        <span className="text-gray-500 font-normal"> mm</span>
                                                    </p>
                                            </div>
                                        ): (
                                            <div className="relative w-full h-full flex flex-col justify-center items-center">
                                                <PhotoIcon width={25} height={25} strokeWidth={2} stroke="gray" />
                                                <p>No Image Selected</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

BulkLayoutPanel.propTypes = {
    showBulkModal: PropTypes.bool,
    setShowBulkModal: PropTypes.func
}
export default BulkLayoutPanel;