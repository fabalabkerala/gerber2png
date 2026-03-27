import PropTypes from "prop-types";
import {
  ArrowDownTrayIcon,
  DocumentCheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { motion } from "motion/react";

function PngCard({ name, blobUrl, handleDelete }) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden"
        >
            <div className="relative flex items-center justify-center bg-slate-50 h-[140px] p-3">
                <img
                    src={blobUrl}
                    alt={name}
                    className="max-h-full object-contain border border-dashed border-slate-300 hover:border-slate-400 transition"
                />
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/60 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-2">
                        <motion.a
                            whileTap={{ scale: 0.9 }}
                            href={blobUrl}
                            download={name}
                            className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-100 transition cursor-pointer"
                        >
                            <ArrowDownTrayIcon width={18} />
                        </motion.a>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleDelete}
                            className="p-2 rounded-xl bg-white border border-red-200 text-red-500 hover:bg-red-50 transition cursor-pointer"
                        >
                            <TrashIcon width={18} />
                        </motion.button>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2">
                <DocumentCheckIcon width={16} className="text-green-500 shrink-0" />
                <p className="text-xs text-gray-600 truncate">{name}</p>
            </div>
        </motion.div>
    );
}

PngCard.propTypes = {
  name: PropTypes.string.isRequired,
  blobUrl: PropTypes.string.isRequired,
  handleDelete: PropTypes.func.isRequired,
};

export default PngCard;