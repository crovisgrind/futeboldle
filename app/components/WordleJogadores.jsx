'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Lightbulb, Share2, Trophy, Lock, CheckCircle2, Shield } from 'lucide-react';
import { sendGAEvent } from '@next/third-parties/google';
import playersData from '../data/players.json';

const PLAYERS = Array.isArray(playersData) && playersData.length > 0 ? playersData : [];
const DAILY_LIMIT = 3;

// --- Função de Normalização para Acentos e Case ---
const normalizeText = (text) => {
  return text
    .normalize("NFD") // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
    .toUpperCase() // Tudo para maiúsculo
    .trim(); // Remove espaços extras
};

// --- Função para gerar o Índice do Jogador Diário ---
const getDailyPlayerIndex = (challengeNumber) => {
  const today = new Date();
  const seedString = `craque-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}-${challengeNumber}`;
  
  let hash = 5381;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash * 33) ^ seedString.charCodeAt(i);
  }
  
  return Math.abs(hash) % PLAYERS.length;
};

// --- COMPONENTE PRINCIPAL ---
export default function CraqueDoDia() {
  const [targetPlayer, setTargetPlayer] = useState(null);
  const [randomTitle, setRandomTitle] = useState('');
  const [randomTeam, setRandomTeam] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [input, setInput] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [stats, setStats] = useState({ dailyCount: 0, streak: 0, lastDate: '' });
  const [keyboardState, setKeyboardState] = useState({}); // Estado para o teclado virtual

  // --- Efeito para Carregar Estatísticas e Desafio ---
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
      // Reseta o streak se não jogou ontem
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
    } else {
      // Se já jogou todos, esconde o input e mostra a tela final
      setTargetPlayer(null); // Para renderizar a tela de "Sessão Finalizada"
    }
  }, []);

  // --- Função para Carregar um Novo Desafio ---
  const loadChallenge = (count) => {
    if (count < DAILY_LIMIT) {
      const index = getDailyPlayerIndex(count);
      const player = PLAYERS[index];
      setTargetPlayer(player);
      
      if (player?.titles?.length > 0) {
        setRandomTitle(player.titles[Math.floor(Math.random() * player.titles.length)]);
      } else {
        setRandomTitle('Sem títulos registrados'); // Fallback
      }

      if (player?.times?.length > 0) {
        setRandomTeam(player.times[Math.floor(Math.random() * player.times.length)]);
      } else {
        setRandomTeam('Time desconhecido'); // Fallback
      }

      setGuesses([]);
      setInput('');
      setGameOver(false);
      setWon(false);
      setKeyboardState({}); // Reseta o estado do teclado para o novo desafio
    } else {
      setTargetPlayer(null); // Para renderizar a tela de "Sessão Finalizada"
    }
  };

  // --- Função para Finalizar o Jogo (Vitória/Derrota) ---
  const finishGame = (isWin) => {
    setGameOver(true);
    setWon(isWin);
    const newStats = { ...stats };
    newStats.dailyCount += 1;
    if (isWin) newStats.streak += 1;
    setStats(newStats);
    localStorage.setItem('craquedodia_stats', JSON.stringify(newStats));

    // Atualiza o estado do teclado com base nas letras corretas/presentes
    if (isWin && targetPlayer) {
        const targetNormal = normalizeText(targetPlayer.name);
        const newKeyboardState = { ...keyboardState };
        targetNormal.split('').forEach(char => {
            newKeyboardState[char] = 'correct'; // Todas as letras da resposta final ficam verdes
        });
        setKeyboardState(newKeyboardState);
    }
  };

  // --- Função para Lidar com Palpites ---
  const handleGuess = useCallback(() => {
    if (stats.dailyCount >= DAILY_LIMIT || !targetPlayer || gameOver) return;
    if (input.trim().length !== targetPlayer.name.length) return;

    const guessUpper = input.trim().toUpperCase();
    const targetUpper = targetPlayer.name.toUpperCase();
    
    // Versões sem acento para comparação lógica
    const guessNormal = normalizeText(guessUpper);
    const targetNormal = normalizeText(targetUpper);
    
    const currentKeyboardState = { ...keyboardState };

    const results = guessNormal.split('').map((char, i) => {
      let status = 'absent';
      // 1. Letra correta na posição correta (considerando normalização)
      if (char === targetNormal[i]) {
        status = 'correct';
      } 
      // 2. Letra existe no nome mas em outra posição
      else if (targetNormal.includes(char)) {
        status = 'present';
      }
      
      // Atualiza o estado do teclado: 'correct' > 'present' > 'absent'
      if (currentKeyboardState[char] !== 'correct' && currentKeyboardState[char] !== 'present') {
          currentKeyboardState[char] = status;
      } else if (currentKeyboardState[char] === 'present' && status === 'correct') {
          currentKeyboardState[char] = 'correct';
      }
      return status;
    });

    setKeyboardState(currentKeyboardState);

    const newGuesses = [...guesses, { name: guessUpper, results }];
    setGuesses(newGuesses);
    setInput('');

    // Comparação final de vitória também normalizada
    if (guessNormal === targetNormal) {
      finishGame(true);
    } else if (newGuesses.length >= 6) {
      finishGame(false);
    }
  }, [input, stats.dailyCount, targetPlayer, gameOver, guesses, keyboardState, finishGame]);


  // --- Funções do Teclado Virtual ---
  const handleVirtualKeyPress = useCallback((key) => {
    if (gameOver) return;

    if (key === 'ENTER') {
      handleGuess();
    } else if (key === 'BACKSPACE') {
      setInput((prev) => prev.slice(0, -1));
    } else if (input.length < targetPlayer.name.length) {
      setInput((prev) => prev + key);
    }
  }, [input, targetPlayer, gameOver, handleGuess]);

  // --- Escuta por Teclas do Teclado Físico ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;

      if (e.key === 'Enter') {
        handleGuess();
      } else if (e.key === 'Backspace') {
        setInput((prev) => prev.slice(0, -1));
      } else if (e.key.length === 1 && /[a-zA-Záàâãéèêíïóôõöúçñ ]/.test(e.key)) {
        if (targetPlayer && input.length < targetPlayer.name.length) {
          setInput((prev) => prev + e.key.toUpperCase());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input, targetPlayer, gameOver, handleGuess]);

  // --- Função para Compartilhar Resultados ---
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

  // --- Teclado Virtual Layout ---
  const keyboardLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  const getButtonClass = (char) => {
      const state = keyboardState[char];
      if (state === 'correct') return 'bg-green-500 text-white';
      if (state === 'present') return 'bg-yellow-500 text-white';
      if (state === 'absent') return 'bg-slate-700 text-slate-300';
      return 'bg-slate-600 hover:bg-slate-500 text-white';
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
            {guesses.length >= 0 && (
              <div className="bg-green-600 text-white p-3 rounded-xl font-bold text-[10px] uppercase flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-left-4 border border-green-400/30">
                <div className="bg-white/20 p-1.5 rounded-lg"><Shield size={16} /></div>
                <span>Jogou no: {randomTeam}</span>
              </div>
            )}

            {guesses.length >= 3 && (
              <div className="bg-yellow-500 text-green-950 p-3 rounded-xl font-bold text-[10px] uppercase flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-right-4">
                <div className="bg-green-950/10 p-1.5 rounded-lg"><Lightbulb size={16} /></div>
                <span>Revelado por: {targetPlayer.revivedPor}</span>
              </div>
            )}

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
                {/* Input desabilitado para forçar o uso do teclado virtual em mobile */}
                <input
                  type="text"
                  maxLength={targetPlayer.name.length}
                  value={input}
                  onChange={(e) => setInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                  className="w-full bg-black/40 border-2 border-green-500/50 p-5 rounded-2xl text-center text-3xl font-black tracking-[0.3em] focus:outline-none focus:border-yellow-400 transition-all placeholder:opacity-30"
                  placeholder="PALPITE"
                  disabled // Desabilita o input para focar no teclado virtual
                />
                
                {/* Teclado Virtual */}
                <div className="w-full flex flex-col gap-1.5 mt-4">
                    {keyboardLayout.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center gap-1">
                            {row.map((char) => (
                                <button
                                    key={char}
                                    onClick={() => handleVirtualKeyPress(char)}
                                    className={`
                                        flex-1 h-12 text-lg font-bold rounded-md uppercase transition-colors duration-200
                                        ${getButtonClass(char)}
                                        ${char === 'ENTER' ? 'flex-[1.5] bg-green-700 hover:bg-green-600' : ''}
                                        ${char === 'BACKSPACE' ? 'flex-[1.5] bg-red-700 hover:bg-red-600' : ''}
                                    `}
                                >
                                    {char === 'BACKSPACE' ? '⌫' : char}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
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