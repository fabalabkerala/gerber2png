import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { AnimatePresence, motion } from "motion/react";
import ModalHeader from "../ui/ModalHeader";
import {
    DEFAULT_OUTLINE_TAB_DEPTH_MM,
    DEFAULT_OUTLINE_TABS,
    DEFAULT_OUTLINE_TAB_WIDTH_MM,
    drawTabsOnOutlineCanvas,
} from "../../utils/svgConverter/svg2png";
import { TrashIcon } from "@heroicons/react/24/outline";

const PREVIEW_WIDTH = 920;
const PREVIEW_HEIGHT = 560;

const sideOptions = [
    { id: "top", label: "Top Edge", shortLabel: "Top" },
    { id: "bottom", label: "Bottom Edge", shortLabel: "Bottom" },
    { id: "left", label: "Left Edge", shortLabel: "Left" },
    { id: "right", label: "Right Edge", shortLabel: "Right" },
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const sliderClassName = "mt-3 h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-cyan-500 dark:bg-slate-700 dark:accent-cyan-400";

const panelClassName = "rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-sm shadow-slate-200/60 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none h-full";

const OutlineTabsModal = ({ png, outlineToolWidth, preset, onClose, onApply, onRemove, onSavePreset }) => {
    const canvasRef = useRef(null);
    const dragStateRef = useRef(null);
    const initialConfig = useMemo(() => {
        if (png?.tabConfig) return png.tabConfig;
        if (preset) return preset;
        return {
            tabWidthMm: DEFAULT_OUTLINE_TAB_WIDTH_MM,
            tabDepthMm: DEFAULT_OUTLINE_TAB_DEPTH_MM,
            tabs: DEFAULT_OUTLINE_TABS,
        };
    }, [png?.tabConfig, preset]);
    const [imageElement, setImageElement] = useState(null);
    const [tabWidth, setTabWidth] = useState(initialConfig.tabWidthMm);
    const [tabDepth, setTabDepth] = useState(initialConfig.tabDepthMm);
    const [tabs, setTabs] = useState(() => (
        Array.isArray(initialConfig.tabs) ? initialConfig.tabs : DEFAULT_OUTLINE_TABS
    ));
    const [activeTabId, setActiveTabId] = useState(() => (
        Array.isArray(initialConfig.tabs) ? (initialConfig.tabs[0]?.id ?? null) : (DEFAULT_OUTLINE_TABS[0]?.id ?? null)
    ));
    const [hoveredTabId, setHoveredTabId] = useState(null);
    const [draggingTabId, setDraggingTabId] = useState(null);
    const [placementMode, setPlacementMode] = useState(null);

    useEffect(() => {
        const nextTabs = Array.isArray(initialConfig.tabs) ? initialConfig.tabs : DEFAULT_OUTLINE_TABS;
        setTabWidth(initialConfig.tabWidthMm);
        setTabDepth(initialConfig.tabDepthMm);
        setTabs(nextTabs);
        setActiveTabId(nextTabs[0]?.id ?? null);
    }, [initialConfig]);

    useEffect(() => {
        const image = new Image();
        image.onload = () => setImageElement(image);
        image.src = png?.originalUrl || png?.url;
    }, [png]);

    const renderModel = useMemo(() => {
        if (!imageElement) return null;

        const scale = Math.min(PREVIEW_WIDTH / imageElement.naturalWidth, PREVIEW_HEIGHT / imageElement.naturalHeight);
        const drawWidth = imageElement.naturalWidth * scale;
        const drawHeight = imageElement.naturalHeight * scale;
        const offsetX = (PREVIEW_WIDTH - drawWidth) / 2;
        const offsetY = (PREVIEW_HEIGHT - drawHeight) / 2;

        return {
            scale,
            drawWidth,
            drawHeight,
            offsetX,
            offsetY,
        };
    }, [imageElement]);

    useEffect(() => {
        if (!imageElement || !renderModel || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = PREVIEW_WIDTH;
        canvas.height = PREVIEW_HEIGHT;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const grid = 24;
        for (let y = 0; y < canvas.height; y += grid) {
            for (let x = 0; x < canvas.width; x += grid) {
                const isAlt = ((x / grid) + (y / grid)) % 2 === 0;
                ctx.fillStyle = isAlt ? "#0f172a" : "#111f35";
                ctx.fillRect(x, y, grid, grid);
            }
        }

        ctx.fillStyle = "rgba(15, 23, 42, 0.72)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.shadowColor = "rgba(15, 23, 42, 0.45)";
        ctx.shadowBlur = 24;
        ctx.drawImage(
            imageElement,
            renderModel.offsetX,
            renderModel.offsetY,
            renderModel.drawWidth,
            renderModel.drawHeight
        );
        ctx.restore();

        ctx.save();
        ctx.translate(renderModel.offsetX, renderModel.offsetY);
        drawTabsOnOutlineCanvas(ctx, {
            canvasWidth: renderModel.drawWidth,
            canvasHeight: renderModel.drawHeight,
            toolWidthMm: parseFloat(outlineToolWidth) || 0.8,
            tabWidthMm: tabWidth,
            tabDepthMm: tabDepth,
            tabs,
            pxPerMm: (1000 / 25.4) * renderModel.scale,
            color: "#ffffff",
        });
        ctx.restore();

        ctx.save();
        ctx.translate(renderModel.offsetX, renderModel.offsetY);
        tabs.forEach((tab) => {
            const rect = getPreviewRect({
                tab,
                drawWidth: renderModel.drawWidth,
                drawHeight: renderModel.drawHeight,
                tabWidthMm: tabWidth,
                tabDepthMm: tab.depthMm ?? tabDepth,
                outlineToolWidth,
                scale: renderModel.scale,
            });

            const isActive = tab.id === activeTabId;
            const isHovered = tab.id === hoveredTabId;
            const isDragging = tab.id === draggingTabId;

            if (isActive || isHovered || isDragging) {
                ctx.save();
                ctx.fillStyle = isActive ? "rgba(251, 191, 36, 0.18)" : "rgba(34, 211, 238, 0.12)";
                ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
                ctx.restore();
            }

            ctx.save();
            if (isActive || isDragging) {
                ctx.shadowColor = "rgba(251, 191, 36, 0.55)";
                ctx.shadowBlur = 18;
            } else if (isHovered) {
                ctx.shadowColor = "rgba(34, 211, 238, 0.45)";
                ctx.shadowBlur = 12;
            }

            ctx.strokeStyle = isActive || isDragging
                ? "#f59e0b"
                : isHovered
                    ? "#22d3ee"
                    : "#67e8f9";
            ctx.lineWidth = isActive || isDragging ? 3 : isHovered ? 2 : 1.5;
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
            ctx.restore();
        });
        ctx.restore();
    }, [activeTabId, draggingTabId, hoveredTabId, imageElement, outlineToolWidth, renderModel, tabDepth, tabWidth, tabs]);

    const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null;

    const updateHoveredTab = (event) => {
        if (!renderModel || dragStateRef.current) return;
        const point = getCanvasPoint(event, canvasRef.current);
        const nextHovered = findTabAtPoint({
            point,
            renderModel,
            tabs,
            tabWidth,
            tabDepth,
            outlineToolWidth,
        });
        setHoveredTabId(nextHovered?.id ?? null);
    };

    const handlePointerDown = (event) => {
        if (!renderModel) return;

        const point = getCanvasPoint(event, canvasRef.current);

        if (placementMode === "anywhere") {
            const newTab = createTabFromPoint({
                point,
                renderModel,
                fallbackDepthMm: tabDepth,
            });

            if (newTab) {
                setTabs((prev) => [...prev, newTab]);
                setActiveTabId(newTab.id);
                setHoveredTabId(newTab.id);
                setPlacementMode(null);
            }
            return;
        }

        const clickedTab = findTabAtPoint({
            point,
            renderModel,
            tabs,
            tabWidth,
            tabDepth,
            outlineToolWidth,
        });

        if (!clickedTab) return;

        setActiveTabId(clickedTab.id);
        setHoveredTabId(clickedTab.id);
        setDraggingTabId(clickedTab.id);
        dragStateRef.current = { tabId: clickedTab.id };
    };

    const handlePointerMove = (event) => {
        if (!renderModel) return;

        updateHoveredTab(event);

        if (!dragStateRef.current) return;

        const point = getCanvasPoint(event, canvasRef.current);
        const localX = clamp(point.x - renderModel.offsetX, 0, renderModel.drawWidth);
        const localY = clamp(point.y - renderModel.offsetY, 0, renderModel.drawHeight);

        setTabs((prev) =>
            prev.map((tab) => {
                if (tab.id !== dragStateRef.current.tabId) return tab;

                if (tab.side === "free") {
                    return {
                        ...tab,
                        x: clamp(localX / renderModel.drawWidth, 0, 1),
                        y: clamp(localY / renderModel.drawHeight, 0, 1),
                    };
                }

                if (tab.side === "top" || tab.side === "bottom") {
                    return { ...tab, offset: clamp(localX / renderModel.drawWidth, 0, 1) };
                }

                return { ...tab, offset: clamp(localY / renderModel.drawHeight, 0, 1) };
            })
        );
    };

    const handlePointerUp = () => {
        dragStateRef.current = null;
        setDraggingTabId(null);
    };

    const handlePointerLeave = () => {
        handlePointerUp();
        setHoveredTabId(null);
    };

    const handleAddTab = (side) => {
        const nextId = `${side}-${Date.now()}`;
        setTabs((prev) => [...prev, { id: nextId, side, offset: 0.5, depthMm: tabDepth }]);
        setActiveTabId(nextId);
        setHoveredTabId(nextId);
        setPlacementMode(null);
    };

    const handleRemoveSelected = () => {
        setTabs((prev) => {
            const nextTabs = prev.filter((tab) => tab.id !== activeTabId);
            setActiveTabId(nextTabs[0]?.id ?? null);
            return nextTabs;
        });
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-3 py-4 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    initial={{ scale: 0.97, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.97, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 240, damping: 24 }}
                    className="flex max-h-[92vh] w-[1420px] max-w-[96vw] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-2xl shadow-slate-950/30 dark:border-slate-800 dark:bg-slate-950"
                    onClick={(event) => event.stopPropagation()}
                >
                    <ModalHeader title="Outline Tabs Editor" onClose={onClose} />

                    <div className="flex-1 overflow-y-auto p-4 md:p-5">
                        <div className="grid gap-4 xl:grid-cols-[270px_minmax(0,1fr)_270px]">
                            <aside className="flex flex-col gap-4 xl:min-h-[600px]">
                                <section className={panelClassName}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Quick Add Tabs</p>
                                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                                Add to a specific edge, or place a fully independent tab anywhere inside the image.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-2">
                                        {sideOptions.map((side) => (
                                            <button
                                                key={side.id}
                                                onClick={() => handleAddTab(side.id)}
                                                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3 text-left transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50/70 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-cyan-500/40 dark:hover:bg-cyan-500/10"
                                            >
                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-100">
                                                    {side.label}
                                                </span>
                                                <span className="rounded-full bg-slate-100 px-2 text-[10px] font-medium text-slate-500 transition group-hover:bg-cyan-100 group-hover:text-cyan-700 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-cyan-500/20 dark:group-hover:text-cyan-200">
                                                    + Add
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() =>
                                            setPlacementMode((prev) =>
                                                prev === "anywhere"
                                                    ? null
                                                    : "anywhere"
                                            )
                                        }
                                        className={`group relative mt-3 w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                                            placementMode === "anywhere"
                                                ? "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm dark:border-amber-500/50 dark:from-amber-500/10 dark:to-orange-500/10"
                                                : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50/50 hover:shadow-sm dark:border-slate-900 dark:bg-slate-950 dark:hover:border-cyan-500/40 dark:hover:bg-cyan-500/10"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition text-sm ${
                                                        placementMode === "anywhere"
                                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200"
                                                            : "bg-slate-100 text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-700 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-cyan-500/20 dark:group-hover:text-cyan-200"
                                                    }`}
                                                >
                                                    ✦
                                                </div>

                                                <div>
                                                    <p
                                                        className={`text-sm font-semibold ${
                                                            placementMode === "anywhere"
                                                                ? "text-amber-800 dark:text-amber-100"
                                                                : "text-slate-700 dark:text-slate-100"
                                                        }`}
                                                    >
                                                        Place Anywhere
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                        Click preview to place a free tab
                                                    </p>
                                                </div>
                                            </div>

                                            {/* mini slider */}
                                            <div
                                                className={`relative mt-0.5 h-4 w-11 shrink-0 rounded-full transition ${
                                                    placementMode === "anywhere"
                                                        ? "bg-amber-400 dark:bg-amber-500"
                                                        : "bg-slate-300 dark:bg-slate-700"
                                                }`}
                                            >
                                                <motion.div
                                                    className="absolute top-0.5 h-3 w-4 rounded-full bg-white shadow-md"
                                                    animate={{
                                                        x: placementMode === "anywhere" ? 26 : 2,
                                                    }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 500,
                                                        damping: 30,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </button>
                                </section>
                            </aside>

                            <section className={`flex min-h-[600px] flex-col overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl`}>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between relative p-5">
                                    <div>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            Click a tab to select. Drag it along its edge to reposition it before applying.
                                        </p>
                                    </div>
                                </div>

                                <div className="relative mt-5 p-14 bg-slate-950 shadow-inner shadow-slate-950/50">

                                    <EdgeAddButton side="top" onClick={handleAddTab} className="left-1/2 top-3 -translate-x-1/2" />
                                    <EdgeAddButton side="bottom" onClick={handleAddTab} className="bottom-3 left-1/2 -translate-x-1/2" />
                                    <EdgeAddButton side="left" onClick={handleAddTab} className="left-3 top-1/2 -translate-y-1/2" />
                                    <EdgeAddButton side="right" onClick={handleAddTab} className="right-3 top-1/2 -translate-y-1/2" />

                                    <canvas
                                        ref={canvasRef}
                                        width={PREVIEW_WIDTH}
                                        height={PREVIEW_HEIGHT}
                                        className="relative z-10 max-h-[62vh] w-full rounded-[20px]  border-slate-700/70 bg-slate-950 object-contain shadow-[0_20px_60px_rgba(2,6,23,0.45)]"
                                        onMouseDown={handlePointerDown}
                                        onMouseMove={handlePointerMove}
                                        onMouseUp={handlePointerUp}
                                        onMouseLeave={handlePointerLeave}
                                    />
                                </div>
                            </section>

                            <aside className="flex flex-col gap-4 xl:min-h-[600px]">
                                <section className={`${panelClassName} flex flex-col justify-between p-0`}>

                                    {activeTab ? (
                                        <div className="rounded-2xl bg-slate-100/90 p-4 dark:bg-slate-950/50 h-full">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        {activeTab.side === "free" ? "Independent Tab" : sideOptions.find((side) => side.id === activeTab.side)?.label}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={handleRemoveSelected}
                                                    className="rounded-lg border border-red-200 bg-red-400 px-1 py-1 text-sm font-medium text-white transition hover:bg-red-200 hover:text-red-500 dark:border-red-500/30 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-500/10 dark:hover:text-red-600"
                                                >
                                                    <TrashIcon className="size-4"/>
                                                </button>
                                            </div>

                                            {activeTab.side === "free" ? (
                                                <>
                                                    <div className="mt-4 flex items-center justify-between gap-3">

                                                        <div className="relative grid w-full grid-cols-2 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                                                            <motion.div
                                                                className="absolute inset-y-0 w-1/2 rounded-2xl bg-teal-500 shadow-sm dark:bg-teal-500/20"
                                                                animate={{ x: (activeTab.orientation ?? "horizontal") === "vertical" ? "100%" : "0%" }}
                                                                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setTabs((prev) => prev.map((tab) => (
                                                                        tab.id === activeTab.id
                                                                            ? { ...tab, orientation: "horizontal" }
                                                                            : tab
                                                                    )));
                                                                }}
                                                                className={`relative z-10 rounded-xl px-3 py-1 text-xs font-semibold transition ${
                                                                    (activeTab.orientation ?? "horizontal") === "horizontal"
                                                                        ? "text-white dark:text-teal-100"
                                                                        : "text-slate-500 dark:text-slate-400"
                                                                }`}
                                                            >
                                                                Horizontal
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setTabs((prev) => prev.map((tab) => (
                                                                        tab.id === activeTab.id
                                                                            ? { ...tab, orientation: "vertical" }
                                                                            : tab
                                                                    )));
                                                                }}
                                                                className={`relative z-10 rounded-xl px-3 py-1 text-xs font-semibold transition ${
                                                                    (activeTab.orientation ?? "horizontal") === "vertical"
                                                                        ? "text-white dark:text-teal-100"
                                                                        : "text-slate-500 dark:text-slate-400"
                                                                }`}
                                                            >
                                                                Vertical
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <label className="mt-5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                                                        <div className="flex justify-between">
                                                            <span>X Position</span>
                                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                {(((activeTab.x ?? 0.5) * 100)).toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="1"
                                                            step="0.001"
                                                            value={activeTab.x ?? 0.5}
                                                            onChange={(event) => {
                                                                const nextX = Number(event.target.value);
                                                                setTabs((prev) => prev.map((tab) => tab.id === activeTab.id ? { ...tab, x: nextX } : tab));
                                                            }}
                                                            className={sliderClassName}
                                                        />
                                                    </label>

                                                    <label className="mt-4 block text-xs font-medium text-slate-600 dark:text-slate-300">
                                                        <div className="flex justify-between">
                                                            <span>Y Position</span>
                                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                {(((activeTab.y ?? 0.5) * 100)).toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="1"
                                                            step="0.001"
                                                            value={activeTab.y ?? 0.5}
                                                            onChange={(event) => {
                                                                const nextY = Number(event.target.value);
                                                                setTabs((prev) => prev.map((tab) => tab.id === activeTab.id ? { ...tab, y: nextY } : tab));
                                                            }}
                                                            className={sliderClassName}
                                                        />
                                                    </label>
                                                </>
                                            ) : (
                                                <label className="mt-4 block text-xs font-medium text-slate-600 dark:text-slate-300">
                                                    <div className="flex justify-between">
                                                        <span>Position</span>
                                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                            {(activeTab.offset * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="1"
                                                        step="0.001"
                                                        value={activeTab.offset}
                                                        onChange={(event) => {
                                                            const nextOffset = Number(event.target.value);
                                                            setTabs((prev) => prev.map((tab) => tab.id === activeTab.id ? { ...tab, offset: nextOffset } : tab));
                                                        }}
                                                        className={sliderClassName}
                                                    />
                                                </label>
                                            )}

                                            <label className="mt-4 block text-xs font-medium text-slate-600 dark:text-slate-300">
                                                <div className="flex justify-between">
                                                    <span>Depth</span>
                                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                        {((activeTab.depthMm ?? tabDepth)).toFixed(1)} mm
                                                    </span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0.8"
                                                    max="16"
                                                    step="0.1"
                                                    value={activeTab.depthMm ?? tabDepth}
                                                    onChange={(event) => {
                                                        const nextDepth = Math.max(Number(event.target.value) || 0, 0.8);
                                                        setTabs((prev) => prev.map((tab) => tab.id === activeTab.id ? { ...tab, depthMm: nextDepth } : tab));
                                                    }}
                                                    className={sliderClassName}
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl h-full flex items-center text-center  border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                                            Select a tab from the preview to edit its position here.
                                        </div>
                                    )}

                                    {/* <div className="flex flex-col items-start justify-between gap-1 mt-5">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Tab Geometry</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Shared width for tabs in this outline</p>
                                    </div> */}

                                    <div className="mt-3 rounded-2xl bg-slate-100/80 p-4  dark:bg-slate-950/50">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-xs font-medium text-slate-700 dark:text-slate-100">Tab Width</p>
                                            </div>
                                            <div className="rounded-2xl flex items-end bg-slate-50  text-right dark:border-slate-700 dark:bg-slate-900">
                                                <p className="text-xs font-semibold text-slate-900 dark:text-white">{tabWidth.toFixed(1)}</p>
                                                <p className="ml-0.5 text-[10px] text-slate-500 dark:text-slate-400">mm</p>
                                            </div>
                                        </div>
                                        <input
                                            type="range"
                                            min="0.8"
                                            max="8"
                                            step="0.1"
                                            value={tabWidth}
                                            onChange={(event) => setTabWidth(Math.max(Number(event.target.value) || 0, 0.8))}
                                            className={sliderClassName}
                                        />
                                    </div>
                                </section>

                                <section className={`${panelClassName} flex flex-col justify-between !h-fit`}>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Defaults</p>
                                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                            Save this setup so future outline images open with the same geometry and placement defaults.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => onSavePreset({ tabWidthMm: tabWidth, tabDepthMm: tabDepth, tabs })}
                                        className="mt-4 w-full rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-700 transition hover:bg-cyan-100 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200 dark:hover:bg-cyan-500/20"
                                    >
                                        Save As Default
                                    </button>
                                </section>
                            </aside>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80 md:px-5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">

                            <div className="flex flex-wrap items-center justify-end gap-2">
                                {png?.hasTabs && (
                                    <button
                                        onClick={onRemove}
                                        className="rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-500/10"
                                    >
                                        Remove All Tabs
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => onApply({ tabWidthMm: tabWidth, tabDepthMm: tabDepth, tabs })}
                                    className="rounded-2xl bg-gradient-to-r from-[#D3346E] to-[#B81D50] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:brightness-105"
                                >
                                    Apply Tabs
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

function EdgeAddButton({ side, className, onClick }) {
    const label = sideOptions.find((item) => item.id === side)?.shortLabel ?? side;

    return (
        <button
            onClick={() => onClick(side)}
            className={`absolute z-20 flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/60 bg-slate-950/90 text-lg font-medium text-cyan-200 shadow-lg shadow-cyan-950/20 transition hover:scale-105 hover:border-cyan-200 hover:bg-cyan-500 hover:text-white ${className}`}
            aria-label={`Add tab to ${label.toLowerCase()} edge`}
            title={`Add tab to ${label.toLowerCase()} edge`}
        >
            +
        </button>
    );
}

EdgeAddButton.propTypes = {
    side: PropTypes.string.isRequired,
    className: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
};

function findTabAtPoint({ point, renderModel, tabs, tabWidth, tabDepth, outlineToolWidth }) {
    const localX = point.x - renderModel.offsetX;
    const localY = point.y - renderModel.offsetY;

    return tabs.find((tab) => {
        const rect = getPreviewRect({
            tab,
            drawWidth: renderModel.drawWidth,
            drawHeight: renderModel.drawHeight,
            tabWidthMm: tabWidth,
            tabDepthMm: tab.depthMm ?? tabDepth,
            outlineToolWidth,
            scale: renderModel.scale,
        });

        return (
            localX >= rect.x &&
            localX <= rect.x + rect.width &&
            localY >= rect.y &&
            localY <= rect.y + rect.height
        );
    });
}

function createTabFromPoint({ point, renderModel, fallbackDepthMm }) {
    const localX = clamp(point.x - renderModel.offsetX, 0, renderModel.drawWidth);
    const localY = clamp(point.y - renderModel.offsetY, 0, renderModel.drawHeight);

    return {
        id: `free-${Date.now()}`,
        side: "free",
        x: clamp(localX / renderModel.drawWidth, 0, 1),
        y: clamp(localY / renderModel.drawHeight, 0, 1),
        orientation: "horizontal",
        depthMm: fallbackDepthMm,
    };
}

function getCanvasPoint(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: ((event.clientX - rect.left) / rect.width) * canvas.width,
        y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
}

function getPreviewRect({ tab, drawWidth, drawHeight, tabWidthMm, tabDepthMm, outlineToolWidth, scale }) {
    const correctedToolWidth = Math.max(parseFloat(outlineToolWidth) || 0, 0) + 0.02;
    const pxPerMm = (1000 / 25.4) * scale;
    const tabWidthPx = Math.max(tabWidthMm, correctedToolWidth) * pxPerMm;
    const tabDepthPx = Math.max(tabDepthMm, correctedToolWidth + 0.4) * pxPerMm;
    const paddingPx = 0.82 * pxPerMm;

    if (tab.side === "free") {
        const centerX = (tab.x ?? 0.5) * drawWidth;
        const centerY = (tab.y ?? 0.5) * drawHeight;
        const isVertical = tab.orientation === "vertical";
        const width = isVertical ? tabWidthPx : tabDepthPx;
        const height = isVertical ? tabDepthPx : tabWidthPx;

        return {
            x: Math.max(0, Math.min(centerX - width / 2, drawWidth - width)),
            y: Math.max(0, Math.min(centerY - height / 2, drawHeight - height)),
            width,
            height,
        };
    }

    if (tab.side === "top" || tab.side === "bottom") {
        const centerX = tab.offset * drawWidth;
        return {
            x: Math.max(0, Math.min(centerX - tabWidthPx / 2, drawWidth - tabWidthPx)),
            y: tab.side === "top" ? 0 : drawHeight - (paddingPx + tabDepthPx),
            width: tabWidthPx,
            height: paddingPx + tabDepthPx,
        };
    }

    const centerY = tab.offset * drawHeight;
    return {
        x: tab.side === "left" ? 0 : drawWidth - (paddingPx + tabDepthPx),
        y: Math.max(0, Math.min(centerY - tabWidthPx / 2, drawHeight - tabWidthPx)),
        width: paddingPx + tabDepthPx,
        height: tabWidthPx,
    };
}

OutlineTabsModal.propTypes = {
    png: PropTypes.shape({
        url: PropTypes.string.isRequired,
        originalUrl: PropTypes.string,
        hasTabs: PropTypes.bool,
        tabConfig: PropTypes.shape({
            tabWidthMm: PropTypes.number,
            tabDepthMm: PropTypes.number,
            tabs: PropTypes.arrayOf(PropTypes.shape({
                id: PropTypes.string,
                side: PropTypes.string,
                offset: PropTypes.number,
                depthMm: PropTypes.number,
                x: PropTypes.number,
                y: PropTypes.number,
                orientation: PropTypes.oneOf(["horizontal", "vertical"]),
            })),
        }),
    }).isRequired,
    outlineToolWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    preset: PropTypes.shape({
        tabWidthMm: PropTypes.number,
        tabDepthMm: PropTypes.number,
        tabs: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string,
            side: PropTypes.string,
            offset: PropTypes.number,
            depthMm: PropTypes.number,
            x: PropTypes.number,
            y: PropTypes.number,
            orientation: PropTypes.oneOf(["horizontal", "vertical"]),
        })),
    }),
    onClose: PropTypes.func.isRequired,
    onApply: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onSavePreset: PropTypes.func.isRequired,
};

export default OutlineTabsModal;
