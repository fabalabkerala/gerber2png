import PropTypes from "prop-types";
import { ArrowDownTrayIcon, ArrowRightStartOnRectangleIcon, DocumentCheckIcon, TrashIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";

function PngCard({ name, blobUrl, handleDelete }) {
    return (
        <div className="flex flex-col my-2 shadow rounded-2xl overflow-hidden">
            <div className="flex items-center justify-center bg-white">
                <img
                    src={blobUrl}
                    alt={name}
                    className="max-w-full border  border-dashed hover:border-none object-contain border-gray-400"
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
                        whileTap={{ scale: 0.97, background: '#ef4444' }}
                        onClick={handleDelete} 
                        className="flex items-center gap-1 px-2.5 pr-1.5 py-1.5 text-xs font-medium text-white rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-sm transition"
                    >
                        <p>Export to Mods</p>
                        <ArrowRightStartOnRectangleIcon width={20} height={16} strokeWidth={2} stroke="white" />
                    </motion.button>
                    <div className="flex items-center gap-1">
                        <motion.a 
                            whileTap={{ scale: 0.95 }} 
                            href={blobUrl} 
                            download={name} 
                            className="bg-white py-1.5 px-2 rounded-lg border "
                        >
                            <ArrowDownTrayIcon width={20} height={16} stroke="#5545e5" />
                        </motion.a>
                        <motion.button 
                            whileTap={{ scale: 0.97, background: '#ef4444' }}
                            onClick={handleDelete} 
                            className="py-1.5 px-2 rounded-lg shadow-sm  bg-red-400  "
                        >
                            <TrashIcon width={20} height={16} strokeWidth={2} stroke="white" />
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