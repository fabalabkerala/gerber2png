import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

const ImageLayout = ({
    count,
    row,
    column,
    spacing,
    background,
    dimension,
    visibleSlots,
    selected,
    onToggleSlot,
}) => {
    const previewWidth = 550;
    const previewHeight = 300;
    const padding = 24;

    // Actual physical layout size (mm)
    const totalWidthMM =
        dimension.width * column +
        spacing * (column - 1);

    const totalHeightMM =
        dimension.height * row +
        spacing * (row - 1);

    // Available preview space
    const availableWidth = previewWidth - padding * 2;
    const availableHeight = previewHeight - padding * 2;

    // Compute scale for cell size
    const fitScale = Math.min(
        availableWidth / totalWidthMM,
        availableHeight / totalHeightMM
    );

    // Responsive cell size
    const cellWidth = dimension.width * fitScale;
    const cellHeight = dimension.height * fitScale;
    const scaledSpacing = spacing * fitScale;

    return (
        <div className="w-full my-5">
            <div className="relative h-[300px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-center min-h-full p-6 pt-3">
                    <div
                        className="relative grid border border-slate-200 dark:border-slate-700"
                        style={{
                            gridTemplateColumns: `repeat(${column}, ${cellWidth}px)`,
                            gridTemplateRows: `repeat(${row}, ${cellHeight}px`,
                            gap: `${scaledSpacing}px`,
                            background,
                        }}
                    >
                        {Array.from({ length: count }).map((_, i) => (
                            <div
                                key={i}
                                className="relative overflow-hidden cursor-pointer group"
                                onClick={() => onToggleSlot(i)}
                            >
                                {visibleSlots[i] ? (
                                    <>
                                        <img
                                            src={selected.url}
                                            alt={`slot-${i}`}
                                            className="w-full h-full object-contain select-none"
                                            draggable={false}
                                        />

                                        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 opacity-0 bg-black/40 group-hover:opacity-100">
                                            <EyeIcon className="w-4 h-4 text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <img
                                            src={selected.url}
                                            alt={`slot-${i}`}
                                            className="w-full h-full object-contain opacity-0"
                                            draggable={false}
                                        />

                                        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 bg-black/40 opacity-100">
                                            <EyeSlashIcon className="w-6 h-6 text-white" />
                                        </div>

                                        <span className="absolute z-10 px-1 py-0.5 text-[10px] text-gray-500 rounded bg-white/90 shadow-sm bottom-1 right-1 dark:bg-slate-900/80 dark:text-slate-300">
                                            #{i + 1}
                                        </span>
                                    </>
                                )}
                            </div>
                        ))}

                        {/* Width dimension */}
                        <div className="absolute left-1/2 -bottom-3 w-full h-px -translate-x-1/2 bg-zinc-300 dark:bg-slate-700" />

                        <p className="absolute left-1/2 -bottom-5 -translate-x-1/2 rounded bg-white px-2 text-xs font-medium text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                            {totalWidthMM.toFixed(2)}
                            <span className="font-normal text-gray-500 dark:text-slate-400">
                                {" "}
                                mm
                            </span>
                        </p>

                        {/* Height dimension */}
                        <div className="absolute top-0 -right-4 h-full w-px bg-zinc-300 dark:bg-slate-700" />

                        <p className="absolute top-1/2 -right-[50px] -translate-y-1/2 -rotate-90 rounded bg-white px-2 text-xs font-medium text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                            {totalHeightMM.toFixed(2)}
                            <span className="font-normal text-gray-500 dark:text-slate-400">
                                {" "}
                                mm
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

ImageLayout.propTypes = {
    count: PropTypes.number.isRequired,
    row: PropTypes.number.isRequired,
    column: PropTypes.number.isRequired,
    spacing: PropTypes.number.isRequired,
    background: PropTypes.string,
    dimension: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }),
    selected: PropTypes.shape({
        name: PropTypes.string,
        url: PropTypes.string,
    }),
    visibleSlots: PropTypes.array.isRequired,
    onToggleSlot: PropTypes.func,
};

export default ImageLayout;