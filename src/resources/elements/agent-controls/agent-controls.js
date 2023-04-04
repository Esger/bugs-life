import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { SettingsService } from 'services/settings-service';

@inject(EventAggregator, SettingsService)
export class AgentControls {

	constructor(eventAggregator, settingsService) {
		this._eventAggregator = eventAggregator;
		this._settingsService = settingsService;
		this.showData = this._settingsService.getSettings('showData') || false;
		this.keepDistance = this._settingsService.getSettings('keepDistance');
		if (this.keepDistance == undefined) this.keepDistance = true;
		this.senseFood = this._settingsService.getSettings('senseFood');
		if (this.senseFood == undefined) this.senseFood = true;
	}

	attached() {
		setTimeout(_ => {
			this.toggleShowData();
			this.toggleKeepDistance();
			this.toggleSenseFood();
		}, 100);
	}

	addAgent() {
		this._eventAggregator.publish('addAgent');
	}

	killAgents() {
		this._eventAggregator.publish('killAgents');
	}

	toggleSenseFood() {
		this._settingsService.saveSettings('senseFood', this.senseFood);
		this._eventAggregator.publish('senseFood', this.senseFood);
	}

	toggleKeepDistance() {
		this._settingsService.saveSettings('keepDistance', this.keepDistance);
		this._eventAggregator.publish('keepDistance', this.keepDistance);
	}

	toggleShowData() {
		this._settingsService.saveSettings('showData', this.showData);
		this._eventAggregator.publish('toggleData', this.showData);
	}

}
