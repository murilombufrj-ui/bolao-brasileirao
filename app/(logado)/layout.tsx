"use client"

import { Poppins } from "next/font/google"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LogadoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login")
      } else {
        setLoading(false)
      }
    })
  }, [router])

  if (loading) {
    return <div className="p-6">Carregando...</div>
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <aside className="w-56 border-r border-gray-700 px-4 py-6">
        <h2 className="text-xl font-bold mb-8 text-center">
          Bolão CP 2026
        </h2>

        <nav>
          <ul className="flex flex-col gap-4 text-sm font-semibold">
             <li>
              <Link href="/tabela-completa" className="hover:text-yellow-400 block">
                Tabela Completa
              </Link>
            </li>
            
            <li>
              <Link href="/palpites" className="hover:text-yellow-400 block">
                Palpites
              </Link>
            </li>

            <li>
              <Link href="/ranking" className="hover:text-yellow-400 block">
                Ranking
              </Link>
            </li>

            <li>
              <Link href="/g4-z4" className="hover:text-yellow-400 block">
                Teste
              </Link>
            </li>

            <li>
              <Link href="/perfil" className="hover:text-yellow-400 block">
                Meu Perfil
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}