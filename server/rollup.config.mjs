import json from '@rollup/plugin-json'
import rpt from '@rollup/plugin-typescript'
import builtinModules from 'builtin-modules'
import fs from 'fs'
import path from 'path'
import tsp_compiler from 'ts-patch/compiler/typescript.js'

export function read_json_file_sync(path) {
    if (fs.existsSync(path)) {
        const json_file = (fs.readFileSync(path, 'utf-8') || '').trim()
        if (json_file) {
            try {
                return JSON.parse(json_file)
            } catch (e) {
                console.log(e.message)
            }
        }
    }
}

export function gen_external(external) {
    const pkg = read_json_file_sync('./package.json')
    return [
        ...builtinModules,
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
        ...(external ?? []),
    ]
}

export default [
    {
        input: './src/index.ts',
        output: [
            { file: path.join('./lib', 'index.js'), format: 'cjs', interop: 'auto' },
            { file: path.join('./lib', 'index.mjs'), format: 'es', interop: 'auto' },
        ],
        plugins: [
            json(),
            rpt({ rootDir: '../', declaration: true, removeComments: true, paths: { 'plank-types': ['../types'] }, typescript: tsp_compiler }),
        ],
        external: gen_external()
    },
]
