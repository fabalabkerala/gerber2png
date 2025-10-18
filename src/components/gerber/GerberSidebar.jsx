import { cn } from "../../utils/cn";
import { useGerber } from "../context/GerberContext";
import GerberOptions from "./GerberOptions";
import LayerControls from "./LayerControls";
import OuterSettings from "./OuterSettings";

export default function GerberSidebar() {
    const { mainSvg } = useGerber()
    return (
        <>
            <div className={cn("flex flex-col gap-4 transition-all duration-300", !mainSvg.svg ? "pointer-events-none opacity-50" : "" )}>
                <GerberOptions />
                <LayerControls />
                <OuterSettings />
            </div>
        </>
    )
}