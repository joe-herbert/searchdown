import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import cssnano from 'cssnano';

export default [
    // ESM build
    {
        input: 'src/searchdown.js',
        output: {
            file: 'dist/searchdown.esm.js',
            format: 'esm',
            sourcemap: true
        },
        plugins: [
            postcss({
                extract: 'searchdown.css',
                minimize: true,
                plugins: [cssnano({ preset: 'default' })]
            })
        ]
    },
    // CommonJS build
    {
        input: 'src/searchdown.js',
        output: {
            file: 'dist/searchdown.cjs.js',
            format: 'cjs',
            sourcemap: true,
            exports: 'named'
        },
        plugins: [
            postcss({ inject: false }) // Don't extract again, just handle the import
        ]
    },
    // UMD build (for browsers)
    {
        input: 'src/searchdown.js',
        output: {
            file: 'dist/searchdown.umd.js',
            format: 'umd',
            name: 'Searchdown',
            sourcemap: true,
            exports: 'named'
        },
        plugins: [
            postcss({ inject: false }),
            terser()
        ]
    }
];