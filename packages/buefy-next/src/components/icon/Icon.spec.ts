import { shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BIcon from '@components/icon/Icon.vue'

describe('BIcon', () => {
    it('render correctly', () => {
        const wrapper = shallowMount(BIcon)

        expect(wrapper.html()).toMatchSnapshot()
    })

    it('is vue instance', () => {
        const wrapper = shallowMount(BIcon)

        expect(wrapper.vm).toBeTruthy()
        expect(wrapper.vm.$options.name).toBe('BIcon')
    })

    it('render icon when icon property is passed', () => {
        const wrapper = shallowMount(BIcon, {
            props: { icon: 'eye' }
        })

        expect(wrapper.classes()).toContain('icon')
        const classes = wrapper.find('i').classes()
        expect(classes).toContain('mdi')
        expect(classes).toContain('mdi-eye')
        expect(classes).toContain('mdi-24px')
    })

    it('render a colored icon when type is passed', () => {
        const wrapper = shallowMount(BIcon, {
            props: {
                icon: 'eye',
                type: 'is-primary'
            }
        })

        expect(wrapper.classes()).toContain('has-text-primary')
    })

    it('returns correct color for newType when type is passed as an object', () => {
        const wrapper = shallowMount(BIcon, {
            props: {
                icon: 'eye',
                type: { 'is-primary': true }
            }
        })

        expect(wrapper.vm.newType).toEqual('has-text-primary')
    })

    it('render icon package correctly when the pack property is is passed.', () => {
        const wrapper = shallowMount(BIcon, {
            props: {
                icon: 'eye',
                pack: 'fa'
            }
        })

        expect(wrapper.find('i').classes()).toContain('fa-eye')
    })

    it('use both packages when the both property is is passed', async () => {
        const wrapper = shallowMount(BIcon, {
            props: {
                icon: 'eye',
                both: true
            }
        })

        expect(wrapper.find('i').classes()).toContain('mdi-eye')
        await wrapper.setProps({ pack: 'fa' })

        const equivalentIcons: Record<string, string> = {
            check: 'check',
            information: 'info-circle',
            'check-circle': 'check-circle',
            alert: 'exclamation-triangle',
            'alert-circle': 'exclamation-circle',
            'arrow-up': 'arrow-up',
            'chevron-right': 'angle-right',
            'chevron-left': 'angle-left',
            'chevron-down': 'angle-down',
            eye: 'eye',
            'eye-off': 'eye-slash',
            'menu-down': 'caret-down',
            'menu-up': 'caret-up',
            other: 'other'
        }

        const expectEquivalentIcon = async (icon: string, expected: string) => {
            await wrapper.setProps({ icon })
            expect(wrapper.find('i').classes()).toContain(`fa-${expected}`)
        }

        for (const icon in equivalentIcons) {
            await expectEquivalentIcon(icon, equivalentIcons[icon])
        }
    })

    it('display size when size propery is passed', async () => {
        const wrapper = shallowMount(BIcon, {
            props: {
                icon: 'eye'
            }
        })

        expect(wrapper.find('i').classes()).toContain('mdi-24px')
        await wrapper.setProps({ size: 'is-small' })
        expect(wrapper.find('i').classes()).toContain('mdi')
        expect(wrapper.find('i').classes()).toContain('mdi-eye')
        await wrapper.setProps({ size: 'is-medium' })
        expect(wrapper.find('i').classes()).toContain('mdi-36px')
        await wrapper.setProps({ size: 'is-large' })
        expect(wrapper.find('i').classes()).toContain('mdi-48px')
    })

    it('overrides icon font size when customSize property is passed', () => {
        const wrapper = shallowMount(BIcon, {
            props: {
                icon: 'eye',
                pack: 'fa',
                customSize: 'fa-2x'
            }
        })

        expect(wrapper.find('i').classes()).toContain('fa')
        expect(wrapper.find('i').classes()).toContain('fa-2x')
    })

    it('render custom classes when customClass property is passed', () => {
        const wrapper = shallowMount(BIcon, {
            props: {
                icon: 'eye',
                customClass: 'foo-bar'
            }
        })

        expect(wrapper.find('i').classes()).toContain('foo-bar')
    })
})
