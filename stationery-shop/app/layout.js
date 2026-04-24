import './globals.css'

export const metadata = {
  title: '文具町 | 頂級一頁式文具店',
  description: '選用最高質感的文具，提升生活品味與工作效率。擁有完整的購物與評論體驗。',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}
