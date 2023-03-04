import {
	inject
} from 'aurelia-framework';
import {
	EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class ControlsCustomElement {

	constructor(eventAggregator) {
		this._eventAggregator = eventAggregator;
		this.startPulsor = true;
		this.clearPulsor = false;
		this.timeOut = 0;
		this.addListeners();
	}

	clear() {
		this._eventAggregator.publish('clear');
		this.clearPulsor = false;
		this.startPulsor = true;
	}

	stop() {
		this._eventAggregator.publish('stop');
	}

	step() {
		this._eventAggregator.publish('step');
		this.startPulsor = false;
	}

	start() {
		this._eventAggregator.publish('start');
		this.startPulsor = false;
	}

	startNstop() {
		this._eventAggregator.publish('startNstop');
		this.startPulsor = false;
	}

	fillRandom() {
		this._eventAggregator.publish('fillRandom');
	}

	setTimeoutInterval() {
		this._eventAggregator.publish('timeoutInterval', this.timeOut);
	}

	addListeners() {
		this._eventAggregator.subscribe('cellSize', response => {
			this.clearPulsor = true;
		});
	}

}
