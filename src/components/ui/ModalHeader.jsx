import { XMarkIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react"
import PropTypes from "prop-types";

const ModalHeader = ({ title, onClose }) => {
    return (
        
        <div className="flex justify-between items-center bg-slate-50 rounded-t-xl dark:bg-slate-900 dark:border-b dark:border-slate-800">
            <p className="font-medium text-sm px-4 text-gray-700 dark:text-slate-100">{ title }</p>
            { onClose &&
                <motion.button 
                    whileTap={{ scale: 0.97, background: '#ef4444' }}
                    onClick={ onClose }
                    className="px-2 py-2 rounded-tr shadow-sm border bg-red-400 border-red-300 dark:border-red-500/30 dark:bg-red-500/80"
                >
                    <XMarkIcon width={20} height={16} strokeWidth={2} stroke="white" />
                </motion.button>
            }
        </div>
    )
}

ModalHeader.propTypes = {
    title: PropTypes.string.isRequired,
    onClose: PropTypes.func
}

export default ModalHeader;
