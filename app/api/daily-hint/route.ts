import { NextResponse } from 'next/server';
import playersData from '../../data/players.json';

// Lógica para selecionar o jogador baseado na data
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
    const playerIndex = getDailyPlayerIndex(1);
    const player = playersData[playerIndex];

    // Função para pegar um item aleatório da lista
    const getRandom = (array: string[]) => {
      if (!array || array.length === 0) return "N/A";
      return array[Math.floor(Math.random() * array.length)];
    };

    const hintData = {
      name: player.name,
      challengeDay: new Date().toLocaleDateString('pt-BR'),
      revivedPor: player.revivedPor,
      umTime: getRandom(player.times),
      umTitulo: getRandom(player.titles),
      totalGols: player.gols,
      url: "https://craquedodia.com.br"
    };

    return NextResponse.json(hintData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao processar a dica" }, { status: 500 });
  }
}