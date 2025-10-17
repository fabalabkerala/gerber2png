import PropTypes from "prop-types";
import { ArrowDownTrayIcon, TrashIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";

function PngCard({ name, blobUrl, handleDelete }) {
    return (
        <div className="flex flex-col my-2 max-h-80 shadow rounded bg-white overflow-hidden">
            <div className="flex items-center justify-center bg-white h-60 py-3">
                <img
                    src={blobUrl}
                    alt={name}
                    className="max-h-full max-w-full object-contain p-1 border-dashed border border-gray-400"
                />
            </div>
    
            <div className="flex items-center justify-between px-2 py-2 bg-[#F5F5F5] rounded-b">
                <p className="text-xs pl-1 truncate">{name}</p>
                <div className="flex items-center gap-1">
                    <motion.a 
                        whileTap={{ scale: 0.95 }} 
                        href={blobUrl} 
                        download={name} 
                        className="bg-white py-1 px-2 rounded shadow-sm border "
                    >
                        <ArrowDownTrayIcon width={20} height={16} stroke="#e57345" />
                    </motion.a>
                    <motion.button 
                        whileTap={{ scale: 0.97, background: '#ef4444' }}
                        onClick={handleDelete} 
                        className="py-1 px-2 rounded shadow-sm border bg-red-400 border-red-300"
                    >
                        <TrashIcon width={20} height={16} strokeWidth={2} stroke="white" />
                    </motion.button>
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