import PropTypes from "prop-types";
import { ArrowDownTrayIcon, ArrowRightEndOnRectangleIcon, ArrowRightStartOnRectangleIcon, DocumentCheckIcon, TrashIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";

function PngCard({ name, blobUrl, handleDelete, handleMods }) {
    return (
        <div className="flex flex-col my-2 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-center bg-white">
                <img
                    src={blobUrl}
                    alt={name}
                    className="max-h-[180px] object-contain border border-dashed hover:border-0 border-gray-300 my-4"
                />
            </div>
    
            <div className="flex flex-col items-center justify-between bg-[#ffffff] rounded-b-xl">
                <div className="flex items-end justify-start gap-1 bg-slate-50 border border-white py-1.5 px-2 rounded w-full">
                        <DocumentCheckIcon width={15} height={15} strokeWidth={2} stroke="green" />
                        <p className="text-xs text-gray-500 truncate">{name}</p>
                    </div>
                {/* <p className="text-xs py-1 px-2 bg-slate-50 w-full truncate">{name}</p> */}
                <div className="flex items-center justify-between gap-1 px-2 py-2 pt-2 w-full">
                    <motion.button 
                        whileTap={{ scale: 0.9  }}
                        onClick={handleMods} 
                        className="flex items-center gap-1 px-2.5 pr-1.5 py-1.5 text-xs cursor-pointer font-medium text-indigo-700 rounded-lg bg-slate-100 transition-all duration-500 hover:bg-slate-50 hover:text-indigo-500"
                    >
                        <p>Export to Mods</p>
                        <ArrowRightEndOnRectangleIcon width={20} height={16} strokeWidth={2}  />
                    </motion.button>
                    <div className="flex items-center gap-1">
                        <motion.a 
                            whileTap={{ scale: 0.9 }} 
                            href={blobUrl} 
                            download={name} 
                            className="hover:bg-gray-100 py-1.5 px-2 rounded-lg transition-all duration-400"
                        >
                            <ArrowDownTrayIcon width={20} height={17} strokeWidth={2}/>
                        </motion.a>
                        <motion.button 
                            whileTap={{ scale: 0.97, background: '#ef4444' }}
                            onClick={handleDelete} 
                            className="py-1.5 px-2 rounded-lg bg-red-50 text-red-500 hover:text-white hover:bg-red-400 transition-all duration-400"
                        >
                            <TrashIcon width={20} height={16} strokeWidth={2} />
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
}
  
PngCard.propTypes = {
    name: PropTypes.string.isRequired,
    blobUrl: PropTypes.string.isRequired,
    handleDelete: PropTypes.func.isRequired
}

export default PngCard;