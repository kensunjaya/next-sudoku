/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import Modal from "@/components/Modal";
import Navbar from "@/components/Navbar";
import { Difficulty, Puzzle } from "@/interfaces/Types";
import { findOne, insertOne, updateOne } from "@/utilities/Mongo";
import { useEffect, useState } from "react";
import { MdOutlineLeaderboard } from "react-icons/md";
import { FaGithub } from "react-icons/fa6";
import Leaderboard from "@/components/Leaderboard";
import { formatTime } from "@/utilities/UtilFunctions";
import { CgErase } from "react-icons/cg";

export default function Home() {
  const [cells, setCells] = useState<number[][]>([0, 0, 0, 0, 0, 0, 0, 0, 0].map(() => [0, 0, 0, 0, 0, 0, 0, 0, 0]));
  const [puzzle, setPuzzle] = useState<Puzzle[][]>(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => ({ val: 0, wrong: false, predefined: true }))));
  const [selectedCell, setSelectedCell] = useState<number[]>([-1, -1]);
  const [mistakes, setMistakes] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [finalTime, setFinalTime] = useState<number>(0);
  const [win, setWin] = useState<boolean>(false);
  const [unsolvedNumber, setUnsolvedNumber] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [difficulty, setDifficulty] = useState<Difficulty>(null);
  const [name, setName] = useState<string>("");
  const [id, setId] = useState<string>("");
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  const closeLeaderboard = () => {
    setShowLeaderboard(false);
  }

  const saveUserScore = async () => {
    if (id) {
      await findOne("scores", id).then((result) => {
        if (result) {
          if (result.time > finalTime) {
            updateOne("scores", id, { time: finalTime, lastUpdated: new Date() });
          }
        }
      });
    }
    else {
      if (name.length >= 3) {
        const data = {
          name: name,
          time: finalTime,
          lastUpdated: new Date(),
          difficulty: difficulty
        };
        const _id = await insertOne("scores", data);
        if (_id) {
          setId(_id.toString());
          localStorage.setItem('_id', _id.toString());
        }
      }
    }
    resetPuzzle();
  }

  const eraseMistake = () => {
    if (selectedCell[0] < 0 || selectedCell[0] < 0) return;
    puzzle[selectedCell[0]][selectedCell[1]].wrong = false;
    puzzle[selectedCell[0]][selectedCell[1]].val = 0;
    setPuzzle([...puzzle]);
  }

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

  const removeRemainingNumbers = (puzzle: Puzzle[][]) => {
    const counter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const unsolvedNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    for (let i=0;i<9;i++) {
      for (let j=0;j<9;j++) {
        counter[puzzle[i][j].val]++;
      }
    }
    for (let i=1;i<=9;i++) {
      if (counter[i] >= 9) {
        unsolvedNumber[i-1] = 0
      }
    }
    setUnsolvedNumber(unsolvedNumber)
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
    const puzzle: Puzzle[][] = solution.map(row => row.map(val => ({ val, wrong: false, predefined: true })));
    const cellsToRemove = difficulty == 'easy' ? 38 : difficulty == 'medium' ? 46 : difficulty == 'hard' ? 52 : 58;
    let removed = 0;
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (puzzle[row][col].val != 0) {
        puzzle[row][col].val = 0;
        puzzle[row][col].predefined = false;
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
          if (newPuzzle[i][j].val == num && !newPuzzle[i][j].wrong) count++;
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

  const resetPuzzle = () => {
    const newCells = [0, 0, 0, 0, 0, 0, 0, 0, 0].map(() => [0, 0, 0, 0, 0, 0, 0, 0, 0]);
    setCells(newCells);
    setMistakes(0);
    setWin(false);
    setSelectedCell([-1, -1]);
    setUnsolvedNumber([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const newPuzzle = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => ({ val: 0, wrong: false, predefined: true })));
    setPuzzle(newPuzzle);
    fillDiagonalMatrix(newCells);
    recursiveFill(newCells, 0);
    setCells([...newCells]);
    const newPuzzleCreated = createPuzzle(newCells);
    setPuzzle(newPuzzleCreated);
    setTime(0);
    removeRemainingNumbers(newPuzzleCreated);
  }

  useEffect(() => {
    if (!localStorage.getItem('difficulty')) localStorage.setItem('difficulty', 'easy');
    setDifficulty(localStorage.getItem('difficulty') as Difficulty);
    const userId = localStorage.getItem('_id');
    if (userId) {
      console.log("id exists, setting id")
      setId(userId);
    }
  }, []);

  useEffect(() => {
    for (const elm of unsolvedNumber) {
      if (elm != 0) return;
    }
    setWin(true);
  }, [unsolvedNumber]);

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

  useEffect(() => {
    if (win) {
      setFinalTime(time);
    }
  }, [win]);

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
      {mistakes >= 3 && 
      <Modal 
        title="Game Over" 
        body="You have made 3 mistakes and lost this game" 
        buttonLabel="New Game" 
        setState={resetPuzzle}/>
      }
      {win &&
      <Modal
        title="Congratulations"
        body={`You have successfully completed the puzzle in ${formatTime(finalTime)}`}
        buttonLabel="New Game"
        setState={saveUserScore}
        setInput={(val) => setName(val)}
        input={id ? undefined : name}
      />
      }
      {showLeaderboard && <Leaderboard setState={closeLeaderboard} defaultDifficulty={difficulty} />}
      <main className={`w-fit z-10 ${(mistakes >= 3 || win || showLeaderboard) && 'blur-[0.1rem] opacity-30 transition duration-300 ease-in-out'}`}>
        <div className="flex flex-row text-3xl xs:text-3xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-4xl text-center justify-between items-center">
          <MdOutlineLeaderboard className="hover:cursor-pointer" onClick={() => setShowLeaderboard(!showLeaderboard)} />
          <h1 className="text-center font-bold">Next Sudoku</h1>
          <FaGithub className="hover:cursor-pointer" onClick={() => window.open("https://github.com/kensunjaya", "_blank")} />
        </div>
        <Navbar difficulty={difficulty} setDifficulty={setDifficulty} />
        <div className="flex flex-row justify-between items-center w-full text-xl sm:text-2xl px-3 sm:px-0">
          <div className="flex flex-col min-w-30">
            <div>{`Mistakes`}</div>
            <div className="font-bold">{`${mistakes} / 3`}</div>
          </div>
          <CgErase className="text-5xl hover:cursor-pointer" onClick={() => eraseMistake()} />
          <div className="flex flex-col text-right min-w-30">
            <div>{`Time`}</div>
            <div className="font-bold">{`${formatTime(win ? finalTime : time)}`}</div>
          </div>
        </div>

        <div className="grid mt-4 sm:mt-5 grid-cols-9 text-3xl xs:text-3xl sm:text-3xl md:text-5xl lg:text-5xl xl:text-5xl border-2 border-black font-light dark:border-white">
          {puzzle.map((row, rowIndex) => row.map((cell, colIndex) =>
            <div
              onClick={() => { setSelectedCell([rowIndex, colIndex]) }}
              onKeyDown={(event) => handleKeyDown(event, rowIndex, colIndex)}
              tabIndex={0}
              key={rowIndex * 9 + colIndex}
              className={`flex justify-center ${!cell.predefined && 'text-blue-900 dark:text-blue-200'} hover:cursor-default items-center ${cell.wrong && 'text-red-600 dark:text-red-400'} ${getBorderClass(rowIndex, colIndex)} h-[2.6rem] w-[2.6rem] xs:h-14 xs:w-14 sm:h-14 sm:w-14 md:h-16 md:w-16 xl:h-18 xl:w-18 ${highlightCell(rowIndex, colIndex)}`}
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
              className={`flex transition rounded-md ${num == 0 ? 'opacity-0 duration-0 hover:cursor-default' : 'hover:cursor-pointer'} justify-center text-cyan-700 dark:text-blue-300 items-center text-3xl md:text-5xl lg:text-5xl xl:text-5xl h-[2.rem] w-[2.6rem] xs:h-14 xs:w-14 sm:h-14 sm:w-14 md:h-16 md:w-16 xl:h-18 xl:w-18 hover:bg-gray-200 dark:hover:bg-gray-900`}>
              {num}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}