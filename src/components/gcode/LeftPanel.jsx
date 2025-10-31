import { useState } from "react";
import JobDirectory from "../ui/JobDirectory";

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
    const [openJobs, setOpenJobs] = useState(jobsData.map((j) => j.name));
    const [ selectedFile, setSelectedFile ] = useState(null)

    const toggleJob = (name) => {
        setOpenJobs((prev) =>
        prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
        );
    };

    const handleSelectFile = (file) => {
        setSelectedFile(file.id);
    };

    return (
        <div className="flex flex-col h-full bg-white pb-3 rounded-md shadow overflow-y-auto">
            {/* Heading */}
            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-t-md border-b">
                <p className="font-medium text-sm text-gray-700">All Jobs</p>
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
        </div>
    );
};

export default LeftPanel;
