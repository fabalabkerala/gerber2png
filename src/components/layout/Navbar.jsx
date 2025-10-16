import pcbLogo from '../../assets/pcbLogo.png'
import GitlabIcon from '../icons/GitlabIcon'
import WikiIcon from '../icons/WikiIcon'
import { cn } from '../../utils/cn'
import { useState } from 'react'

export default function Navbar() {
    const [activeTab, setActiveTab] = useState('converter');

    return (
        <>
            <nav className='w-full flex flex-col'>
                <div className="flex justify-between items-center navbar h-14 px-5">
                    <div className='flex items-center'>
                        <img className="w-7" src={ pcbLogo } alt="" />
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

                <div className="flex">
                    <button 
                        className={cn(
                            "px-4 py-1.5 w-64 text-sm",
                            activeTab === 'converter' ? 'bg-[#EBEBEB] text-[#ce5e31] border-t border-red-400 font-medium' : 'hover:bg-zinc-50'
                        )}
                        onClick={() => setActiveTab('converter')}
                    >Gerber2PNG Converter</button>
                    <button 
                        className={cn(
                            "px-4 py-1.5 w-64 text-sm",
                            activeTab === 'generator' ? 'bg-[#EBEBEB] text-[#ce5e31] border-t border-red-400 font-medium' : 'hover:bg-zinc-50'
                        )}
                        onClick={() => setActiveTab('generator')}
                    >G-Code Generator</button>
                </div>
            </nav>
        </>
    )
}