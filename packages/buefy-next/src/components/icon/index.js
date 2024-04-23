import Icon from './Icon.vue'

import { use, registerComponent } from '../../utils/plugins'

const Plugin = {
    install(Vue) {
        registerComponent(Vue, Icon)
    }
}

export default Plugin

export {
    Icon as BIcon
}
