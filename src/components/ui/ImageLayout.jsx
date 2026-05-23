import { useMemo } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
import generateOuterSvg from "../../utils/svgConverter/generateOuter";
import { OUTLINE_EXPORT_PADDING_MM } from "../../utils/svgConverter/svg2png";

const isTopOutlinePng = (png) =>
    png?.job === "outline" &&
    (
        png?.directory === "toplayer" ||
        png?.name === "outline_toplayer"
    );

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
    singleOutlineEnabled = false,
    outlineToolWidth = 0,
}) => {
    const previewWidth = 550;
    const previewHeight = 300;
    const padding = 24;

    // Actual physical layout size (mm)
    const totalWidthMM = dimension.width * column + spacing * (column - 1);

    const totalHeightMM =
        dimension.height * row +
        spacing * (row - 1);

    // Available preview space
    const availableWidth = previewWidth - padding * 2;
    const availableHeight = previewHeight - padding * 2;

    const outerPreview = useMemo(() => {
        if (!singleOutlineEnabled || !isTopOutlinePng(selected)) return null;

        const toolWidth = Math.max(parseFloat(outlineToolWidth) || 0, 0);
        const innerWidth = Math.max(totalWidthMM - toolWidth * 2, 0.01);
        const innerHeight = Math.max(totalHeightMM - toolWidth * 2, 0.01);
        const outer = generateOuterSvg(
            innerWidth,
            innerHeight,
            toolWidth,
            { viewboxX: toolWidth, viewboxY: toolWidth },
            false
        );

        return {
            path: outer.svg.querySelector("path")?.getAttribute("d") ?? "",
            viewBox: outer.svg.getAttribute("viewBox"),
            width: outer.width,
            height: outer.height,
            paddedWidth: outer.width + OUTLINE_EXPORT_PADDING_MM * 2,
            paddedHeight: outer.height + OUTLINE_EXPORT_PADDING_MM * 2,
        };
    }, [outlineToolWidth, singleOutlineEnabled, totalHeightMM, totalWidthMM, selected]);

    const previewContentWidth = singleOutlineEnabled && outerPreview ? outerPreview.paddedWidth : totalWidthMM + (singleOutlineEnabled ? outlineToolWidth * 2 : 0);
    const previewContentHeight = singleOutlineEnabled && outerPreview ? outerPreview.paddedHeight : totalHeightMM + (singleOutlineEnabled ? outlineToolWidth * 2 : 0);

    // Compute scale for cell size
    const fitScale = Math.min(
        availableWidth / previewContentWidth,
        availableHeight / previewContentHeight
    );

    // Responsive cell size
    const cellWidth = dimension.width * fitScale;
    const cellHeight = dimension.height * fitScale;
    const scaledSpacing = spacing * fitScale;

    return (
        <div className="w-auto my-5 mx-2">
            <div className="relative h-[300px] overflow-auto">
                <div className="flex items-center justify-center min-h-full p-6 pt-0">
                    <div
                        className="relative border border-slate-200 dark:border-slate-700"
                        style={{ background }}
                    >
                        {singleOutlineEnabled && outerPreview ? (
                            <div
                                className="relative flex items-center justify-center"
                                style={{ padding: `${OUTLINE_EXPORT_PADDING_MM * fitScale}px` }}
                            >
                                <svg
                                    viewBox={outerPreview.viewBox}
                                    style={{
                                        width: `${outerPreview.width * fitScale}px`,
                                        height: `${outerPreview.height * fitScale}px`,
                                        display: "block",
                                    }}
                                >
                                    <path d={outerPreview.path} fill="#ffffff" />
                                </svg>
                            </div>
                        ) : (
                            <div
                                className="relative grid"
                                style={{
                                    gridTemplateColumns: `repeat(${column}, ${cellWidth}px)`,
                                    gridTemplateRows: `repeat(${row}, ${cellHeight}px`,
                                    gap: `${scaledSpacing}px`,
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
                            </div>
                        )}

                        {/* Width dimension */}
                        <div className="absolute left-1/2 -bottom-3 w-full h-px -translate-x-1/2 bg-zinc-300 dark:bg-slate-700" />

                        <p className="absolute left-1/2 -bottom-5 -translate-x-1/2 rounded bg-white px-2 text-xs font-medium text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                            {previewContentWidth.toFixed(2)}
                            <span className="font-normal text-gray-500 dark:text-slate-400">
                                {" "}
                                mm
                            </span>
                        </p>

                        {/* Height dimension */}
                        <div className="absolute top-0 -right-4 h-full w-px bg-zinc-300 dark:bg-slate-700" />

                        <p className="absolute top-1/2 -right-[50px] -translate-y-1/2 -rotate-90 rounded bg-white px-2 text-xs font-medium text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                            {previewContentHeight.toFixed(2)}
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
    singleOutlineEnabled: PropTypes.bool,
    outlineToolWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default ImageLayout;
