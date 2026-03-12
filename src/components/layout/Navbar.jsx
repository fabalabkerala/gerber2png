import { Link } from 'react-router-dom';
import pcbLogo from '../../assets/logo.png'
import { cn } from '../../utils/cn';
import GitlabIcon from '../icons/GitlabIcon'
import WikiIcon from '../icons/WikiIcon'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';

export default function Navbar() {
    const [activeTab, setActiveTab] = useState(null);
    const location = useLocation()

    useEffect(() => {
        const path = location.pathname;

        if (path === '/') setActiveTab('converter')
        else if (path === '/gcode') setActiveTab('generator');

    }, [location])

    return (
        <>
            <nav className='flex flex-col m-3 mb-0 bg-white border border-slate-200 rounded-xl'>
                <div className="flex justify-between items-center navbar h-16">
                    <div className='flex items-center md:min-w-[335px] px-4 py-4'>
                        <img className="h-12" src={ pcbLogo } alt="" />
                    </div>
                    {/* <div className="flex flex-1 items-end justify-start h-full">
                        <Link
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
                        </Link>
                    </div> */}
                    <div className='flex gap-6 min-w-[280px] items-end justify-end px-4'>
                        <a href="https://github.com/fabalabkerala/gerber2png/wiki" target='_blank'>
                            <WikiIcon />
                        </a>
                        <a href="https://github.com/fabalabkerala/gerber2png" target='_blank'>
                            <GitlabIcon />
                        </a>
                    </div>
                </div>

                
            </nav>
        </>
    )
}