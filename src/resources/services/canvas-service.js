import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class CanvasService {

	// TODO make a worker service from this service

	constructor(eventAggregator) {
		this._eventAggregator = eventAggregator;
		this._grid = false;
		this.cellSize = 2;
		this.trails = true;
		this.opacity = 1 - this.trails * 0.9;
		this._addListeners();
	}

	_initCanvas() {
		this.canvas = document.getElementById('life');
		this.ctx = this.canvas.getContext('2d');
		this.canvasWidth = this.canvas.width;
		this.canvasHeight = this.canvas.height;
		this.offScreenCanvas = new OffscreenCanvas(this.canvasWidth, this.canvasHeight);;
		this.ctxOffscreen = this.offScreenCanvas.getContext('2d');
	}

	clearSpace() {
		this.ctx.fillStyle = "rgb(255, 255, 255)";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctxOffscreen.fillStyle = "rgb(255, 255, 255)";
		this.ctxOffscreen.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	drawCells(cells) {
		this.ctxOffscreen.fillStyle = "rgba(255, 255, 255, " + this.opacity + ")";
		this.ctxOffscreen.fillRect(0, 0, this.canvas.width, this.canvas.height);
		if (this._grid) {
			this.drawgrid();
		}
		this.ctxOffscreen.fillStyle = "rgba(128, 128, 0, 1)";
		cells?.forEach(cell => {
			this.ctxOffscreen.fillRect(cell[0] * this.cellSize, cell[1] * this.cellSize, this.cellSize, this.cellSize);
		})
		this.ctx.drawImage(this.offScreenCanvas, 0, 0, this.canvasWidth, this.canvasHeight);
	}

	drawgrid() {
		const cellSize = Math.max(this.cellSize, 4);
		const maxX = this.canvas.width - cellSize;
		const maxY = this.canvas.height - cellSize;
		const step = cellSize * 2;
		this.ctxOffscreen.fillStyle = "rgba(128, 128, 128, 0.1)";
		let y = 0;
		let oddStep = 0;
		for (; y < maxY; y += cellSize) {
			let x = oddStep;
			oddStep = (oddStep + cellSize) % step;
			for (; x < maxX; x += step) {
				this.ctxOffscreen.fillRect(x, y, cellSize, cellSize);
			}
		}
		this.ctx.drawImage(this.offScreenCanvas, 0, 0, this.canvasWidth, this.canvasHeight);
	}

	addCell(x, y) {
		this.ctx.fillStyle = "#d4d4d4";
		this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
	}

	_addListeners() {
		this._eventAggregator.subscribe('cellSize', response => {
			this.cellSize = response;
		});
		this._eventAggregator.subscribe('toggleGrid', _ => {
			this._grid = !this._grid;
			this._grid && this.drawgrid();
		});
		this._eventAggregator.subscribe('toggleTrails', () => {
			this.trails = !this.trails;
			this.opacity = 1 - this.trails * 0.9;
		});
		this._eventAggregator.subscribe('canvasReady', canvas => {
			this._initCanvas(canvas);
		});
	}

}
