import { XMarkIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react"
import PropTypes from "prop-types";

const ModalHeader = ({ title, onClose }) => {
    return (
        
        <div className="flex justify-between items-center px-4 py-2 bg-slate-50 rounded-t-xl">
            <p className="font-medium text-sm px-2 text-gray-700">{ title }</p>
            { onClose &&
                <motion.button 
                    whileTap={{ scale: 0.97, background: '#ef4444' }}
                    onClick={ onClose }
                    className="py-1 px-2 rounded-tr shadow-sm border bg-red-400 border-red-300"
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