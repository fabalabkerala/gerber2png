import PropTypes from "prop-types";
import { AnimatePresence, motion } from "motion/react";
import ModalHeader from "../ui/ModalHeader";
import { DocumentCheckIcon } from "@heroicons/react/24/outline";

const PngPreviewModal = ({ png, onClose }) => {
    if (!png) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-5 backdrop-blur-[2px] dark:bg-slate-950/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    initial={{ scale: 0.97, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.97, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    className="flex max-h-[92vh] w-[980px] max-w-[96vw] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
                    onClick={(event) => event.stopPropagation()}
                >
                    <ModalHeader title="Preview" onClose={onClose} />

                    <div className="flex-1 overflow-auto bg-slate-100 p-4 dark:bg-slate-950 flex flex-col items-center justify-center">
                        <img
                            src={png.url}
                            alt={png.name}
                            className="max-h-[76vh] w-auto max-w-full object-contain border border-dashed border-slate-300 hover:border-slate-400 transition dark:border-slate-600 dark:hover:border-slate-500"
                        />
                        <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800 flex gap-1 items-center mt-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                            <DocumentCheckIcon width={16} className="text-green-500 shrink-0" />
                            <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                                {png.name}_1000dpi.png
                            </p>
                        </div>
                    </div>

                    
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

PngPreviewModal.propTypes = {
    png: PropTypes.shape({
        url: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    }),
    onClose: PropTypes.func.isRequired,
};

export default PngPreviewModal;
