import PropTypes from "prop-types";
import {
  ArrowDownTrayIcon,
  DocumentCheckIcon,
  RectangleGroupIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { motion } from "motion/react";

function PngCard({ name, blobUrl, handleDelete, handleEditTabs, canAddTabs, hasTabs }) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden transition-colors dark:border-slate-700 dark:bg-slate-900"
        >
            <div className="relative flex items-center justify-center bg-slate-50 h-[140px] p-3 dark:bg-slate-950/60">
                <img
                    src={blobUrl}
                    alt={name}
                    className="max-h-full object-contain border border-dashed border-slate-300 hover:border-slate-400 transition dark:border-slate-600 dark:hover:border-slate-500"
                />
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/60 transition flex items-center justify-center opacity-0 group-hover:opacity-100 dark:group-hover:bg-slate-950/60">
                    <div className="flex items-center gap-2">
                        {canAddTabs && (
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleEditTabs}
                                className={`flex items-center gap-1 rounded-xl border px-2 py-2 text-xs shadow-sm transition ${
                                    hasTabs
                                        ? "cursor-pointer border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20"
                                        : "cursor-pointer border-amber-200 bg-white text-amber-700 hover:bg-amber-50 dark:border-amber-500/30 dark:bg-slate-900 dark:text-amber-200 dark:hover:bg-amber-500/10"
                                }`}
                            >
                                <RectangleGroupIcon width={16} />
                                <span>{hasTabs ? "Edit Tabs" : "Tabs"}</span>
                            </motion.button>
                        )}

                        <motion.a
                            whileTap={{ scale: 0.9 }}
                            href={blobUrl}
                            download={name}
                            className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-100 transition cursor-pointer dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                            <ArrowDownTrayIcon width={18} />
                        </motion.a>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleDelete}
                            className="p-2 rounded-xl bg-white border border-red-200 text-red-500 hover:bg-red-50 transition cursor-pointer dark:bg-slate-900 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10"
                        >
                            <TrashIcon width={18} />
                        </motion.button>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2">
                <DocumentCheckIcon width={16} className="text-green-500 shrink-0" />
                <p className="text-xs text-gray-600 truncate dark:text-slate-300">{name}</p>
            </div>
        </motion.div>
    );
}

PngCard.propTypes = {
  name: PropTypes.string.isRequired,
  blobUrl: PropTypes.string.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleEditTabs: PropTypes.func,
  canAddTabs: PropTypes.bool,
  hasTabs: PropTypes.bool,
};

export default PngCard;
