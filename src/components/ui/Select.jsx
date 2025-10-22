import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { cn } from "../../utils/cn";
import PropTypes from 'prop-types';

const Select = ({ options, selected, setSelected, variant = "bottom", onSelect, getOptionClass }) => {

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
                            'focus:outline-none focus:ring-1 focus:ring-gray-400'
                        )}
                    >
                        {options.find(option => option.id === selected)?.label || selected}
                        <ChevronDownIcon
                            className="absolute top-1/2 -translate-y-1/2 right-1 size-5 w-fit px-0.5 fill-black bg-[#F0F0F0]"
                            aria-hidden="true"
                        />
                    </ListboxButton>
                    <ListboxOptions
                        transition
                        className={cn(
                            "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none",
                            optionsPosition
                        )} 
                    >
                        { options.map(({id, label}) => (
                            <ListboxOption
                                key={id}
                                value={id}
                                className={cn(
                                    'cursor-pointer select-none px-2 py-1 text-sm flex items-center gap-2',
                                    'data-[focus]:bg-gray-100 data-[focus]:text-black data-[selected]:bg-blue-50',
                                    getOptionClass?.(id)
                                )}
                            >
                                <div className="text-xs/6 ">{label}</div>
                                <CheckIcon className={cn(
                                    "size-2 fill-black visible",
                                    selected === id ? 'visible' : 'invisible'
                                )} />
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </div>
            </Listbox>
        </>
    )
}

Select.propTypes = {
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    selected: PropTypes.string.isRequired,
    setSelected: PropTypes.func.isRequired,
    variant: PropTypes.oneOf(["top", "bottom"]),
    onSelect: PropTypes.func,
    getOptionClass: PropTypes.func
}

export default Select;

