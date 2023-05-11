import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { SettingsService } from 'services/settings-service';

@inject(EventAggregator, SettingsService)
export class AgentControls {

	constructor(eventAggregator, settingsService) {
		this._eventAggregator = eventAggregator;
		this._settingsService = settingsService;
		this.showData = this._settingsService.getSettings('showData') || false;
		this.distance = this._settingsService.getSettings('distance') || 32;
		this.keepDistance = this._settingsService.getSettings('keepDistance');
		if (this.keepDistance == undefined) this.keepDistance = true;
		this.senseFood = this._settingsService.getSettings('senseFood');
		if (this.senseFood == undefined) this.senseFood = true;
		this.flocking = this._settingsService.getSettings('flocking');
		if (this.flocking == undefined) this.flocking = true;
	}

	attached() {
		setTimeout(_ => {
			this.toggleShowData();
			this.toggleKeepDistance();
			this.toggleSenseFood();
			this.toggleFlocking();
			this.setDistance(this.distance);
		}, 100);
	}

	addAgent(number) {
		this._eventAggregator.publish('addAgent', number);
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

	setDistance(distance) {
		this._settingsService.saveSettings('distance', distance);
		this._eventAggregator.publish('distance', this.distance);
	}

	toggleFlocking() {
		this._settingsService.saveSettings('flocking', this.flocking);
		this._eventAggregator.publish('flocking', this.flocking);
	}

	toggleShowData() {
		this._settingsService.saveSettings('showData', this.showData);
		this._eventAggregator.publish('toggleData', this.showData);
	}

}
