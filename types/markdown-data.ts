export type MarkdownDataArticleBrief = {
    path: string
    name: string
    type: 'dir' | 'file'
}

export type MarkdownDataBreadcrumb = {
    path: string
    name: string
}

export type MarkdownDataContent = {
    title: string
    type: 'content'
    breadcrumb: MarkdownDataBreadcrumb[]
    articles: MarkdownDataArticleBrief[]
}

export type MarkdownDataArticle = {
    title: string
    type: 'article'
    breadcrumb: MarkdownDataBreadcrumb[]
    file_content: string
}
