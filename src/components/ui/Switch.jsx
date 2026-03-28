import { useState } from "react";
import { cn } from "../../utils/cn";
import PropTypes from 'prop-types';

export default function SwitchToggle({ variant = "primary", enabled: controlled, onChange }) {
    const [internalEnabled, setInternalEnabled] = useState(false);
    const isControlled = controlled !== undefined;
    const enabled = isControlled ? controlled : internalEnabled

    const handleToggle = () => {
        if (isControlled && onChange) onChange(!enabled);
        else setInternalEnabled(!enabled);
    }

    const variants = {
        primary: {
            on: 'bg-[#EF4444]',
            off: 'bg-gray-300 dark:bg-slate-600'
        },
        secondary: {
            on: 'bg-green-500',
            off: 'bg-gray-300 dark:bg-slate-600'
        }
    }
    
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleToggle}
                className={cn(
                "w-8 h-4 flex items-center rounded-full p-1 transition-colors",
                enabled ? variants[variant].on : variants[variant].off
                )}
            >
                <div
                    className={cn(
                        "w-3 h-3 rounded-full bg-white shadow transform transition-transform dark:bg-slate-100",
                        enabled ? "translate-x-3" : "translate-x-0"
                    )}
                />
            </button>
        </div>
    );
}

SwitchToggle.propTypes = {
    variant: PropTypes.string,
    enabled: PropTypes.bool,
    onChange: PropTypes.func
}
