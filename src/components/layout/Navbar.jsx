import { Link } from 'react-router-dom';
import pcbLogo from '../../assets/pcbLogo.png'
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
            <nav className='w-full flex flex-col'>
                <div className="flex justify-between items-center navbar h-16 px-5 py-6 border-b">
                    <div className='flex items-center'>
                        <img className="h-full w-6" src={ pcbLogo } alt="" />
                        <div>
                        <span className='gerber'>Gerber</span><span className='two'>2</span><span className='png'>PNG</span>
                        </div>
                    </div>
                    <div className='flex gap-6'>
                        <a href="https://git.fablabkerala.in/midlaj/gerber2png/-/wikis/home" target='_blank'>
                            <WikiIcon />
                        </a>
                        <a href="https://git.fablabkerala.in/midlaj/gerber2png" target='_blank'>
                            <GitlabIcon />
                        </a>
                    </div>
                </div>

                <div className="flex bg-zinc-50">
                    <Link
                        className={cn(
                            "px-4 py-1.5 w-64 text-sm text-center hover:text-[#e06636] transition-all duration-200",
                            activeTab === 'converter' ? 'bg-[#EBEBEB]  text-[#e06636] border-t border-t-red-400 font-medium' : 'hover:bg-zinc-50 border-x text-black font-normal'
                        )}
                        onClick={() => setActiveTab('converter')}
                        to={'/'}
                    >
                        
                        Gerber2PNG Converter
                    </Link>
                    <Link
                        className={cn(
                            "px-4 py-1.5 w-64 text-sm text-center hover:text-[#e06636] transition-all duration-200",
                            activeTab === 'generator' ? 'bg-[#EBEBEB]  text-[#e06636] border-t border-t-red-400 font-medium' : 'hover:bg-zinc-50 border-x text-black font-normal'
                        )}
                        onClick={() => setActiveTab('generator')}
                        to={'/gcode'}
                    >
                        
                        G-Code Generator
                    </Link>
                    {/* <button 
                        className={cn(
                            "px-4 py-1.5 w-64 text-sm",
                            activeTab === 'converter' ? 'bg-[#EBEBEB]  text-[#ce5e31] border-t border-t-red-400 font-medium' : 'hover:bg-zinc-50 border-x'
                        )}
                        onClick={() => setActiveTab('converter')}
                    >Gerber2PNG Converter</button> */}
                    {/* <button 
                        className={cn(
                            "px-4 py-1.5 w-64 text-sm",
                            activeTab === 'generator' ? 'bg-[#EBEBEB]  text-[#ce5e31] border-t border-t-red-400 font-medium' : 'hover:bg-zinc-50 border-x'
                        )}
                        onClick={() => setActiveTab('generator')}
                    >G-Code Generator</button> */}
                </div>
            </nav>
        </>
    )
}