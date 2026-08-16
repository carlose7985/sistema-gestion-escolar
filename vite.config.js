import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react-oxc';

export default defineConfig({
    plugins: [
        laravel({
            input: "resources/js/app.jsx",
            refresh: true,
        }),
        react(),
    ],
    // Esto ayuda a que Ziggy (las rutas) se integre mejor con el nuevo compilador
    resolve: {
        alias: {
            "ziggy-js": "/node_modules/ziggy-js/dist/index.js",
        },
    },
});
