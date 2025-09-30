import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';

export type BeforeInstallPromptEvent = Event & {
        prompt: () => Promise<void>;
        userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const installPrompt = writable<BeforeInstallPromptEvent | null>(null);
const canInstall = derived(installPrompt, ($installPrompt) => Boolean($installPrompt));
const isStandalone = writable(false);

function setInstallPrompt(event: BeforeInstallPromptEvent | null) {
        installPrompt.set(event);
}

function evaluateStandaloneDisplay() {
        if (!browser) return;
        const isStandaloneDisplay = window.matchMedia('(display-mode: standalone)').matches;
        const isIOSStandalone = (navigator as unknown as { standalone?: boolean }).standalone;
        isStandalone.set(Boolean(isStandaloneDisplay || isIOSStandalone));
}

evaluateStandaloneDisplay();

if (browser) {
        window.matchMedia('(display-mode: standalone)').addEventListener('change', evaluateStandaloneDisplay);
}

export { canInstall, installPrompt, isStandalone, setInstallPrompt };
