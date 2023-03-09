import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Agent } from "components/agent.js"
import { LifeWorkerService } from 'resources/services/life-worker-service';
import { CanvasService } from "services/canvas-service";

@inject(EventAggregator, Agent, LifeWorkerService, CanvasService)
export class AgentsCustomElement {
	_agents = [];

	constructor(eventAggregator, agent, lifeWorkerService, canvasService) {
		this._eventAggregator = eventAggregator;
		this._agent = agent;
		this._lifeWorkerService = lifeWorkerService;
		this._canvasService = canvasService;
		this._addAgent();
		this._addListeners();
	}

	attached() {
		const worldSize = this._canvasService.getWorldSize();
		this._agent.setWorldSize(worldSize);
		this._cellSizeSubscription = this._eventAggregator.subscribe('cellSize', _ => {
			const worldSize = this._canvasService.getWorldSize();
			this._agent.setWorldSize(worldSize);
		});
		this._eventAggregator.publish('loadImages');
		this._agent.setImages();
	}

	_addAgent() {
		const agent = this._agent.randomAgent();
		this._agents.push(agent);
	}

	_addListeners() {
		this._eventAggregator.subscribe('dataReady', _ => {
			this._drawAgents();
			this._stepAgents();
		});
		// this._eventAggregator.subscribe('step', _ => {
		// 	this._drawAgents();
		// 	this._stepAgents();
		// });
	}

	_stepAgents() {
		const lifeCells = this._lifeWorkerService.cells;
		this._agents.forEach(agent => {
			agent.step(lifeCells);
		})
	}

	// Draw the bugs
	_drawAgents() {
		this._canvasService.pushAgents(this._agents);
	}
}
