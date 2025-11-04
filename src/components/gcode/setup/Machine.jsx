import { PhotoIcon } from "@heroicons/react/24/outline";
import { useApp } from "../../context/AppContext"
import ImageSelect from "../../ui/ImageSelect"

const options = [
    {
        machine: 'carvera',
        image: 'https://www.makera.com/cdn/shop/files/Makera_Carvera_1.jpg',
        width: 300,
        height: 250
    },
    {
        machine: 'Roland MDX-20',
        image: 'https://image.rolanddga.com/-/media/roland/images/support/product_shots/mdx20.jpg',
        width: 300,
        height: 300
    },
    {
        machine: 'LPKF ProtoMat',
        image: 'https://www.lpkfusa.com/fileadmin/mediafiles/_processed_/c/5/csm_Produkt_ProtoMat_S104_schraeg_e9179d0b21.png',
        width: 300,
        height: 250
    }, 
]

const Machine = () => {
    const { machineConf, setMachineConf } = useApp();

    const machineOptions = options.map(item => ({ name: item.machine, url: item.image, ...item }));

    return (
        <>
            <div className="flex gap-3 px-6 py-3">
                <div className="flex flex-col gap-3 w-full">
                    <div className="py-1">
                        <div className="w-1/3">
                            <p className="text-xs px-1 py-1 text-gray-700">Choose Machine</p>
                            <ImageSelect
                                options={machineOptions}
                                selected={machineConf}
                                setSelected={setMachineConf}
                            />
                        </div>
                    </div>
                    <div className="py-2 flex gap-4 justify-center items-center">
                        <div className="w-1/3 h-36 p-3 flex flex-col items-center justify-center">
                            { machineConf.url ? (
                                <>
                                    <img src={machineConf.url} alt="dsdfsd" className="h-full object-contain" />
                                </>
                            ): (
                                <>
                                    <PhotoIcon width={20} height={20} strokeWidth={2} stroke="gray" />
                                    <p className="text-xs font-medium">No Preview Available</p>
                                </>
                            )}
                        </div>
                        <div className="w-2/3 h-full px-4 py-3 bg-zinc-50 rounded">
                            <p className="text-sm border- pb-0.5 font-medium">Bedsize<span className="text-[10px] text-gray-600 font-normal"></span></p>
                            <div className="flex flex-col gap-2 justify-between rounded mt-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs w-20 text-black">Width</label>
                                    <p className="px-4 py-1 border-b text-xs font-medium">{ machineConf.width } <span className="font-normal text-gray-500 text-[10px]">mm</span></p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs w-20 text-black">Height</label>
                                    <p className="px-4 py-1 border-b text-xs font-medium">{ machineConf.height } <span className="font-normal text-gray-500 text-[10px]">mm</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Machine;