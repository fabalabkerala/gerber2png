import { useEffect, useMemo, useState } from "react";
import JobDirectory from "../ui/JobDirectory";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import Setup from "./setup/Setup";
import { cn } from "../../utils/cn";
import { useApp } from "../context/AppContext";
import { useGcode } from "../context/GCodeContext";

const LeftPanel = () => {
    const { setupCompleted, pngFiles } = useApp();
    const { currentPngFile, setCurrentPngFile } = useGcode();
    const [ showSetup, setShowSetup ] = useState(false);

    const jobDir = useMemo(() => {
        const topJobs = pngFiles
            .filter(p => p.directory === "toplayer")
            .map((p, i) => ({ 
                ...p,
                name: `${p.job} - Top`, 
                id: `top_${p.job}_${i}`, 
            }));

        const bottomJobs = pngFiles
            .filter(p => p.directory === "bottomlayer")
            .map((p, i) => ({ 
                ...p,
                name: `${p.job} - Bottom`, 
                id: `bottom_${p.job}_${i}`, 
            }));

        const unknownJobs = pngFiles
            .filter(p => !['toplayer', 'bottomlayer'].includes(p.directory))
            .map((p, i) => ({ 
                ...p,
                name: `${p.job} - Unknown`, 
                id: `unknown_${p.job}_${i}`, 
            }));

        return [
            { name: "Top Layer", files: topJobs },
            { name: "Bottom Layer", files: bottomJobs },
            { name: "Unknown", files: unknownJobs },
        ]
    }, [pngFiles]);

    const [ openJobs, setOpenJobs ] = useState(jobDir.map((j) => j.name));

    const toggleJob = (name) => {
        setOpenJobs((prev) =>
        prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
        );
    };

    const handleSelectFile = (file) => {
        setCurrentPngFile(file)
    };

    useEffect(() => {
        if (!setupCompleted) setShowSetup(true)
    }, [setupCompleted])

    useEffect(() => {
        return () => setCurrentPngFile(null)
    }, [setCurrentPngFile])

    return (
        <div className="flex flex-col h-full bg-white pb-3 rounded-md shadow overflow-y-auto transition-colors dark:bg-slate-900 dark:shadow-none dark:border dark:border-slate-800">
            <div className="flex items-center justify-between bg-gray-100 pl-3 pr-1 py-1 rounded-t-md border-b dark:bg-slate-950/80 dark:border-slate-800">
                <p className="font-medium text-sm text-gray-700 dark:text-slate-100">All Jobs</p>
                <motion.button
                    className={cn(
                        "flex text-xs gap-1 py-1 pl-1 pr-1 rounded transition-all duration-300 group",
                        showSetup ? 'bg-white text-orange-600 dark:bg-slate-900 dark:text-orange-300' : 'hover:bg-white hover:text-orange-600 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-orange-300'
                    )}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowSetup(true)}
                >
                    Setup
                    <Cog6ToothIcon className="w-4 h-4 g" />
                </motion.button>
            </div>

            <div className="flex flex-col mt-2 space-y-2 px-2">
                { jobDir.map((job, id) => {
                    if (job.files.length > 0) {
                        return (
                            <JobDirectory 
                                key={id}
                                job={job}
                                isOpen={openJobs.includes(job.name)}
                                onToggle={toggleJob}
                                selectedFile={currentPngFile?.id || null}
                                onSelectFile={handleSelectFile}
                            />
                        )
                    }
                })}
            </div>

            <Setup showSetup={showSetup}  setShowSetup={setShowSetup} />
        </div>
    );
};

export default LeftPanel;
