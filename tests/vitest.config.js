import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['**/*.test.js'],
        server: {
            deps: {
                inline: [/@asamuzakjp\/css-color/, /@csstools\/css-calc/]
            }
        }
    },
});
