import { defineConfig } from 'vitest/config';
import { ejsPrecompile } from './vite-plugin-ejs-precompile.js';

export default defineConfig({
    plugins: [ejsPrecompile()],
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: ['./test/setup.js'],
        include: ['test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['node_modules', 'dist', 'samples'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'test/',
                'dist/',
                'samples/',
                'demo/',
                '**/*.config.js',
                '**/*.d.ts',
            ],
        },
    },
    define: {
        global: 'globalThis',
    },
});
