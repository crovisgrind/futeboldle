'use client';

import React, { useState, useEffect } from 'react';
import { RotateCcw, Lightbulb, Share2, Trophy, Lock, CheckCircle2, Shield } from 'lucide-react';
import { sendGAEvent } from '@next/third-parties/google';
import playersData from '../../data/players.json';

const PLAYERS = Array.isArray(playersData) && playersData.length > 0 ? playersData : [];
const DAILY_LIMIT = 3;

const getDailyPlayerIndex = (challengeNumber) => {
  const today = new Date();
  // Criamos uma chave única para o dia e o número do desafio
  const seedString = `craque-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}-${challengeNumber}`;
  
  // Algoritmo de Hashing DJB2 (mais estável que Math.sin)
  let hash = 5381;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash * 33) ^ seedString.charCodeAt(i);
  }
  
  // Garante que o índice esteja dentro do tamanho da sua lista de jogadores
  return Math.abs(hash) % PLAYERS.length;
};

export default function CraqueDoDia() {
  const [targetPlayer, setTargetPlayer] = useState(null);
  const [randomTitle, setRandomTitle] = useState('');
  const [randomTeam, setRandomTeam] = useState(''); // Novo estado para o time
  const [guesses, setGuesses] = useState([]);
  const [input, setInput] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [stats, setStats] = useState({ dailyCount: 0, streak: 0, lastDate: '' });

  useEffect(() => {
    const today = new Date().toLocaleDateString('pt-BR');
    const savedStats = JSON.parse(localStorage.getItem('craquedodia_stats')) || {
      dailyCount: 0,
      streak: 0,
      lastDate: today
    };

    if (savedStats.lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (savedStats.lastDate !== yesterday.toLocaleDateString('pt-BR')) {
        savedStats.streak = 0;
      }
      savedStats.dailyCount = 0;
      savedStats.lastDate = today;
      localStorage.setItem('craquedodia_stats', JSON.stringify(savedStats));
    }

    setStats(savedStats);
    if (savedStats.dailyCount < DAILY_LIMIT) {
      loadChallenge(savedStats.dailyCount);
    }
  }, []);

  const loadChallenge = (count) => {
    if (count < DAILY_LIMIT) {
      const index = getDailyPlayerIndex(count);
      const player = PLAYERS[index];
      setTargetPlayer(player);
      
      // Sorteia um Título
      if (player?.titles?.length > 0) {
        setRandomTitle(player.titles[Math.floor(Math.random() * player.titles.length)]);
      }

      // Sorteia um Time (Sua nova dica!)
      if (player?.times?.length > 0) {
        setRandomTeam(player.times[Math.floor(Math.random() * player.times.length)]);
      }

      setGuesses([]);
      setInput('');
      setGameOver(false);
      setWon(false);
    } else {
      setTargetPlayer(null);
    }
  };

  const handleGuess = () => {
    if (stats.dailyCount >= DAILY_LIMIT || !targetPlayer || gameOver) return;
    if (input.trim().length !== targetPlayer.name.length) return;

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
    if (isWin) newStats.streak += 1;
    setStats(newStats);
    localStorage.setItem('craquedodia_stats', JSON.stringify(newStats));
  };

  const shareResults = (isFinal = false) => {
    sendGAEvent({
      event: 'share_results',
      value: isFinal ? 'final_placar' : `desafio_${stats.dailyCount}`,
      player_name: targetPlayer?.name || 'resumo_geral'
    });

    const shareUrl = 'https://craquedodia.com.br';
    let text = "";

    if (isFinal) {
      text = `Completei o Craque do Dia! ⚽🏆\nStreak atual: ${stats.streak} 🔥\nDesafios vencidos hoje: ${stats.dailyCount}/${DAILY_LIMIT}\n\nJogue também: ${shareUrl}`;
    } else {
      const squares = guesses.map(g => 
        g.results.map(r => r === 'correct' ? '🟩' : r === 'present' ? '🟨' : '⬛').join('')
      ).join('\n');
      text = `Adivinhei o Craque do Dia! ⚽\n\n${squares}\n\nDesafio ${stats.dailyCount}/${DAILY_LIMIT}\n${shareUrl}`;
    }
    
    if (navigator.share) {
      navigator.share({ title: 'Craque do Dia', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Resultado copiado!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex flex-col items-center p-4 font-sans text-white">
      
      {/* HUD Superior */}
      <div className="w-full max-w-md flex justify-between items-center mb-8 bg-black/30 p-4 rounded-2xl border border-white/10 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-400" size={20} />
          <span className="font-bold tracking-tighter italic uppercase">Streak: {stats.streak}</span>
        </div>
        <div className="flex gap-2">
          {[...Array(DAILY_LIMIT)].map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full transition-all duration-500 ${i < stats.dailyCount ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>

      <header className="mb-8 text-center">
        <h1 className="text-5xl font-black tracking-tighter uppercase italic drop-shadow-lg">
          CRAQUE DO <span className="text-yellow-400 text-6xl block sm:inline">DIA</span>
        </h1>
        <p className="text-green-100 text-[10px] font-bold uppercase mt-2 tracking-[0.2em] opacity-80">
          Três desafios diários • Futebol Brasileiro
        </p>
      </header>

      {!targetPlayer && stats.dailyCount >= DAILY_LIMIT ? (
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl text-center shadow-2xl border-b-[10px] border-yellow-500 animate-in zoom-in text-slate-800">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="text-green-600" size={48} />
          </div>
          <h2 className="text-2xl font-black mb-2 uppercase italic">Sessão Finalizada!</h2>
          <p className="text-slate-500 font-medium text-sm mb-6">
            Você já jogou os {DAILY_LIMIT} craques de hoje. Volte amanhã!
          </p>
          <button onClick={() => shareResults(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
            <Share2 size={20} /> Compartilhar Placar
          </button>
        </div>
      ) : targetPlayer ? (
        <>
          {/* GRID DE JOGO */}
          <div className="w-full max-w-md space-y-2 mb-6">
            {guesses.map((guess, i) => (
              <div key={i} className="flex justify-center gap-1.5 animate-in slide-in-from-bottom-2">
                {targetPlayer.name.split('').map((_, idx) => (
                  <div key={idx} className={`w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center border-b-4 text-2xl font-black rounded-lg transition-colors duration-500 ${
                    guess.results[idx] === 'correct' ? 'bg-green-500 border-green-700 shadow-lg' : 
                    guess.results[idx] === 'present' ? 'bg-yellow-500 border-yellow-700 shadow-md' : 'bg-slate-900/80 border-black/40 text-slate-400'
                  }`}>{guess.name[idx]}</div>
                ))}
              </div>
            ))}
            
            {!gameOver && (
              <div className="flex justify-center gap-1.5">
                {targetPlayer.name.split('').map((_, i) => (
                  <div key={i} className={`w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center border-b-4 text-2xl font-black rounded-lg transition-all ${
                    input[i] ? 'border-yellow-400 bg-white/20 scale-105 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'border-slate-500 bg-slate-900/60 shadow-inner'
                  }`}>{input[i]?.toUpperCase() || ''}</div>
                ))}
              </div>
            )}
          </div>

          {/* DICAS PROGRESSIVAS */}
          <div className="w-full max-w-sm flex flex-col gap-2 mb-8 px-2">
            
            {/* DICA 1: Sempre visível ou após o 1º erro - Decidi colocar após o 1º palpite para dar um desafio inicial */}
            {guesses.length >= 0 && (
              <div className="bg-green-600 text-white p-3 rounded-xl font-bold text-[10px] uppercase flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-left-4 border border-green-400/30">
                <div className="bg-white/20 p-1.5 rounded-lg"><Shield size={16} /></div>
                <span>Jogou no: {randomTeam}</span>
              </div>
            )}

            {/* DICA 2: Revelação (RevivedPor) */}
            {guesses.length >= 3 && (
              <div className="bg-yellow-500 text-green-950 p-3 rounded-xl font-bold text-[10px] uppercase flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-right-4">
                <div className="bg-green-950/10 p-1.5 rounded-lg"><Lightbulb size={16} /></div>
                <span>Revelado por: {targetPlayer.revivedPor}</span>
              </div>
            )}

            {/* DICA 3: Título */}
            {guesses.length >= 5 && (
              <div className="bg-white text-green-900 p-3 rounded-xl font-bold text-[10px] uppercase flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-left-4">
                <div className="bg-green-900/10 p-1.5 rounded-lg"><Lightbulb size={16} /></div>
                <span>Conquista: {randomTitle}</span>
              </div>
            )}
          </div>

          {/* CONTROLES */}
          <div className="w-full max-w-sm px-2">
            {!gameOver ? (
              <div className="space-y-4">
                <input
                  type="text"
                  maxLength={targetPlayer.name.length}
                  value={input}
                  onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Záàâãéèêíïóôõöúçñ ]/g, "").toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                  className="w-full bg-black/40 border-2 border-green-500/50 p-5 rounded-2xl text-center text-3xl font-black tracking-[0.3em] focus:outline-none focus:border-yellow-400 transition-all placeholder:opacity-30"
                  placeholder="PALPITE"
                />
                <button onClick={handleGuess} className="w-full bg-yellow-500 hover:bg-yellow-400 text-green-950 font-black py-5 rounded-2xl shadow-[0_6px_0_rgb(161,98,7)] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest text-lg">
                  Confirmar
                </button>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-3xl text-center shadow-2xl border-b-[10px] border-yellow-500 animate-in zoom-in text-slate-800">
                <h2 className={`text-3xl font-black mb-1 ${won ? 'text-green-600' : 'text-red-600'}`}>
                  {won ? '🎯 GOLAÇO!' : '❌ NA TRAVE!'}
                </h2>
                <p className="text-2xl font-black uppercase mb-6 text-green-900 tracking-tighter italic">
                  {targetPlayer.name}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => shareResults(false)} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
                    <Share2 size={18}/> Compartilhar
                  </button>
                  <button 
                    onClick={() => loadChallenge(stats.dailyCount)} 
                    className="flex-1 bg-green-700 text-white py-4 rounded-2xl font-bold hover:bg-green-600 transition-all shadow-md"
                  >
                    {stats.dailyCount < DAILY_LIMIT ? 'Próximo' : 'Ver Placar Final'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}