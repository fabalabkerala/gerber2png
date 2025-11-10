import { FolderIcon, DocumentIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";
import PropTypes from "prop-types";

const JobDirectory = ({job, isOpen,  onToggle, selectedFile, onSelectFile }) => {

    const isSelectedInThisJob = job.files.some((f) => f.id === selectedFile);

    return (
        <>
            <div className=" border-gray-100 rounded-md overflow-hidden">
                <button
                    onClick={() => onToggle(job.name)}
                    className={cn(
                        "flex items-center w-full gap-2 px-2 py-1.5 hover:bg-gray-50 transition",
                        isSelectedInThisJob ? 'bg-gray-50' : ''
                    )}
                >
                    <FolderIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                        {job.name}
                    </span>
                </button>

                <AnimatePresence initial={false}>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="ml-6 border-gray-200"
                        >
                            {job.files.map((file) => {
                                const isSelected = selectedFile === file.id;
                                return (
                                    <button
                                        key={file.id}
                                        onClick={() => onSelectFile(file)}
                                        className={cn(
                                            "flex items-center gap-2 px-2 py-1.5 w-full text-left rounded-md transition capitalize",
                                            isSelected ? "bg-orange-50 text-orange-500" : "hover:bg-gray-50 text-gray-700"
                                        )}
                                    >
                                        <DocumentIcon
                                            className={cn(
                                                "w-4 h-4",
                                                isSelected ? "text-orange-500" : "text-gray-500"
                                            )}
                                        />
                                        <span className="text-xs">{file.name}</span>
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </>
    )
}

JobDirectory.propTypes = {
    job: PropTypes.shape({
        name: PropTypes.string.isRequired,
        files: PropTypes.array.isRequired
    }),
    isOpen: PropTypes.bool,
    onToggle: PropTypes.func,
    selectedFile: PropTypes.shape({
        name: PropTypes.string,
        id: PropTypes.string
    }),
    onSelectFile: PropTypes.func
}

export default JobDirectory;