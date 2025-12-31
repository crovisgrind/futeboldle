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
  const [shake, setShake] = useState(false);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const randomPlayer = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
    setTargetPlayer(randomPlayer);
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

    setGuesses([...guesses, newGuess]);
    setInput('');

    if (isCorrect) {
      setWon(true);
      setGameOver(true);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      if (guesses.length + 1 >= 6) setGameOver(true);
    }
  };

  if (!targetPlayer) return null;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex flex-col items-center p-4 font-sans text-white transition-transform duration-100 ${shake ? 'translate-x-1' : ''}`}>
      
      <header className="mb-8 text-center drop-shadow-2xl pt-6">
        <h1 className="text-5xl font-black tracking-tighter uppercase italic text-white">
          CRAQUE DA <span className="text-yellow-400">BOLA</span>
        </h1>
        <p className="text-green-100 text-sm font-bold mt-2 uppercase tracking-wide">
          Acerte o nome desse famoso jogador brasileiro
        </p>
      </header>

      {/* Grid de Palpites e Campo de Digitação */}
      <div className="w-full max-w-md space-y-3 mb-8">
        {/* Histórico de Chutes */}
        {guesses.map((guess, i) => (
          <div key={i} className="flex justify-center gap-1.5">
            {targetPlayer.name.split('').map((_, idx) => (
              <div
                key={idx}
                className={`w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center border-b-4 text-2xl font-black rounded-lg transition-all duration-700
                  ${guess.results[idx] === 'correct' ? 'bg-green-500 border-green-700' : 
                    guess.results[idx] === 'present' ? 'bg-yellow-500 border-yellow-700' : 
                    'bg-green-950/80 border-black/40 text-green-800'}`}
              >
                {guess.name[idx]}
              </div>
            ))}
          </div>
        ))}

        {/* Campo Ativo de Digitação */}
{!gameOver && (
  <div className="flex justify-center gap-1.5">
    {targetPlayer.name.split('').map((_, i) => (
      <div 
        key={i} 
        className={`w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center border-b-4 text-2xl font-black rounded-lg transition-all
        ${input[i] 
          ? 'border-yellow-400 bg-white/20 scale-105 shadow-[0_0_15px_rgba(250,204,21,0.4)]' 
          : 'border-slate-500 bg-slate-900/60 shadow-inner'}`}
      >
        <span className="drop-shadow-md text-white">
          {input[i]?.toUpperCase() || ''}
        </span>
      </div>
    ))}
  </div>
)}
      </div>

      {/* Dicas Progressivas */}
      <div className="w-full max-w-sm flex flex-col gap-2 mb-8">
        {guesses.length >= 2 && (
          <div className="bg-yellow-500 text-green-950 p-3 rounded-lg font-bold text-xs uppercase flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-left">
            <Lightbulb size={16} /> Revelado por: {targetPlayer.revivedPor}
          </div>
        )}
        {guesses.length >= 4 && (
          <div className="bg-white text-green-900 p-3 rounded-lg font-bold text-xs uppercase flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-right">
            <Lightbulb size={16} /> Título: {randomTitle}
          </div>
        )}
      </div>

      {/* Área de Input e Ação */}
      <div className="w-full max-w-sm mt-auto sm:mt-0">
        {!gameOver ? (
          <div className="space-y-4">
            <input
              type="text"
              maxLength={targetPlayer.name.length}
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Záàâãéèêíïóôõöúçñ ]/g, "").toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
              className="w-full bg-black/30 border-2 border-green-500 p-4 rounded-2xl text-center text-2xl font-black tracking-widest focus:outline-none focus:border-yellow-400 placeholder:text-green-300/30"
              placeholder="DIGITE AQUI"
              autoFocus
            />
            <button
              onClick={handleGuess}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-green-950 font-black py-5 rounded-2xl shadow-[0_6px_0_rgb(161,98,7)] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest text-lg"
            >
              Confirmar Chute
            </button>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl text-center shadow-2xl border-b-[10px] border-yellow-500 animate-in zoom-in">
            <h2 className={`text-4xl font-black mb-2 ${won ? 'text-green-600' : 'text-red-600'}`}>
              {won ? '🎯 GOLAÇO!' : '❌ NA TRAVE!'}
            </h2>
            <p className="text-slate-500 font-bold uppercase text-sm mb-4 leading-tight">
              {won ? 'Você conhece o futebol brasileiro!' : 'Não foi dessa vez! O craque era:'}
            </p>
            <p className="text-3xl text-green-800 font-black tracking-tighter uppercase mb-6">
              {targetPlayer.name}
            </p>
            <button 
              onClick={resetGame} 
              className="bg-green-700 text-white px-10 py-4 rounded-full font-black flex items-center gap-2 mx-auto hover:bg-green-600 transition-all shadow-lg active:scale-95"
            >
              <RotateCcw /> JOGAR NOVAMENTE
            </button>
          </div>
        )}
      </div>

      {/* Dica de rodapé para acessibilidade */}
      {!gameOver && (
        <div className="mt-6 text-green-200/50 text-[10px] font-bold uppercase tracking-widest">
          O jogador possui {targetPlayer.name.length} letras
        </div>
      )}
    </div>
  );
}