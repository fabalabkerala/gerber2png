const DEFAULT_MODS_ORIGIN = 'https://modsproject.org';
const DEFAULT_MODS_URL = 'https://modsproject.org/';

const createHiddenModsFrame = (src = DEFAULT_MODS_URL) => {
    const iframe = document.createElement('iframe');
    iframe.src = src;

    iframe.setAttribute('aria-hidden', 'true');
    iframe.tabIndex = -1;
    iframe.className = 'pointer-events-none fixed left-[-9999px] top-[-9999px] h-0 w-0 border-0 opacity-0';

    return new Promise((resolve) => {
        iframe.onload = () => resolve(iframe);
        document.body.appendChild(iframe);
    });
};

const waitForModsReady = ({ origin, timeoutMs = 15000 }) => (
    new Promise((resolve, reject) => {
        let timeoutId;

        const cleanup = () => {
            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }
            window.removeEventListener('message', handleReady);
        };

        const handleReady = (event) => {
            if (event.origin !== origin) return;
            if (event.data !== 'ready') return;

            cleanup();
            resolve();
        };

        timeoutId = window.setTimeout(() => {
            cleanup();
            reject(new Error('Timed out waiting for a ready response from Mods.'));
        }, timeoutMs);

        window.addEventListener('message', handleReady);
    })
);

const sendPayloadUntilReady = async ({ targetWindow, origin, payload, timeoutMs = 15000 }) => {
    if (!targetWindow) {
        throw new Error('Mods validation target is not available.');
    }

    const readyPromise = waitForModsReady({ origin, timeoutMs });

    console.log('Sending payload to Mods validation frame and waiting for ready response...', payload, { origin, targetWindow });
    targetWindow.postMessage(payload, origin);

    const resendInterval = window.setInterval(() => {
        if (!targetWindow) {
            window.clearInterval(resendInterval);
            return;
        }

        targetWindow.postMessage(payload, origin);
    }, 600);

    try {
        await readyPromise;
    } finally {
        window.clearInterval(resendInterval);
    }
};


const useModsValidator = () => {

    const verifyRemoteFile = async (url, signal, image) => {
        const request = async (method) => fetch(url, {
            method,
            signal,
            headers: method === 'GET' ? { Range: 'bytes=0-0' } : undefined,
        });

        const testMods = async () => {
            const targetUrl = `${DEFAULT_MODS_URL}/?program=${encodeURIComponent(url)}`;
            const modsFrame = await createHiddenModsFrame(targetUrl);

            try {
                const targetWindow = modsFrame.contentWindow;
                if (!targetWindow) throw new Error('Mods validation target window is not available.');
                
                await sendPayloadUntilReady({
                    targetWindow: modsFrame.contentWindow,
                    origin: DEFAULT_MODS_ORIGIN,
                    payload: { type: 'png', data: image },
                })

                return { ok: true };
            } catch (error) {
                return {
                    ok: false,
                    message: 'Mods validation failed. Program did not respond to PNG transfer.',
                };
            } finally {
                setTimeout(() => modsFrame.remove(), 150);
            }
        }

        try {

            const headResponse = await request('HEAD');
            if (headResponse.ok) {
                const result = await testMods();
                return result;
            }

            if (![403, 405, 501].includes(headResponse.status)) {
                return { ok: false, message: `The file could not be reached (${headResponse.status}).` };
            }

        } catch (error) {
            if (error.name === 'AbortError') throw error;
        }

        try {
            const getResponse = await request('GET');
            if (getResponse.ok) {
                const result = await testMods();
                return result;
            }
            return { ok: false, message: `The file could not be reached (${getResponse.status}).` };
        } catch (error) {
            if (error.name === 'AbortError') throw error;
            return {
                ok: false,
                message: 'The browser could not verify this file. Make sure the link is public and allows direct access.',
            };
        }
    };

    const validateCustomProgram = async (file, pngFile) => {
        const text = await file.text();
        const parsedProgram = JSON.parse(text);

        if (!pngFile?.url) {
            return {
                ok: false,
                message: 'Select a PNG preview first so we can verify the custom program with a real transfer.',
            };
        }

        const modsFrame = await createHiddenModsFrame();

        try {
            const pngBuffer = await fetch(pngFile.url).then((res) => res.arrayBuffer());
            const targetWindow = modsFrame.contentWindow;
            if (!targetWindow) {
                throw new Error('Unable to create the hidden Mods validation frame.');
            }

            console.log('Waiting for Mods to be ready for custom program validation...', { parsedProgram, pngFile, modsFrame, targetWindow });
            await sendPayloadUntilReady({
                targetWindow,
                origin: DEFAULT_MODS_ORIGIN,
                payload: {
                    type: 'program',
                    data: parsedProgram,
                    name: 'Validation Program',
                },
            });

            await sendPayloadUntilReady({
                targetWindow,
                origin: DEFAULT_MODS_ORIGIN,
                payload: {
                    type: 'png',
                    data: pngBuffer,
                },
            });

            return { ok: true };
        } catch (error) {
            console.error('Error occurred while validating custom program:', error);
            return {
                ok: false,
                message: 'This JSON program did not acknowledge the PNG transfer, so it likely does not expose the required Mods postMessage flow.',
            };
        } finally {
            window.setTimeout(() => {
                modsFrame.remove();
            }, 150);
        }
    };

    return {
        verifyRemoteFile,
        validateCustomProgram,
    };
};

export default useModsValidator;