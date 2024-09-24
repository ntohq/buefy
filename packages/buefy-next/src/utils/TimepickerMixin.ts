import { defineComponent } from 'vue'
import type { PropType } from 'vue'

import CompatFallthroughMixin from './CompatFallthroughMixin'
import FormElementMixin from './FormElementMixin'
import { BDropdown } from '../components/dropdown'
import { BInput } from '../components/input'
import { isMobile, matchWithGroups } from './helpers'
import config from './config'

type BInputInstance = InstanceType<typeof BInput>
type BDropdownInstance = InstanceType<typeof BDropdown>

const AM = 'AM'
const PM = 'PM'
const HOUR_FORMAT_24 = '24'
const HOUR_FORMAT_12 = '12'

export type HourFormat = typeof HOUR_FORMAT_24 | typeof HOUR_FORMAT_12

export type TimeCreator = () => Date

export interface ITimepickerMixin {
    hourFormat?: HourFormat
    timeCreator: TimeCreator
    enableSeconds?: boolean
    computedValue: Date | null | undefined
    dtf: Intl.DateTimeFormat
    amString: string
    pmString: string
}

export type TimeFormatter = (date: Date, vm: ITimepickerMixin) => string
export type TimeParser = (timeString: string, vm: ITimepickerMixin) => Date | null

const defaultTimeFormatter: TimeFormatter = (date, vm) => {
    return vm.dtf.format(date)
}

const defaultTimeParser: TimeParser = (timeString, vm) => {
    if (timeString) {
        let d = null
        if (vm.computedValue && !isNaN(vm.computedValue.valueOf())) {
            d = new Date(vm.computedValue)
        } else {
            d = vm.timeCreator()
            d.setMilliseconds(0)
        }

        if (vm.dtf.formatToParts && typeof vm.dtf.formatToParts === 'function') {
            const formatRegex = vm.dtf
                .formatToParts(d).map((part) => {
                    if (part.type === 'literal') {
                        return part.value.replace(/ /g, '\\s?')
                    } else if (part.type === 'dayPeriod') {
                        return `((?!=<${part.type}>)(${vm.amString}|${vm.pmString}|${AM}|${PM}|${AM.toLowerCase()}|${PM.toLowerCase()})?)`
                    }
                    return `((?!=<${part.type}>)\\d+)`
                }).join('')
            const timeGroups: Record<string, string | number | null> =
                matchWithGroups(formatRegex, timeString)

            // We do a simple validation for the group.
            // If it is not valid, it will fallback to Date.parse below
            timeGroups.hour = timeGroups.hour ? parseInt(timeGroups.hour + '', 10) : null
            timeGroups.minute = timeGroups.minute ? parseInt(timeGroups.minute + '', 10) : null
            timeGroups.second = timeGroups.second ? parseInt(timeGroups.second + '', 10) : null
            if (
                timeGroups.hour &&
                timeGroups.hour >= 0 &&
                timeGroups.hour < 24 &&
                timeGroups.minute &&
                timeGroups.minute >= 0 &&
                timeGroups.minute < 59
            ) {
                const dayPeriod = timeGroups.dayPeriod
                if (dayPeriod &&
                    (
                        (dayPeriod as string).toLowerCase() === vm.pmString.toLowerCase() ||
                        (dayPeriod as string).toLowerCase() === PM.toLowerCase()
                    ) &&
                    timeGroups.hour < 12
                ) {
                    timeGroups.hour += 12
                }
                d.setHours(timeGroups.hour)
                d.setMinutes(timeGroups.minute)
                d.setSeconds(timeGroups.second || 0)
                return d
            }
        }

        // Fallback if formatToParts is not supported or if we were not able to parse a valid date
        let am = false
        if (vm.hourFormat === HOUR_FORMAT_12) {
            const dateString12 = timeString.split(' ')
            timeString = dateString12[0]
            am = (dateString12[1] === vm.amString || dateString12[1] === AM)
        }
        const time = timeString.split(':')
        let hours = parseInt(time[0], 10)
        const minutes = parseInt(time[1], 10)
        const seconds = vm.enableSeconds ? parseInt(time[2], 10) : 0
        if (isNaN(hours) || hours < 0 || hours > 23 ||
            (vm.hourFormat === HOUR_FORMAT_12 && (hours < 1 || hours > 12)) ||
            isNaN(minutes) || minutes < 0 || minutes > 59) {
            return null
        }
        d.setSeconds(seconds)
        d.setMinutes(minutes)
        if (vm.hourFormat === HOUR_FORMAT_12) {
            if (am && hours === 12) {
                hours = 0
            } else if (!am && hours !== 12) {
                hours += 12
            }
        }
        d.setHours(hours)
        return new Date(d.getTime())
    }
    return null
}

export default defineComponent({
    mixins: [CompatFallthroughMixin, FormElementMixin],
    props: {
        modelValue: [Date, null] as PropType<Date | null>,
        inline: Boolean,
        minTime: Date,
        maxTime: Date,
        placeholder: String,
        editable: Boolean,
        disabled: Boolean,
        hourFormat: {
            type: String as PropType<HourFormat>,
            validator: (value) => {
                return value === HOUR_FORMAT_24 || value === HOUR_FORMAT_12
            }
        },
        incrementHours: {
            type: Number,
            default: 1
        },
        incrementMinutes: {
            type: Number,
            default: 1
        },
        incrementSeconds: {
            type: Number,
            default: 1
        },
        timeFormatter: {
            type: Function as PropType<TimeFormatter>,
            default: (date: Date, vm: ITimepickerMixin) => {
                if (typeof config.defaultTimeFormatter === 'function') {
                    return config.defaultTimeFormatter(date)
                } else {
                    return defaultTimeFormatter(date, vm)
                }
            }
        },
        timeParser: {
            type: Function as PropType<TimeParser>,
            default: (date: string, vm: ITimepickerMixin) => {
                if (typeof config.defaultTimeParser === 'function') {
                    return config.defaultTimeParser(date)
                } else {
                    return defaultTimeParser(date, vm)
                }
            }
        },
        mobileNative: {
            type: Boolean,
            default: () => config.defaultTimepickerMobileNative
        },
        mobileModal: {
            type: Boolean,
            default: () => config.defaultTimepickerMobileModal
        },
        timeCreator: {
            type: Function as PropType<TimeCreator>,
            default: () => {
                if (typeof config.defaultTimeCreator === 'function') {
                    return config.defaultTimeCreator()
                } else {
                    return new Date()
                }
            }
        },
        position: String,
        unselectableTimes: Array<Date>,
        openOnFocus: Boolean,
        enableSeconds: Boolean,
        defaultMinutes: Number,
        defaultSeconds: Number,
        focusable: {
            type: Boolean,
            default: true
        },
        tzOffset: {
            type: Number,
            default: 0
        },
        appendToBody: Boolean,
        resetOnMeridianChange: {
            type: Boolean,
            default: false
        }
    },
    emits: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        'update:modelValue': (_value: Date | null) => true
    },
    data() {
        return {
            dateSelected: this.modelValue,
            hoursSelected: null as number | null,
            minutesSelected: null as number | null,
            secondsSelected: null as number | null,
            meridienSelected: null as string | null,
            _elementRef: 'input',
            AM,
            PM,
            HOUR_FORMAT_24,
            HOUR_FORMAT_12
        }
    },
    computed: {
        computedValue: {
            get() {
                return this.dateSelected
            },
            set(value: Date | null) {
                this.dateSelected = value
                this.$emit('update:modelValue', this.dateSelected)
            }
        },
        localeOptions() {
            // FIXME: resolvedOptions does not return DateTimeFormatOptions but
            // ResolvedDateTimeFormatOptions. We have to verify if it is
            // actually DateTimeFormatOptions.
            return new Intl.DateTimeFormat(this.locale, {
                hour: 'numeric',
                minute: 'numeric',
                second: this.enableSeconds ? 'numeric' : undefined
            }).resolvedOptions() as Intl.DateTimeFormatOptions
        },
        dtf() {
            return new Intl.DateTimeFormat(this.locale, {
                hour: this.localeOptions.hour || 'numeric',
                minute: this.localeOptions.minute || 'numeric',
                second: this.enableSeconds ? this.localeOptions.second || 'numeric' : undefined,
                // Fixes 12 hour display github.com/buefy/buefy/issues/3418
                hourCycle: !this.isHourFormat24 ? 'h12' : 'h23'
            })
        },
        newHourFormat() {
            return this.hourFormat || (this.localeOptions.hour12 ? HOUR_FORMAT_12 : HOUR_FORMAT_24)
        },
        sampleTime() {
            const d = this.timeCreator()
            d.setHours(10)
            d.setSeconds(0)
            d.setMinutes(0)
            d.setMilliseconds(0)
            return d
        },
        hourLiteral() {
            if (this.dtf.formatToParts && typeof this.dtf.formatToParts === 'function') {
                const d = this.sampleTime
                const parts = this.dtf.formatToParts(d)
                const literal = parts.find((part, idx) => (idx > 0 && parts[idx - 1].type === 'hour'))
                if (literal) {
                    return literal.value
                }
            }
            return ':'
        },
        minuteLiteral() {
            if (this.dtf.formatToParts && typeof this.dtf.formatToParts === 'function') {
                const d = this.sampleTime
                const parts = this.dtf.formatToParts(d)
                const literal = parts.find((part, idx) => (idx > 0 && parts[idx - 1].type === 'minute'))
                if (literal) {
                    return literal.value
                }
            }
            return ':'
        },
        secondLiteral() {
            if (this.dtf.formatToParts && typeof this.dtf.formatToParts === 'function') {
                const d = this.sampleTime
                const parts = this.dtf.formatToParts(d)
                const literal = parts.find((part, idx) => (idx > 0 && parts[idx - 1].type === 'second'))
                if (literal) {
                    return literal.value
                }
            }
            return undefined
        },
        amString() {
            if (this.dtf.formatToParts && typeof this.dtf.formatToParts === 'function') {
                const d = this.sampleTime
                d.setHours(10)
                const dayPeriod = this.dtf.formatToParts(d).find((part) => part.type === 'dayPeriod')
                if (dayPeriod) {
                    return dayPeriod.value
                }
            }
            return AM
        },
        pmString() {
            if (this.dtf.formatToParts && typeof this.dtf.formatToParts === 'function') {
                const d = this.sampleTime
                d.setHours(20)
                const dayPeriod = this.dtf.formatToParts(d).find((part) => part.type === 'dayPeriod')
                if (dayPeriod) {
                    return dayPeriod.value
                }
            }
            return PM
        },
        hours() {
            if (!this.incrementHours || this.incrementHours < 1) throw new Error('Hour increment cannot be null or less than 1.')
            const hours = []
            const numberOfHours = this.isHourFormat24 ? 24 : 12
            for (let i = 0; i < numberOfHours; i += this.incrementHours) {
                let value = i
                let label = value
                if (!this.isHourFormat24) {
                    value = (i + 1)
                    label = value
                    if (this.meridienSelected === this.amString) {
                        if (value === 12) {
                            value = 0
                        }
                    } else if (this.meridienSelected === this.pmString) {
                        if (value !== 12) {
                            value += 12
                        }
                    }
                }
                hours.push({
                    label: this.formatNumber(label),
                    value
                })
            }
            return hours
        },

        minutes() {
            if (!this.incrementMinutes || this.incrementMinutes < 1) throw new Error('Minute increment cannot be null or less than 1.')
            const minutes = []
            for (let i = 0; i < 60; i += this.incrementMinutes) {
                minutes.push({
                    label: this.formatNumber(i, true),
                    value: i
                })
            }
            return minutes
        },

        seconds() {
            if (!this.incrementSeconds || this.incrementSeconds < 1) throw new Error('Second increment cannot be null or less than 1.')
            const seconds = []
            for (let i = 0; i < 60; i += this.incrementSeconds) {
                seconds.push({
                    label: this.formatNumber(i, true),
                    value: i
                })
            }
            return seconds
        },

        meridiens() {
            return [this.amString, this.pmString]
        },

        isMobile() {
            return this.mobileNative && isMobile.any()
        },

        isHourFormat24() {
            return this.newHourFormat === HOUR_FORMAT_24
        },

        disabledOrUndefined() {
            return this.disabled || undefined
        }
    },
    watch: {
        hourFormat() {
            if (this.hoursSelected !== null) {
                this.meridienSelected = this.hoursSelected >= 12 ? this.pmString : this.amString
            }
        },
        locale() {
            // see updateInternalState default
            if (!this.modelValue) {
                this.meridienSelected = this.amString
            }
        },
        /*
         * When v-model is changed:
         *   1. Update internal value.
         *   2. If it's invalid, validate again.
         */
        modelValue: {
            handler(value) {
                this.updateInternalState(value)
                !this.isValid && (this.$refs.input as BInputInstance).checkHtml5Validity()
            },
            immediate: true
        }
    },
    methods: {
        onMeridienChange(value: string) {
            if (this.hoursSelected !== null && this.resetOnMeridianChange) {
                this.hoursSelected = null
                this.minutesSelected = null
                this.secondsSelected = null
                this.computedValue = null
            } else if (this.hoursSelected !== null) {
                if (value === this.pmString) {
                    this.hoursSelected += 12
                } else if (value === this.amString) {
                    this.hoursSelected -= 12
                }
            }
            this.updateDateSelected(
                this.hoursSelected,
                this.minutesSelected,
                this.enableSeconds ? this.secondsSelected : 0,
                value)
        },

        onHoursChange(value: string) {
            if (!this.minutesSelected && typeof this.defaultMinutes !== 'undefined') {
                this.minutesSelected = this.defaultMinutes
            }
            if (!this.secondsSelected && typeof this.defaultSeconds !== 'undefined') {
                this.secondsSelected = this.defaultSeconds
            }
            this.updateDateSelected(
                parseInt(value, 10),
                this.minutesSelected,
                this.enableSeconds ? this.secondsSelected : 0,
                this.meridienSelected
            )
        },

        onMinutesChange(value: string) {
            if (!this.secondsSelected && this.defaultSeconds) {
                this.secondsSelected = this.defaultSeconds
            }
            this.updateDateSelected(
                this.hoursSelected,
                parseInt(value, 10),
                this.enableSeconds ? this.secondsSelected : 0,
                this.meridienSelected
            )
        },

        onSecondsChange(value: string) {
            this.updateDateSelected(
                this.hoursSelected,
                this.minutesSelected,
                parseInt(value, 10),
                this.meridienSelected
            )
        },

        updateDateSelected(
            hours: number | null,
            minutes: number | null,
            seconds: number | null,
            meridiens: string | null
        ) {
            if (hours != null && minutes != null &&
                ((!this.isHourFormat24 && meridiens !== null) || this.isHourFormat24)) {
                let time = null
                if (this.computedValue && !isNaN(this.computedValue.valueOf())) {
                    time = new Date(this.computedValue)
                } else {
                    time = this.timeCreator()
                    time.setMilliseconds(0)
                }
                time.setHours(hours)
                time.setMinutes(minutes)
                time.setSeconds(seconds!)

                if (!isNaN(time.getTime())) this.computedValue = new Date(time.getTime())
            }
        },

        updateInternalState(value?: Date | null) {
            if (value) {
                this.hoursSelected = value.getHours()
                this.minutesSelected = value.getMinutes()
                this.secondsSelected = value.getSeconds()
                this.meridienSelected = value.getHours() >= 12 ? this.pmString : this.amString
            } else {
                this.hoursSelected = null
                this.minutesSelected = null
                this.secondsSelected = null
                this.meridienSelected = this.amString
            }
            this.dateSelected = value
        },

        isHourDisabled(hour: number) {
            let disabled = false
            if (this.minTime) {
                const minHours = this.minTime.getHours()
                const noMinutesAvailable = this.minutes.every((minute) => {
                    return this.isMinuteDisabledForHour(hour, minute.value)
                })
                disabled = hour < minHours || noMinutesAvailable
            }
            if (this.maxTime) {
                if (!disabled) {
                    const maxHours = this.maxTime.getHours()
                    disabled = hour > maxHours
                }
            }
            if (this.unselectableTimes) {
                if (!disabled) {
                    const unselectable = this.unselectableTimes.filter((time) => {
                        if (this.enableSeconds && this.secondsSelected !== null) {
                            return time.getHours() === hour &&
                                time.getMinutes() === this.minutesSelected &&
                                time.getSeconds() === this.secondsSelected
                        } else if (this.minutesSelected !== null) {
                            return time.getHours() === hour &&
                                time.getMinutes() === this.minutesSelected
                        }
                        return false
                    })
                    if (unselectable.length > 0) {
                        disabled = true
                    } else {
                        disabled = this.minutes.every((minute) => {
                            return this.unselectableTimes!.filter((time) => {
                                return time.getHours() === hour &&
                                    time.getMinutes() === minute.value
                            }).length > 0
                        })
                    }
                }
            }
            return disabled
        },

        isMinuteDisabledForHour(hour: number, minute: number) {
            let disabled = false
            if (this.minTime) {
                const minHours = this.minTime.getHours()
                const minMinutes = this.minTime.getMinutes()
                disabled = hour === minHours && minute < minMinutes
            }
            if (this.maxTime) {
                if (!disabled) {
                    const maxHours = this.maxTime.getHours()
                    const maxMinutes = this.maxTime.getMinutes()
                    disabled = hour === maxHours && minute > maxMinutes
                }
            }

            return disabled
        },

        isMinuteDisabled(minute: number) {
            let disabled = false
            if (this.hoursSelected !== null) {
                if (this.isHourDisabled(this.hoursSelected)) {
                    disabled = true
                } else {
                    disabled = this.isMinuteDisabledForHour(this.hoursSelected, minute)
                }
                if (this.unselectableTimes) {
                    if (!disabled) {
                        const unselectable = this.unselectableTimes.filter((time) => {
                            if (this.enableSeconds && this.secondsSelected !== null) {
                                return time.getHours() === this.hoursSelected &&
                                    time.getMinutes() === minute &&
                                    time.getSeconds() === this.secondsSelected
                            } else {
                                return time.getHours() === this.hoursSelected &&
                                    time.getMinutes() === minute
                            }
                        })
                        disabled = unselectable.length > 0
                    }
                }
            }
            return disabled
        },

        isSecondDisabled(second: number) {
            let disabled = false
            if (this.minutesSelected !== null) {
                if (this.isMinuteDisabled(this.minutesSelected)) {
                    disabled = true
                } else {
                    if (this.minTime) {
                        const minHours = this.minTime.getHours()
                        const minMinutes = this.minTime.getMinutes()
                        const minSeconds = this.minTime.getSeconds()
                        disabled = this.hoursSelected === minHours &&
                            this.minutesSelected === minMinutes &&
                            second < minSeconds
                    }
                    if (this.maxTime) {
                        if (!disabled) {
                            const maxHours = this.maxTime.getHours()
                            const maxMinutes = this.maxTime.getMinutes()
                            const maxSeconds = this.maxTime.getSeconds()
                            disabled = this.hoursSelected === maxHours &&
                                this.minutesSelected === maxMinutes &&
                                second > maxSeconds
                        }
                    }
                }
                if (this.unselectableTimes) {
                    if (!disabled) {
                        const unselectable = this.unselectableTimes.filter((time) => {
                            return time.getHours() === this.hoursSelected &&
                                time.getMinutes() === this.minutesSelected &&
                                time.getSeconds() === second
                        })
                        disabled = unselectable.length > 0
                    }
                }
            }
            return disabled
        },

        /*
         * Parse string into date
         */
        onChange(value: string) {
            const date = this.timeParser(value, this)
            this.updateInternalState(date)
            if (date && !isNaN(date.valueOf())) {
                this.computedValue = date
            } else {
                // Force refresh input value when not valid date
                this.computedValue = null;
                (this.$refs.input as BInputInstance).newValue = this.computedValue
            }
        },

        /*
         * Toggle timepicker
         */
        toggle(active: boolean) {
            if (this.$refs.dropdown) {
                (this.$refs.dropdown as BDropdownInstance).isActive = typeof active === 'boolean'
                    ? active
                    : !(this.$refs.dropdown as BDropdownInstance).isActive
            }
        },

        /*
         * Close timepicker
         */
        close() {
            this.toggle(false)
        },

        /*
         * Call default onFocus method and show timepicker
         */
        handleOnFocus() {
            this.onFocus()
            if (this.openOnFocus) {
                this.toggle(true)
            }
        },

        /*
         * Format date into string 'HH-MM-SS'
         */
        formatHHMMSS(value: Date | null | undefined) {
            const date = new Date(value!)
            if (value && !isNaN(date.valueOf())) {
                const hours = date.getHours()
                const minutes = date.getMinutes()
                const seconds = date.getSeconds()
                return this.formatNumber(hours, true) + ':' +
                    this.formatNumber(minutes, true) + ':' +
                    this.formatNumber(seconds, true)
            }
            return ''
        },

        /*
         * Parse time from string
         */
        onChangeNativePicker(event: { target: EventTarget }) {
            const date = (event.target as HTMLInputElement).value
            if (date) {
                let time = null
                if (this.computedValue && !isNaN(this.computedValue.valueOf())) {
                    time = new Date(this.computedValue)
                } else {
                    time = new Date()
                    time.setMilliseconds(0)
                }
                const t = date.split(':')
                time.setHours(parseInt(t[0], 10))
                time.setMinutes(parseInt(t[1], 10))
                time.setSeconds(t[2] ? parseInt(t[2], 10) : 0)
                this.computedValue = new Date(time.getTime())
            } else {
                this.computedValue = null
            }
        },

        formatNumber(value: number, prependZero?: boolean) {
            return this.isHourFormat24 || prependZero
                ? this.pad(value)
                : value
        },

        pad(value: number) {
            return (value < 10 ? '0' : '') + value
        },

        /*
         * Format date into string
         */
        formatValue(date: Date | null | undefined) {
            if (date && !isNaN(date.valueOf())) {
                return this.timeFormatter(date, this)
            } else {
                return null
            }
        },
        /*
         * Keypress event that is bound to the document.
         */
        keyPress({ key }: { key: KeyboardEvent['key'] }) {
            if (this.$refs.dropdown && (this.$refs.dropdown as BDropdownInstance).isActive && (key === 'Escape' || key === 'Esc')) {
                this.toggle(false)
            }
        },
        /*
         * Emit 'blur' event on dropdown is not active (closed)
         */
        onActiveChange(value: boolean) {
            if (!value) {
                this.onBlur()
            }
        }
    },
    created() {
        if (typeof window !== 'undefined') {
            document.addEventListener('keyup', this.keyPress)
        }
    },
    beforeUnmounted() {
        if (typeof window !== 'undefined') {
            document.removeEventListener('keyup', this.keyPress)
        }
    }
})