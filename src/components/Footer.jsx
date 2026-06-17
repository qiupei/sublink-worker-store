/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */
import { APP_NAME, APP_VERSION } from '../constants.js';

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer class="mt-12 py-8 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <div class="container mx-auto px-4">
                <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div class="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-gray-600 dark:text-gray-400 text-center md:text-left">
                        <span class="text-sm">© {currentYear} {APP_NAME}. All rights reserved.</span>
                        <span class="hidden md:inline text-gray-300 dark:text-gray-700">|</span>
                        <span
                            class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 font-mono"
                            title={`Version ${APP_VERSION}`}
                        >
                            v{APP_VERSION}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
