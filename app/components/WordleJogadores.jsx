'use client';

import React, { useState, useEffect } from 'react';
import { RotateCcw, Lightbulb } from 'lucide-react';
import playersData from '@/public/data/players.json';

const PLAYERS = Array.isArray(playersData) && playersData.length > 0 ? playersData : [];

function compareLetters(guess, targetName) {
  const targetUpper = targetName.toUpperCase();
  const guessUpper = guess.toUpperCase().padEnd(targetName.length, ' ');
  const result = new Array(targetName.length).fill('absent');
  const targetCharsCount = {};

  for (let char of targetUpper) {
    targetCharsCount[char] = (targetCharsCount[char] || 0) + 1;
  }

  for (let i = 0; i < targetName.length; i++) {
    if (guessUpper[i] === targetUpper[i]) {
      result[i] = 'correct';
      targetCharsCount[guessUpper[i]]--;
    }
  }

  for (let i = 0; i < targetName.length; i++) {
    if (result[i] !== 'correct' && targetCharsCount[guessUpper[i]] > 0) {
      result[i] = 'present';
      targetCharsCount[guessUpper[i]]--;
    }
  }

  return result;
}

export default function WordleJogadores() {
  const [targetPlayer, setTargetPlayer] = useState(null);
  const [randomTitle, setRandomTitle] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [input, setInput] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const randomPlayer = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
    setTargetPlayer(randomPlayer);
    
    // Escolhe um título aleatório para a dica de nível 3
    if (randomPlayer?.titles?.length > 0) {
      setRandomTitle(randomPlayer.titles[Math.floor(Math.random() * randomPlayer.titles.length)]);
    }

    setGuesses([]);
    setInput('');
    setGameOver(false);
    setWon(false);
  };

  const handleGuess = () => {
    if (!input.trim() || !targetPlayer || gameOver) return;
    if (input.length !== targetPlayer.name.length) return;

    const guessUpper = input.trim().toUpperCase();
    const isCorrect = guessUpper === targetPlayer.name.toUpperCase();
    
    const newGuess = {
      name: guessUpper,
      results: compareLetters(guessUpper, targetPlayer.name)
    };

    const updatedGuesses = [...guesses, newGuess];
    setGuesses(updatedGuesses);
    setInput('');

    if (isCorrect) {
      setWon(true);
      setGameOver(true);
    } else if (updatedGuesses.length >= 6) {
      setGameOver(true);
    }
  };

  if (!targetPlayer) return <div className="min-h-screen bg-green-900 flex items-center justify-center text-white font-bold">CARREGANDO ESTÁDIO...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex flex-col items-center p-4 font-sans text-white">
      
      <header className="mb-6 text-center drop-shadow-lg">
        <h1 className="text-4xl font-black tracking-wider uppercase">
          CRAQUE<span className="text-yellow-400">DLE</span>
        </h1>
        <div className="flex items-center justify-center gap-2 mt-1">
            <span className="bg-yellow-500 text-green-900 px-2 py-0.5 rounded text-xs font-bold uppercase">
                {targetPlayer.name.length} LETRAS
            </span>
        </div>
      </header>

      {/* Grid de Palpites */}
      <div className="w-full max-w-md space-y-2 mb-6">
        {guesses.map((guess, i) => (
          <div key={i} className="flex justify-center gap-1 animate-in slide-in-from-bottom-2">
            {targetPlayer.name.split('').map((_, letterIdx) => (
              <div
                key={letterIdx}
                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 text-xl sm:text-2xl font-bold rounded shadow-sm transition-all duration-500
                  ${guess.results[letterIdx] === 'correct' ? 'bg-green-500 border-green-400' : 
                    guess.results[letterIdx] === 'present' ? 'bg-yellow-500 border-yellow-400' : 
                    'bg-green-950/60 border-green-900/50 text-green-200'}`}
              >
                {guess.name[letterIdx] || ''}
              </div>
            ))}
          </div>
        ))}

        {!gameOver && (
          <div className="flex justify-center gap-1">
            {targetPlayer.name.split('').map((_, i) => (
              <div 
                key={i} 
                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 text-xl sm:text-2xl font-bold rounded transition-all
                ${input[i] ? 'border-yellow-400 bg-green-900/80 scale-105' : 'border-green-600 bg-green-900/40'}`}
              >
                {input[i]?.toUpperCase() || ''}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Área de Dicas Progressivas */}
      <div className="w-full max-w-sm mb-6 space-y-2">
        {guesses.length >= 2 && (
          <div className="bg-blue-600/30 border border-blue-400/50 p-2 rounded-lg flex items-center gap-3 animate-in fade-in zoom-in">
            <Lightbulb className="text-yellow-400 shrink-0" size={18} />
            <p className="text-xs font-bold uppercase tracking-tight">
                Dica 1: Revelado pelo <span className="text-yellow-400">{targetPlayer.revivedPor}</span>
            </p>
          </div>
        )}
        
        {guesses.length >= 4 && (
          <div className="bg-purple-600/30 border border-purple-400/50 p-2 rounded-lg flex items-center gap-3 animate-in fade-in zoom-in">
            <Lightbulb className="text-yellow-400 shrink-0" size={18} />
            <p className="text-xs font-bold uppercase tracking-tight">
                Dica 2: Ganhou o título <span className="text-yellow-400">{randomTitle}</span>
            </p>
          </div>
        )}
      </div>

      <div className="w-full max-w-sm">
        {!gameOver ? (
          <div className="space-y-4">
            <input
              type="text"
              maxLength={targetPlayer.name.length}
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Záàâãéèêíïóôõöúçñ ]/g, ""))}
              onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
              className="w-full p-3 bg-white/10 border-2 border-green-500 rounded-xl text-white text-center text-xl uppercase tracking-widest focus:outline-none focus:border-yellow-400 placeholder:text-green-300/50"
              placeholder="QUEM É O CRAQUE?"
              autoFocus
            />
            <button
              onClick={handleGuess}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-green-950 font-black py-4 rounded-xl transition-all active:scale-95 shadow-lg uppercase tracking-wider"
            >
              Chutar Nome
            </button>
          </div>
        ) : (
          <div className="text-center bg-white p-6 rounded-3xl shadow-2xl border-b-8 border-yellow-500 animate-in zoom-in duration-300">
            <p className={`text-2xl font-black mb-1 ${won ? 'text-green-700' : 'text-red-600'}`}>
              {won ? '🏆 GOLAÇO!' : 'FIM DE JOGO!'}
            </p>
            <p className="text-slate-600 mb-6 font-medium leading-tight">
              {won ? `Você provou que entende tudo de bola!` : `Não foi dessa vez, o craque era:`} <br/>
              <span className="text-3xl text-green-800 font-black tracking-tighter uppercase">{targetPlayer.name}</span>
            </p>
            <button
              onClick={resetGame}
              className="flex items-center gap-2 mx-auto bg-green-700 hover:bg-green-600 text-white px-10 py-4 rounded-full font-bold transition shadow-lg active:scale-95"
            >
              <RotateCcw size={20} /> JOGAR DE NOVO
            </button>
          </div>
        )}
      </div>
    </div>
  );
}