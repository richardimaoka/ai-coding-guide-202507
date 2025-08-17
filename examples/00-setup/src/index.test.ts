import { test, expect } from 'vitest'

function add(a: number, b: number): number {
  return a + b
}

test('adds 1 + 2 to equal 3', () => {
  expect(add(1, 2)).toBe(3)
})

test('adds 0 + 0 to equal 0', () => {
  expect(add(0, 0)).toBe(0)
})