import { cn } from "../../utils/cn";
import { useGerberView } from "../context/GerberContext";
import GerberOptions from "./GerberOptions";
import LayerControls from "./LayerControls";

export default function GerberSidebar() {
    const { mainSvg } = useGerberView()
    return (
        <>
            <div className={cn("h-full flex flex-col gap-4 transition-all duration-300", !mainSvg.svg ? "pointer-events-none opacity-50" : "" )}>
                <GerberOptions />
                <LayerControls />
            </div>
        </>
    )
}