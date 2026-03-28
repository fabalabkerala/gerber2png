import { useEffect, useId, useState } from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { cn } from "../../utils/cn";

const ThreeWaySlider = ({ options, valueSync, onChange, variant = 'primary' }) => {
    const [selected, setSelected] = useState(valueSync || options[0].id); 
    const instanceId = useId();

    useEffect(() => { setSelected(valueSync) }, [valueSync])

    const handleClick = (id) => {
        setSelected(id)
        if (onChange) onChange(id)
    }

    const variants = {
        primary: {
            pill: 'bg-[#34d399]',
            label: 'text-white'
        },
        secondary: {
            pill: 'border-2 border-[#34d399]',
            label: 'text-[#34d399]'
        },
        
    }

    return (
        <div className="relative flex bg-white border border-gray-100 rounded-full w-full dark:bg-slate-900 dark:border-slate-700">
            { options.map((opt) => (
                <button
                    key={opt.id}
                    onClick={() => handleClick(opt.id)}
                    className={cn(
                        "relative z-10 px-4 py-1.5 text-xs font-medium transition-colors duration-200 flex-1 text-nowrap",
                        selected === opt.id ? variants[variant].label : 'text-gray-700 dark:text-slate-300', 
                        opt.class
                    )}
                >
                    {opt.label}
                    {selected === opt.id && (
                        <motion.div
                            layoutId={`highlight-${instanceId}`}
                            className={cn(
                                "absolute inset-0 rounded-full z-[-1]",
                                variants[variant].pill
                            )}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                </button>
            ))}
        </div>
    );
};

ThreeWaySlider.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired
        })
    ).isRequired,
    valueSync: PropTypes.string,
    onChange: PropTypes.func,
    variant: PropTypes.string
}

export default ThreeWaySlider;
