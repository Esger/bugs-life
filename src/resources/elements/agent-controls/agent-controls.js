import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class AgentControls {
	constructor(eventAggregator) {
		this._eventAggregator = eventAggregator;
	}
	addAgent() {
		this._eventAggregator.publish('addAgent');
	}
}
