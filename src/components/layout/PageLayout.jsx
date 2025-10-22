import PropTypes from 'prop-types';
import { useGerber } from '../context/GerberContext';
import { AnimatePresence, motion } from 'motion/react';

export const  PageLayout = ({ sidebar, main, right }) => {
    const { loader } = useGerber();
    return (
        <>
            <div className="h-full relative flex flex-col md:flex-row bg-[#EBEBEB] md:overflow-hidden">
                <aside className="w-full md:w-1/6 h-48 md:h-full min-w-[300px] py-3 ps-3 pe-0.5 md:overflow-y-auto custom-scrollbar">
                    {sidebar}
                </aside>

                <main className="flex-1 h-full p-3 relative">{main}</main>

                <aside className="w-full md:w-1/6 h-48 md:h-full min-w-[300px] py-3 pe-3 ps-0.5 md:overflow-y-auto custom-scrollbar">
                    {right}
                </aside>

                <AnimatePresence>
                    {loader && (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-[9999]"
                        >
                            <motion.div
                            className="w-12 h-12 border-4 border-[#e57345] border-t-transparent rounded-full"
                            animate={{
                                rotate: [0, 360],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                rotate: {
                                repeat: Infinity,
                                duration: 1,
                                ease: "linear",
                                },
                                scale: {
                                repeat: Infinity,
                                duration: 1.2,
                                ease: "easeInOut",
                                },
                            }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </>
    )
}

PageLayout.propTypes ={
    sidebar: PropTypes.node.isRequired,
    main: PropTypes.node.isRequired,
    right: PropTypes.node,
}
