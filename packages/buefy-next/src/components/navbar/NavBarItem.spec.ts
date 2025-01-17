import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount, shallowMount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import BNavbarItem from '@components/navbar/NavbarItem.vue'

let wrapper: VueWrapper<InstanceType<typeof BNavbarItem>>

const stubBNavBar = defineComponent({
    data() {
        return {
            _isNavBar: true
        }
    },
    methods: {
        closeMenu: vi.fn()
    },
    template: `
        <div>
            <slot />
        </div>`
})

describe('BNavbarItem', () => {
    const tag = 'div'
    beforeEach(() => {
        wrapper = shallowMount(BNavbarItem)
    })

    it('is called', () => {
        expect(wrapper.vm).toBeTruthy()
        expect(wrapper.vm.$options.name).toBe('BNavbarItem')
    })

    it('render correctly', () => {
        expect(wrapper.html()).toMatchSnapshot()
    })

    it('correctly renders the provided tag', async () => {
        await wrapper.setProps({ tag })
        expect(wrapper.find(tag).exists()).toBeTruthy()
    })

    it('emit event from tag and out', async () => {
        const testStub = vi.fn()

        const emitWrap = shallowMount(BNavbarItem, {
            props: {
                onTest_event: testStub
            },
            slots: {
                default: '<div class="test_inner"/>'
            }
        })

        const inner = emitWrap.find('div.test_inner')
        expect(inner).toBeTruthy()

        await inner.trigger('test_event')
        expect(testStub).toHaveBeenCalled()
    })

    it('close on escape', () => {
        wrapper = mount(stubBNavBar, {
            slots: {
                default: BNavbarItem
            }
        }).findComponent(BNavbarItem)
        stubBNavBar.methods!.closeMenu.mockClear()
        const event = new KeyboardEvent('keyup', { key: 'Escape' })
        wrapper.vm.keyPress({})
        wrapper.vm.keyPress(event)
        expect(stubBNavBar.methods!.closeMenu).toHaveBeenCalledTimes(1)
        stubBNavBar.methods!.closeMenu.mockClear()
    })

    it('manage click as expected', () => {
        wrapper = mount(stubBNavBar, {
            slots: {
                default: BNavbarItem
            }
        }).findComponent(BNavbarItem)
        stubBNavBar.methods!.closeMenu.mockClear()
        const event = new MouseEvent('click')
        wrapper.vm.handleClickEvent({
            ...event,
            target: { localName: 'a' }
        })
        expect(stubBNavBar.methods!.closeMenu).toHaveBeenCalledTimes(1)
        stubBNavBar.methods!.closeMenu.mockClear()
    })
})
