import { AnimatePresence, motion } from "motion/react"
import PropTypes from "prop-types";

const BulkLayoutPanel = ({showBulkModal, setShowBulkModal}) => {
    return (
        <>
            <AnimatePresence>
                {showBulkModal && (
                    <motion.div
                        className="absolute inset-0 bg-black/10 bg-blend-color-burn flex justify-center items-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        // onClick={() => setShowBulkModal(false)}
                    >
                        <motion.div
                            className="bg-white rounded-xl shadow-xl p-6 w-[400px] flex flex-col gap-4"
                            initial={{ y: -30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -30, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-lg font-semibold text-gray-800">Bulk Action</h2>
                            <p className="text-gray-600 text-sm">Select an action to apply to all PNGs.</p>

                            {/* Your bulk options go here */}
                            <div className="flex flex-col gap-2">
                                <button className="bg-[#e57345] text-white rounded-md py-2 font-medium hover:bg-[#d46336]">
                                    Convert to Grayscale
                                </button>
                                <button className="bg-gray-100 text-gray-800 rounded-md py-2 font-medium hover:bg-gray-200">
                                    Resize All
                                </button>
                            </div>

                            <button
                                onClick={() => setShowBulkModal(false)}
                                className="text-sm text-gray-500 hover:text-gray-700 mt-3 self-end"
                            >
                                Close
                            </button>
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