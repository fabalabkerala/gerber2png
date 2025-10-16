import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { cn } from "../../utils/cn";
import PropTypes from 'prop-types';

const Select = ({options, selected, setSelected }) => {

    return (
        <>
            <Listbox value={selected} onChange={setSelected}>
                <div className="relative w-full">
                    <ListboxButton
                        className={cn(                    
                            'relative block w-full rounded pl-2 text-left text-xs border py-1',
                            'focus:outline-none focus:ring-1 focus:ring-gray-400'
                        )}
                    >
                        { selected }
                        <ChevronDownIcon
                            className="absolute top-1/2 -translate-y-1/2 right-1 size-5 w-fit px-0.5 fill-black bg-[#F0F0F0]"
                            aria-hidden="true"
                        />
                    </ListboxButton>
                    <ListboxOptions
                        className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"  
                    >
                        { options.map((value, id) => (
                            <ListboxOption
                                key={id}
                                value={value}
                                className={cn(
                                    'cursor-pointer select-none px-2 py-1 text-sm flex items-center gap-2',
                                    'data-[focus]:bg-gray-100 data-[focus]:text-black data-[selected]:bg-blue-50'
                                )}
                            >
                                <CheckIcon className={cn(
                                    "size-4 fill-black visible",
                                    selected === value ? 'visible' : 'invisible'
                                )} />
                                <div className="text-sm/6 ">{value}</div>
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
    setSelected: PropTypes.func.isRequired
}

export default Select;

