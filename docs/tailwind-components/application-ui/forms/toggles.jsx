// Tailwind Plus UI Blocks - Toggles
// Source: https://tailwindcss.com/plus/ui-blocks/application-ui/forms/toggles
// Format: React JSX (v4.1)
// Downloaded automatically

// =============================================================================
// 1. Simple toggle
// =============================================================================
export default function Example() {
  return (
    <div className="group relative inline-flex w-11 shrink-0 rounded-full bg-gray-200 p-0.5 inset-ring inset-ring-gray-900/5 outline-offset-2 outline-indigo-600 transition-colors duration-200 ease-in-out has-checked:bg-indigo-600 has-focus-visible:outline-2 dark:bg-white/5 dark:inset-ring-white/10 dark:outline-indigo-500 dark:has-checked:bg-indigo-500">
      <span className="size-5 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-checked:translate-x-5" />
      <input
        name="setting"
        type="checkbox"
        aria-label="Use setting"
        className="absolute inset-0 size-full appearance-none focus:outline-hidden"
      />
    </div>
  )
}


// =============================================================================
// 2. Short toggle
// =============================================================================
export default function Example() {
  return (
    <div className="group relative inline-flex h-5 w-10 shrink-0 items-center justify-center rounded-full outline-offset-2 outline-indigo-600 has-focus-visible:outline-2 dark:outline-indigo-500">
      <span className="absolute mx-auto h-4 w-9 rounded-full bg-gray-200 inset-ring inset-ring-gray-900/5 transition-colors duration-200 ease-in-out group-has-checked:bg-indigo-600 dark:bg-gray-800/50 dark:inset-ring-white/10 dark:group-has-checked:bg-indigo-500" />
      <span className="absolute left-0 size-5 rounded-full border border-gray-300 bg-white shadow-xs transition-transform duration-200 ease-in-out group-has-checked:translate-x-5 dark:shadow-none" />
      <input
        name="setting"
        type="checkbox"
        aria-label="Use setting"
        className="absolute inset-0 size-full appearance-none focus:outline-hidden"
      />
    </div>
  )
}


// =============================================================================
// 3. Toggle with icon
// =============================================================================
export default function Example() {
  return (
    <div className="group relative inline-flex w-11 shrink-0 rounded-full bg-gray-200 p-0.5 inset-ring inset-ring-gray-900/5 outline-offset-2 outline-indigo-600 transition-colors duration-200 ease-in-out has-checked:bg-indigo-600 has-focus-visible:outline-2 dark:bg-white/5 dark:inset-ring-white/10 dark:outline-indigo-500 dark:has-checked:bg-indigo-500">
      <span className="relative size-5 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-checked:translate-x-5">
        <span
          aria-hidden="true"
          className="absolute inset-0 flex size-full items-center justify-center opacity-100 transition-opacity duration-200 ease-in group-has-checked:opacity-0 group-has-checked:duration-100 group-has-checked:ease-out"
        >
          <svg fill="none" viewBox="0 0 12 12" className="size-3 text-gray-400 dark:text-gray-600">
            <path
              d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-0 flex size-full items-center justify-center opacity-0 transition-opacity duration-100 ease-out group-has-checked:opacity-100 group-has-checked:duration-200 group-has-checked:ease-in"
        >
          <svg fill="currentColor" viewBox="0 0 12 12" className="size-3 text-indigo-600 dark:text-indigo-500">
            <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
          </svg>
        </span>
      </span>
      <input
        name="setting"
        type="checkbox"
        aria-label="Use setting"
        className="absolute inset-0 size-full appearance-none focus:outline-hidden"
      />
    </div>
  )
}


// =============================================================================
// 4. With left label and description
// =============================================================================
export default function Example() {
  return (
    <div className="flex items-center justify-between">
      <span className="flex grow flex-col">
        <label id="availability-label" className="text-sm/6 font-medium text-gray-900 dark:text-white">
          Available to hire
        </label>
        <span id="availability-description" className="text-sm text-gray-500 dark:text-gray-400">
          Nulla amet tempus sit accumsan. Aliquet turpis sed sit lacinia.
        </span>
      </span>
      <div className="group relative inline-flex w-11 shrink-0 rounded-full bg-gray-200 p-0.5 inset-ring inset-ring-gray-900/5 outline-offset-2 outline-indigo-600 transition-colors duration-200 ease-in-out has-checked:bg-indigo-600 has-focus-visible:outline-2 dark:bg-white/5 dark:inset-ring-white/10 dark:outline-indigo-500 dark:has-checked:bg-indigo-500">
        <span className="size-5 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-checked:translate-x-5" />
        <input
          id="availability"
          name="availability"
          type="checkbox"
          aria-labelledby="availability-label"
          aria-describedby="availability-description"
          className="absolute inset-0 size-full appearance-none focus:outline-hidden"
        />
      </div>
    </div>
  )
}


// =============================================================================
// 5. With right label
// =============================================================================
export default function Example() {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="group relative inline-flex w-11 shrink-0 rounded-full bg-gray-200 p-0.5 inset-ring inset-ring-gray-900/5 outline-offset-2 outline-indigo-600 transition-colors duration-200 ease-in-out has-checked:bg-indigo-600 has-focus-visible:outline-2 dark:bg-white/5 dark:inset-ring-white/10 dark:outline-indigo-500 dark:has-checked:bg-indigo-500">
        <span className="size-5 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-checked:translate-x-5" />
        <input
          id="annual-billing"
          name="annual-billing"
          type="checkbox"
          aria-labelledby="annual-billing-label"
          aria-describedby="annual-billing-description"
          className="absolute inset-0 size-full appearance-none focus:outline-hidden"
        />
      </div>

      <div className="text-sm">
        <label id="annual-billing-label" className="font-medium text-gray-900 dark:text-white">
          Annual billing
        </label>{' '}
        <span id="annual-billing-description" className="text-gray-500 dark:text-gray-400">
          (Save 10%)
        </span>
      </div>
    </div>
  )
}


