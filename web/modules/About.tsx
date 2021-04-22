import {MetaModule} from './Module';
import * as util from '../lib/util';

export default class About extends MetaModule {
	renderThumb(): HTMLElement {
		return <span>About this site, contact.</span>
	}

	getName(): string {
		return "About";
	}

	render() {
		return [
			<div>
				<p>
					This site, a collection of browser-based tests/utilities, is built and maintained by an individual.
				</p>
				<p>What's the goal?</p>
				<blockquote>What can we find out, test, or verify, from an ordinary webpage?</blockquote>
				<p>
					Ever want see if your touchscreen is working right, if your camera/microphone works, or if your
					MIDI device is working right? That's the sort of thing we're after.
				</p>
				<p>And it'd be best if we had:
					<ul>
						<li>All the useful basic tests we can run from a web browser and a pile of related utilities.</li>
						<li>No ads.</li>
						<li>Fast to load.</li>
						<li>No nonsense or privacy invasions.</li>
						<li>Really cheap for me to host. (Then I'm not tempted to add ads, which incidentally aren't no-nonsense, don't respect privacy, and are the bane of web performance.)</li>
					</ul>
				</p>
				<p>
					To contact the site owner, reach out to [GitHub username for code repo]@gmail.com.
				</p>
			</div>
		];
	}
}

