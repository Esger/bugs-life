import {
	inject
} from 'aurelia-framework';
import {
	EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)

export class TabsCustomElement {

	constructor(eventAggregator) {
		this.tabs = [
			{
				title: 'Life Rules',
				active: true
			},
			{
				title: 'Story',
				active: false
			},
			{
				title: 'Agents',
				active: false,
			}
		]
	}

	activateTab(i) {
		const tabs = this.tabs.slice();
		tabs.forEach(tab => {
			tab.active = false;
		});
		tabs[i].active = true;
		this.tabs = tabs;
	}

}
