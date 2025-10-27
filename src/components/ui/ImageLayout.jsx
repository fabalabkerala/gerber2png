import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import PropTypes from "prop-types"

const ImageLayout = ({ 
    count, 
    row, 
    column, 
    spacing, 
    background, 
    dimension, 
    visibleSlots, 
    selected, 
    onToggleSlot 
}) => {
    return (
        <>
            <div className="max-w-[550px] h-[300px] flex-1 mx-auto pb-6 pr-5 my-5 overflow-y-auto custom-scrollbar">
                <div
                    className="relative grid w-fit mx-auto my-auto border"
                    style={{
                        gridTemplateColumns: `repeat(${column}, auto)`,
                        gridTemplateRows: `repeat(${row}, auto)`,
                        gap: `${spacing}px`,
                        background: background,
                        height: row >= column ? '100%' : 'auto', // 👈 key fix
                    }}
                >
                    { Array.from({ length: count }).map((_, i) => (
                        <div
                        key={i}
                        className="relative flex items-center justify-center cursor-pointer overflow-hidden group"
                        onClick={() => onToggleSlot(i)}
                        >
                        { visibleSlots[i] ? (
                            <>
                                <img
                                    src={selected.url}
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
                                    src={selected.url}
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
                        {dimension.width * column + spacing * (column - 1)}
                        <span className="text-gray-500 font-normal"> mm</span>
                    </p>

                    <div className="absolute top-0 -right-7 w-px h-full bg-zinc-300 mx-3" />
                        <p className="text-nowrap absolute top-1/2 -translate-y-1/2 -right-[50px] bg-white px-2 text-xs -rotate-90 origin-center font-medium">
                            {dimension.height * row + spacing * (row - 1)}
                            <span className="text-gray-500 font-normal"> mm</span>
                        </p>
                </div>
            </div>
        </>
    )
}

ImageLayout.propTypes = {
    count: PropTypes.number.isRequired,
    row: PropTypes.number.isRequired,
    column: PropTypes.number.isRequired,
    spacing: PropTypes.number.isRequired,
    background: PropTypes.string,
    dimension: PropTypes.shape({ width: PropTypes.number, height: PropTypes.number }),
    selected: PropTypes.shape({ name: PropTypes.string, url: PropTypes.string }),
    visibleSlots: PropTypes.array.isRequired,
    onToggleSlot: PropTypes.func
}

ImageLayout.defaultProps = {
    count: 1,
    row: 1,
    column: 1,
    spacing: 2,
    background: "#f9f9f9",
    dimension: { width: 10, height: 10 },
    selected: { name: "default", url: "" },
    visibleSlots: [true],
    onToggleSlot: () => {},
};

export default ImageLayout;