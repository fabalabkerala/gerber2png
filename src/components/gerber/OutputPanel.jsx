import { motion, AnimatePresence } from "motion/react";
import { FolderArrowDownIcon, Squares2X2Icon, TrashIcon } from "@heroicons/react/24/outline";
import PngCard from "../ui/PngCard";
import { 
    // useEffect, 
    useRef, 
    useState 
} from "react";
import JSZip from "jszip";
import ImageIcon from "../icons/ImageIcon";
import BulkLayoutPanel from "./multiLayout/Panel";
import { useApp } from "../context/AppContext";

const OutputPanel = () => {
    const { pngFiles, setPngFiles } = useApp()
    const [showBulkModal, setShowBulkModal] = useState(false);
    const menuRef = useRef(null);


    const handleDeleteAll = () => {
        pngFiles.forEach((item) => {
            URL.revokeObjectURL(item.url);
        });

        setPngFiles([]);
    }

    const downloadZip = () => {
        const zip = new JSZip();
        Promise.all(
            pngFiles.map((pngBlob, index) => {
                return new Promise((resolve) => {
                    fetch(pngBlob.url).then(response => response.blob()).then(blob => {
                        zip.file(`${pngBlob.name}_${index}.png`, blob);
                        resolve();
                    })
                })
            })
        ).then(() => {
            zip.generateAsync({ type : 'blob' }).then(zipBlob => {
                const url = window.URL.createObjectURL(zipBlob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `gerber_files_${pngFiles.length}.zip`);
                document.body.appendChild(link);
                link.click();
            }).catch(err => { console.log('Error Generating Zip File :', err) })
        })
    }

    return (
        <>
            <AnimatePresence>
            { pngFiles.length > 0 ? (
                <motion.div 
                    className="flex flex-col gap-1 rounded h-full" 
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.99 }}
                >
                    <div className="flex justify-between items-center gap-2 rounded-tl-md rounded-tr-md pb-3">
                        <motion.button
                            onClick={() => {
                                setShowBulkModal(true);
                            }}
                            className="flex flex-1 items-center gap-1 bg-white border border-[#4A34D3] rounded-lg shadow overflow-hidden" 
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="h-full bg-slate-100 px-1.5 py-1.5">
                                <Squares2X2Icon width={16} height={16} strokeWidth={1.5} stroke="#4A34D3" />
                            </div>
                            <p className="text-[0.72rem] ps-0.5 pe-0.5 text-[#4A34D3] tracking-wider text-nowrap">Multi Layout</p>
                        </motion.button>
                        <motion.button
                            className="flex justify-center items-center gap-2   bg-indigo-600 hover:bg-indigo-700 px-2 py-1.5 rounded-lg shadow" 
                            whileTap={{ scale: 0.98 }}
                            onClick={downloadZip}
                        >
                            <p className="text-[0.72rem] ps-0.5 text-white tracking-wider">Download All</p>
                            <FolderArrowDownIcon width={16} height={16} strokeWidth={1.5} stroke="white" />
                        </motion.button>

                        <div ref={menuRef} className="relative">
                            <motion.button
                                onClick={handleDeleteAll}
                                className="flex justify-center items-center gap-1 px-2 py-1.5 rounded-lg shadow bg-red-500 border border-red-300" 
                                whileTap={{ scale: 0.96 }}
                            >
                                <TrashIcon width={16} height={16} strokeWidth={2} stroke="white" />
                            </motion.button>
                        </div>
                        
                    </div>
                    <div className="relative border-t border-white my-2">
                        <p className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#f5f6f8] px-2 text-xs text-gray-700">Preview</p>
                    </div>

                    <div className="md:overflow-y-auto custom-scrollbar">
                        { pngFiles.slice().reverse().map((item, index) => (
                            <PngCard
                                key={index}
                                blobUrl={item.url}
                                name={ `${ item.name }_1000dpi.png` }
                                handleDelete={() => {
                                    setPngFiles((prevState) => {
                                        const newState = [...prevState];
                                        newState.splice(pngFiles.length - 1 - index, 1);
                                        return newState
                                    });
                                    URL.revokeObjectURL(item.url);
                                }}
                            />
                        ))}
                    </div>

                </motion.div>
            ):(
                <motion.div 
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.99 }} 
                    className="flex flex-col gap-1 h-full rounded justify-center items-center"
                >
                    <ImageIcon width={35} height={35} strokeWidth={6} stroke={"#374151"} />
                    <p className=" text-gray-700">No PNG images are generated</p>
                </motion.div>
            )}
            </AnimatePresence>

            <BulkLayoutPanel showBulkModal={showBulkModal} setShowBulkModal={setShowBulkModal} />
        </>
    )
}
export default OutputPanel;

