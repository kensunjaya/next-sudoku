# NExT Sudoku
NExT Sudoku is an ordinary sudoku game running on a web browser
## How do we generate the grid randomly?
<p>Since a standard 9×9 Sudoku grid consists of 3×3 sub-grids, we start by filling the three diagonal sub-grids with random values from 1-9. These diagonal sub-grids are independent of each other, meaning they don’t interfere with the rules outside their sub-grid.</p>
<img src="https://imgur.com/7tyyD2g.png" width="450px" />
<br/>
<p>After filling the diagonal sub-grids, we use a recursive backtracking algorithm to fill in the rest of the board while ensuring Sudoku rules are followed.</p>
<img src="https://imgur.com/QJFwtDC.png" width="450px" />
<br/>
<p>Once we have a completely valid Sudoku grid, we remove some numbers from the board to create a puzzle. The difficulty level determines how many numbers are removed.</p>
<img src="https://imgur.com/6jlg1AB.png" width="450px" />

## Getting Started

First, install the required dependencies
```bash
npm install
```

Run the website on localhost
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
