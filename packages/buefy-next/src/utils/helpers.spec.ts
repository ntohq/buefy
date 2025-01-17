import { describe, expect, it, vi } from 'vitest'
import {
    escapeRegExpChars,
    getValueByPath,
    indexOf,
    matchWithGroups,
    merge,
    removeElement,
    toCssWidth
} from './helpers'

describe('helpers', () => {
    describe('getValueByPath', () => {
        it('get value of an object property/path even if it is nested', () => {
            const obj = {
                val1: 'val1',
                val2: {
                    val21: 'val21'
                },
                val3: {
                    val31: {
                        val311: 'val311'
                    }
                }
            }

            expect(getValueByPath(obj, 'val1')).toBe('val1')
            expect(getValueByPath(obj, 'val2.val21')).toBe('val21')
            expect(getValueByPath(obj, 'val3.val31.val311')).toBe('val311')
        })
    })

    describe('indexOf', () => {
        it('get index of an array element using equality function', () => {
            type Obj = {
                id: number
            }
            const obj1 = {
                id: 1
            }
            const obj2 = {
                id: 2
            }
            const obj3 = {
                id: 3
            }
            const obj4 = {
                id: 4
            }
            const obj5 = {
                id: 5
            }
            const arr = [
                obj1,
                obj2,
                obj3,
                obj4
            ]
            const fnc = (obj1: Obj, obj2: Obj) => {
                return obj1.id === obj2.id
            }

            expect(indexOf(arr, obj1, fnc)).toBe(0)
            expect(indexOf(arr, obj2, fnc)).toBe(1)
            expect(indexOf(arr, obj3, fnc)).toBe(2)
            expect(indexOf(arr, obj4, fnc)).toBe(3)
            expect(indexOf(arr, obj5, fnc)).toBe(-1)
            expect(indexOf(null, obj1, fnc)).toBe(-1)
            expect(indexOf(arr, obj1)).toBe(0)
        })
    })

    describe('merge', () => {
        describe('shallow merges', () => {
            it('merges objects', () => {
                const a = { a: 'discard' }
                const b = { a: 'test' }
                expect(merge(a, b)).toEqual({ a: 'test' })
            })

            it('extends objects', () => {
                const a = { a: 'test' }
                const b = { b: 'test' }
                expect(merge<{
                    a?: string,
                    b?: string
                }>(a, b)).toEqual({ a: 'test', b: 'test' })
            })

            it('extends a property with an object overriding missing', () => {
                const a = { a: 'test' }
                const b = { b: { c: 'test' } }
                expect(merge<{
                    a?: string,
                    b?: { c: string }
                }>(a, b)).toEqual({ a: 'test', b: { c: 'test' } })
            })

            it('replaces a property with an object overriding string', () => {
                const a = { b: 'whatever', a: 'test' }
                const b = { b: { c: 'test' } }
                expect(merge<{
                    a?: string,
                    b: string | { c: string }
                }>(a, b)).toEqual({ a: 'test', b: { c: 'test' } })
            })
        })

        describe('deep merges', () => {
            it('merges objects', () => {
                const a = { test: { a: 'discard', b: 'test' } }
                const b = { test: { a: 'test' } }
                expect(merge(a, b, true)).toEqual({ test: { a: 'test', b: 'test' } })
            })

            it('extends objects', () => {
                const a = { test: { a: 'test' } }
                const b = { test: { b: 'test' } }
                expect(merge<{
                    test: {
                        a?: string,
                        b?: string
                    }
                }>(a, b, true)).toEqual({ test: { a: 'test', b: 'test' } })
            })

            it('extends a property with an object', () => {
                const a = { test: { a: 'test' } }
                const b = { test: { b: { c: 'test' } } }
                expect(merge<{
                    test: {
                        a?: string,
                        b?: { c: string }
                    }
                }>(a, b, true)).toEqual({ test: { a: 'test', b: { c: 'test' } } })
            })

            it('replaces a property with an object', () => {
                const a = { test: { b: 'whatever', a: 'test' } }
                const b = { test: { b: { c: 'test' } } }
                expect(merge<{
                    test: {
                        a?: string,
                        b: string | { c: string }
                    }
                }>(a, b, true)).toEqual({ test: { a: 'test', b: { c: 'test' } } })
            })

            it('replaces a property with an object with nested partial object', () => {
                const a = {
                    test: {
                        a: 'test-1',
                        b: 'whatever'
                    }
                }
                const b = {
                    test: {
                        b: 'test-2'
                    }
                }
                expect(merge<{
                    test: {
                        a: string,
                        b: string
                    }
                }>(a, b, true)).toEqual({
                    test: {
                        a: 'test-1',
                        b: 'test-2'
                    }
                })
            })
        })
    })

    describe('escapeRegExpChars', () => {
        it('escape regex characters', () => {
            const initial = 'All of these should be escaped: \\ ^ $ * + ? . ( ) | { } [ ]'
            const expected = 'All of these should be escaped: \\\\ \\^ \\$ \\* \\+ \\? \\. \\( \\) \\| \\{ \\} \\[ \\]'

            expect(escapeRegExpChars(null)).toBeNull()
            expect(escapeRegExpChars(initial)).toBe(expected)
        })
    })

    describe('removeElement', () => {
        it('calls remove function from the element if it exists', () => {
            const elm = {
                remove: vi.fn()
            }

            removeElement((elm as unknown) as Element)
            expect(elm.remove).toHaveBeenCalled()
        })

        it('calls parentNode.removeChild function from the element if it exists', () => {
            const elm = {
                parentNode: {
                    removeChild: vi.fn()
                }
            }

            removeElement((elm as unknown) as Element)
            expect(elm.parentNode.removeChild).toHaveBeenCalled()
        })
    })

    describe('toCssWidth', () => {
        it('should return "200px" for 200', () => {
            expect(toCssWidth(200)).toBe('200px')
        })

        it('should return "1.5em" for "1.5em"', () => {
            expect(toCssWidth('1.5em')).toBe('1.5em')
        })

        it('should return "NaN" for NaN', () => {
            expect(toCssWidth(NaN)).toBe('NaN')
        })

        it('should return null for undefined', () => {
            expect(toCssWidth(undefined)).toBeNull()
        })
    })

    describe('matchWithGroups', () => {
        describe('with pattern = "((?!=<year>)\\d+)/((?!=<month>)\\d+)/((?!=<day>)\\d+)"', () => {
            const pattern = '((?!=<year>)\\d+)/((?!=<month>)\\d+)/((?!=<day>)\\d+)'

            it('should return {year:"2024",month:"02",day:"14"} for "2024/02/14"', () => {
                expect(matchWithGroups(pattern, '2024/02/14'))
                    .toEqual({
                        year: '2024',
                        month: '02',
                        day: '14'
                    })
            })

            it('should return {year:null,month:null,day:null} for "2024-02-14"', () => {
                expect(matchWithGroups(pattern, '2024-02-14'))
                    .toEqual({
                        year: null,
                        month: null,
                        day: null
                    })
            })
        })

        describe('with pattern = "year=(\\d+)/month=(\\d+)/day=(\\d+)" (invalid pattern)', () => {
            const pattern = 'year=(\\d+)/month=(\\d+)/day=(\\d+)'

            it('should throw Error for "2024/02/14"', () => {
                expect(() => matchWithGroups(pattern, '2024/02/14')).toThrow()
            })
        })
    })
})
