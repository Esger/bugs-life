import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class CanvasService {

	// TODO make a worker service from this service

	constructor(eventAggregator) {
		this._eventAggregator = eventAggregator;
		this._grid = false;
		this._cellSize = 2;
		this._trails = true;
		this._opacity = 1 - this._trails * 0.9;
		this._agentsBuffer = [];
		this._hasAgents = true;
		this._addListeners();
	}

	_initCanvas() {
		this._canvas = document.getElementById('life');
		this._ctx = this._canvas.getContext('2d');
		this._canvasWidth = this._canvas.width;
		this._canvasHeight = this._canvas.height;
		this._offScreenCanvas = new OffscreenCanvas(this._canvasWidth, this._canvasHeight);;
		this._ctxOffscreen = this._offScreenCanvas.getContext('2d');
	}

	clearSpace() {
		this._ctx.fillStyle = "rgb(255, 255, 255)";
		this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
		this._ctxOffscreen.fillStyle = "rgb(255, 255, 255)";
		this._ctxOffscreen.fillRect(0, 0, this._canvas.width, this._canvas.height);
	}

	drawCells(cells) {
		this._ctxOffscreen.fillStyle = "rgba(255, 255, 255, " + this._opacity + ")";
		this._ctxOffscreen.fillRect(0, 0, this._canvas.width, this._canvas.height);
		this._grid && this.drawgrid();

		this._ctxOffscreen.fillStyle = "rgba(128, 128, 0, 1)";
		cells?.forEach(cell => {
			this._ctxOffscreen.fillRect(cell[0] * this._cellSize, cell[1] * this._cellSize, this._cellSize, this._cellSize);
		})
		this._ctx.drawImage(this._offScreenCanvas, 0, 0, this._canvasWidth, this._canvasHeight);

		this._hasAgents && this._drawAgents();
	}

	drawgrid() {
		const cellSize = Math.max(this._cellSize, 4);
		const maxX = this._canvas.width - cellSize;
		const maxY = this._canvas.height - cellSize;
		const step = cellSize * 2;
		this._ctxOffscreen.fillStyle = "rgba(128, 128, 128, 0.1)";
		let y = 0;
		let oddStep = 0;
		for (; y < maxY; y += cellSize) {
			let x = oddStep;
			oddStep = (oddStep + cellSize) % step;
			for (; x < maxX; x += step) {
				this._ctxOffscreen.fillRect(x, y, cellSize, cellSize);
			}
		}
		this._ctx.drawImage(this._offScreenCanvas, 0, 0, this._canvasWidth, this._canvasHeight);
	}

	addCell(x, y) {
		this._ctx.fillStyle = "#d4d4d4";
		this._ctx.fillRect(x * this._cellSize, y * this._cellSize, this._cellSize, this._cellSize);
	}

	pushAgents(agents) {
		// agents have to be drawn as last.
		this._agentsBuffer.push(agents);
	}

	_drawAgents() {
		const agents = this._agentsBuffer.shift();
		agents?.forEach(agent => {
			const adult = (agent.adult() && !agent.pregnant) ? 1 : 0;
			const scale = Math.max(agent.radius, agent.minRadius) / 16;
			this._ctxOffscreen.save();
			this._ctxOffscreen.translate(agent.x, agent.y);
			this._ctxOffscreen.rotate(agent.direction - Math.PI / 2);
			this._ctxOffscreen.scale(scale, scale);
			this._ctxOffscreen.drawImage(agent.image(), - 16, - 16);
			this._ctxOffscreen.restore();
		});
		this._ctx.drawImage(this._offScreenCanvas, 0, 0, this._canvasWidth, this._canvasHeight);

		// if (this.showData) {
		// 	let progressRadius = Math.max(bug.radius - 2.5, 1);
		// 	let bugRear = 3 * PI / 2;
		// 	let progress = (1 - bug.steps / bug.maxSteps) * PI / 2;
		// 	let startAngle = bugRear - progress;
		// 	let endAngle = bugRear + progress;
		// 	ctx.strokeStyle = "rgba(0,255,0,.7)";
		// 	ctx.lineWidth = '3';
		// 	ctx.beginPath();
		// 	ctx.arc(0, 0, progressRadius, startAngle, endAngle);
		// 	ctx.stroke();
		// 	ctx.fillStyle = "rgb(0,0,0)";
		// 	ctx.fillText(bug.id, - 6, - 2);
		// }
	}

	_addListeners() {
		this._eventAggregator.subscribe('cellSize', response => {
			this._cellSize = response;
		});
		this._eventAggregator.subscribe('toggleGrid', _ => {
			this._grid = !this._grid;
			this._grid && this.drawgrid();
		});
		this._eventAggregator.subscribe('toggleTrails', () => {
			this._trails = !this._trails;
			this._opacity = 1 - this._trails * 0.9;
		});
		this._eventAggregator.subscribe('canvasReady', canvas => {
			this._initCanvas(canvas);
		});
	}

}
