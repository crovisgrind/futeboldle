import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

const PLAYERS = [
  { name: 'PELÉ', revivedPor: 'SANTOS', teams: ['SANTOS', 'NYK', 'BRASIL'], titles: ['TRICAMPEÃO MUNDIAL 1958-1962-1970', 'LIBERTADORES 1962-1963', 'PAULISTA'], gols: 1283 },
  { name: 'RONALDO', revivedPor: 'CRUZEIRO', teams: ['CRUZEIRO', 'PSV', 'INTER', 'REAL MADRID', 'BRASIL'], titles: ['BICAMPEÃO MUNDIAL 1994-2002', 'LIBERTADORES 1992'], gols: 62 },
  { name: 'RONALDINHO', revivedPor: 'GRÊMIO', teams: ['GRÊMIO', 'PSG', 'BARCELONA', 'BRASIL'], titles: ['CAMPEÃO MUNDIAL 2002', 'LIBERTADORES 1995', 'CHAMPIONS LEAGUE 2006'], gols: 33 },
  { name: 'NEYMAR', revivedPor: 'SANTOS', teams: ['SANTOS', 'BARCELONA', 'PSG', 'BRASIL'], titles: ['COPA AMÉRICA 2021', 'OURO OLÍMPICO 2016'], gols: 79 },
  { name: 'VINICIUS JR', revivedPor: 'FLAMENGO', teams: ['FLAMENGO', 'REAL MADRID', 'BRASIL'], titles: ['LIBERTADORES 2019', 'CHAMPIONS LEAGUE 2022'], gols: 35 },
  { name: 'KAKÁ', revivedPor: 'SÃO PAULO', teams: ['SÃO PAULO', 'MILAN', 'REAL MADRID', 'BRASIL'], titles: ['CAMPEÃO MUNDIAL 2002', 'LIBERTADORES 1992', 'CHAMPIONS LEAGUE 2007'], gols: 86 },
  { name: 'RIVALDO', revivedPor: 'PALMEIRAS', teams: ['PALMEIRAS', 'BARCELONA', 'BRASIL'], titles: ['CAMPEÃO MUNDIAL 2002', 'LIBERTADORES 1999'], gols: 35 },
  { name: 'ROBINHO', revivedPor: 'SANTOS', teams: ['SANTOS', 'REAL MADRID', 'MILAN', 'BRASIL'], titles: ['LIBERTADORES 2011', 'PAULISTA'], gols: 28 },
  { name: 'DIDI', revivedPor: 'BOTAFOGO', teams: ['BOTAFOGO', 'REAL MADRID', 'BRASIL'], titles: ['TRICAMPEÃO MUNDIAL 1958-1962-1970'], gols: 31 },
  { name: 'GARRINCHA', revivedPor: 'BOTAFOGO', teams: ['BOTAFOGO', 'BRASIL'], titles: ['BICAMPEÃO MUNDIAL 1958-1962', 'LIBERTADORES 1948'], gols: 49 },
  { name: 'TOSTÃO', revivedPor: 'CRUZEIRO', teams: ['CRUZEIRO', 'BRASIL'], titles: ['CAMPEÃO MUNDIAL 1970', 'LIBERTADORES 1976'], gols: 33 },
  { name: 'SÓCRATES', revivedPor: 'CORINTHIANS', teams: ['CORINTHIANS', 'BRASIL'], titles: ['COPA AMÉRICA 1983', 'PAULISTA'], gols: 35 },
  { name: 'ZIZINHO', revivedPor: 'FLAMENGO', teams: ['FLAMENGO', 'BRASIL'], titles: ['LIBERTADORES 1948-1951', 'COPA AMÉRICA 1949'], gols: 44 },
  { name: 'FRED', revivedPor: 'ATLÉTICO MINEIRO', teams: ['ATLÉTICO MINEIRO', 'LYONNAISE', 'BRASIL'], titles: ['LIBERTADORES 2013', 'COPA AMÉRICA 1999'], gols: 42 },
];

function comparePlayers(guess, target) {
  const result = [];
  const guessUpper = guess.toUpperCase();
  const targetUpper = target.name;

  for (let i = 0; i < guessUpper.length; i++) {
    if (i < targetUpper.length) {
      if (guessUpper[i] === targetUpper[i]) {
        result.push('correct');
      } else if (targetUpper.includes(guessUpper[i])) {
        result.push('present');
      } else {
        result.push('absent');
      }
    }
  }
  return result;
}

function getHint(guessedPlayer, targetPlayer) {
  const hints = [];

  // Dica de time que revelou
  if (guessedPlayer.revivedPor !== targetPlayer.revivedPor) {
    hints.push(`💡 Time que revelou: ${targetPlayer.revivedPor}`);
  }

  // Dica de um dos times que jogou
  const commonTeams = guessedPlayer.teams.filter(t => targetPlayer.teams.includes(t));
  if (commonTeams.length === 0 && guessedPlayer.teams.length > 0) {
    const targetTeam = targetPlayer.teams[Math.floor(Math.random() * targetPlayer.teams.length)];
    hints.push(`⚽ Time que jogou: ${targetTeam}`);
  }

  // Dica de um dos títulos
  const commonTitles = guessedPlayer.titles.filter(t => targetPlayer.titles.includes(t));
  if (commonTitles.length === 0 && guessedPlayer.titles.length > 0) {
    const targetTitle = targetPlayer.titles[Math.floor(Math.random() * targetPlayer.titles.length)];
    hints.push(`🏆 Título ganhou: ${targetTitle}`);
  }

  return hints.length > 0 ? hints[Math.floor(Math.random() * hints.length)] : '🎯 Você está perto!';
}

export default function WordleJogadores() {
  const [targetPlayer, setTargetPlayer] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [input, setInput] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    const randomPlayer = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
    setTargetPlayer(randomPlayer);
  }, []);

  const handleGuess = () => {
    if (!input.trim() || !targetPlayer) return;

    const guessedPlayer = PLAYERS.find(p => p.name.toUpperCase() === input.toUpperCase());
    
    if (!guessedPlayer) {
      alert('Jogador não encontrado!');
      return;
    }

    const isCorrect = guessedPlayer.name === targetPlayer.name;
    const hint = isCorrect ? null : getHint(guessedPlayer, targetPlayer);

    const newGuess = {
      name: guessedPlayer.name,
      letterMatch: comparePlayers(input, targetPlayer),
      teamMatch: guessedPlayer.teams.some(t => targetPlayer.teams.includes(t)) ? '✓' : '✗',
      titleMatch: guessedPlayer.titles.some(t => targetPlayer.titles.includes(t)) ? '✓' : '✗',
      isCorrect: isCorrect,
      hint: hint,
    };

    const updatedGuesses = [...guesses, newGuess];
    setGuesses(updatedGuesses);
    setInput('');

    if (newGuess.isCorrect) {
      setWon(true);
      setGameOver(true);
    } else if (updatedGuesses.length >= 6) {
      setGameOver(true);
    }
  };

  const handleReset = () => {
    const randomPlayer = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
    setTargetPlayer(randomPlayer);
    setGuesses([]);
    setInput('');
    setGameOver(false);
    setWon(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !gameOver) {
      handleGuess();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-700 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-5xl font-bold text-white text-center mb-2">⚽ FUTEBOLDLE</h1>
        <p className="text-center text-green-100 mb-8">Adivinhe o jogador brasileiro! Você tem 6 tentativas.</p>

        <div className="bg-white rounded-lg shadow-2xl p-6 mb-6">
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {guesses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Comece a adivinhar...</p>
            ) : (
              guesses.map((guess, idx) => (
                <div key={idx} className="border-2 border-gray-300 rounded p-4 bg-gray-50">
                  <div className="font-bold text-lg mb-3">
                    {guess.name.split('').map((char, i) => (
                      <span
                        key={i}
                        className={`inline-block w-8 h-8 text-center leading-8 mr-1 rounded font-bold text-white ${
                          guess.letterMatch[i] === 'correct' ? 'bg-green-500' :
                          guess.letterMatch[i] === 'present' ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div className={`p-2 rounded font-semibold ${guess.teamMatch === '✓' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      Times: {guess.teamMatch}
                    </div>
                    <div className={`p-2 rounded font-semibold ${guess.titleMatch === '✓' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      Títulos: {guess.titleMatch}
                    </div>
                  </div>
                  {guess.hint && !guess.isCorrect && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-blue-800 text-sm font-medium">
                      {guess.hint}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {!gameOver && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite o nome do jogador..."
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 uppercase"
                autoFocus
              />
              <button
                onClick={handleGuess}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
              >
                Chutar
              </button>
            </div>
          )}

          {gameOver && (
            <div className={`p-4 rounded-lg mb-4 text-center ${won ? 'bg-green-100' : 'bg-red-100'}`}>
              {won ? (
                <p className="text-2xl font-bold text-green-800">🎉 Parabéns! Acertou em {guesses.length} tentativa{guesses.length > 1 ? 's' : ''}!</p>
              ) : (
                <div>
                  <p className="text-xl font-bold text-red-800">😢 Fim de jogo!</p>
                  <p className="text-red-700 mt-2">O jogador era: <strong className="text-lg">{targetPlayer?.name}</strong></p>
                  <p className="text-red-600 mt-1 text-sm">Time que revelou: {targetPlayer?.revivedPor}</p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleReset}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} /> Novo Jogo
          </button>
        </div>

        <div className="bg-white bg-opacity-10 rounded-lg p-4 text-white text-sm">
          <p className="font-bold mb-2">📋 Jogadores disponíveis ({PLAYERS.length}):</p>
          <p className="text-xs">{PLAYERS.map(p => p.name).join(', ')}</p>
        </div>
      </div>
    </div>
  );
}