import Colorpicker from './Colorpicker.vue'

import { use, registerComponent } from '../../utils/plugins'

const Plugin = {
    install(Vue) {
        registerComponent(Vue, Colorpicker)
    }
}

export default Plugin

export {
    Colorpicker as BColorpicker
}
