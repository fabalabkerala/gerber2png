import GerberOptions from "./GerberOptions";
import LayerControls from "./LayerControls";
import OuterSettings from "./OuterSettings";

export default function GerberSidebar() {
    return (
        <>
            <div className="flex flex-col gap-4">
                <GerberOptions />
                <LayerControls />
                <OuterSettings />
            </div>
        </>
    )
}