// src/components/ui/DropZone.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { cn } from "../../utils/cn";
import PropTypes from "prop-types";
import handleZip from "../../utils/svgConverter/jsZip";

export default function  FileDropZone({ onFilesSelect, accept = "*", multiple = false }) {
    const [isDragging, setIsDragging] = useState(false);
    const [fileNames, setFileNames] = useState([]);

    const handleFiles = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        let selectedFiles = [];

        const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
        if (!files?.length) return;

        if (files.length === 1 && files[0].name.endsWith('.zip')) {
            const extractedFiles = await handleZip(files[0], { gerberOnly: true });
            selectedFiles = extractedFiles;

        } else {
            selectedFiles = Array.from(files);
        }
        
        setFileNames(selectedFiles.map((f) => f.name));
        onFilesSelect?.(selectedFiles);

        // Reset input so same file can be uploaded again
        if (e.target?.value !== undefined) e.target.value = "";
    };

    return (
        <motion.label
            htmlFor="dropzone-input"
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFiles}
            whileTap={{ scale: 0.998 }}
            className={cn(
                "group flex flex-col items-center justify-center h-full border border-dashed rounded-lg p-6 cursor-pointer transition-colors duration-300",
                isDragging ? "border-[#5545e5] bg-[#f1e4e023]" : "border-white bg-white hover:border hover:border-[#5545e5] hover:bg-gray-50"
            )} 
        >
            <CloudArrowUpIcon
                className={`w-12 h-12 mb-2 transition-colors ${
                isDragging ? "text-[#5545e5]" : "text-gray-500 group-hover:text-[#5545e5]"
                }`}
            />

            <p className="text-sm text-gray-600 text-center">
                <span className="font-medium text-[#5545e5]"> Click to Upload </span> <span>or Drag and Drop</span>
            </p>

            {fileNames.length > 0 && (
                <ul className="mt-2 text-xs text-gray-500">
                {fileNames.map((name, idx) => (
                    <li key={idx} className="truncate max-w-[250px]">
                    {name}
                    </li>
                ))}
                </ul>
            )}

            <input
                id="dropzone-input"
                type="file"
                accept={accept}
                multiple={multiple}
                className="hidden"
                onChange={handleFiles}
            />
        </motion.label>
    );
}

FileDropZone.propTypes = {
    onFilesSelect: PropTypes.func,
    accept: PropTypes.string,
    multiple: PropTypes.bool
}