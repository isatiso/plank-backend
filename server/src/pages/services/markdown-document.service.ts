import { TpService } from '@tarpit/core'
import { throw_not_found } from '@tarpit/http'
import fs from 'fs'
import path from 'path'

type FileDesc = {
    type: 'file'
    path: string
    filename: string
}

type DirectoryDesc = {
    type: 'dir'
    path: string
    map: Record<string, FileDesc | DirectoryDesc>
}

@TpService()
export class MarkdownDocumentService {
    private _docs: Readonly<DirectoryDesc['map']> = {}

    constructor() {
        this.for_walk_dir('markdown').then(res => this._docs = res.map)
    }

    async for_walk_dir(dir: string): Promise<DirectoryDesc> {
        const file_map: DirectoryDesc = { type: 'dir', path: path.relative('markdown', dir), map: {} }
        for (const filename of await fs.promises.readdir(dir)) {
            const filepath = path.join(dir, filename)
            const stat = await fs.promises.stat(filepath)
            if (stat.isDirectory()) {
                file_map.map[filename] = await this.for_walk_dir(filepath) as DirectoryDesc
            } else if (stat.isFile()) {
                file_map.map[filename] = { type: 'file', filename, path: path.relative('markdown', filepath) }
            }
        }
        return file_map
    }

    list_docs(dir?: string): { path: string, name: string }[] {
        const desc = this.search_file(dir?.split('/') ?? [])
        if (desc.type === 'dir') {
            return Object.keys(desc.map).map(p => ({
                type: desc.map[p].type,
                path: desc.map[p].path,
                name: path.basename(desc.map[p].path).replace(path.extname(desc.map[p].path), '')
            }))
        } else {
            return []
        }
    }

    make_breadcrumb(path: string) {
        const breadcrumb: { name: string, path: string }[] = path.split('/').map(name => ({ name, path: path.split(name)[0] + name }))
        if (breadcrumb[0].name === 'marked') {
            breadcrumb[0].name = 'Markdown'
        }
        return breadcrumb
    }

    search_file(paths: string[]): FileDesc | DirectoryDesc {
        return this._search_file(this._docs, paths)
    }

    async get_file(filepath: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            fs.readFile(filepath, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(data)
                }
            })
        })
    }

    private _search_file(map: DirectoryDesc['map'], paths: string[]): FileDesc | DirectoryDesc {
        let field_path = 'marked'
        for (const p of paths) {
            const field = map[p]
            if (!field) {
                throw_not_found()
            }
            if (field.type === 'dir') {
                field_path = field.path
                map = field.map
            } else {
                return field
            }
        }
        return { type: 'dir', path: field_path, map }
    }
}
