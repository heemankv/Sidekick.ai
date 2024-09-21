import Header from "./header"
import Footer from "./footer"
import type { ReactNode } from "react"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#171717]">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
