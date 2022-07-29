import { useEffect, useRef, useState } from 'react'

export const usePrevious = <T>(value: T) => {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

export const clamp = (n: number, min: number, max: number): number => Math.min(Math.max(min, n), max)

export const useStatefulProp = <T>(prop: T) => {
  const state = useState(prop)
  const [_, setStatefulProp] = useState(prop)

  useEffect(() => {
    setStatefulProp(prop)
  }, [prop])

  return state
}
