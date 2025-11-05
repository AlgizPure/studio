"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

/**
 * @fileoverview Реализация системы уведомлений (тостов), вдохновленная react-hot-toast.
 * Предоставляет хук `useToast` и функцию `toast` для управления уведомлениями.
 */

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

/**
 * @typedef {ToastProps & { id: string, title?: React.ReactNode, description?: React.ReactNode, action?: ToastActionElement }} ToasterToast
 * Расширенный тип для тоста, используемый в `Toaster`.
 */
type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

/** Типы действий для редьюсера тостов. */
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

/** Генерирует уникальный ID для тоста. */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

/**
 * @typedef {object} Action
 * Тип для действий, которые могут быть отправлены редьюсеру тостов.
 */
type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

/**
 * @typedef {object} State
 * Состояние тостера, содержащее массив активных тостов.
 * @property {ToasterToast[]} toasts - Массив тостов.
 */
interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * Добавляет тост в очередь на удаление после задержки.
 * @param {string} toastId - ID тоста.
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

/**
 * Редьюсер для управления состоянием тостов.
 * @param {State} state - Текущее состояние.
 * @param {Action} action - Действие для выполнения.
 * @returns {State} - Новое состояние.
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Побочные эффекты ! - Это можно было бы вынести в отдельное действие dismissToast(),
      // но для простоты оставлено здесь.
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

/**
 * Отправляет действие редьюсеру и уведомляет всех слушателей об изменении состояния.
 * @param {Action} action - Действие для отправки.
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

/**
 * @typedef {Omit<ToasterToast, "id">} Toast
 * Тип для создания нового тоста (без ID).
 */
type Toast = Omit<ToasterToast, "id">

/**
 * Создает и отображает новый тост.
 * @param {Toast} props - Свойства тоста.
 * @returns {{ id: string, dismiss: () => void, update: (props: ToasterToast) => void }} - Объект с ID тоста и функциями для его обновления и скрытия.
 */
function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

/**
 * Хук для использования системы тостов в компонентах React.
 * @returns {{ toasts: ToasterToast[], toast: (props: Toast) => { id: string, dismiss: () => void, update: (props: ToasterToast) => void }, dismiss: (toastId?: string) => void }} - Состояние тостов и функции для управления ими.
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
