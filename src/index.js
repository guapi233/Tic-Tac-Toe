import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

// 格子
function Square(props) {
  return (
    <button
      className={"square " + (props.winner ? "active-btn" : "")}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

// 棋盘
class Board extends React.Component {
  checkWinner(i) {
    return this.props.winnerList.includes(i);
  }

  renderSquare(i) {
    return (
      <Square
        key={i}
        winner={this.checkWinner(i)}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  generBoard() {
    return [0, 1, 2].map((row) => (
      <div className="board-row" key={row}>
        {[0, 1, 2].map((col) => this.renderSquare(row * 3 + col))}
      </div>
    ));
  }

  render() {
    return <div>{this.generBoard()}</div>;
  }
}

// 游戏
class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{ squares: Array(9).fill(null), newStep: "", winnerList: [] }],
      xIsNext: true,
      stepNumber: 0,
      reverseHistory: false,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) return;

    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState(
      {
        history: history.concat([
          { squares, newStep: `新增步骤：${i}`, winnerList: [] },
        ]),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext,
      },
      () =>
        calculateWinner(squares, (winnerList) => {
          const history = this.state.history.slice();
          const current = history[history.length - 1];

          if (current.winnerList.length) return;
          current.winnerList = winnerList;
          this.setState({ history });
        })
    );
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: !(step % 2),
    });
  }

  reverseHistory() {
    this.setState({
      reverseHistory: !this.state.reverseHistory,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const checkActive = (move) =>
      this.state.stepNumber === move ? "active-btn" : "";

    const moves = history.map((step, move) => {
      const desc = move ? "Go to move #" + move : "Go to game start";

      return (
        <li key={move}>
          <button
            onClick={() => this.jumpTo(move)}
            className={checkActive(move)}
          >
            {desc}
          </button>
          <span style={{ marginLeft: "10px" }}>{step.newStep}</span>
        </li>
      );
    });

    let status = "";
    winner
      ? (status = `winner: ${winner}`)
      : this.state.history.length === 10
      ? (status = "平局")
      : (status = `Next player: ${this.state.xIsNext ? "X" : "O"}`);

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winnerList={current.winnerList}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.reverseHistory()}>反转历史记录</button>
          <ol>{this.state.reverseHistory ? moves.slice().reverse() : moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares, showWinner) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      showWinner && showWinner([a, b, c]);

      return squares[a];
    }
  }
  return null;
}
