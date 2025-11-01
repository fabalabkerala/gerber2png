import { useState } from "react";
import { cn } from "../../utils/cn";
import { ViewfinderCircleIcon } from "@heroicons/react/24/outline";
import InitialSetup from "./Setup";

const MainPanel = () => {
    const [ showSetup, setShowSetup ] = useState(true);
    const [activeTab, setActiveTab] = useState("image");

    return (
        <>
            <div className="flex flex-col h-full bg-white rounded-md shadow overflow-hidden">
                {/* Tabs */}
                <div className="flex items-center bg-gray-100 border- text-sm">
                    <button
                        onClick={() => setActiveTab("image")}
                        className={cn(
                            "px-4 py-2 border-r transition-colors",
                            activeTab === "image"
                                ? "bg-white font-medium text-gray-800"
                                : "hover:bg-gray-200 text-gray-500"
                        )}
                    >
                        top_drill_1000dpi.png
                    </button>
                    <button
                        onClick={() => setActiveTab("gcode")}
                        className={cn(
                            "px-4 py-2 transition-colors flex items-center gap-1",
                            activeTab === "gcode"
                                ? "bg-white font-medium text-gray-800"
                                : "hover:bg-gray-200 text-gray-500"
                        )}
                    >
                        <ViewfinderCircleIcon 
                            className={cn(
                                "w-4 h-4",
                                activeTab === "gcode" ? "text-orange-500" : "text-gray-500"
                            )}
                        />
                        GCode Preview
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto bg-white flex justify-center items-center">
                    {activeTab === "image" ? (
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYyxRDrJKhWSGOwCDdHS5K_6EOY20t0fsUFg&s"
                            alt="PCB Preview"
                            className="max-w-full max-h-full object-contain"
                        />
                    ) : (
                        <div className="relative w-full h-full flex justify-center items-center">
                            {/* Replace this div with your GCode canvas component */}
                            <p className="text-gray-600 text-sm">GCode Preview goes here</p>
                        </div>
                    )}
                </div>
            </div>

            <InitialSetup showSetup={showSetup}  setShowSetup={setShowSetup} />
        </>
    );
};

export default MainPanel;
