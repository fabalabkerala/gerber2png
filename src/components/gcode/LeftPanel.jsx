import { useEffect, useState } from "react";
import JobDirectory from "../ui/JobDirectory";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import Setup from "./setup/Setup";
import { cn } from "../../utils/cn";
import { useApp } from "../context/AppContext";

const jobsData = [
    {
        name: "Top Layer",
        files: [
            { name: "Traces - Top", id: "v2-traces-top" },
            { name: "Drill - Top", id: "v2-drill-top" },
            { name: "Outline", id: "v2-outline" },
        ],
    },
    {
        name: "Bottom Layer",
        files: [
            { name: "Traces - Top", id: "v3-traces-top" },
            { name: "Drill - Top", id: "v3-drill-top" },
            { name: "Outline", id: "v3-outline" },
        ],
    },
];

const LeftPanel = () => {
    const { setupCompleted } = useApp();
    const [ openJobs, setOpenJobs ] = useState(jobsData.map((j) => j.name));
    const [ selectedFile, setSelectedFile ] = useState(null);
    const [ showSetup, setShowSetup ] = useState(false);

    const toggleJob = (name) => {
        setOpenJobs((prev) =>
        prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
        );
    };

    const handleSelectFile = (file) => {
        setSelectedFile(file.id);
    };

    useEffect(() => {
        if (!setupCompleted) setShowSetup(true)
    }, [setupCompleted])

    return (
        <div className="flex flex-col h-full bg-white pb-3 rounded-md shadow overflow-y-auto">
            {/* Heading */}
            <div className="flex items-center justify-between bg-gray-100 pl-3 pr-1 py-1 rounded-t-md border-b">
                <p className="font-medium text-sm text-gray-700">All Jobs</p>
                <motion.button
                    className={cn(
                        "flex text-xs gap-1 py-1 pl-1 pr-1 rounded transition-all duration-300 group",
                        showSetup ? 'bg-white text-orange-600' : 'hover:bg-white hover:text-orange-600'
                    )}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowSetup(true)}
                >
                    Setup
                    <Cog6ToothIcon className="w-4 h-4 g" />
                </motion.button>
            </div>

            {/* Job List */}
            <div className="flex flex-col mt-2 space-y-2 px-2">
                { jobsData.map((job, id) => (
                    <JobDirectory 
                        key={id}
                        job={job}
                        isOpen={openJobs.includes(job.name)}
                        onToggle={toggleJob}
                        selectedFile={selectedFile}
                        onSelectFile={handleSelectFile}
                    />
                ))}
            </div>

            <Setup showSetup={showSetup}  setShowSetup={setShowSetup} />
        </div>
    );
};

export default LeftPanel;
