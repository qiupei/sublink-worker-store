/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */
import { APP_NAME } from '../constants.js';

export const Navbar = ({ activeView = 'home' } = {}) => {
    const navItems = [
        { key: 'home', href: '/', icon: 'fa-house', label: '首页' },
        { key: 'subscriptions', href: '/?view=subscriptions', icon: 'fa-table-cells-large', label: '我的订阅' }
    ];

    return (
        <nav class="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800 z-50 transition-all duration-300">
            <div class="max-w-[1500px] mx-auto px-4">
                <div class="flex items-center justify-between h-16 gap-4">
                    <a href="/" class="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                        <img src="/favicon.ico" alt={`${APP_NAME} logo`} class="w-6 h-6" />
                        <span>{APP_NAME}</span>
                    </a>
                    <div class="hidden sm:inline-flex items-center rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
                        {navItems.map(item => (
                            <a
                                href={item.href}
                                class={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors ${activeView === item.key ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                <i class={`fas ${item.icon} text-xs`}></i>
                                {item.label}
                            </a>
                        ))}
                    </div>
                    <div class="flex items-center gap-3">
                        <a
                            href={activeView === 'subscriptions' ? '/' : '/?view=subscriptions'}
                            class="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                            aria-label={activeView === 'subscriptions' ? '首页' : '我的订阅'}
                        >
                            <i class={`fas ${activeView === 'subscriptions' ? 'fa-house' : 'fa-table-cells-large'}`}></i>
                        </a>
                        <button
                            class="w-10 h-10 rounded-xl text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
                            x-on:click="toggleDarkMode()"
                            aria-label="Toggle dark mode"
                        >
                            <i class="fas text-sm" x-bind:class="darkMode ? 'fa-sun' : 'fa-moon'"></i>
                        </button>
                        <div id="navbar-auth" class="flex items-center"></div>
                    </div>
                </div>
            </div>
        </nav>
    );
};
