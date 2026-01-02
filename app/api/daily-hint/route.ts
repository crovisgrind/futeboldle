import { NextResponse } from 'next/server';
import playersData from '../../data/players.json'; // Ajusta o caminho se necessário

// Mesma lógica de Hash que usamos no seu componente para garantir que o jogador seja o mesmo
const getDailyPlayerIndex = (challengeNumber: number) => {
  const today = new Date();
  const seedString = `craque-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}-${challengeNumber}`;
  
  let hash = 5381;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash * 33) ^ seedString.charCodeAt(i);
  }
  
  return Math.abs(hash) % playersData.length;
};

export async function GET() {
  try {
    // Vamos pegar o jogador do Desafio 1 (o principal do dia)
    const playerIndex = getDailyPlayerIndex(1);
    const player = playersData[playerIndex];

    // Retornamos apenas dicas, sem o nome (para não dar spoiler se a API for descoberta)
    const hintData = {
      challengeDay: new Date().toLocaleDateString('pt-BR'),
      revivedPor: player.revivedPor,
      // Pegamos apenas os 2 primeiros times e 2 primeiros títulos para a dica não ficar gigante
      timesExemplo: player.times.slice(0, 2).join(', '),
      titulosExemplo: player.titles.slice(0, 2).join(', '),
      
      url: "https://craquedodia.com.br" // Substitua pela sua URL
    };

    return NextResponse.json(hintData);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar jogador" }, { status: 500 });
  }
}