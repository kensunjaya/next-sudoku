export type Difficulty = "easy" | "medium" | "hard" | "expert" | null;

export type Puzzle = {
  val: number;
  wrong: boolean;
  predefined: boolean;
}

export type Scoreboard = {
  _id?: string;
  rank?: number;
  name: string;
  time: number;
  difficulty: Difficulty;
  lastUpdated: Date;
}
