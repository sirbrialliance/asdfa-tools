import {MetaModule} from './Module'
import * as util from '../lib/util'
import contentList from '../lib/contentList'

export default class About extends MetaModule {
	getId() { return "About" }

	renderThumb(): HTMLElement {
		return <span>About this site, contact.</span>
	}

	getName(): string {
		return "About"
	}

	render() {
		let contentEl = <div class="readmeMD" />
		contentEl.innerHTML = contentList.aboutHTML
		return [
			<small>
				(The content below is the same as in{" "}
				<a href="https://github.com/sirbrialliance/asdfa-tools/blob/master/Readme.md">Readme.md</a>.)
			</small>,
			contentEl
		]
	}
}

