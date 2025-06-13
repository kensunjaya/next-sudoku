# NExT Sudoku

NExT Sudoku is a classic Sudoku game that runs entirely in your web browser.

---

## 🚀 How Do We Generate the Grid Randomly?

Since a standard 9×9 Sudoku grid consists of 3×3 sub-grids, we start by filling the **three diagonal sub-grids** with random values from 1–9. These diagonal sub-grids are independent of each other, meaning they don’t interfere with the rules outside their sub-grid.

<p align="center">
  <img src="https://imgur.com/7tyyD2g.png" width="450px" alt="Diagonal Sub-grids"/>
</p>

After filling the diagonal sub-grids, we use a **recursive backtracking algorithm** to fill in the rest of the board while ensuring Sudoku rules are followed.

<p align="center">
  <img src="https://imgur.com/QJFwtDC.png" width="450px" alt="Backtracking"/>
</p>

Once we have a completely valid Sudoku grid, we remove some numbers to create a playable puzzle. The **difficulty level** determines how many numbers are removed.

<p align="center">
  <img src="https://imgur.com/6jlg1AB.png" width="450px" alt="Difficulty Levels"/>
</p>

---

## 🛠️ Getting Started

First, install the required dependencies:

```bash
npm install
```

---

## 💾 DynamoDB Setup for NExT Sudoku

### 1. Get an AWS Account

If you don't have one, [create an AWS account](https://aws.amazon.com/). The AWS Free Tier is great for starting out.

---

### 2. Create an AWS IAM User

For security, it's best to create a dedicated IAM user for your application.

- Log in to the AWS Management Console.
- Navigate to the **IAM** service.
- Click **Users** → **Add users**.
- **Set Permissions**:
  - Choose: `Attach existing policies directly`
  - Select: `AmazonDynamoDBFullAccess`
- Complete the steps and **Create user**.
- **Important**: Download the `.csv` file or save the **Access key ID** and **Secret access key** securely.

---

### 3. Create a DynamoDB Table

This table will store the player's scores.

- Go to **DynamoDB** in the AWS Console.
- Click **Tables** → **Create table**.
- **Table Details**:
  - **Table name**: `SudokuScores`
  - **Partition key**: `name` (Type: `String`)
  - **Sort key**: `difficulty` (Type: `String`)
  - Use default settings, and click **Create table**.

---

### 4. Link DynamoDB to Your Application

Use environment variables to securely configure your app:

1. Create a `.env` file in the root of your project:

    ```env
    AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
    AWS_REGION=YOUR_AWS_REGION  # e.g., ap-southeast-1
    ```

2. Never commit this file to version control. Add `.env` to your `.gitignore`.

<p align="center">
  <img src="https://imgur.com/tLknajb.png" width="200px" alt="AWS Setup"/>
</p>

---

## 🧪 Run the Website Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see it in action.
