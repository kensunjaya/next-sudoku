'use client';
import Modal from "@/components/Modal";
import Navbar from "@/components/Navbar";
import { Difficulty, Puzzle } from "@/interfaces/Types";
import { useEffect, useState } from "react";

export default function Home() {
  const [cells, setCells] = useState<number[][]>([0, 0, 0, 0, 0, 0, 0, 0, 0].map(() => [0, 0, 0, 0, 0, 0, 0, 0, 0]));
  const [puzzle, setPuzzle] = useState<Puzzle[][]>(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => ({ val: 0, wrong: false }))));
  const [selectedCell, setSelectedCell] = useState<number[]>([-1, -1]);
  const [mistakes, setMistakes] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [unsolvedNumber, setUnsolvedNumber] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [difficulty, setDifficulty] = useState<Difficulty>(null);

  const generateRandom3x3matrix = () => {
    const random3x3array = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    return random3x3array;
  }

  const fillDiagonalMatrix = (cells: number[][]) => {
    for (let i = 0; i < 3; i++) {
      const random3x3array = generateRandom3x3matrix();
      for (let j = 3 * i; j < 3 * (i + 1); j++) {
        for (let k = 3 * i; k < 3 * (i + 1); k++) {
          cells[j][k] = random3x3array.shift() ?? 0;
        }
      }
    }
  }

  // Check if a number can be placed in a cell
  const checkIfSafe = (cells: number[][], row: number, col: number, num: number) => {
    for (let i = 0; i < 9; i++) {
      if (cells[row][i] == num) return false;
      if (cells[i][col] == num) return false;
    }
    const startRow = row - row % 3;
    const startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (cells[i + startRow][j + startCol] == num) return false;
      }
    }
    return true;
  }

  const highlightCell = (row: number, col: number) => {
    if (selectedCell[0] == -1) return '';
    if (selectedCell[0] == row && selectedCell[1] == col) return 'bg-gray-400 dark:bg-gray-600';
    if (selectedCell[0] == row || selectedCell[1] == col) return 'bg-gray-200 dark:bg-gray-800';
    const startRow = row - row % 3;
    const startCol = col - col % 3;
    if (puzzle[row][col].val != 0 && !puzzle[selectedCell[0]][selectedCell[1]].wrong && !puzzle[row][col].wrong && puzzle[selectedCell[0]][selectedCell[1]].val == puzzle[row][col].val) return 'bg-gray-400 dark:bg-gray-600';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (selectedCell[0] == i + startRow && selectedCell[1] == j + startCol) return 'bg-gray-200 dark:bg-gray-800';
      }
    }
  }

  // Fill the rest of the cells using backtracking algorithm
  const recursiveFill = (cells: number[][], prev: number) => {
    if (prev == 81) return true; // all cells are filled
    const row = Math.floor(prev / 9);
    const col = prev % 9;
    if (cells[row][col] != 0) return recursiveFill(cells, prev + 1);
    for (let num = 1; num <= 9; num++) {
      if (checkIfSafe(cells, row, col, num)) {
        cells[row][col] = num;
        if (recursiveFill(cells, prev + 1)) return true;
        cells[row][col] = 0;
      }
    }
    return false;
  }

  const createPuzzle = (solution: number[][]) => {
    const puzzle: Puzzle[][] = solution.map(row => row.map(val => ({ val, wrong: false })));
    const cellsToRemove = difficulty == 'easy' ? 38 : difficulty == 'medium' ? 46 : difficulty == 'hard' ? 54 : 62;
    let removed = 0;
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (puzzle[row][col].val != 0) {
        puzzle[row][col].val = 0;
        removed++;
      }
    }
    return puzzle;
  }

  const checkAnswer = (num: number, rowIndex: number, colIndex: number) => {
    if (mistakes >= 3) return;
    if (num >= 1 && num <= 9) {
      if (puzzle[rowIndex][colIndex].val != 0 && !puzzle[rowIndex][colIndex].wrong) return;
      const newPuzzle = puzzle.map(row => row.slice());
      if (cells[rowIndex][colIndex] != num) {
        setMistakes(mistakes + 1);
        newPuzzle[rowIndex][colIndex].wrong = true;
        newPuzzle[rowIndex][colIndex].val = num;
        setPuzzle(newPuzzle);
        return;
      }
      newPuzzle[rowIndex][colIndex].val = num;
      newPuzzle[rowIndex][colIndex].wrong = false;
      setPuzzle(newPuzzle);
      let count = 0;
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (newPuzzle[i][j].val == num) count++;
        }
      }
      if (count == 9) {
        const newUnsolvedNumber = unsolvedNumber.map(n => n == num ? 0 : n);
        setUnsolvedNumber(newUnsolvedNumber);
      }
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, rowIndex: number, colIndex: number) => {
    const num = parseInt(event.key);
    checkAnswer(num, rowIndex, colIndex);
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  const resetPuzzle = () => {
    const newCells = [0, 0, 0, 0, 0, 0, 0, 0, 0].map(() => [0, 0, 0, 0, 0, 0, 0, 0, 0]);
    setCells(newCells);
    setMistakes(0);
    setUnsolvedNumber([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const newPuzzle = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => ({ val: 0, wrong: false })));
    setPuzzle(newPuzzle);
    fillDiagonalMatrix(newCells);
    recursiveFill(newCells, 0);
    setCells([...newCells]);
    setPuzzle(createPuzzle(newCells));
    setTime(0);
  }

  useEffect(() => {
    if (!localStorage.getItem('difficulty')) localStorage.setItem('difficulty', 'easy');
    setDifficulty(localStorage.getItem('difficulty') as Difficulty);
  }, []);

  useEffect(() => {
    if (!difficulty) return;
    resetPuzzle();
    localStorage.setItem('difficulty', difficulty);
    const timeInterval = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
    return () => {
      clearInterval(timeInterval);
    }
  }, [difficulty]);

  const getBorderClass = (rowIndex: number, colIndex: number) => {
    let borderClass = 'border border-gray-500';
    if (rowIndex % 3 === 0) borderClass += ' border-t-2 border-t-black dark:border-t-white';
    if ((rowIndex + 1) % 3 === 0) borderClass += ' border-b-2 border-b-black dark:border-b-white';
    if ((colIndex + 1) % 3 === 0) borderClass += ' border-r-2 border-r-black dark:border-r-white';
    if (colIndex % 3 === 0) borderClass += ' border-l-2 border-l-black dark:border-l-white';
    if (rowIndex === 8) borderClass += ' border-b-2 border-b-black dark:border-b-white';
    if (colIndex === 8) borderClass += ' border-r-2 border-r-black dark:border-r-white';
    return borderClass;
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-3 sm:py-4 font-sans">
      {mistakes >= 3 && <Modal title="Game Over" body="You have made 3 mistakes and lost this game" buttonLabel="New Game" setState={resetPuzzle}/>}
      <main className={`w-fit z-10 ${mistakes >= 3 && 'blur-[0.1rem] opacity-30 transition duration-300 ease-in-out'}`}>
        <h1 className="text-center text-3xl font-bold">Next Sudoku</h1>
        <Navbar difficulty={difficulty} setDifficulty={setDifficulty} />
        <div className="flex flex-row justify-between w-full text-xl sm:text-2xl px-3 sm:px-0">
          <div className="flex flex-col">
            <div>{`Mistakes`}</div>
            <div className="font-bold">{`${mistakes} / 3`}</div>
          </div>
          <div className="flex flex-col text-right">
            <div>{`Time`}</div>
            <div className="font-bold">{`${formatTime(time)}`}</div>
          </div>
        </div>

        <div className="grid mt-4 sm:mt-5 grid-cols-9 text-3xl xs:text-3xl sm:text-3xl md:text-4xl xl:text-5xl border-2 border-black font-light dark:border-white">
          {puzzle.map((row, rowIndex) => row.map((cell, colIndex) =>
            <div
              onClick={() => { setSelectedCell([rowIndex, colIndex]) }}
              onKeyDown={(event) => handleKeyDown(event, rowIndex, colIndex)}
              tabIndex={0}
              key={rowIndex * 9 + colIndex}
              className={`flex justify-center hover:cursor-default items-center ${cell.wrong && 'text-red-600 dark:text-red-400'} ${getBorderClass(rowIndex, colIndex)} h-[2.6rem] w-[2.6rem] xs:h-14 xs:w-14 sm:h-14 sm:w-14 md:h-16 md:w-16 xl:h-18 xl:w-18 ${highlightCell(rowIndex, colIndex)}`}
            >
              {cell.val != 0 || cell.wrong ? cell.val : ''}
            </div>
          ))}
        </div>
        <div className="grid mt-5 grid-cols-9">
          {unsolvedNumber.map((num, index) =>
            <button
              key={index}
              disabled={num == 0}
              onClick={() => checkAnswer(num, selectedCell[0], selectedCell[1])}
              className={`flex transition rounded-md ${num == 0 ? 'opacity-0 hover:cursor-default' : 'hover:cursor-pointer'} justify-center text-cyan-700 dark:text-blue-300 items-center text-3xl md:text-4xl xl:text-5xl h-[2.6rem] w-[2.6rem] xs:h-14 xs:w-14 sm:h-14 sm:w-14 md:h-16 md:w-16 xl:h-18 xl:w-18 hover:bg-gray-200 dark:hover:bg-gray-900`}>
              {num}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}