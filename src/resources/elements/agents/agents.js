import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Agent } from 'resources/components/agent.js';
import { LifeWorkerService } from 'resources/services/life-worker-service';
import { AgentsDataService } from 'resources/services/agents-data-service';

@inject(EventAggregator, Agent, LifeWorkerService, AgentsDataService)
export class AgentsCustomElement {
	@bindable canvasWidth;
	@bindable canvasHeight;
	@bindable cellSize;

	constructor(eventAggregator, agent, lifeWorkerService, agentsDataService) {
		this._eventAggregator = eventAggregator;
		this._lifeWorkerService = lifeWorkerService;
		this._agentsDataService = agentsDataService;
		this._agents = [];
		this._agent = agent;
	}

	attached() {
		this._setWorldWidth();
		setTimeout(() => {
			this._addAgent();
			this._addListeners();
		});
	}

	_setWorldWidth() {
		this._worldWidth = this.canvasWidth / this.cellSize;
		this._worldHeight = this.canvasHeight / this.cellSize;
		this._agents.forEach(agent => agent.setWorldSize(this._worldWidth, this._worldHeight));
	}

	_addAgent() {
		const agent = this._agent.createAgent(this._worldWidth, this._worldHeight);
		this._agents.push(agent);
		this._agentsDataService.setAgents(this._agents);
	}

	_addListeners() {
		this._cellsReadySubscription = this._eventAggregator.subscribe('cellsReady', _ => {
			this._stepAgents();
		});
		this._cellSizeSubscription = this._eventAggregator.subscribe('cellSize', cellSize => {
			this.cellSize = cellSize;
			this._setWorldWidth();
		});
	}

	_stepAgents() {
		const food = this._lifeWorkerService.getCells();
		this._agents.forEach(agent => {
			agent.step(food);
		});
		this._eventAggregator.publish('agentsReady');
	}

	detached() {
		this._cellsReadySubscription.dispose();
	}
}
