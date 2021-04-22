import {MetaModule} from './Module';
import * as util from '../lib/util';

export default class Source extends MetaModule {
	renderThumb(): HTMLElement {
		return <span>View sources for this site, submit pull requests, etc.</span>
	}

	getName(): string {
		return "Source Code";
	}

	render() {
		return [
			<div>
				<p><a href="https://github.com/sirbrialliance/asdfa-tools/">The source code for this site is hosted on GitHub.</a></p>
				<p>
					Pull requests in line with the site vision are welcome!
				</p>
			</div>
		];
	}
}

