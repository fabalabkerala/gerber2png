import { useReducer, useEffect } from "react";
import { deriveProgramNameFromUrl, validateJsonUrl } from "../utils/modsProgramUtils";

const initialState = {
    mode: "url",
    name: "",
    url: "",
    urlStatus: "idle",
    urlError: "",

    jsonName: "",
    jsonContent: "",
    jsonStatus: "idle",
    jsonError: "",

    isNameEdited: false,
};

function reducer(state, action) {
    switch (action.type) {
        case "SET_MODE":
            return { ...state, mode: action.value };
        
        case 'SET_URL':
            return { ...state, url: action.value, urlStatus: 'idle', urlError: '' };
        
        case 'URL_CHECK_START':
            return { ...state, urlStatus: 'checking', urlError: '' };
        
        case 'URL_CHECK_SUCCESS':
            return { ...state, urlStatus: 'valid', urlError: '' };
        
        case 'URL_CHECK_FAIL':
            return { ...state, urlStatus: 'invalid', urlError: action.error };
        
        case 'SET_NAME':
            return { ...state, name: action.value, isNameEdited: true };
        
        case 'AUTO_SET_NAME':
            if (state.isNameEdited) return state;
            return { ...state, name: action.value };

        case 'JSON_CHECK_START':
            return { ...state, mode: 'json', jsonStatus: 'checking', jsonError: '' };
        
        case 'JSON_SUCCESS':
            return { ...state, jsonStatus: 'valid', jsonError: '', jsonName: action.name, jsonContent: action.content };
        
        case 'JSON_FAIL':
            return { ...state, jsonStatus: 'invalid', jsonError: action.error };
        
        case 'RESET':
            return initialState;
        
        default:
            return state;  
    }
}

export default function useCustomProgramForm({ 
    verifyRemoteFile, 
    validateCustomProgram, 
    selectedPng, 
    customPrograms 
}) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const trimmedUrl = state.url.trim();
    const derivedName = state.mode === 'json' ? state.jsonName.replace(/\.[^/.]+$/, '').trim() : deriveProgramNameFromUrl(trimmedUrl);
    const finalName = state.name.trim() || derivedName || 'Custom Program';

    const urlError = validateJsonUrl(trimmedUrl, customPrograms);

    useEffect(() => {
        if (state.mode !== 'url') return
        if (!trimmedUrl || urlError) return;

        let isActive = true;
        const controller = new AbortController();

        const run = async () => {
            dispatch({ type: 'URL_CHECK_START' });

            try {
                const result = await verifyRemoteFile(trimmedUrl, controller.signal, selectedPng);
                if (!isActive) return;

                if (result.ok) {
                    dispatch({ type: 'URL_CHECK_SUCCESS' });
                } else {
                    dispatch({ type: 'URL_CHECK_FAIL', error: result.message });
                }

            } catch (error) {
                if (!isActive || error.name === 'AbortError') return;
                dispatch({ type: 'URL_CHECK_FAIL', error: 'An error occurred while checking the URL.' });
            }
        }

        const timeout = setTimeout(run, 500);
        
        return () => {
            isActive = false;
            controller.abort();
            clearTimeout(timeout);
        };
    }, [trimmedUrl, state.mode])

    useEffect(() => {
        if (!derivedName) return;
        dispatch({ type: 'AUTO_SET_NAME', value: derivedName });
    }, [derivedName])

    const isReady = state.mode === 'json' ? state.jsonStatus === 'valid' && !!state.jsonContent : state.urlStatus === 'valid' && !urlError && trimmedUrl;

    const handleJsonUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            dispatch({ type: 'RESET' });
            dispatch({ type: 'JSON_CHECK_START' });
            const validationResult = await validateCustomProgram(file, selectedPng);

            if (!validationResult.ok) {
                dispatch({ type: 'JSON_FAIL', error: validationResult.message });
                return;
            }

            const text = await file.text();
            dispatch({ type: 'JSON_SUCCESS', name: file.name, content: text });

            if (!state.name.trim()) {
                dispatch({ type: 'AUTO_SET_NAME', value: file.name.replace(/\.[^/.]+$/, '').trim() });
            }
        } catch (error) {
            console.error('Error validating custom JSON program:', error);
            dispatch({ type: 'JSON_FAIL', error: 'An error occurred while validating the JSON file.' });
        } finally {
            event.target.value = '';
        }
    };

    return { 
        state, 
        dispatch,
        derived: { name: finalName, url: trimmedUrl },
        isReady,
        handleJsonUpload
    };
}