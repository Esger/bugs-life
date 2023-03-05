export class Agent {

	_goldenRatio = 1.618;
	_minRadius = 0;
	_maxRadius = 15;
	_adultRadius = this._maxRadius / this._goldenRatio;

	randomAgent() {
		self = this;
		const newAgentObject = _ => {
			return {
				direction: 0,
				x: 100, y: 100,
				radius: 0,
				gender: 'male',
				pregnant: false,
			}
		};

		const newAgent = newAgentObject();
		newAgent.minRadius = _ => self._minRadius;
		newAgent.adult = _ => (newAgent.radius > self._adultRadius) * 1;
		newAgent.image = _ => self._bugImages[newAgent.gender][newAgent.adult()];

		return newAgent;
	}

	setImages() {
		this._bugImages = {
			'male': [$('.bug_0')[0], $('.bug-0')[0]],
			'female': [$('.bug_1')[0], $('.bug-1')[0]]
		}
	}

	// _image() {
	// 	return this._bugImages[bug.gender][adult];
	// }


}
