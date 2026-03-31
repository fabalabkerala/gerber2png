import { useState } from "react"
import PropTypes from "prop-types";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import { cn } from "../../utils/cn";

function LayerToggle({ layerName, enabled: controlled, onChange, className }) {
    const [ internalEnabled, setInternalEnabled ] = useState(false);
    const isControlled = controlled !== undefined;
    const enabled = isControlled ? controlled : internalEnabled;

    const handleToggle = () => {
        if (isControlled && onChange) onChange(!enabled);
        else setInternalEnabled(!enabled);
    }
    return (
        <>
            <div className={cn("flex justify-between items-center border w-full h-fit rounded", className)}>
                <p className="text-xs px-2 py-1 text-gray-700 capitalize">{ layerName }</p>
                <motion.button 
                    className={cn(
                        "px-3 py-1.5 rounded-e ",
                        enabled ? "bg-zinc-100" : "bg-zinc-50 text-orange-400"
                    )}
                    whileTap={{ scale: 0.95 }}
                    onClick={ handleToggle }
                >
                    { enabled ?
                        <EyeIcon width={18} height={12} />
                        :
                        <EyeSlashIcon width={18} height={12} />
                    }
                </motion.button>
            </div>
        </>
    )
}

LayerToggle.propTypes = {
    layerName: PropTypes.string,
    enabled: PropTypes.bool,
    onChange: PropTypes.func,
    className: PropTypes.string
}

export default LayerToggle;