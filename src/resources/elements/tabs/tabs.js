import { inject } from 'aurelia-framework';
import { SettingsService } from 'services/settings-service';
@inject(SettingsService)
export class TabsCustomElement {

	constructor(settingsService) {
		this._settingsService = settingsService;
		this._defaultTabs = [
			{
				title: 'Life Rules',
				active: true
			},
			{
				title: 'Story',
				active: false
			},
			{
				title: 'Bugs',
				active: false,
			}
		];
		this.tabs = this._settingsService.getSettings('tabs') || this._defaultTabs;
	}

	activateTab(i) {
		const tabs = this.tabs.slice();
		tabs.forEach(tab => {
			tab.active = false;
		});
		tabs[i].active = true;
		this.tabs = tabs;
		this._settingsService.saveSettings('tabs', tabs);
	}

}
