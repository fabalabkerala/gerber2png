import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRightEndOnRectangleIcon,
  FolderArrowDownIcon,
  Squares2X2Icon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import PngCard from "../ui/PngCard";
import { useState } from "react";
import JSZip from "jszip";
import ImageIcon from "../icons/ImageIcon";
import BulkLayoutPanel from "./multiLayout/Panel";
import { useApp } from "../context/AppContext";
import ModsPanel from "./modsPanel/Panel";

const OutputPanel = () => {
  const { pngFiles, setPngFiles } = useApp();

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showModsPanel, setShowModsPanel] = useState(false);
  const [selectedPng, setSelectedPng] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const hasFiles = pngFiles.length > 0;

  const handleDeleteAll = () => {
    pngFiles.forEach((item) => URL.revokeObjectURL(item.url));
    setPngFiles([]);
    setShowDeleteConfirm(false);
  };

  const downloadZip = () => {
    if (!hasFiles) return;

    const zip = new JSZip();
    Promise.all(
      pngFiles.map((pngBlob, index) => {
        return fetch(pngBlob.url)
          .then((res) => res.blob())
          .then((blob) => {
            zip.file(`${pngBlob.name}_${index}.png`, blob);
          });
      })
    ).then(() => {
      zip.generateAsync({ type: "blob" }).then((zipBlob) => {
        const url = window.URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `gerber_files_${pngFiles.length}.zip`;
        link.click();
      });
    });
  };

  return (
    <>
      {/* MAIN PANEL */}
      <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden">

        {/* HEADER */}
        <div className="px-3 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="flex flex-col">
                    {pngFiles.length > 0 ? (
                    <>
                        {/* READY STATE */}
                        <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <p className="text-xs font-semibold text-gray-700">
                            Ready for Mods
                        </p>
                        </div>

                        <p className="text-[10px] text-gray-500 ml-3">
                        {pngFiles.length} output
                        {pngFiles.length !== 1 && "s"} generated
                        </p>
                    </>
                    ) : (
                    <>
                        {/* EMPTY STATE */}
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            <p className="text-xs font-semibold text-gray-500">
                                No outputs yet
                            </p>
                        </div>

                        <p className="text-[10px] text-gray-400 ml-3">
                            Generate PNG to continue
                        </p>
                    </>
                    )}
                </div>
            </div>
            <motion.button
                whileTap={{ scale: hasFiles ? 0.95 : 1 }}
                whileHover={hasFiles ? { y: -1 } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                disabled={!hasFiles || isExporting}
                onClick={() => {
                setIsExporting(true);
                setTimeout(() => {
                    setSelectedPng(pngFiles[0]);
                    setShowModsPanel(true);
                    setIsExporting(false);
                }, 200);
                }}
                className={`
                flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition
                ${
                    hasFiles
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm hover:opacity-95"
                    : "bg-slate-100 text-gray-400 cursor-not-allowed"
                }
                `}
            >
                {isExporting ? "Opening..." : "Open Mods"}
                <ArrowRightEndOnRectangleIcon width={14} />
            </motion.button>
        </div>

        {/* ACTION STRIP */}
        <div className="px-3 py-2 bg-slate-50">
          <div className="flex items-center justify-between bg-white rounded-xl px-1 py-1 shadow-sm">

            {/* LEFT */}
            <div className="flex items-center gap-1">
              <motion.button
                whileTap={{ scale: hasFiles ? 0.96 : 1 }}
                disabled={!hasFiles}
                onClick={() => setShowBulkModal(true)}
                className={`
                  flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-lg transition
                  ${
                    hasFiles
                      ? "text-gray-700 hover:bg-slate-100"
                      : "text-gray-400 cursor-not-allowed"
                  }
                `}
              >
                <Squares2X2Icon width={14} />
                Layout
              </motion.button>

              <motion.button
                whileTap={{ scale: hasFiles ? 0.96 : 1 }}
                disabled={!hasFiles}
                onClick={downloadZip}
                className={`
                  flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-lg transition
                  ${
                    hasFiles
                      ? "text-gray-700 hover:bg-slate-100"
                      : "text-gray-400 cursor-not-allowed"
                  }
                `}
              >
                <FolderArrowDownIcon width={14} />
                Download All
              </motion.button>
            </div>

            {/* DELETE */}
            <motion.button
              whileTap={{ scale: hasFiles ? 0.96 : 1 }}
              disabled={!hasFiles}
              onClick={() => setShowDeleteConfirm(true)}
              className={`
                p-2 rounded-lg transition
                ${
                  hasFiles
                    ? "text-red-500 hover:bg-red-50"
                    : "text-gray-400 cursor-not-allowed"
                }
              `}
            >
              <TrashIcon width={14} />
            </motion.button>

          </div>
        </div>

        {/* FILE LIST */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 space-y-2">
          <AnimatePresence>
            {hasFiles ? (
              pngFiles
                .slice()
                .reverse()
                .map((item, index) => (
                  <motion.div
                    key={item.url}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{
                      duration: 0.18,
                      delay: index * 0.04,
                    }}
                    whileHover={{ y: -1 }}
                    className="rounded-xl transition"
                  >
                    <PngCard
                      blobUrl={item.url}
                      name={`${item.name}_1000dpi.png`}
                      handleDelete={() => {
                        setPngFiles((prev) => {
                          const updated = [...prev];
                          updated.splice(
                            pngFiles.length - 1 - index,
                            1
                          );
                          return updated;
                        });
                        URL.revokeObjectURL(item.url);
                      }}
                      handleMods={() => {
                        setSelectedPng(item);
                        setShowModsPanel(true);
                      }}
                    />
                  </motion.div>
                ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center gap-3"
              >
                <ImageIcon width={34} height={34} stroke="#9CA3AF" />
                <p className="text-sm text-gray-600">
                  No outputs generated
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="bg-white rounded-xl p-5 w-[300px] space-y-4 shadow-xl"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-800">
                  Delete all outputs?
                </p>
                <p className="text-xs text-gray-500">
                  This will permanently remove{" "}
                  <span className="font-medium text-gray-700">
                    {pngFiles.length} PNG file
                    {pngFiles.length !== 1 && "s"}
                  </span>{" "}
                  from this session.
                </p>
              </div>

              <div className="text-[11px] text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                This action cannot be undone.
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="px-3 py-1.5 text-xs rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
                >
                  Delete All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PANELS */}
      <BulkLayoutPanel
        showBulkModal={showBulkModal}
        setShowBulkModal={setShowBulkModal}
      />

      <ModsPanel
        showModsPanel={showModsPanel}
        setShowModsPanel={setShowModsPanel}
        selectedPng={selectedPng}
      />
    </>
  );
};

export default OutputPanel;