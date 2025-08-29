import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'

// 基础目录（docs 根目录）
const docsRoot = path.resolve(__dirname, '..')

// 将文件名转换为标题：去掉扩展名，替换下划线为空格，首字母大写
function fileNameToTitle(file: string): string {
  const base = file.replace(/\.md$/i, '')
  return base
    .split(/[-_]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// 读取某个子目录下的所有 markdown 文件生成 sidebar items
function getItemsForDir(dir: string) {
  const full = path.join(docsRoot, dir)
  if (!fs.existsSync(full)) return []
  return fs
    .readdirSync(full)
    .filter(f => f.toLowerCase().endsWith('.md'))
    .sort((a, b) => a.localeCompare(b, 'en'))
    .map(f => ({
      text: fileNameToTitle(f),
      link: `/${dir}/${f.replace(/\.md$/i, '')}`
    }))
}

// 动态获取顶层子目录（排除 .vitepress 与 以点开头的目录）
function getTopLevelDirs(): string[] {
  return fs
    .readdirSync(docsRoot, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .filter(name => !name.startsWith('.') && name !== '.vitepress')
    .sort((a, b) => a.localeCompare(b, 'en'))
}

// 生成 sidebar 结构
function buildSidebar() {
  return getTopLevelDirs()
    .map(dir => ({
      text: fileNameToTitle(dir),
      items: getItemsForDir(dir)
    }))
    .filter(g => g.items.length > 0)
}

// 生成 nav：指向每个分类的第一个文档（如果存在）
function buildNav() {
  const groups = buildSidebar()
  return [
    { text: 'Home', link: '/' },
    ...groups.map(g => ({
      text: g.text,
      link: g.items[0]?.link || '/'
    }))
  ]
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "HUNAU_Guide",
  description: "HUNAU_Guide",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
  nav: buildNav(),
  sidebar: buildSidebar(),

    socialLinks: [
      { icon: 'github', link: 'https://github.com/AtHUNAU/HUNAU_Guide' }
    ]
  }
})
