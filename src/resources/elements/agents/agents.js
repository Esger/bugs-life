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
		this._nextId = 1000;
		this._initialAgentsCount = 10;
	}

	attached() {
		this._setWorldWidth();
		setTimeout(_ => {
			for (let i = 0; i < this._initialAgentsCount; i++) {
				this._addAgent();
			}
			this._addListeners();
			this._addAwareness();
		});
	}

	_setWorldWidth() {
		this._worldWidth = this.canvasWidth / this.cellSize;
		this._worldHeight = this.canvasHeight / this.cellSize;
	}

	_addAwareness() {
		this._agents.forEach(agent => {
			agent.siblings = this._agents;
			agent.setWorldSize(this._worldWidth, this._worldHeight);
		});
	}

	_addAgent() {
		const agent = this._agent.createAgent(this._worldWidth, this._worldHeight, this._lifeWorkerService, this._nextId);
		this._nextId++;
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
		this._addAgentSubscription = this._eventAggregator.subscribe('addAgent', _ => {
			this._addAgent();
			this._addAwareness();
		});
	}

	_stepAgents() {
		const food = this._lifeWorkerService.getCells();
		this._agents.forEach(agent => {
			agent.step(food);
		});
		this._agents = this._agents.filter(agent => agent.depletion < 100); // remove dead agents
		this._agentsDataService.setAgents(this._agents);
		this._addAwareness();
		this._eventAggregator.publish('agentsReady');
	}

	detached() {
		this._cellsReadySubscription.dispose();
		this._cellSizeSubscription.dispose();
	}
}
