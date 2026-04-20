const DEFAULT_MODS_URL = 'https://modsproject.org/';
const CUSTOM_JSON_MODS_URL = 'https://modsproject.org';

export const buildCustomProgramUrl = (program) => {
    if (!program) return null;

    if (program.type === 'json') {
        return CUSTOM_JSON_MODS_URL;
    }

    return `${DEFAULT_MODS_URL}?program=${encodeURIComponent(program.value)}`;
};

export const deriveProgramNameFromUrl = (url) => {
    try {
        const parsedUrl = new URL(url);
        const lastSegment = parsedUrl.pathname.split('/').filter(Boolean).pop();
        if (!lastSegment) return '';

        const decodedName = decodeURIComponent(lastSegment);
        return decodedName.replace(/\.[^/.]+$/, '').trim();
    } catch (error) {
        return '';
    }
}; 

export const validateJsonUrl = (url, existingPrograms) => {
    if (!url) return ''

    try {
        const parsedUrl = new URL(url);
        if (!parsedUrl.protocol.startsWith('http')) {
            return 'Enter a valid http or https URL.';
        }

        if (!parsedUrl.pathname.endsWith('.json')) {
            return 'The URL must point directly to a .json file.';
        }

        if (existingPrograms.some((program) => program.type === 'url' && program.value === url)) {
            return 'This Mods URL is already saved.';
        }

        return '';
    } catch (error) {
        return 'Enter a valid URL.';
    }
}

export const getHelperText = (state) => {
    if (state.mode === 'json') {
        if (state.jsonStatus === 'checking') return 'Checking whether this JSON program can boot in Mods and acknowledge a PNG transfer...';
        if (state.jsonStatus === 'valid') return 'JSON file verified. This program responded to the test PNG transfer and is ready to save.';
        return 'Upload a Mods JSON program file and we will verify the actual Mods connection before saving it.';
    }

    if (state.mode === 'url') {
        if (state.urlStatus === 'checking') return 'Checking whether this URL is valid and can boot in Mods...';
        if (state.urlStatus === 'valid') return 'URL verified and ready to save.';
        if (state.urlError) return state.urlError;
        return 'Paste the public URL of your hosted JSON program. We will verify that the file is reachable before saving it.';
    }
}