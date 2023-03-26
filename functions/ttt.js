const Canvas = require('canvas');
class TTT {
    constructor({ client, p1, p2, starterPiece }) {
        this.client = client;
        this.p1 = { user: p1, piece: starterPiece };
        this.p2 = { user: p2, piece: this.p1.piece === `❌` ? `⭕` : `❌` };
        this.turn = this.p1.piece === `❌` ? this.p1.user.id : this.p2.user.id;
        this.board = [null, null, null, null, null, null, null, null, null];
    }

    async start(message, ttt) {
        let timer = setTimeout(() => {
            if (!this.client.ttt.get(message._id)) return;
            message.edit({ content: "This TTT game has ended due to no activity for 2 minutes!" }).catch(() => { });
            this.client.ttt.delete(message._id);
        }, 120000);
        this.client.ttt.set(message._id, { ttt, messageId: message._id, users: { p1: this.p1, p2: this.p2 }, turn: this.turn, timer, board: this.board })
    }

    async draw(winner) {
        const canvas = Canvas.createCanvas(500, 700);
        this.canvas = canvas;
        const ctx = this.canvas.getContext('2d');
        this.ctx = ctx;
        ctx.fillStyle = '#23272A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 50px Sans-Serif';
        ctx.fillText(`Tic Tac Toe`, 120, 60);
        ctx.font = 'normal 34px Sans-Serif';

        ctx.textAlign = "center";
        console.log(winner)
        if (winner) {
            if (winner.user === this.p1.user.id) {
                ctx.fillStyle = `#FFD700`;
                ctx.fillText(`👑 ${this.p1.user.username} (${this.p1.piece})`, 250, 130);
            } else if (winner.tie) {
                ctx.fillStyle = `#FF0036`;
                ctx.fillText(`${this.p1.user.username} (${this.p1.piece})`, 250, 130);
            } else if (winner.ff) {
                ctx.fillStyle = winner.ff === this.p1.user.id ? `#FF0036` : `#ffffff`;
                ctx.fillText(`${this.p1.user.username} (${this.p1.piece})`, 250, 130);
            } else {
                ctx.fillStyle = `#FF0036`;
                ctx.fillText(`${this.p1.user.username} (${this.p1.piece})`, 250, 130);
            }
        } else {
            ctx.fillText(`${this.p1.user.username} (${this.p1.piece})`, 250, 130);
        }

        ctx.fillStyle = `#ffffff`;
        ctx.fillText(`vs.`, 250, 170);

        if (winner) {
            if (winner.user === this.p2.user.id) {
                ctx.fillStyle = `#FFD700`;
                ctx.fillText(`👑 ${this.p2.user.username} (${this.p2.piece})`, 250, 210);
            } else if (winner.tie) {
                ctx.fillStyle = `#FF0036`;
                ctx.fillText(`${this.p2.user.username} (${this.p2.piece})`, 250, 210);
            } else if (winner.ff) {
                ctx.fillStyle = winner.ff === this.p2.user.id ? `#FF0036` : `#ffffff`;
                ctx.fillText(`${this.p2.user.username} (${this.p2.piece})`, 250, 210);
            } else {
                ctx.fillStyle = `#FF0036`;
                ctx.fillText(`${this.p2.user.username} (${this.p2.piece})`, 250, 210);
            }
        } else {
            ctx.fillText(`${this.p2.user.username} (${this.p2.piece})`, 250, 210);
        }

        ctx.textAlign = "left";
        ctx.font = 'normal 100px Sans-Serif';
        ctx.fillStyle = "#ffffff";
        ctx.lineWidth = 9;
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(175, 685);
        ctx.lineTo(175, 253);
        ctx.stroke();

        ctx.fillStyle = this.board[0] === `❌` ? `#E23232` : `#3F3FEC`;
        ctx.fillText(`${this.board[0] ? this.board[0] : ''}`, 30, 350);
        ctx.fillStyle = this.board[1] === `❌` ? `#E23232` : `#3F3FEC`;
        ctx.fillText(`${this.board[1] ? this.board[1] : ''}`, 180, 350);
        ctx.fillStyle = this.board[2] === `❌` ? `#E23232` : `#3F3FEC`;
        ctx.fillText(`${this.board[2] ? this.board[2] : ''}`, 327, 350);

        ctx.fillStyle = "#ffffff";
        ctx.lineWidth = 9;
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(485, 387);
        ctx.lineTo(15, 387);
        ctx.stroke();

        ctx.fillStyle = this.board[3] === `❌` ? `#E23232` : `#3F3FEC`;
        ctx.fillText(`${this.board[3] ? this.board[3] : ''}`, 30, 500);
        ctx.fillStyle = this.board[4] === `❌` ? `#E23232` : `#3F3FEC`;
        ctx.fillText(`${this.board[4] ? this.board[4] : ''}`, 180, 500);
        ctx.fillStyle = this.board[5] === `❌` ? `#E23232` : `#3F3FEC`;
        ctx.fillText(`${this.board[5] ? this.board[5] : ''}`, 327, 500);

        ctx.fillStyle = "#ffffff";
        ctx.lineWidth = 9;
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(485, 540);
        ctx.lineTo(15, 540);
        ctx.stroke();

        ctx.fillStyle = this.board[6] === `❌` ? `#E23232` : `#3F3FEC`;
        ctx.fillText(`${this.board[6] ? this.board[6] : ''}`, 30, 650);
        ctx.fillStyle = this.board[7] === `❌` ? `#E23232` : `#3F3FEC`;
        ctx.fillText(`${this.board[7] ? this.board[7] : ''}`, 180, 650);
        ctx.fillStyle = this.board[8] === `❌` ? `#E23232` : `#3F3FEC`;
        ctx.fillText(`${this.board[8] ? this.board[8] : ''}`, 327, 650);

        ctx.fillStyle = "#ffffff";
        ctx.lineWidth = 9;
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(323, 685);
        ctx.lineTo(323, 253);
        ctx.stroke();

        if (winner && winner.dir === `right1`) {
            ctx.fillStyle = winner.color;
            ctx.lineWidth = 9;
            ctx.strokeStyle = winner.color;
            ctx.beginPath();
            ctx.moveTo(475, 315);
            ctx.lineTo(25, 315);
            ctx.stroke();
        } else if (winner && winner.dir === `right2`) {
            ctx.fillStyle = winner.color;
            ctx.lineWidth = 9;
            ctx.strokeStyle = winner.color;
            ctx.beginPath();
            ctx.moveTo(475, 465);
            ctx.lineTo(25, 465);
            ctx.stroke();
        } else if (winner && winner.dir === `right3`) {
            ctx.fillStyle = winner.color;
            ctx.lineWidth = 9;
            ctx.strokeStyle = winner.color;
            ctx.beginPath();
            ctx.moveTo(475, 615);
            ctx.lineTo(25, 615);
            ctx.stroke();
        } else if (winner && winner.dir === `down1`) {
            ctx.fillStyle = winner.color;
            ctx.lineWidth = 9;
            ctx.strokeStyle = winner.color;
            ctx.beginPath();
            ctx.moveTo(100, 685);
            ctx.lineTo(100, 253);
            ctx.stroke();
        } else if (winner && winner.dir === `down2`) {
            ctx.fillStyle = winner.color;
            ctx.lineWidth = 9;
            ctx.strokeStyle = winner.color;
            ctx.beginPath();
            ctx.moveTo(250, 685);
            ctx.lineTo(250, 253);
            ctx.stroke();
        } else if (winner && winner.dir === `down3`) {
            ctx.fillStyle = winner.color;
            ctx.lineWidth = 9;
            ctx.strokeStyle = winner.color;
            ctx.beginPath();
            ctx.moveTo(400, 685);
            ctx.lineTo(400, 253);
            ctx.stroke();
        } else if (winner && winner.dir === `diag1`) {
            ctx.fillStyle = winner.color;
            ctx.lineWidth = 9;
            ctx.strokeStyle = winner.color;
            ctx.beginPath();
            ctx.moveTo(15, 223);
            ctx.lineTo(485, 700);
            ctx.stroke();
        } else if (winner && winner.dir === `diag2`) {
            ctx.fillStyle = winner.color;
            ctx.lineWidth = 9;
            ctx.strokeStyle = winner.color;
            ctx.beginPath();
            ctx.moveTo(485, 223);
            ctx.lineTo(15, 700);
            ctx.stroke();
        }

        ctx.save();
        return this.canvas;
    }

    checkWin() {
        if (this.board[0] === this.board[1] && this.board[1] === this.board[2] && this.board[0] !== null) {
            return { winner: this.board[0], dir: `right1` };
        } else if (this.board[3] === this.board[4] && this.board[4] === this.board[5] && this.board[3] !== null) {
            return { winner: this.board[3], dir: `right2` };
        } else if (this.board[6] === this.board[7] && this.board[7] === this.board[8] && this.board[6] !== null) {
            return { winner: this.board[6], dir: `right3` };
        } else if (this.board[0] === this.board[3] && this.board[3] === this.board[6] && this.board[0] !== null) {
            return { winner: this.board[0], dir: `down1` };
        } else if (this.board[1] === this.board[4] && this.board[4] === this.board[7] && this.board[1] !== null) {
            return { winner: this.board[1], dir: `down2` };
        } else if (this.board[2] === this.board[5] && this.board[5] === this.board[8] && this.board[2] !== null) {
            return { winner: this.board[2], dir: `down3` };
        } else if (this.board[0] === this.board[4] && this.board[4] === this.board[8] && this.board[0] !== null) {
            return { winner: this.board[0], dir: `diag1` };
        } else if (this.board[2] === this.board[4] && this.board[4] === this.board[6] && this.board[2] !== null) {
            return { winner: this.board[2], dir: `diag2` };
        } else {
            return false;
        }
    }

    tie() {
        if (this.board.every(x => x !== null)) {
            return true;
        } else {
            return false;
        }
    }

    move(index, player) {
        if (!this.board[index]) {
            if (!player) return true;
            this.board[index] = player;
            return true;
        } else {
            return false;
        }
    }

    checkBoard() {
        return this.board;
    }

}

module.exports = TTT;