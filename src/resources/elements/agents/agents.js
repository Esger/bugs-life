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
		this._initialAgentsCount = 20;
	}

	attached() {
		this._setWorldWidth();
		setTimeout(_ => {
			for (let i = 0; i < this._initialAgentsCount; i++) {
				this._addAgent();
			}
			this._addListeners();
			this._setAwareness();
		});
	}

	_setWorldWidth() {
		this._worldWidth = this.canvasWidth / this.cellSize;
		this._worldHeight = this.canvasHeight / this.cellSize;
	}

	_setAwareness() {
		this._agents.forEach(agent => {
			agent.siblings = this._agents;
			agent.setWorldSize(this._worldWidth, this._worldHeight, this.cellSize);
			agent.setDeathTimeout(this._speedInterval);
			agent.setKeepDistance(this._keepDistance);
			agent.setSenseFood(this._senseFood);
		});
	}

	_addAgent() {
		const agent = this._agent.createAgent(this._worldWidth, this._worldHeight, this.cellSize, this._lifeWorkerService, this._nextId);
		this._nextId++;
		this._agents.push(agent);
		this._agentsDataService.setAgents(this._agents);
	}

	_addListeners() {
		this._cellsReadySubscription = this._eventAggregator.subscribe('cellsReady', _ => {
			this._agents.length && this._stepAgents();
		});
		this._cellSizeSubscription = this._eventAggregator.subscribe('cellSize', cellSize => {
			this.cellSize = cellSize;
			this._setWorldWidth();
			this._setAwareness();
		});
		this._cellSizeSubscription = this._eventAggregator.subscribe('keepDistance', keepDistance => {
			this._keepDistance = keepDistance;
			this._setAwareness();
		});
		this._cellSizeSubscription = this._eventAggregator.subscribe('senseFood', senseFood => {
			this._senseFood = senseFood;
			this._setAwareness();
		});
		this._addAgentSubscription = this._eventAggregator.subscribe('addAgent', _ => {
			this._addAgent();
			this._setAwareness();
		});
		this._addAgentSubscription = this._eventAggregator.subscribe('killAgents', _ => {
			this._agents = [];
			this._agentsDataService.setAgents(this._agents);
			this._eventAggregator.publish('agentsReady', this._agents.length);
		});
		this._eventAggregator.subscribe('timeoutInterval', response => {
			this._speedInterval = response;
		});
	}

	_stepAgents() {
		this._agents.forEach(agent => agent.step());
		this._agents = this._agents.filter(agent => agent.depletion < 100); // remove dead agents
		this._agentsDataService.setAgents(this._agents);
		this._setAwareness();
		this._eventAggregator.publish('agentsReady', this._agents.length);
	}

	detached() {
		this._cellsReadySubscription.dispose();
		this._cellSizeSubscription.dispose();
	}
}
