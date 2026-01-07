import React from "react";

export default function TabelaCompletaPage() {
  const usuarios = ["Murilo", "João"];

  function calcularPontuacao(
    oficialCasa: number,
    oficialFora: number,
    palpiteCasa: number,
    palpiteFora: number
  ) {
    if (oficialCasa === palpiteCasa && oficialFora === palpiteFora) {
      return { pontos: 3, cor: "bg-green-100" };
    }

    const resultadoOficial =
      oficialCasa === oficialFora
        ? "empate"
        : oficialCasa > oficialFora
        ? "casa"
        : "fora";

    const resultadoPalpite =
      palpiteCasa === palpiteFora
        ? "empate"
        : palpiteCasa > palpiteFora
        ? "casa"
        : "fora";

    if (resultadoOficial === resultadoPalpite) {
      return { pontos: 1, cor: "bg-yellow-100" };
    }

    return { pontos: 0, cor: "bg-gray-100" };
  }

  const jogos: any[] = [
    {
      id: 1,
      rodada: 1,
      data: "29/03",
      horario: "16:00",
      mandante: "Flamengo",
      visitante: "Palmeiras",
      placarOficial: { casa: 2, fora: 1 },
      palpites: {
        Murilo: { casa: 2, fora: 1 },
        João: { casa: 0, fora: 0 },
      },
    },
    {
      id: 2,
      rodada: 1,
      data: "29/03",
      horario: "18:30",
      mandante: "Grêmio",
      visitante: "Atlético-MG",
      placarOficial: { casa: 2, fora: 0 },
      palpites: {
        Murilo: { casa: 0, fora: 2 },
        João: { casa: 1, fora: 0 },
      },
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-black">
        Tabela Completa do Bolão
      </h1>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-max border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-black">Rod</th>
              <th className="p-2 text-black">Data</th>
              <th className="p-2 text-black">Hora</th>
              <th className="p-2 text-black">Mandante</th>
              <th className="p-2 text-black text-center">Placar</th>
              <th className="p-2 text-black">Visitante</th>

              {usuarios.map((user) => (
                <th
                  key={user}
                  className="p-2 text-black text-center border-l"
                >
                  {user}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {jogos.map((jogo) => (
              <tr key={jogo.id} className="border-t">
                <td className="p-2 text-black">{jogo.rodada}</td>
                <td className="p-2 text-black">{jogo.data}</td>
                <td className="p-2 text-black">{jogo.horario}</td>
                <td className="p-2 text-black font-semibold">
                  {jogo.mandante}
                </td>

                <td className="p-2 text-black text-center font-bold">
                  {jogo.placarOficial.casa} x {jogo.placarOficial.fora}
                </td>

                <td className="p-2 text-black font-semibold">
                  {jogo.visitante}
                </td>

                {usuarios.map((user) => {
                  const palpite = jogo.palpites[user];
                  const resultado = calcularPontuacao(
                    jogo.placarOficial.casa,
                    jogo.placarOficial.fora,
                    palpite.casa,
                    palpite.fora
                  );

                  return (
                    <td
                      key={`${jogo.id}-${user}`}
                      className={`p-2 text-black text-center border-l ${resultado.cor}`}
                    >
                      <span className="font-bold">
                        {palpite.casa} x {palpite.fora}
                      </span>
                      <span className="mx-1 border-l border-gray-300"></span>
                      <span className="italic font-medium">{resultado.pontos}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
