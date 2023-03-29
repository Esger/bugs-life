import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class AgentControls {

	constructor(eventAggregator) {
		this._eventAggregator = eventAggregator;
		this.showData = false;
	}

	addAgent() {
		this._eventAggregator.publish('addAgent');
	}

	toggleShowData() {
		this._eventAggregator.publish('toggleData');
	}

}
