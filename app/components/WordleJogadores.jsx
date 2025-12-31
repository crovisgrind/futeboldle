'use client';

import React, { useState, useEffect } from 'react';
import { RotateCcw, Lightbulb, Share2, Trophy, Lock } from 'lucide-react';
import playersData from '@/public/data/players.json';

const PLAYERS = Array.isArray(playersData) && playersData.length > 0 ? playersData : [];
const DAILY_LIMIT = 3;

// Função para gerar o mesmo jogador para todos baseado na data
const getDailyPlayerIndex = (challengeNumber) => {
  const today = new Date();
  // Cria uma semente baseada no dia/mês/ano
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const finalSeed = dateSeed + challengeNumber;
  const x = Math.sin(finalSeed) * 10000;
  return Math.floor((x - Math.floor(x)) * PLAYERS.length);
};

export default function WordleJogadores() {
  const [targetPlayer, setTargetPlayer] = useState(null);
  const [randomTitle, setRandomTitle] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [input, setInput] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [stats, setStats] = useState({ dailyCount: 0, streak: 0, lastDate: '' });

  // Carrega estatísticas e o desafio inicial
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const savedStats = JSON.parse(localStorage.getItem('craque_bola_stats')) || {
      dailyCount: 0,
      streak: 0,
      lastDate: today,
      totalWins: 0
    };

    // Reset diário de streak se o usuário pulou um dia
    if (savedStats.lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (savedStats.lastDate !== yesterday.toLocaleDateString()) {
        savedStats.streak = 0;
      }
      
      savedStats.dailyCount = 0;
      savedStats.lastDate = today;
      localStorage.setItem('craque_bola_stats', JSON.stringify(savedStats));
    }

    setStats(savedStats);
    loadChallenge(savedStats.dailyCount);
  }, []);

  const loadChallenge = (count) => {
    if (count < DAILY_LIMIT) {
      const index = getDailyPlayerIndex(count);
      const player = PLAYERS[index];
      setTargetPlayer(player);
      
      // Define um título aleatório para a dica de nível 2
      if (player?.titles?.length > 0) {
        setRandomTitle(player.titles[Math.floor(Math.random() * player.titles.length)]);
      }

      setGuesses([]);
      setInput('');
      setGameOver(false);
      setWon(false);
    }
  };

  const handleGuess = () => {
    if (stats.dailyCount >= DAILY_LIMIT || !targetPlayer || gameOver) return;
    if (input.length !== targetPlayer.name.length) return;

    const guessUpper = input.trim().toUpperCase();
    const targetUpper = targetPlayer.name.toUpperCase();
    
    const results = guessUpper.split('').map((char, i) => {
      if (char === targetUpper[i]) return 'correct';
      if (targetUpper.includes(char)) return 'present';
      return 'absent';
    });

    const newGuesses = [...guesses, { name: guessUpper, results }];
    setGuesses(newGuesses);
    setInput('');

    if (guessUpper === targetUpper) {
      finishGame(true);
    } else if (newGuesses.length >= 6) {
      finishGame(false);
    }
  };

  const finishGame = (isWin) => {
    setGameOver(true);
    setWon(isWin);
    const newStats = { ...stats };
    newStats.dailyCount += 1;
    if (isWin) {
      newStats.streak += 1;
      newStats.totalWins += 1;
    }
    setStats(newStats);
    localStorage.setItem('craque_bola_stats', JSON.stringify(newStats));
  };

  const shareResults = () => {
    const squares = guesses.map(g => 
      g.results.map(r => r === 'correct' ? '🟩' : r === 'present' ? '🟨' : '⬛').join('')
    ).join('\n');
    
    const shareUrl = 'https://craquedodia.com.br';
    const text = `Craque do Dia ⚽\nDesafio ${stats.dailyCount}/${DAILY_LIMIT}\nStreak: ${stats.streak} 🔥\n\n${squares}\n\nJogue em: ${shareUrl}`;
    
    if (navigator.share) {
      navigator.share({ title: 'Craque do Dia', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Resultado copiado para o WhatsApp!');
    }
  };

  if (!targetPlayer && stats.dailyCount < DAILY_LIMIT) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex flex-col items-center p-4 font-sans text-white">
      
      {/* HUD de Progresso */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 bg-black/30 p-4 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-400" size={20} />
          <span className="font-bold tracking-tighter italic uppercase text-sm">Streak: {stats.streak}</span>
        </div>
        <div className="flex gap-1.5">
          {[...Array(DAILY_LIMIT)].map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${i < stats.dailyCount ? 'bg-yellow-400' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>

      <header className="mb-8 text-center">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic">
          CRAQUE DO <span className="text-yellow-400">DIA</span>
        </h1>
        <p className="text-green-100 text-[10px] font-bold uppercase mt-1 tracking-widest">
          Desafio Diário {stats.dailyCount >= DAILY_LIMIT ? DAILY_LIMIT : stats.dailyCount + (gameOver ? 0 : 1)} de {DAILY_LIMIT}
        </p>
      </header>

      {stats.dailyCount >= DAILY_LIMIT && !gameOver ? (
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl text-center shadow-2xl border-b-[10px] border-yellow-500 animate-in zoom-in text-slate-800">
          <Lock className="mx-auto mb-4 text-yellow-500" size={48} />
          <h2 className="text-2xl font-black mb-2 uppercase italic">Treino Concluído!</h2>
          <p className="text-slate-500 font-medium text-sm mb-6">
            Você completou os 3 desafios de hoje. Volte amanhã para novos craques!
          </p>
          <button onClick={shareResults} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
            <Share2 size={20} /> Compartilhar Resumo
          </button>
        </div>
      ) : (
        <>
          {/* Grid de Palpites */}
          <div className="w-full max-w-md space-y-2 mb-6">
            {guesses.map((guess, i) => (
              <div key={i} className="flex justify-center gap-1">
                {targetPlayer.name.split('').map((_, idx) => (
                  <div key={idx} className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-b-4 text-xl font-black rounded-lg ${
                    guess.results[idx] === 'correct' ? 'bg-green-500 border-green-700' : 
                    guess.results[idx] === 'present' ? 'bg-yellow-500 border-yellow-700' : 'bg-slate-900/80 border-black/40 text-slate-400'
                  }`}>{guess.name[idx]}</div>
                ))}
              </div>
            ))}
            {!gameOver && (
              <div className="flex justify-center gap-1">
                {targetPlayer.name.split('').map((_, i) => (
                  <div key={i} className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-b-4 text-xl font-black rounded-lg transition-all ${
                    input[i] ? 'border-yellow-400 bg-white/20 scale-105' : 'border-slate-500 bg-slate-900/60'
                  }`}>{input[i]?.toUpperCase() || ''}</div>
                ))}
              </div>
            )}
          </div>

          {/* Área de Dicas Progressivas */}
          <div className="w-full max-w-sm flex flex-col gap-2 mb-8">
            {guesses.length >= 2 && (
              <div className="bg-yellow-500 text-green-950 p-3 rounded-lg font-bold text-[10px] uppercase flex items-center gap-2 shadow-lg animate-in slide-in-from-left">
                <Lightbulb size={16} className="shrink-0" /> Revelado por: {targetPlayer.revivedPor}
              </div>
            )}
            {guesses.length >= 4 && (
              <div className="bg-white text-green-900 p-3 rounded-lg font-bold text-[10px] uppercase flex items-center gap-2 shadow-lg animate-in slide-in-from-right">
                <Lightbulb size={16} className="shrink-0" /> Título: {randomTitle}
              </div>
            )}
          </div>

          {/* Controle de Jogo */}
          <div className="w-full max-w-sm">
            {!gameOver ? (
              <div className="space-y-4">
                <input
                  type="text"
                  maxLength={targetPlayer.name.length}
                  value={input}
                  onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Záàâãéèêíïóôõöúçñ ]/g, "").toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                  className="w-full bg-black/30 border-2 border-green-500 p-4 rounded-2xl text-center text-2xl font-black tracking-widest focus:outline-none focus:border-yellow-400 text-white uppercase"
                  placeholder="QUEM É?"
                />
                <button onClick={handleGuess} className="w-full bg-yellow-500 hover:bg-yellow-400 text-green-950 font-black py-5 rounded-2xl shadow-[0_6px_0_rgb(161,98,7)] active:translate-y-1 transition-all uppercase tracking-widest">
                  Confirmar Chute
                </button>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-3xl text-center shadow-2xl border-b-[10px] border-yellow-500 animate-in zoom-in text-slate-800">
                <h2 className={`text-3xl font-black mb-1 ${won ? 'text-green-600' : 'text-red-600'}`}>
                  {won ? '🎯 GOLAÇO!' : '❌ NA TRAVE!'}
                </h2>
                <p className="text-xl font-black uppercase mb-6 text-green-900">{targetPlayer.name}</p>
                <div className="flex gap-2">
                  <button onClick={shareResults} className="flex-1 bg-blue-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
                    <Share2 size={18}/> Compartilhar
                  </button>
                  <button onClick={() => loadChallenge(stats.dailyCount)} className="flex-1 bg-green-700 text-white p-4 rounded-2xl font-bold hover:bg-green-600 transition-all shadow-lg">
                    Próximo
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}