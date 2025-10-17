import { motion, AnimatePresence } from "motion/react";
import { EllipsisVerticalIcon, FolderArrowDownIcon, Square3Stack3DIcon, TrashIcon } from "@heroicons/react/24/outline";
import PngCard from "../ui/PngCard";
import { useEffect, useRef, useState } from "react";

const OutputPanel = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false)
            }
        };

        window.addEventListener('mousedown', handleClickOutside)

        return () => window.removeEventListener('mousedown', handleClickOutside)
    }, []);

    return (
        <>
            <div className="flex flex-col gap-1 rounded">
                <div className="flex justify-end items-center gap-2 rounded-tl-md rounded-tr-md">
                    <motion.button
                        className="flex justify-center items-center gap-2 bg-[#e57345] px-3 py-2 rounded shadow" 
                        whileTap={{ scale: 0.98 }}
                    >
                        <p className="font-medium text-sm ps-0.5 text-white tracking-wider">Download All</p>
                        <FolderArrowDownIcon width={18} height={18} strokeWidth={2} stroke="white" />
                    </motion.button>

                    <div ref={menuRef} className="relative">
                        <motion.button
                            onClick={() => setMenuOpen(prev => !prev)}
                            className="flex justify-center items-center gap-1 bg-white px-1.5 py-2 rounded shadow" 
                            whileTap={{ scale: 0.96 }}
                        >
                            <EllipsisVerticalIcon width={20} height={20} strokeWidth={3} fill="black" stroke="black" />
                        </motion.button>

                        <AnimatePresence>
                            { menuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-md z-10"
                                >
                                    <button
                                        onClick={() => console.log("Rename")}
                                        className="flex items-center gap-1 w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-b font-medium text-gray-700"
                                    >
                                        <Square3Stack3DIcon width={16} height={16} className="text-[#e57345]"/> Bulk Action
                                    </button>
                                    <button
                                        onClick={() => console.log("Delete")}
                                        className="flex items-center gap-1 w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-500 hover:text-red-600"
                                    >
                                        <TrashIcon width={16} height={16}/> Delete All
                                    </button>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>

                <div className="">
                    <PngCard
                        key={1}
                        blobUrl={'https://images.unsplash.com/photo-1594868116409-083f2a48b14c?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8NHx8fGVufDB8fHx8fA%3D%3D'}
                        name={'top_trace_1000dpi.png'}
                    />
                </div>

            </div>
        </>
    )
}
export default OutputPanel;

