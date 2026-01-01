import WordleJogadores from './components/WordleJogadores';
import { sendGAEvent } from '@next/third-parties/google';
export default function Home() {
  return <WordleJogadores />;
}