import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'

// 基础目录（docs 根目录）
const docsRoot = path.resolve(__dirname, '..')

// 顶层目录显示顺序；未列出的目录会自动追加到末尾
const topLevelDirOrder = [
  '入学前',
  '住宿舍',
  '日常生活',
  '嘿，教室',
  '人，上学',
  '云上农大',
  '交通出行',
  '认识点小伙伴'
]

// 为每个目录显式指定默认文章（不带 .md 后缀）
const defaultArticles: Record<string, string> = {
  '云上农大': '自在东湖',
  '交通出行': '公交出行',
  '人，上学': '课表',
  '住宿舍': '宿舍',
  '入学前': '给新生的防坑蒙拐骗指南',
  '嘿，教室': '教室位置',
  '日常生活': '校园一卡通',
  '认识点小伙伴': '东方project'
}

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
  const dirs = fs
    .readdirSync(docsRoot, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .filter(name => !name.startsWith('.') && name !== '.vitepress')

  const ordered = topLevelDirOrder.filter(name => dirs.includes(name))
  const rest = dirs
    .filter(name => !topLevelDirOrder.includes(name))
    .sort((a, b) => a.localeCompare(b, 'en'))

  return [...ordered, ...rest]
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

function getDefaultLinkForGroup(group: { text: string; items: { text: string; link: string }[] }) {
  const defaultArticle = defaultArticles[group.text]
  if (!defaultArticle) return group.items[0]?.link || '/'

  const matchedItem = group.items.find(item => item.link === `/${group.text}/${defaultArticle}`)
  return matchedItem?.link || group.items[0]?.link || '/'
}

// 生成 nav：指向每个分类的第一个文档（如果存在）
function buildNav() {
  const groups = buildSidebar()
  return [
    { text: 'Home', link: '/' },
    ...groups.map(g => ({
      text: g.text,
      link: getDefaultLinkForGroup(g)
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
