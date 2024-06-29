import type { App } from 'vue'
import Tag from './Tag.vue'
import Taglist from './Taglist.vue'

import { use, registerComponent } from '../../utils/plugins'

const Plugin = {
    install(Vue: App) {
        registerComponent(Vue, Tag)
        registerComponent(Vue, Taglist)
    }
}

use(Plugin)

export default Plugin

export {
    Tag as BTag,
    Taglist as BTaglist
}