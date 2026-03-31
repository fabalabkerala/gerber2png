import PropTypes from "prop-types";
import { ArrowPathIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";

function PreviewTab({ blobUrl, handleRefresh, closeWindow }) {
    return (
        <div className="flex flex-col max-h-80 shadow rounded bg-white overflow-hidden">
            <div className="flex items-center justify-between px-2 py-2 bg-[#F5F5F5] rounded-b">
                <p className="text-xs font-medium pl-1 truncate">Preview</p>
                <div className="flex items-center gap-1">
                    <motion.button
                        whileTap={{ scale: 0.95 }} 
                        onClick={() => closeWindow(false)}
                        className="bg-white py-1 px-2 rounded shadow-sm border "
                    >
                        <ArrowPathIcon width={20} height={16} stroke="#e57345" />
                    </motion.button>
                    <motion.button 
                        whileTap={{ scale: 0.97, background: '#ef4444' }}
                        onClick={handleRefresh} 
                        className="py-1 px-2 rounded shadow-sm border bg-red-400 border-red-300"
                    >
                        <XCircleIcon width={20} height={16} strokeWidth={2} stroke="white" />
                    </motion.button>
                </div>
            </div>

            <div className="flex items-center justify-center bg-white h-60 py-3">
                <img
                    src={ blobUrl }
                    className="max-h-full max-w-full object-contain p-1 border-dashed border border-gray-400"
                />
            </div>
        </div>
    );
}
  
PreviewTab.propTypes = {
    blobUrl: PropTypes.string.isRequired,
    handleRefresh: PropTypes.func.isRequired,
    closeWindow: PropTypes.func.isRequired
}

export default PreviewTab;