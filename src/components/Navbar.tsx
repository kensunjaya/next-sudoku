'use client';
import { Difficulty } from "@/interfaces/Types";

interface NavbarProps {
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
}

const Navbar: React.FC<NavbarProps> = ({difficulty, setDifficulty}) => {
  return (
    <nav className="flex flex-row text-black dark:text-gray-200 justify-around py-4 sm:py-5 text-lg">
      <button className={`hover:cursor-pointer hover:scale-120 transition px-3 rounded-sm ${difficulty == 'easy' && 'text-cyan-700 dark:text-blue-300'}`} onClick={() => setDifficulty("easy")}>easy</button>
      <button className={`hover:cursor-pointer hover:scale-120 transition px-3 rounded-sm ${difficulty == 'medium' && 'text-cyan-700 dark:text-blue-300'}`} onClick={() => setDifficulty("medium")}>medium</button>
      <button className={`hover:cursor-pointer hover:scale-120 transition px-3 rounded-sm ${difficulty == 'hard' && 'text-cyan-700 dark:text-blue-300'}`} onClick={() => setDifficulty("hard")}>hard</button>
      <button className={`hover:cursor-pointer hover:scale-120 transition px-3 rounded-sm ${difficulty == 'expert' && 'text-cyan-700 dark:text-blue-300'}`} onClick={() => setDifficulty("expert")}>expert</button>
    </nav>
  );
}

export default Navbar;