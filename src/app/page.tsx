'use client';
import { useEffect, useState } from "react";

type Puzzle = {
  val: number;
  wrong: boolean;
}

export default function Home() {
  const [cells, setCells] = useState<number[][]>([0, 0, 0, 0, 0, 0, 0, 0, 0].map(() => [0, 0, 0, 0, 0, 0, 0, 0, 0]));
  const [puzzle, setPuzzle] = useState<Puzzle[][]>(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => ({ val: 0, wrong: false }))));
  const [selectedCell, setSelectedCell] = useState<number[]>([-1, -1]);
  const [mistakes, setMistakes] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [unsolvedNumber, setUnsolvedNumber] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  const generateRandom3x3matrix = () => {
    const random3x3array = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    return random3x3array;
  }

  const fillDiagonalMatrix = (cells: number[][]) => {
    for (let i=0;i<3;i++) {
      const random3x3array = generateRandom3x3matrix();
      for (let j=3*i;j<3*(i+1);j++) {
        for (let k=3*i;k<3*(i+1);k++) {
          cells[j][k] = random3x3array.shift() ?? 0;
        }
      }
    }
  }

  // Check if a number can be placed in a cell
  const checkIfSafe = (cells: number[][], row: number, col: number, num: number) => {
    for (let i=0;i<9;i++) {
      if (cells[row][i] == num) return false;
      if (cells[i][col] == num) return false;
    }
    const startRow = row - row%3;
    const startCol = col - col%3;
    for (let i=0;i<3;i++) {
      for (let j=0;j<3;j++) {
        if (cells[i+startRow][j+startCol] == num) return false;
      }
    }
    return true;
  }

  const highlightCell = (row: number, col: number) => {
    if (selectedCell[0] == -1) return '';
    if (selectedCell[0] == row && selectedCell[1] == col) return 'bg-gray-200 dark:bg-gray-600';
    if (selectedCell[0] == row || selectedCell[1] == col) return 'bg-gray-200 dark:bg-gray-800';
    const startRow = row - row%3;
    const startCol = col - col%3;
    if (puzzle[row][col].val != 0 && puzzle[selectedCell[0]][selectedCell[1]].val == puzzle[row][col].val) return 'bg-gray-200 dark:bg-gray-600';
    for (let i=0;i<3;i++) {
      for (let j=0;j<3;j++) {
        if (selectedCell[0] == i+startRow && selectedCell[1] == j+startCol) return 'bg-gray-200 dark:bg-gray-800';
      }
    }
  }

  // Fill the rest of the cells using backtracking algorithm
  const recursiveFill = (cells: number[][], prev: number) => {
    if (prev == 81) return true; // all cells are filled
    const row = Math.floor(prev/9);
    const col = prev%9;
    if (cells[row][col] != 0) return recursiveFill(cells, prev+1);
    for (let num=1;num<=9;num++) {
      if (checkIfSafe(cells, row, col, num)) {
        cells[row][col] = num;
        if (recursiveFill(cells, prev+1)) return true;
        cells[row][col] = 0;
      }
    }
    return false;
  }

  const createPuzzle = (solution: number[][]) => {
    const puzzle: Puzzle[][] = solution.map(row => row.map(val => ({ val, wrong: false })));
    for (let i = 0; i < 81; i++) {
      if (Math.random() < 0.5) {
        const row = Math.floor(i / 9);
        const col = i % 9;
        puzzle[row][col].val = 0;
      }
    }
    return puzzle;
  }

  const checkAnswer = (num: number, rowIndex: number, colIndex: number) => {
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
      for (let i=0;i<9;i++) {
        for (let j=0;j<9;j++) {
          if (newPuzzle[i][j].val == num) count++;
        }
      }
      if (count == 9) {
        const newUnsolvedNumber = unsolvedNumber.filter(n => n != num);
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

  useEffect(() => {
    fillDiagonalMatrix(cells);
    setCells([...cells]);
    recursiveFill(cells, 0);
    setCells([...cells]);
    setPuzzle(createPuzzle(cells));
    const timeInterval = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
    return () => {
      clearInterval(timeInterval);
    }
  }, []);

  const getBorderClass = (rowIndex: number, colIndex: number) => {
    let borderClass = 'border border-gray-500';
    if (rowIndex % 3 === 0) borderClass += ' border-t-2 border-t-white';
    if ((rowIndex+1) % 3 === 0) borderClass += ' border-b-2 border-b-white';
    if ((colIndex+1) % 3 === 0) borderClass += ' border-r-2 border-r-white';
    if (colIndex % 3 === 0) borderClass += ' border-l-2 border-l-white';
    if (rowIndex === 8) borderClass += ' border-b-2 border-b-white';
    if (colIndex === 8) borderClass += ' border-r-2 border-r-white';
    return borderClass;
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-2">
      <main className="w-fit">
        <div className="flex flex-row justify-between w-full text-xl sm:text-2xl">
          <div className="flex flex-col">
            <div>{`Mistakes`}</div>
            <div className="font-bold">{`${mistakes} / 3`}</div>
          </div>
          <div className="flex flex-col text-right">
            <div>{`Time`}</div>
            <div className="font-bold">{`${formatTime(time)}`}</div>
          </div>
        </div>
        
        <div className="grid mt-5 grid-cols-9 text-3xl xs:text-3xl sm:text-3xl md:text-4xl xl:text-5xl border-2 border-black dark:border-white">
          {puzzle.map((row, rowIndex) => row.map((cell, colIndex) =>
            <div 
              onClick={() => {setSelectedCell([rowIndex, colIndex])}} 
              onKeyDown={(event) => handleKeyDown(event, rowIndex, colIndex)}
              tabIndex={0}
              key={rowIndex * 9 + colIndex} 
              className={`flex justify-center hover:cursor-default items-center ${cell.wrong && 'text-red-400'} ${getBorderClass(rowIndex, colIndex)} h-[2.4rem] w-[2.4rem] xs:h-14 xs:w-14 sm:h-12 sm:w-12 md:h-14 md:w-14 xl:h-16 xl:w-16 ${highlightCell(rowIndex, colIndex)}`}
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
              className="flex hover:cursor-pointer justify-center text-blue-300 items-center text-3xl md:text-4xl xl:text-5xl h-[2.4rem] w-[2.4rem] xs:h-14 xs:w-14 sm:h-12 sm:w-12 md:h-14 md:w-14 xl:h-16 xl:w-16 hover:bg-gray-200 dark:hover:bg-gray-900">
              {num != 0 ? num : ''}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}