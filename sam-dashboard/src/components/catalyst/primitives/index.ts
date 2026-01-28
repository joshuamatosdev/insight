// Catalyst Primitives - Basic UI Components
// Single-purpose, reusable building blocks

// Core primitives (lowercase files)
export * from './alert'
export * from './auth-layout'
export * from './avatar'
export * from './badge'
export * from './button'
export * from './icon-button'
export * from './checkbox'
export * from './count'
export * from './divider'
export * from './heading'
export * from './inline-alert'
// Note: InputGroup is exported from forms/input-group to avoid conflict
export {Input} from './input'
export * from './link'
export * from './radio'
export * from './select'
export * from './spinner'
export * from './switch'
export * from './text'
export * from './textarea'
export * from './tooltip'

// Extended primitives (folders and capitalized files)
export * from './ErrorBoundary'
export * from './FormField'
export * from './Icon'
export * from './ScreenReaderOnly'
// Note: Toast, ToastType, ToastProvider, and useToast are all exported from blocks/toast
// The primitives/Toast.tsx is an older implementation that's been superseded
// export { Toast, ToastContainer, ToastProvider } from './Toast'
export * from './VirtualList'
