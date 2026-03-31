import { AnimatePresence, motion } from "motion/react";
import PropTypes from "prop-types";
import {
    CheckCircleIcon,
    DocumentArrowUpIcon,
    LinkIcon,
    PlusCircleIcon,
} from "@heroicons/react/24/outline";
import ModalHeader from "../../ui/ModalHeader";
import { cn } from "../../../utils/cn";

const CustomProgramModal = ({
    isOpen,
    onClose,
    customName,
    setCustomName,
    customUrl,
    setCustomUrl,
    customPrograms,
    customProgramHelper,
    customUrlError,
    customProgramName,
    isCustomProgramReady,
    saveCustomProgram,
    removeCustomProgram,
    useCustomProgram,
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="flex max-h-[min(88vh,760px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <ModalHeader title="Add Custom Program" onClose={onClose} />
                        <div className="overflow-y-auto p-4 custom-scrollbar">
                            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                                        <PlusCircleIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Program Details</p>
                                        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                                            Add a hosted JSON program link and we will open it in Mods through the `?program=` entry point.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3 flex flex-col gap-2">
                                    <input
                                        type="text"
                                        value={customName}
                                        onChange={(event) => setCustomName(event.target.value)}
                                        placeholder="Program name"
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-slate-500"
                                    />

                                    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                                        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-950/70">
                                            <LinkIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                            <input
                                                type="url"
                                                value={customUrl}
                                                onChange={(event) => setCustomUrl(event.target.value)}
                                                placeholder="https://example.com/custom-program.json"
                                                className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
                                            />
                                        </div>
                                        <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                                            {customProgramHelper}
                                        </p>
                                        {customUrlError && (
                                            <p className="mt-2 text-[10px] font-medium text-red-600 dark:text-red-300">
                                                {customUrlError}
                                            </p>
                                        )}
                                    </div>

                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                                        <p className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                                            {isCustomProgramReady ? `Ready to save as ${customProgramName}.` : 'Complete the program details to enable saving.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        type="button"
                                        className={cn(
                                            "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow transition",
                                            isCustomProgramReady
                                                ? "bg-gradient-to-r from-[#D3346E] to-[#B81D50] hover:from-[#B81D50] hover:to-[#D3346E]"
                                                : "cursor-not-allowed bg-slate-300 text-white/80 shadow-none dark:bg-slate-700"
                                        )}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={!isCustomProgramReady}
                                        onClick={saveCustomProgram}
                                    >
                                        <CheckCircleIcon className="h-4 w-4" />
                                        Save & Use
                                    </motion.button>
                                </div>
                            </div>

                            {customPrograms.length > 0 && (
                                <div className="mt-4 rounded-xl border border-slate-200 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Saved Programs</p>
                                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                            {customPrograms.length} saved
                                        </span>
                                    </div>
                                    <div className="mt-3 flex flex-col gap-2">
                                        {customPrograms.map((program) => (
                                            <div
                                                key={program.id}
                                                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/60"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate text-xs font-medium text-slate-800 dark:text-slate-100">
                                                        {program.label}
                                                    </p>
                                                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                                                        {program.type === 'url'
                                                            ? <LinkIcon className="h-3 w-3 shrink-0" />
                                                            : <DocumentArrowUpIcon className="h-3 w-3 shrink-0" />}
                                                        <p className="truncate">
                                                            {program.type === 'url' ? program.value : 'Saved JSON program'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-rose-400/30 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                                                        onClick={() => useCustomProgram(program.id)}
                                                    >
                                                        Use
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-medium text-red-600 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/15"
                                                        onClick={() => removeCustomProgram(program.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

CustomProgramModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    customName: PropTypes.string.isRequired,
    setCustomName: PropTypes.func.isRequired,
    customUrl: PropTypes.string.isRequired,
    setCustomUrl: PropTypes.func.isRequired,
    customPrograms: PropTypes.array.isRequired,
    customProgramHelper: PropTypes.string.isRequired,
    customUrlError: PropTypes.string.isRequired,
    customProgramName: PropTypes.string.isRequired,
    isCustomProgramReady: PropTypes.bool.isRequired,
    saveCustomProgram: PropTypes.func.isRequired,
    removeCustomProgram: PropTypes.func.isRequired,
    useCustomProgram: PropTypes.func.isRequired,
};

export default CustomProgramModal;
