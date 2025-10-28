import { PhotoIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react"
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useGerberView } from "../context/GerberContext";
import ModalHeader from "../ui/ModalHeader";
import ImageSelect from "../ui/ImageSelect";
import ImageLayout from "../ui/ImageLayout";
import LayoutConfiguration from "./LayoutConfiguration";
import LayoutSetup from "./LayoutSetup";

const BulkLayoutPanel = ({showBulkModal, setShowBulkModal}) => {
    const { pngUrls } = useGerberView();
    const [ selectedPng, setSelectedPng ] = useState('Choose an Image');
    const [ layoutBg, setLayoutBg ] = useState('black');
    const [ config, setConfig ] = useState({
        row: 1,
        column: 1,
        spacing: 1,
        pcb: 1,
        background: 'black'
    });
    const [ machine, setMachine ] = useState({
        machine: null,
        width: 100,
        height: 100
    })

    const totalSlots = config.row * config.column;
    const [visibleSlots, setVisibleSlots] = useState(
        Array(totalSlots).fill(true)
    );

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

    useEffect(() => {
        if (selectedPng.url) {
            console.log('sected L : ', selectedPng)
            if (isNaN(selectedPng.height) || isNaN(selectedPng.width)) return;

            const maxCol = Math.floor((machine.width + config.spacing)  / (selectedPng.width + config.spacing));
            const maxRow = Math.floor((machine.height + config.spacing) / (selectedPng.height + config.spacing));

            setConfig(prev => ({
                ...prev,
                row: maxRow,
                column: maxCol,
                pcb: maxRow * maxCol
            }));
        }
    }, [config.spacing, machine, selectedPng])

    
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
                                        onSelect={(value) => {
                                            if (value.name.includes('drill')) {
                                                setLayoutBg('white')
                                            }
                                        }}
                                    />
                                    <div className="pb-5 pr-6 mt-2 w-64 h-48 flex flex-col justify-center items-center">
                                        { selectedPng.url ? (
                                            <div className="flex h-full w-full">
                                                <div className="relative h-full w-fit mx-auto">
                                                    <img src={selectedPng.url} alt="dsdfsd" className="h-full object-contain" />

                                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full h-px bg-zinc-300 my-3" />
                                                    <p className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white px-2 text-xs font-medium">
                                                        {/* {dimension.width} */}
                                                        {selectedPng.width}
                                                        <span className="text-gray-500 font-normal"> mm</span>
                                                    </p>

                                                    <div className="absolute top-0 -right-6 w-px h-full bg-zinc-300 mx-3" />
                                                    <p className=" absolute top-1/2 -translate-y-1/2 -right-[48px] bg-white px-2 text-xs -rotate-90 origin-center font-medium">
                                                        {/* {dimension.height} */}
                                                        {selectedPng.height}
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

                                <div>
                                    <LayoutConfiguration 
                                        machine={machine}
                                        setMachine={setMachine}
                                    />
                                    <LayoutSetup 
                                        config={config}
                                        setConfig={setConfig}
                                        selectedPng={selectedPng}
                                        machine={machine}
                                        visibleSlots={visibleSlots}
                                    />
                                </div>
                            </div>

                            {/* Your bulk options go here */}
                            <div className="flex flex-col gap-2 p-3 overflow-hidden">
                                <div className="relative border-t mx-2">
                                    <p className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-2 text-sm text-gray-700">Preview</p>
                                </div>

                                <div className="flex">
                                    { selectedPng.url ? (
                                        <ImageLayout 
                                            count={totalSlots}
                                            row={config.row}
                                            column={config.column}
                                            spacing={config.spacing}
                                            background={layoutBg}
                                            dimension={{ width: selectedPng.width, height: selectedPng.height }}
                                            selected={selectedPng}
                                            visibleSlots={visibleSlots}
                                            onToggleSlot={(id) => toggleSlot(id)}
                                        />
                                    ): (
                                        <div className="max-w-[550px] h-[300px] flex-1 mx-auto pb-6 pr-5 my-5">
                                            <div className="relative w-full h-full flex flex-col justify-center items-center">
                                                <PhotoIcon width={25} height={25} strokeWidth={2} stroke="gray" />
                                                <p>No Image Selected</p>
                                            </div>
                                        </div>
                                    )} 
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



import { MaxRectsPacker } from "maxrects-packer";

export const useSmartLayout = (bed, pcb, spacing) => {
  const packer = new MaxRectsPacker(bed.width, bed.height, spacing, {
    smart: true,
    pot: false,
    allowRotation: true,
  });
  const items = Array(200).fill().map((_, i) => ({
    width: pcb.width,
    height: pcb.height,
    id: `pcb_${i}`,
  }));
  packer.addArray(items);
  return packer.bins[0].rects;
};

