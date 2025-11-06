import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { cn } from "../../utils/cn";
import PropTypes from 'prop-types';

const ImageSelect = ({ options, selected, setSelected, variant = "bottom", onSelect, getOptionClass }) => {

    const optionsPosition = variant === "top" ?  "mb-1 bottom-full origin-bottom" :  "mt-1 top-full origin-top";

    const handleSelect = (value) => {
        setSelected(value)
        onSelect?.(value)
    }
    
    return (
        <>
            <Listbox value={selected} onChange={handleSelect}>
                <div className="relative w-full">
                    <ListboxButton
                        className={cn(                    
                            'relative block w-full rounded pl-2 text-left text-xs border py-1',
                            'focus:outline-none focus:ring-1 focus:ring-gray-400 capitalize'
                        )}
                    >
                        {options.find(png => png.name === selected.name)?.name || selected}
                        <ChevronDownIcon
                            className="absolute top-1/2 -translate-y-1/2 right-0 size-2 w-fit px-2 py-1 h-full bg-[#F0F0F0]"
                            aria-hidden="true"
                        />
                    </ListboxButton>
                    <ListboxOptions
                        transition
                        className={cn(
                            "absolute z-50 mt-1 max-h-60 w-full overflow-auto custom-scrollbar rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none",
                            optionsPosition
                        )} 
                    >
                        { options.map((option, index) => (
                            <ListboxOption
                                key={index}
                                value={option}
                                className={cn(
                                    'cursor-pointer select-none px-2 py-1 text-sm flex items-center gap-2',
                                    'data-[focus]:bg-gray-100 data-[focus]:text-black data-[selected]:bg-blue-50',
                                    selected.name === option.name ? 'bg-zinc-100' : '',
                                    getOptionClass?.(index)
                                )}
                            >
                                <img className="w-12 object-contain rounded " src={option.url} />
                                <div className="text-xs/6 capitalize">{option.name}</div>
                                <CheckIcon className={cn(
                                    "size-2 fill-black visible",
                                    selected.name === option.name ? 'visible' : 'invisible'
                                )} />
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </div>
            </Listbox>
        </>
    )
}

ImageSelect.propTypes = {
    options: PropTypes.array.isRequired,
    selected: PropTypes.shape({ 
        name: PropTypes.string, 
        url: PropTypes.string 
    }).isRequired,
    setSelected: PropTypes.func.isRequired,
    variant: PropTypes.oneOf(["top", "bottom"]),
    onSelect: PropTypes.func,
    getOptionClass: PropTypes.func
}

export default ImageSelect;

