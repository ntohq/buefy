import { h as createElement } from 'vue'
import { isVueComponent } from './helpers'

export default {
    name: 'BSlotComponent',
    props: {
        component: {
            type: Object,
            required: true
        },
        name: {
            type: String,
            default: 'default'
        },
        scoped: {
            type: Boolean
        },
        props: {
            type: Object
        },
        tag: {
            type: String,
            default: 'div'
        },
        event: {
            type: String,
            default: 'hook:updated'
        }
    },
    methods: {
        refresh() {
            this.$forceUpdate()
        }
    },
    created() {
        if (isVueComponent(this.component)) {
            this.component.$on(this.event, this.refresh)
        }
    },
    beforeUnmount() {
        if (isVueComponent(this.component)) {
            this.component.$off(this.event, this.refresh)
        }
    },
    render() {
        return createElement(this.tag, {},
            this.component.$slots
                ? this.scoped
                    ? this.component.$slots[this.name](this.props)
                    : this.component.$slots[this.name]()
                : undefined)
    }
}
