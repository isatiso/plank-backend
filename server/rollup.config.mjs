import fs from 'fs'
import path from 'path'
import ts from 'typescript'
import json from '@rollup/plugin-json'
import rpt from '@rollup/plugin-typescript'
import ts2 from 'ttypescript'
import process from 'process'
import dts from 'rollup-plugin-dts'
import builtinModules from 'builtin-modules'

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

export function find_tsconfig(dir, config_name) {

    dir = dir ? path.resolve(dir) : process.cwd()
    config_name = config_name ?? 'tsconfig.json'
    const config_path = ts.findConfigFile(dir, ts.sys.fileExists, config_name)
    if (!config_path) {
        throw new Error(`${config_name} not found.`)
    }
    return config_path
}

export function read_tsconfig(dir, config_name) {
    const config_path = find_tsconfig(dir, config_name)
    const { config } = ts.readConfigFile(config_path, ts.sys.readFile)
    return config
}

export function parse_tsconfig(config, dir, config_name) {
    dir = dir ? path.resolve(dir) : process.cwd()
    config = config ?? read_tsconfig(dir, config_name)
    const { options } = ts.parseJsonConfigFileContent(config, ts.sys, dir)
    return options
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
            rpt({ rootDir: './', declaration: true, removeComments: true, paths: {}, typescript: ts2 }),
        ],
        external: gen_external()
    },
    {
        input: './lib/src/index.d.ts',
        output: [
            { file: path.join('./lib', 'index.d.ts'), format: 'es', interop: 'auto' },
        ],
        plugins: [
            dts({
                compilerOptions: {
                    // ...parse_tsconfig(read_tsconfig()),
                    declaration: true,
                    removeComments: true,
                    paths: {},
                }
            }),
            {
                name: 'clean',
                buildEnd(err) {
                    fs.rmSync('./lib/src', { recursive: true })
                }
            }
        ],
        external: gen_external()
    }
]
