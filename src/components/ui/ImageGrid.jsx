const ImageLayout = ({ layout, row, column, background, }) => {
    return (
        <>
            <div className="max-w-[550px] h-[300px] flex-1 mx-auto pb-6 pr-5 my-5">
                <div
                    className="relative grid w-fit mx-auto my-auto border"
                    style={{
                        gridTemplateColumns: `repeat(${config.column}, auto)`,
                        gridTemplateRows: `repeat(${config.row}, auto)`,
                        gap: `${config.spacing}px`,
                        background: layoutBg,
                        height: config.row >= config.column ? '100%' : 'auto', // 👈 key fix
                    }}
                >
                    { Array.from({ length: totalSlots }).map((_, i) => (
                        <div
                        key={i}
                        className="relative flex items-center justify-center cursor-pointer overflow-hidden group"
                        onClick={() => toggleSlot(i)}
                        >
                        { visibleSlots[i] ? (
                            <>
                                <img
                                    src={selectedPng.url}
                                    alt={`slot-${i}`}
                                    className="max-h-full max-w-full"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                    <EyeIcon className="text-white w-3.5 h-3.5" />
                                </div>
                            </>
                        ) : (
                            <>
                                <img
                                    src={selectedPng.url}
                                    alt={`slot-${i}`}
                                    className="max-h-full max-w-full opacity-0"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                    <EyeSlashIcon className="text-white w-3.5 h-3.5" />
                                </div>
                                <span className="absolute bottom-1 right-1 text-[10px] text-gray-400">
                                    #{i + 1}
                                </span>
                            </>
                        )}
                        </div>
                    ))}

                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-full h-px bg-zinc-300 my-3" />
                    <p className="text-nowrap absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-2 text-xs font-medium">
                        {dimension.width * config.column + config.spacing * (config.column - 1)}
                        <span className="text-gray-500 font-normal"> mm</span>
                    </p>

                    <div className="absolute top-0 -right-7 w-px h-full bg-zinc-300 mx-3" />
                        <p className="text-nowrap absolute top-1/2 -translate-y-1/2 -right-[50px] bg-white px-2 text-xs -rotate-90 origin-center font-medium">
                            {dimension.height * config.row + config.spacing * (config.row - 1)}
                            <span className="text-gray-500 font-normal"> mm</span>
                        </p>
                </div>
            </div>
        </>
    )
}