import { XMarkIcon, CheckIcon, ChevronDownIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { cn } from "../../utils/cn";
import { AnimatePresence, motion } from "motion/react"
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useGerberView } from "../context/GerberContext";
import { getPngDimensions } from "../../utils/svgConverter/svg2png";
import Select from "../ui/Select";

const options = [
    { id: 'black', label: 'Black' }, 
    { id: 'white', label: 'White' }, 
];

const BulkLayoutPanel = ({showBulkModal, setShowBulkModal}) => {
    const { pngUrls } = useGerberView();
    const [selected, setSelected] = useState('Choose an Image');
    const [ layoutBg, setLayoutBg ] = useState('black');
    const [ config, setConfig ] = useState({
        row: 1,
        column: 1,
        spacing: 1,
        pcb: 1
    });
    const [ dimension, setDimension ] = useState({ width: null, height: null })

    useEffect(() => {
        if (!selected.url) return;

        const getDimension = async () => {
            const dimension = await getPngDimensions(selected.url);
            setDimension(dimension)
        }
        getDimension();
        
    }, [selected]);

    const totalSlots = config.row * config.column;
    const [visibleSlots, setVisibleSlots] = useState(
        Array(totalSlots).fill(true)
    );


    const handleConfig = (name, value) => {
        let val;

        if (name === 'spacing') val = value > 5 ? 5 : value
        else val = value > 100 ? 100 : value
        
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
                            <div className="flex justify-between items-center bg-[#F5F5F5] rounded-tl-md rounded-tr-md">
                                <p className="font-medium text-sm px-2 text-gray-700">Layer Setup</p>
                                <motion.button 
                                    whileTap={{ scale: 0.97, background: '#ef4444' }}
                                    onClick={() => setShowBulkModal(false)}
                                    className="py-1 px-2 rounded-tr shadow-sm border bg-red-400 border-red-300"
                                >
                                    <XMarkIcon width={20} height={16} strokeWidth={2} stroke="white" />
                                </motion.button>
                            </div>
                            {/* <p className="text-gray-600 text-sm">Select an action to apply to all PNGs.</p> */}
                            <div className="flex gap-3 p-3">
                                <div className="flex flex-col gap-2 p-2">
                                    <Listbox value={selected} onChange={(png) => setSelected(png)}>
                                        <div className="relative w-full pr-2">
                                            <ListboxButton
                                                className={cn(                    
                                                    'relative block w-full rounded pl-2 text-left text-xs border py-1',
                                                    'focus:outline-none focus:ring-1 focus:ring-gray-400'
                                                )}
                                            >
                                                {pngUrls.find(png => png.name === selected.name)?.name || selected}
                                                <ChevronDownIcon
                                                    className="absolute top-1/2 -translate-y-1/2 right-0 size-4 w-fit px-2 h-full bg-[#F0F0F0]"
                                                    aria-hidden="true"
                                                />
                                            </ListboxButton>
                                            <ListboxOptions
                                                transition
                                                className={cn(
                                                    "absolute z-50 mt-1 max-h-60 w-full overflow-auto custom-scrollbar rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none",
                                                    // optionsPosition
                                                )} 
                                            >
                                                { pngUrls.map(({name, url}, index) => (
                                                    <ListboxOption
                                                        key={index}
                                                        value={{name, url}}
                                                        className={cn(
                                                            'cursor-pointer select-none px-2 py-1 text-sm flex items-center gap-2',
                                                            'data-[focus]:bg-gray-100 data-[focus]:text-black data-[selected]:bg-blue-50',
                                                            selected.name === name ? 'bg-zinc-100' : ''
                                                            // getOptionClass?.(id)
                                                        )}
                                                    >
                                                        <img className="w-12 object-contain rounded " src={url} />
                                                        <div className="text-xs/6 ">{name}</div>
                                                        <CheckIcon className={cn(
                                                            "size-2 fill-black visible",
                                                            selected.name === name ? 'visible' : 'invisible'
                                                        )} />
                                                    </ListboxOption>
                                                ))}
                                            </ListboxOptions>
                                        </div>
                                    </Listbox>
                                    <div className="pb-5 pr-6 mt-2">
                                        <div className="relative w-64">
                                            { selected.url ? (
                                                <img src={selected.url} alt="dsdfsd" />
                                            ): (
                                                <>
                                                    <div className="flex flex-col justify-center items-center h-48">
                                                        <PhotoIcon width={20} height={16} strokeWidth={2} stroke="black" />
                                                        <p>No Preview Available</p>
                                                        {/* <img src={selected.url} alt="" /> */}
                                                    </div>
                                                </>
                                            )}

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
                                </div>

                                <div className="bg-zinc-100 flex-1 p-3 px-5 m-2 ">
                                    <p className="border-b mb-3 font-medium">Layout <span className="text-xs text-gray-600">(Rows X Columns)</span></p>
                                    <div className="flex gap-3">
                                        <div className="flex gap-2">
                                            <label className="text-sm/6 w-20 font-medium text-black">Rows</label>
                                            <input 
                                                className="rounded w-36 focus:outline-none text-center" 
                                                type="number"
                                                value={config.row}
                                                onInput={(e) => {
                                                    handleConfig('row', e.target.value);
                                                }} 
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <label className="text-sm/6 w-20 font-medium text-black">Columns</label>
                                            <input 
                                                className="rounded w-36 focus:outline-none text-center" 
                                                type="number" 
                                                value={config.column}
                                                onInput={(e) => {
                                                    handleConfig('column', e.target.value);
                                                }} 
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-3">
                                        <div className="flex gap-2 flex-1">
                                            <label className="text-sm/6 w-20 font-medium text-black">Spacing</label>
                                            <input 
                                                className="rounded w-36 focus:outline-none text-center" 
                                                type="number" 
                                                value={config.spacing}
                                                onInput={(e) => {
                                                    handleConfig('spacing', e.target.value);
                                                }} 
                                            />
                                        </div>
                                        <div className="flex gap-2 flex-1">
                                            <p className="text-sm/6 w-20 font-medium text-black text-nowrap">Layout BG</p>
                                            <div className="bg-white w-36">
                                                <Select 
                                                    options={options} 
                                                    selected={layoutBg} 
                                                    setSelected={setLayoutBg} 
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Your bulk options go here */}
                            <div className="flex flex-col gap-2 p-3">
                                <div className="relative border-t mx-2">
                                    <p className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-2 text-sm text-gray-700">Preview</p>
                                </div>

                                <div className="max-w-[450px] h-[300px] mx-auto pb-6 pr-5 mt-5">
                                    <div
                                        className="relative grid w-fit max-w-[450px]"
                                        style={{
                                            gridTemplateColumns: `repeat(${config.column}, auto)`,
                                            gridTemplateRows: `repeat(${config.row}, auto)`,
                                            gap: `${config.spacing}px`,
                                            background: layoutBg,
                                            height: config.row >= config.column ? '100%' : 'auto', // 👈 key fix
                                        }}
                                    >
                                        {Array.from({ length: totalSlots }).map((_, i) => (
                                            <div
                                            key={i}
                                            className="relative flex items-center justify-center cursor-pointer overflow-hidden"
                                            onClick={() => toggleSlot(i)}
                                            >
                                            {visibleSlots[i] ? (
                                                <img
                                                src={selected.url}
                                                alt={`slot-${i}`}
                                                className="max-h-full max-w-full"
                                                />
                                            ) : (
                                                <img
                                                    src={selected.url}
                                                    alt={`slot-${i}`}
                                                    className="max-h-full max-w-full opacity-0"
                                                />
                                            )}

                                            <span className="absolute bottom-1 right-1 text-[10px] text-gray-400">
                                                #{i + 1}
                                            </span>
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
                                </div>

                            </div>

                            {/* <button
                                onClick={() => setShowBulkModal(false)}
                                className="text-sm text-gray-500 hover:text-gray-700 mt-3 self-end"
                            >
                                Close
                            </button> */}
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