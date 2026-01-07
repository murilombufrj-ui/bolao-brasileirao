'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function G4Z4Page() {
  const [jogos, setJogos] = useState<any[]>([])

  useEffect(() => {
    async function carregarJogos() {
      const { data, error } = await supabase
        .from('matches')
        .select('*')

      console.log('DATA:', data)
      console.log('ERROR:', error)

      if (data) {
        setJogos(data)
      }
    }

    carregarJogos()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Jogos</h1>

      {jogos.length === 0 && (
        <p>Nenhum jogo carregado</p>
      )}

      {jogos.map((jogo) => (
        <div key={jogo.id}>
          {jogo.home} x {jogo.away}
        </div>
      ))}
    </div>
  )
}
