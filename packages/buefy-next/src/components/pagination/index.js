import Pagination from './Pagination.vue'
import PaginationButton from './PaginationButton.vue'

import { use, registerComponent } from '../../utils/plugins'

const Plugin = {
    install(Vue) {
        registerComponent(Vue, Pagination)
        registerComponent(Vue, PaginationButton)
    }
}

export default Plugin

export {
    Pagination as BPagination,
    PaginationButton as BPaginationButton
}
