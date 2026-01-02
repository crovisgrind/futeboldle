import { NextResponse } from 'next/server';
import playersData from '../../data/players.json'; // Ajusta o caminho se necessário

// Mesma lógica de Hash que usamos no seu componente para garantir que o jogador seja o mesmo
// ... (mantenha a lógica do playerIndex acima)

const player = playersData[playerIndex];

// Função simples para pegar um item aleatório do array
const getRandom = (array: string[]) => array[Math.floor(Math.random() * array.length)];

const hintData = {
  name: player.name,
  challengeDay: new Date().toLocaleDateString('pt-BR'),
  revivedPor: player.revivedPor,
  // Sorteia apenas UM time e UM título da lista
  umTime: getRandom(player.times),
  umTitulo: getRandom(player.titles),
  totalGols: player.gols,
  url: "https://craquedodia.com.br"
};

return NextResponse.json(hintData);