'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import playersData from '@/public/data/players.json';

const PLAYERS = Array.isArray(playersData) && playersData.length > 0 ? playersData : [];

export default function WordleJogadores() {
  const [targetPlayer, setTargetPlayer] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const randomPlayer = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
    setTargetPlayer(randomPlayer);
    setGuesses([]);
    setGameOver(false);
    setWon(false);
    setInput('');
  };

  // Lógica de sugestões enquanto digita
  useEffect(() => {
    if (input.length > 1) {
      const filtered = PLAYERS.filter(p => 
        p.name.toLowerCase().includes(input.toLowerCase()) &&
        !guesses.some(g => g.name === p.name)
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [input, guesses]);

  const handleGuess = (selectedPlayerName) => {
    const nameToSearch = selectedPlayerName || input;
    const guessedPlayer = PLAYERS.find(p => p.name.toUpperCase() === nameToSearch.trim().toUpperCase());

    if (!guessedPlayer) return; // Só aceita jogadores da lista

    const isCorrect = guessedPlayer.name === targetPlayer.name;
    
    // Comparação de Atributos (Estilo Wordle/Loldle)
    const newGuess = {
      name: guessedPlayer.name,
      revived: {
        val: guessedPlayer.revivedPor,
        match: guessedPlayer.revivedPor === targetPlayer.revivedPor ? 'correct' : 'absent'
      },
      gols: {
        val: guessedPlayer.gols,
        match: guessedPlayer.gols === targetPlayer.gols ? 'correct' : (Math.abs(guessedPlayer.gols - targetPlayer.gols) < 50 ? 'present' : 'absent'),
        direction: guessedPlayer.gols < targetPlayer.gols ? '↑' : '↓'
      },
      teams: {
        match: guessedPlayer.teams.some(t => targetPlayer.teams.includes(t)) ? 'correct' : 'absent'
      },
      isCorrect
    };

    const updatedGuesses = [newGuess, ...guesses]; // Novos chutes no topo
    setGuesses(updatedGuesses);
    setInput('');
    setSuggestions([]);

    if (isCorrect) {
      setWon(true);
      setGameOver(true);
    } else if (updatedGuesses.length >= 6) {
      setGameOver(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 flex flex-col items-center">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-black text-white tracking-tighter">FUT<span className="text-green-500">DLE</span></h1>
        <p className="text-slate-400">Adivinhe o craque histórico</p>
      </header>

      <div className="w-full max-w-2xl">
        {/* Input Area */}
        {!gameOver && (
          <div className="relative mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nome do jogador..."
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg px-4 py-3 text-white focus:border-green-500 outline-none transition"
                />
                {suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                    {suggestions.map(p => (
                      <button
                        key={p.name}
                        onClick={() => handleGuess(p.name)}
                        className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 transition border-b border-slate-700 last:border-0"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Game Result */}
        {gameOver && (
          <div className={`mb-6 p-6 rounded-xl text-center animate-bounce ${won ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            <h2 className="text-2xl font-bold">{won ? '🔥 GOLAÇO!' : 'FIM DE JOGO'}</h2>
            <p>O craque era: <strong>{targetPlayer?.name}</strong></p>
            <button onClick={initGame} className="mt-4 bg-white text-black px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 mx-auto">
              <RotateCcw size={16}/> JOGAR NOVAMENTE
            </button>
          </div>
        )}

        {/* Table Header */}
        <div className="grid grid-cols-4 gap-2 mb-2 px-2 text-xs font-bold text-slate-500 uppercase">
          <div>Jogador</div>
          <div className="text-center">Revelação</div>
          <div className="text-center">Times</div>
          <div className="text-center">Gols</div>
        </div>

        {/* Guesses List */}
        <div className="space-y-2">
          {guesses.map((guess, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 animate-in fade-in slide-in-from-top-2">
              {/* Nome */}
              <div className="bg-slate-800 p-2 rounded text-white text-sm font-bold flex items-center justify-center text-center border-b-4 border-slate-950">
                {guess.name}
              </div>
              
              {/* Time de Revelação */}
              <div className={`p-2 rounded text-white text-xs font-bold flex items-center justify-center text-center border-b-4 border-slate-950 ${
                guess.revived.match === 'correct' ? 'bg-green-600' : 'bg-slate-700'
              }`}>
                {guess.revived.val}
              </div>

              {/* Match de Times */}
              <div className={`p-2 rounded text-white text-sm font-bold flex items-center justify-center border-b-4 border-slate-950 ${
                guess.teams.match === 'correct' ? 'bg-green-600' : 'bg-slate-700'
              }`}>
                {guess.teams.match === 'correct' ? 'SIM' : 'NÃO'}
              </div>

              {/* Gols com seta */}
              <div className={`p-2 rounded text-white text-sm font-bold flex flex-col items-center justify-center border-b-4 border-slate-950 ${
                guess.gols.match === 'correct' ? 'bg-green-600' : 
                guess.gols.match === 'present' ? 'bg-yellow-600' : 'bg-slate-700'
              }`}>
                {guess.gols.val}
                {guess.gols.match !== 'correct' && <span className="text-[10px]">{guess.gols.direction}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}