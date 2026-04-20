import { useEffect, useState } from "react";

const CUSTOM_PROGRAM_CREATE_ID = 'custom-program-create';
const CUSTOM_PROGRAM_STORAGE_KEY = 'modsCustomPrograms';
const PREFERRED_MACHINE_STORAGE_KEY = 'modsPreferredMachine';

const useCustomPrograms = (defaultMachine = null) => {
    const [ programs, setPrograms ] = useState([]);
    const [ preferredMachine, setPreferredMachine ] = useState(defaultMachine);

    useEffect(() => {
        const storedPrograms = localStorage.getItem(CUSTOM_PROGRAM_STORAGE_KEY);
        const storedMachine = localStorage.getItem(PREFERRED_MACHINE_STORAGE_KEY);

        if (storedPrograms) {
            try {
                const parsedPrograms = JSON.parse(storedPrograms);
                setPrograms(Array.isArray(parsedPrograms) ? parsedPrograms : []);
            } catch (error) {
                console.error('Failed to parse stored custom programs:', error);
            }
        }
        if (storedMachine) {
            try {
                const parsedMachine = JSON.parse(storedMachine);
                setPreferredMachine(parsedMachine);
            } catch (error) {
                console.error('Failed to parse stored preferred machine:', error);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(CUSTOM_PROGRAM_STORAGE_KEY, JSON.stringify(programs));
    }, [programs]);

    useEffect(() => {
        if (!preferredMachine || preferredMachine === CUSTOM_PROGRAM_CREATE_ID) return;
        localStorage.setItem(PREFERRED_MACHINE_STORAGE_KEY, JSON.stringify(preferredMachine));
    }, [preferredMachine]);

    const addCustomProgram = (type, label, value) => {
        const program = {
            id: `custom-program-${Date.now()}`, 
            type,
            label,
            value,
        }
        
        setPrograms(prevPrograms => [...prevPrograms, program]);
        setPreferredMachine(program.id);
    }

    const removeCustomProgram = (id) => {
        setPrograms(prevPrograms => prevPrograms.filter(program => program.id !== id));

        if (preferredMachine === id) {
            setPreferredMachine(defaultMachine);
        }
    }
    return { programs, preferredMachine, setPreferredMachine, addCustomProgram, removeCustomProgram };
}

export default useCustomPrograms;