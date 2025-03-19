import { Difficulty, Scoreboard } from "@/interfaces/Types";
import { findAll } from "@/utilities/Mongo";
import { formatTime } from "@/utilities/UtilFunctions";
import { useEffect, useState } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import Navbar from "./Navbar";
import { PuffLoader } from "react-spinners";

interface LeaderboardProps {
  defaultDifficulty: Difficulty;
  setState: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({setState, defaultDifficulty}) => {
  const [scores, setScores] = useState<Scoreboard[]>([]);
  const [displayedScores, setDisplayedScores] = useState<Scoreboard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [difficulty, setDifficulty] = useState<Difficulty>(defaultDifficulty);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const fetchScores = async () => {
      const data = await findAll("scores");
      if (!data) return;
      data.sort((a: Scoreboard, b: Scoreboard) => a.time - b.time);
      data.forEach((score: Scoreboard, index: number) => score.rank = index + 1);
      setScores(data);
      const displayedScores = data.filter((score: Scoreboard) => score.difficulty === difficulty).slice(0, 10);
      displayedScores.sort((a: Scoreboard, b: Scoreboard) => a.time - b.time);
      displayedScores.forEach((score: Scoreboard, index: number) => score.rank = index + 1);
      setDisplayedScores(displayedScores);
      setLoading(false);
    };

    fetchScores();
  }, []);

  useEffect(() => {
    if (scores.length > 0) {
      const displayedScores = scores.filter((score: Scoreboard) => score.difficulty === difficulty).slice(0, 10);
      displayedScores.sort((a: Scoreboard, b: Scoreboard) => a.time - b.time);
      displayedScores.forEach((score: Scoreboard, index: number) => score.rank = index + 1);
      setDisplayedScores(displayedScores);
    }
  }, [difficulty])

  useEffect(() => {
    if (search.length > 0) {
      const filtered = displayedScores.filter((score: Scoreboard) => score.name.toLowerCase().includes(search.toLowerCase()));
      setDisplayedScores(filtered);
    }
  }, [search]);

  return (
    <div className="fixed inset-0 bg-transparent w-full h-full backdrop-opacity-80 overflow-y-auto text-gray-900 dark:text-white flex flex-col items-center justify-start z-100">
      <div className="bg-white dark:bg-black px-5 pb-10 pt-5 rounded-md">
        <div className="flex justify-between items-start w-full text-2xl">
          <input onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Search" className=" outline-1 outline-gray-400 rounded-md text-sm px-2 w-40 focus:outline-blue-500 py-1" />
          <IoIosCloseCircleOutline onClick={() => setState()} className="hover:cursor-pointer text-red-500 dark:text-red-300 text-3xl"/>
        </div>
        <Navbar difficulty={difficulty} setDifficulty={setDifficulty} />
        {loading ? (
          window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 
          <div className="flex justify-center"><PuffLoader color="#FFF"/></div> : 
          <div className="flex justify-center"><PuffLoader color="#000"/></div>
        ) : (
          <table className="table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Rank</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Best</th>
                <th className="px-4 py-2 border">Updated</th>
              </tr>
            </thead>
            <tbody>
              {displayedScores.filter((score: Scoreboard) => score.difficulty === difficulty).slice(0, 10).map((score: Scoreboard, index: number) => (
                <tr key={index}>
                  <td className="border px-4 py-2 text-center">{score.rank}</td>
                  <td className="border px-4 py-2">{score.name}</td>
                  <td className="border px-4 py-2">{formatTime(score.time)}</td>
                  <td className="border px-4 py-2">{new Date(score.lastUpdated).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;