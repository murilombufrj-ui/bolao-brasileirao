"use client" 

console.log("PAGE PALPITES CARREGOU")

import { useEffect, useState } from "react"
import { createClient } from '@supabase/supabase-js'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Jogo = {
  id: number
  rodada: number
  dataHora: string
  mandante: string
  visitante: string
}

function Rodadas() {
  const [jogos, setJogos] = useState<Jogo[]>([])
  const [loading, setLoading] = useState(true)
  const [rodadaAtual, setRodadaAtual] = useState(1)
  const [palpites, setPalpites] = useState<Record<number, { m?: string; v?: string }>>({})
  const [jogoCapitao, setJogoCapitao] = useState<number | null>(null)
  const [agora, setAgora] = useState(new Date())
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState("")

useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    console.log("SESSION:", data.session)
  })

  supabase.auth.getUser().then(({ data }) => {
    console.log("USER:", data.user)
  })
}, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
      }
    })
  }, [])

  useEffect(() => {
    if (!userId) return

    async function carregarPalpites() {
      const { data, error } = await supabase
        .from("palpites")
        .select("*")
        .eq("user_id", userId)

      if (error || !data) return

      const mapa: Record<number, { m?: string; v?: string }> = {}
      let capitao: number | null = null

      data.forEach(p => {
        mapa[p.match_id] = {
          m: p.palpite_home?.toString(),
          v: p.palpite_away?.toString(),
        }

        if (p.capitao) {
          capitao = p.match_id
        }
      })

      setPalpites(mapa)
      setJogoCapitao(capitao)
    }

    carregarPalpites()
  }, [userId])


  useEffect(() => {
  async function carregarJogos() {
    const { data, error } = await supabase
      .from('matches')
      .select('*')

    console.log(data)
  }

  carregarJogos()
  }, [])

  useEffect(() => {
  async function carregarJogos() {
    const { data, error } = await supabase
      .from('matches')
      .select('*')

    if (error) {
      console.error(error)
      return
    }

    const jogosFormatados = data.map((j: any) => ({
      id: j.id,
      rodada: j.rodada,
      dataHora: `${j.data}T${j.hora}`,
      mandante: j.home,
      visitante: j.away,
    }))

    setJogos(jogosFormatados)
    setLoading(false)
  }

  carregarJogos()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setAgora(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const jogosDaRodada = jogos.filter(j => j.rodada === rodadaAtual)
  const maxRodada = Math.max(...jogos.map(j => j.rodada))

  if (loading) return <div className="text-white">Carregando...</div>

  const primeiroJogo = jogosDaRodada.reduce((a, b) =>
    new Date(a.dataHora) < new Date(b.dataHora) ? a : b
  )

  const ultimoJogo = jogosDaRodada.reduce((a, b) =>
    new Date(a.dataHora) > new Date(b.dataHora) ? a : b
  )

  const fechamento = new Date(new Date(primeiroJogo.dataHora).getTime() - 30 * 60000)
  const fimRodada = new Date(new Date(ultimoJogo.dataHora).getTime() + 2 * 60 * 60000)

  const jogosRodadaAnterior = jogos.filter(j => j.rodada === rodadaAtual - 1)
  const ultimoRodadaAnterior =
    jogosRodadaAnterior.length > 0
      ? jogosRodadaAnterior.reduce((a, b) =>
          new Date(a.dataHora) > new Date(b.dataHora) ? a : b
        )
      : null

  const abertura =
    rodadaAtual === 1 || !ultimoRodadaAnterior
      ? null
      : new Date(new Date(ultimoRodadaAnterior.dataHora).getTime() + 2 * 60 * 60000)

  const antesDeAbrir = abertura && agora < abertura
  const aberto = agora >= (abertura ?? new Date(0)) && agora < fechamento
  const emAndamento = agora >= fechamento && agora < fimRodada
  const encerrada = agora >= fimRodada

  function tempoRestante(data: Date) {
    const diff = data.getTime() - agora.getTime()
    if (diff <= 0) return "00:00:00"
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

async function salvarPalpites() {
  if (!userId || salvando || salvo) return

  setSalvando(true)

  const registros = Object.entries(palpites).map(([matchId, p]) => ({
    user_id: userId,
    match_id: matchId,
    palpite_home: p.m === "" || p.m == null ? null : Number(p.m),
    palpite_away: p.v === "" || p.v == null ? null : Number(p.v),
    capitao: jogoCapitao === Number(matchId),
  }))

  const { error } = await supabase
    .from("palpites")
    .upsert(registros, {
      onConflict: "user_id,match_id",
    })

  setSalvando(false)

  if (!error) {
    console.error("SUPABASE ERROR:", error)
    return
  }
  setSalvo(true)
  setTimeout(() => setSalvo(true), 2000)
}


  return (
    <div className="min-h-screen text-black p-6">
      <h1 className="text-3xl font-bold text-center mb-4">Palpites</h1>

      <div className="flex justify-center items-center gap-2 mb-4">
        <button
          onClick={() => setRodadaAtual(r => Math.max(1, r - 1))}
          disabled={rodadaAtual === 1}
          className="bg-white text-black px-1 py-0,3 rounded-[6px] disabled:opacity-30"
        >
          ◀
        </button>

        <select
          value={rodadaAtual}
          onChange={e => setRodadaAtual(Number(e.target.value))}
          className="bg-white text-black px-3 py-2 rounded-[11px] font-semibold"
        >
          {Array.from({ length: maxRodada }, (_, i) => i + 1).map(r => (
            <option key={r} value={r}>
              Rodada {r}
            </option>
          ))}
        </select>

        <button
          onClick={() => setRodadaAtual(r => Math.min(maxRodada, r + 1))}
          disabled={rodadaAtual === maxRodada}
          className="bg-white text-black px-1 py-0,3 rounded-[6px] disabled:opacity-30"
        >
          ▶
        </button>
      </div>

      <div className="mb-6 flex flex-col items-center text-center gap-1">
        {aberto && (
          <>
            <div className="flex items-center gap-1">
              <span className="animate-pulse text-green-400 text-sm">●</span>
              <strong className="text-green-400">Palpites Abertos</strong>
            </div>
            <div className="italic text-blue-300 text-sm">
              Fecham em {tempoRestante(fechamento)}
            </div>
          </>
        )}

        {antesDeAbrir && (
          <>
            <div className="flex items-center gap-1">
              <span className="text-red-400 text-sm">✖</span>
              <strong className="text-red-400">Palpites Fechados</strong>
            </div>
            <div className="italic text-blue-300 text-sm">
              Abrem em {tempoRestante(abertura!)}
            </div>
          </>
        )}

        {emAndamento && (
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-sm">—</span>
            <strong className="text-yellow-400">Rodada em andamento</strong>
          </div>
        )}

        {encerrada && <strong className="text-gray-300">Rodada encerrada</strong>}
      </div>

      <div className="flex flex-col gap-6 items-center">
        {jogosDaRodada.map(jogo => {
          const isCapitao = jogoCapitao === jogo.id

          return (
            <div
              key={jogo.id}
              className={`w-full max-w-3xl bg-white shadow-md text-black rounded-[13px] p-4
              ${aberto ? "transition-transform hover:scale-[1.03]" : ""}
              ${isCapitao ? "border-3 border-yellow-400" : ""}
              ${salvo ? "font-bold" : ""}`}
            >
              <div className="flex justify-between mb-3 text-sm">
                <span>{new Date(jogo.dataHora).toLocaleString()}</span>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isCapitao}
                    disabled={!aberto}
                    onChange={() => {
                      setJogoCapitao(isCapitao ? null : jogo.id)
                      setSalvo(false)
                    }}
                  />
                  Jogo Capitão
                </label>
              </div>

              <div className="grid grid-cols-[1fr_auto_auto_auto_1fr] items-center gap-2">
                <span className="text-right">{jogo.mandante}</span>

                <input
                  type="text"
                  inputMode="numeric"
                  className="w-8 border rounded-[6px] text-center font-bold appearance-none"
                  disabled={!aberto}
                  value={palpites[jogo.id]?.m || ""}
                  onChange={e => {
                    setPalpites(p => ({
                      ...p,
                      [jogo.id]: { ...p[jogo.id], m: e.target.value },
                    }))
                    setSalvo(false)
                  }}
                />

                <span>x</span>

                <input
                  type="text"
                  inputMode="numeric"
                  className="w-8 border rounded-[6px] text-center font-bold appearance-none"
                  disabled={!aberto}
                  value={palpites[jogo.id]?.v || ""}
                  onChange={e => {
                    setPalpites(p => ({
                      ...p,
                      [jogo.id]: { ...p[jogo.id], v: e.target.value },
                    }))
                    setSalvo(false)
                  }}
                />

                <span>{jogo.visitante}</span>
              </div>
            </div>
          )
        })}
      </div>
      


      {aberto && (
        <div className="flex justify-center mt-8">
          <button
  onClick={salvarPalpites}
  disabled={salvo || salvando}
  className={`
    px-6 py-3 rounded-[11px] font-bold transition
    ${salvo
      ? "bg-green-400 text-white cursor-not-allowed"
      : "bg-blue-600 text-white hover:brightness-95 hover:scale-105 active:scale-100"}
  `}
>
  {salvo ? "Palpites Salvos!" : salvando ? "Salvando..." : "Salvar Palpites"}
</button>

        </div>
      )}
      </div>
  )
}

const TIMES = [
  'Athletico','Atlético-MG','Bahia','Botafogo','Chapecoense','Corinthians',
  'Coritiba','Cruzeiro','Flamengo','Fluminense','Grêmio','Internacional',
  'Mirassol','Palmeiras','Red Bull Bragantino','Remo','Santos','São Paulo',
  'Vasco','Vitória',
]

function Campeonato() {
  const [g4, setG4] = useState<string[]>(['', '', '', ''])
  const [z4, setZ4] = useState<string[]>(['', '', '', ''])
  const [art1, setArt1] = useState('')
  const [art2, setArt2] = useState('')
  const [gar1, setGar1] = useState('')
  const [gar2, setGar2] = useState('')
  const [timesDuplicados, setTimesDuplicados] = useState<string[]>([])

  useEffect(() => {
    const todos = [...g4, ...z4].filter(Boolean)
    const duplicados = todos.filter((t, i) => todos.indexOf(t) !== i)
    setTimesDuplicados([...new Set(duplicados)])
  }, [g4, z4])

  function renderLinha(label: string, lista: string[], setLista: (v: string[]) => void, index: number) {
    const valor = lista[index]
    const erro = timesDuplicados.includes(valor)

    return (
      <div className="flex items-center gap-2 bg-white rounded-[11px] px-2 py-2">
        <span className="w-14 text-right font-bold text-black">{label}</span>
        <select
          className={`w-[240px] border rounded-[9px] px-2 py-1 font-bold ${erro ? 'bg-red-200 text-red-800 border-red-500' : 'bg-white text-black'}`}
          value={valor}
          onChange={e => {
            const novo = [...lista]
            novo[index] = e.target.value
            setLista(novo)
          }}
        >
          <option value="">Selecione</option>
          {TIMES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-black p-6">
      <h1 className="text-3xl font-bold text-center mb-2">
        G4 / Z4 / Artilheiro / Garçom
      </h1>

      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-2">
          <span className="text-green-400 animate-pulse text-sm">●</span>
          <span className="text-green-400 font-bold">Palpites Abertos</span>
        </div>
        <div className="text-blue-900 italic text-sm mt-1">
          Fecham em 12:34:56
        </div>
      </div>

      <div className="flex justify-center gap-6 mb-6">
        <div className="w-[360px] bg-white/20 shadow-md rounded-[13px] p-2 space-y-3 transition-transform hover:scale-[1.03]">
        <h2 className="text-center font-bold mb-3">G4</h2>
          {renderLinha('1º', g4, setG4, 0)}
          {renderLinha('2º', g4, setG4, 1)}
          {renderLinha('3º', g4, setG4, 2)}
          {renderLinha('4º', g4, setG4, 3)}
        </div>

        <div className="w-[360px] bg-white/20 shadow-md rounded-[13px] p-2 space-y-3 transition-transform hover:scale-[1.03]">
        <h2 className="text-center font-bold mb-3">Z4</h2>
          {renderLinha('17º', z4, setZ4, 0)}
          {renderLinha('18º', z4, setZ4, 1)}
          {renderLinha('19º', z4, setZ4, 2)}
          {renderLinha('20º', z4, setZ4, 3)}
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <div className="w-[744px] bg-white/20 shadow-md rounded-[13px] p-2 transition-transform hover:scale-[1.03]">
          <div className="bg-white rounded-[11px] p-3 grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold mb-2 text-black">Artilheiro</h3>
              <input className="w-full border rounded-[11px] px-2 py-1 mb-2 text-black" value={art1} onChange={e => setArt1(e.target.value)} />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">ou</span>
                <input className="w-full border rounded-[11px] px-2 py-1 text-sm italic text-gray-600" value={art2} onChange={e => setArt2(e.target.value)} />
              </div>
            </div>

            <div className="border-l border-gray-300 pl-4">
              <h3 className="font-bold mb-2 text-black">Garçom</h3>
              <input className="w-full border rounded-[11px] px-2 py-1 mb-2 text-black" value={gar1} onChange={e => setGar1(e.target.value)} />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">ou</span>
                <input className="w-full border rounded-[11px] px-2 py-1 text-sm italic text-gray-600" value={gar2} onChange={e => setGar2(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {timesDuplicados.length > 0 && (
        <div className="text-center text-red-400 font-bold mb-4">
          Um mesmo time não pode ser selecionado mais de uma vez
        </div>
      )}

      <div className="flex justify-center">
        <button className="bg-yellow-400 text-black px-4 py-1 rounded-[11px] font-bold">
          Salvar Palpites
        </button>
      </div>
    </div>
  )
}

export default function Page() {
  const [aba, setAba] = useState<'rodadas' | 'campeonato'>('rodadas')

  return (
    <>
      <div className="absolute top-4 left-60 flex gap-2 z-50">
        <button
          onClick={() => setAba('rodadas')}
          className={`px-3 py-0.5 rounded-[11px] font-bold ${aba === 'rodadas' ? 'bg-yellow-400 text-black' : 'bg-gray-300 text-black opacity-40 shadow-md'}`}
        >
          Rodadas
        </button>

        <button
          onClick={() => setAba('campeonato')}
          className={`px-3 py-0.5 rounded-[11px] font-bold ${aba === 'campeonato' ? 'bg-yellow-400 text-black' : 'bg-gray-300 text-black opacity-40 shadow-md'}`}
        >
          Campeonato
        </button>
      </div>

      {aba === 'rodadas' && <Rodadas />}
      {aba === 'campeonato' && <Campeonato />}
    </>
  )
}
