import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { motion } from 'motion/react';
import pcbLogo from '../../assets/logo3.png'
import { cn } from '../../utils/cn';
import GitlabIcon from '../icons/GitlabIcon'
import WikiIcon from '../icons/WikiIcon'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
    const [activeTab, setActiveTab] = useState(null);
    const location = useLocation()
    const { theme, toggleTheme } = useApp();

    useEffect(() => {
        const path = location.pathname;

        if (path === '/') setActiveTab('converter')
        else if (path === '/gcode') setActiveTab('generator');

    }, [location])

    return (
        <>
            <nav className='flex flex-col m-3 mb-0 bg-white border border-slate-200 rounded-xl transition-colors dark:bg-slate-900 dark:border-slate-800 dark:shadow-[0_12px_40px_rgba(0,0,0,0.28)]'>
                <div className="flex justify-between items-center navbar h-16">
                    <div className='flex items-center gap-2.5 md:min-w-[335px] px-4 py-4'>
                        <img className="h-8 rounded-lg drop-shadow-sm" src={ pcbLogo } alt="Gerber2PNG" />
                        <div className="flex items-end leading-none select-none">
                            <span className="bg-gradient-to-b from-[#178264] via-[#0C5B49] to-[#063B31] bg-clip-text text-[1.25rem] tracking-wide font-bold text-transparent dark:from-[#7EEAD4] dark:via-[#34D399] dark:to-[#0F766E]">
                                Gerber
                            </span>
                            <span className="bg-gradient-to-b from-[#F4AA41] via-[#D97A1C] to-[#A8580E] bg-clip-text text-[1.42rem] tracking-wide font-black text-transparent dark:from-[#FCD34D] dark:via-[#F59E0B] dark:to-[#D97706]">
                                2
                            </span>
                            <span className="bg-gradient-to-b from-[#F6CC55] via-[#EDB11F] to-[#C88712] bg-clip-text text-[1.38rem] font-bold text-transparent dark:from-[#FEF08A] dark:via-[#FACC15] dark:to-[#EAB308]">
                                PNG
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-1 items-end justify-start h-full">
                        {/* <Link
                            className={cn(
                                "px-4 py-1.5 w-64 text-sm text-center hover:text-[#3647e0] transition-all duration-200 h-fit",
                                activeTab === 'converter' ? 'bg-[#f5f6f8]  text-[#3647e0] border-t border-t-indigo-400 font-medium' : 'hover:bg-zinc-50 border-x text-black font-normal'
                            )}
                            onClick={() => setActiveTab('converter')}
                            to={'/'}
                        >
                            
                            Gerber2PNG Converter
                        </Link>
                        <Link
                            className={cn(
                                "px-4 py-1.5 w-64 text-sm text-center hover:text-[#e57345] transition-all duration-200 h-fit",
                                activeTab === 'generator' ? 'bg-[#EBEBEB]  text-[#e57345] border-t border-t-orange-400 font-medium' : 'hover:bg-zinc-50 border-x text-black font-normal'
                            )}
                            onClick={() => setActiveTab('generator')}
                            to={'/gcode'}
                        >
                            
                            G-Code Generator
                        </Link> */}
                    </div>
                    <div className='flex gap-3 min-w-[280px] items-center justify-end px-4'>
                        <div className="flex items-center gap-2">
                            <SunIcon className={cn("h-3.5 w-3.5 transition-colors", theme === "dark" ? "text-slate-500" : "text-amber-500")} />
                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                onClick={toggleTheme}
                                className={cn(
                                    "relative flex h-5 w-12 items-center rounded-full border transition-colors",
                                    theme === "dark"
                                        ? "border-cyan-500/40 bg-cyan-500/15"
                                        : "border-slate-300 bg-slate-200"
                                )}
                                aria-label="Toggle dark mode"
                                aria-pressed={theme === "dark"}
                            >
                                <motion.span
                                    layout
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    className={cn(
                                        "absolute flex h-4 w-4 items-center justify-center rounded-full shadow-sm",
                                        theme === "dark"
                                            ? "left-7 bg-slate-950 text-cyan-200"
                                            : "left-0.5 bg-white text-amber-500"
                                    )}
                                >
                                    {theme === "dark" ? <MoonIcon className="h-2.5 w-2.5" /> : <SunIcon className="h-2.5 w-2.5" />}
                                </motion.span>
                            </motion.button>
                            <MoonIcon className={cn("h-3.5 w-3.5 transition-colors", theme === "dark" ? "text-cyan-300" : "text-slate-400")} />
                        </div>
                        <a className="text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-300 dark:hover:text-white" href="https://github.com/fabalabkerala/gerber2png/wiki" target='_blank'>
                            <WikiIcon />
                        </a>
                        <a className="text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-300 dark:hover:text-white" href="https://github.com/fabalabkerala/gerber2png" target='_blank'>
                            <GitlabIcon />
                        </a>
                    </div>
                </div>

                
            </nav>
        </>
    )
}
