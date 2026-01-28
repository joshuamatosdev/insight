// Tailwind Plus UI Blocks - Radio Groups
// Source: https://tailwindcss.com/plus/ui-blocks/application-ui/forms/radio-groups
// Format: React JSX (v4.1)
// Downloaded automatically

// =============================================================================
// 1. Simple list
// =============================================================================
const notificationMethods = [
  { id: 'email', title: 'Email' },
  { id: 'sms', title: 'Phone (SMS)' },
  { id: 'push', title: 'Push notification' },
]

export default function Example() {
  return (
    <fieldset>
      <legend className="text-sm/6 font-semibold text-gray-900 dark:text-white">Notifications</legend>
      <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">How do you prefer to receive notifications?</p>
      <div className="mt-6 space-y-6">
        {notificationMethods.map((notificationMethod) => (
          <div key={notificationMethod.id} className="flex items-center">
            <input
              defaultChecked={notificationMethod.id === 'email'}
              id={notificationMethod.id}
              name="notification-method"
              type="radio"
              className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 dark:border-white/10 dark:bg-white/5 dark:checked:border-indigo-500 dark:checked:bg-indigo-500 dark:focus-visible:outline-indigo-500 dark:disabled:border-white/5 dark:disabled:bg-white/10 dark:disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden"
            />
            <label
              htmlFor={notificationMethod.id}
              className="ml-3 block text-sm/6 font-medium text-gray-900 dark:text-white"
            >
              {notificationMethod.title}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  )
}


// =============================================================================
// 2. Simple inline list
// =============================================================================
const notificationMethods = [
  { id: 'email', title: 'Email' },
  { id: 'sms', title: 'Phone (SMS)' },
  { id: 'push', title: 'Push notification' },
]

export default function Example() {
  return (
    <fieldset>
      <legend className="text-sm/6 font-semibold text-gray-900 dark:text-white">Notifications</legend>
      <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">How do you prefer to receive notifications?</p>
      <div className="mt-6 space-y-6 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
        {notificationMethods.map((notificationMethod) => (
          <div key={notificationMethod.id} className="flex items-center">
            <input
              defaultChecked={notificationMethod.id === 'email'}
              id={notificationMethod.id}
              name="notification-method"
              type="radio"
              className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 dark:border-white/10 dark:bg-white/5 dark:checked:border-indigo-500 dark:checked:bg-indigo-500 dark:focus-visible:outline-indigo-500 dark:disabled:border-white/5 dark:disabled:bg-white/10 dark:disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden"
            />
            <label
              htmlFor={notificationMethod.id}
              className="ml-3 block text-sm/6 font-medium text-gray-900 dark:text-white"
            >
              {notificationMethod.title}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  )
}


// =============================================================================
// 3. List with description
// =============================================================================
const plans = [
  { id: 'small', name: 'Small', description: '4 GB RAM / 2 CPUS / 80 GB SSD Storage' },
  { id: 'medium', name: 'Medium', description: '8 GB RAM / 4 CPUS / 160 GB SSD Storage' },
  { id: 'large', name: 'Large', description: '16 GB RAM / 8 CPUS / 320 GB SSD Storage' },
]

export default function Example() {
  return (
    <fieldset aria-label="Plan">
      <div className="space-y-5">
        {plans.map((plan) => (
          <div key={plan.id} className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                defaultChecked={plan.id === 'small'}
                id={plan.id}
                name="plan"
                type="radio"
                aria-describedby={`${plan.id}-description`}
                className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 dark:border-white/10 dark:bg-white/5 dark:checked:border-indigo-500 dark:checked:bg-indigo-500 dark:focus-visible:outline-indigo-500 dark:disabled:border-white/5 dark:disabled:bg-white/10 dark:disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden"
              />
            </div>
            <div className="ml-3 text-sm/6">
              <label htmlFor={plan.id} className="font-medium text-gray-900 dark:text-white">
                {plan.name}
              </label>
              <p id={`${plan.id}-description`} className="text-gray-500 dark:text-gray-400">
                {plan.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  )
}


// =============================================================================
// 4. List with inline description
// =============================================================================
const plans = [
  { id: 'small', name: 'Small', description: '4 GB RAM / 2 CPUS / 80 GB SSD Storage' },
  { id: 'medium', name: 'Medium', description: '8 GB RAM / 4 CPUS / 160 GB SSD Storage' },
  { id: 'large', name: 'Large', description: '16 GB RAM / 8 CPUS / 320 GB SSD Storage' },
]

export default function Example() {
  return (
    <fieldset aria-label="Plan">
      <div className="space-y-5">
        {plans.map((plan) => (
          <div key={plan.id} className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                defaultChecked={plan.id === 'small'}
                id={plan.id}
                name="plan"
                type="radio"
                aria-describedby={`${plan.id}-description`}
                className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 dark:border-white/10 dark:bg-white/5 dark:checked:border-indigo-500 dark:checked:bg-indigo-500 dark:focus-visible:outline-indigo-500 dark:disabled:border-white/5 dark:disabled:bg-white/10 dark:disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden"
              />
            </div>
            <div className="ml-3 text-sm/6">
              <label htmlFor={plan.id} className="font-medium text-gray-900 dark:text-white">
                {plan.name}
              </label>{' '}
              <span id={`${plan.id}-description`} className="text-gray-500 dark:text-gray-400">
                {plan.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  )
}


// =============================================================================
// 5. List with radio on right
// =============================================================================
const accounts = [
  { id: 'checking', name: 'Checking', description: 'CIBC ••••6610' },
  { id: 'savings', name: 'Savings', description: 'Bank of America ••••0149' },
  { id: 'mastercard', name: 'Mastercard', description: 'Capital One ••••7877' },
]

export default function Example() {
  return (
    <fieldset>
      <legend className="text-sm/6 font-semibold text-gray-900 dark:text-white">Transfer funds</legend>
      <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Transfer your balance to your bank account.</p>
      <div className="mt-2.5 divide-y divide-gray-200 dark:divide-white/10">
        {accounts.map((account, accountIdx) => (
          <div key={accountIdx} className="relative flex items-start pt-3.5 pb-4">
            <div className="min-w-0 flex-1 text-sm/6">
              <label htmlFor={`account-${account.id}`} className="font-medium text-gray-900 dark:text-white">
                {account.name}
              </label>
              <p id={`account-${account.id}-description`} className="text-gray-500 dark:text-gray-400">
                {account.description}
              </p>
            </div>
            <div className="ml-3 flex h-6 items-center">
              <input
                defaultChecked={account.id === 'checking'}
                id={`account-${account.id}`}
                name="account"
                type="radio"
                aria-describedby={`account-${account.id}-description`}
                className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 dark:border-white/10 dark:bg-white/5 dark:checked:border-indigo-500 dark:checked:bg-indigo-500 dark:focus-visible:outline-indigo-500 dark:disabled:border-white/5 dark:disabled:bg-white/10 dark:disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden"
              />
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  )
}


// =============================================================================
// 6. Simple list with radio on right
// =============================================================================
const sides = [
  { id: null, name: 'None' },
  { id: 1, name: 'Baked beans' },
  { id: 2, name: 'Coleslaw' },
  { id: 3, name: 'French fries' },
  { id: 4, name: 'Garden salad' },
  { id: 5, name: 'Mashed potatoes' },
]

export default function Example() {
  return (
    <fieldset>
      <legend className="text-sm/6 font-semibold text-gray-900 dark:text-white">Select a side</legend>
      <div className="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200 dark:divide-white/10 dark:border-white/10">
        {sides.map((side, sideIdx) => (
          <div key={sideIdx} className="relative flex items-start py-4">
            <div className="min-w-0 flex-1 text-sm/6">
              <label htmlFor={`side-${side.id}`} className="font-medium text-gray-900 select-none dark:text-white">
                {side.name}
              </label>
            </div>
            <div className="ml-3 flex h-6 items-center">
              <input
                defaultChecked={side.id === null}
                id={`side-${side.id}`}
                name="plan"
                type="radio"
                className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 dark:border-white/10 dark:bg-white/5 dark:checked:border-indigo-500 dark:checked:bg-indigo-500 dark:focus-visible:outline-indigo-500 dark:disabled:border-white/5 dark:disabled:bg-white/10 dark:disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden"
              />
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  )
}


// =============================================================================
// 7. Simple table
// =============================================================================
const plans = [
  { id: 'startup', name: 'Startup', priceMonthly: '$29', priceYearly: '$290', limit: 'Up to 5 active job postings' },
  { id: 'business', name: 'Business', priceMonthly: '$99', priceYearly: '$990', limit: 'Up to 25 active job postings' },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: '$249',
    priceYearly: '$2490',
    limit: 'Unlimited active job postings',
  },
]

export default function Example() {
  return (
    <fieldset aria-label="Pricing plans" className="relative -space-y-px rounded-md bg-white dark:bg-gray-800/50">
      {plans.map((plan) => (
        <label
          key={plan.id}
          aria-label={plan.name}
          aria-description={`${plan.priceMonthly} per month, ${plan.priceYearly} per year, ${plan.limit}`}
          className="group flex flex-col border border-gray-200 p-4 first:rounded-tl-md first:rounded-tr-md last:rounded-br-md last:rounded-bl-md focus:outline-hidden has-checked:relative has-checked:border-indigo-200 has-checked:bg-indigo-50 md:grid md:grid-cols-3 md:pr-6 md:pl-4 dark:border-gray-700 dark:has-checked:border-indigo-800 dark:has-checked:bg-indigo-600/10"
        >
          <span className="flex items-center gap-3 text-sm">
            <input
              defaultValue={plan.id}
              defaultChecked={plan.id === 'startup'}
              name="pricing-plan"
              type="radio"
              className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 dark:border-white/10 dark:bg-white/5 dark:checked:border-indigo-500 dark:checked:bg-indigo-500 dark:focus-visible:outline-indigo-500 dark:disabled:border-white/5 dark:disabled:bg-white/10 dark:disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden"
            />
            <span className="font-medium text-gray-900 group-has-checked:text-indigo-900 dark:text-white dark:group-has-checked:text-indigo-300">
              {plan.name}
            </span>
          </span>
          <span className="ml-6 pl-1 text-sm md:ml-0 md:pl-0 md:text-center">
            <span className="font-medium text-gray-900 group-has-checked:text-indigo-900 dark:text-white dark:group-has-checked:text-indigo-300">
              {plan.priceMonthly} / mo
            </span>{' '}
            <span className="text-gray-500 group-has-checked:text-indigo-700 dark:text-gray-400 dark:group-has-checked:text-indigo-300/75">
              ({plan.priceYearly} / yr)
            </span>
          </span>
          <span className="ml-6 pl-1 text-sm text-gray-500 group-has-checked:text-indigo-700 md:ml-0 md:pl-0 md:text-right dark:text-gray-400 dark:group-has-checked:text-indigo-300/75">
            {plan.limit}
          </span>
        </label>
      ))}
    </fieldset>
  )
}


// =============================================================================
// 8. List with descriptions in panel
// =============================================================================
const settings = [
  { id: 'public', name: 'Public access', description: 'This project would be available to anyone who has the link' },
  {
    id: 'private-to-project-members',
    name: 'Private to project members',
    description: 'Only members of this project would be able to access',
  },
  { id: 'private-to-you', name: 'Private to you', description: 'You are the only one able to access this project' },
]

export default function Example() {
  return (
    <fieldset aria-label="Privacy setting" className="-space-y-px rounded-md bg-white dark:bg-gray-800/50">
      {settings.map((setting) => (
        <label
          key={setting.id}
          aria-label={setting.name}
          aria-description={setting.description}
          className="group flex border border-gray-200 p-4 first:rounded-tl-md first:rounded-tr-md last:rounded-br-md last:rounded-bl-md focus:outline-hidden has-checked:relative has-checked:border-indigo-200 has-checked:bg-indigo-50 dark:border-gray-700 dark:has-checked:border-indigo-800 dark:has-checked:bg-indigo-500/10"
        >
          <input
            defaultValue={setting.id}
            defaultChecked={setting.id === 'public'}
            name="privacy-setting"
            type="radio"
            className="relative mt-0.5 size-4 shrink-0 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 dark:border-white/10 dark:bg-white/5 dark:checked:border-indigo-500 dark:checked:bg-indigo-500 dark:focus-visible:outline-indigo-500 dark:disabled:border-white/5 dark:disabled:bg-white/10 dark:disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden"
          />
          <span className="ml-3 flex flex-col">
            <span className="block text-sm font-medium text-gray-900 group-has-checked:text-indigo-900 dark:text-white dark:group-has-checked:text-indigo-300">
              {setting.name}
            </span>
            <span className="block text-sm text-gray-500 group-has-checked:text-indigo-700 dark:text-gray-400 dark:group-has-checked:text-indigo-300/75">
              {setting.description}
            </span>
          </span>
        </label>
      ))}
    </fieldset>
  )
}


// =============================================================================
// 9. Color picker
// =============================================================================
const options = [
  { id: 'pink', name: 'Pink', classes: 'bg-pink-500 checked:outline-pink-500' },
  { id: 'purple', name: 'Purple', classes: 'bg-purple-500 checked:outline-purple-500' },
  { id: 'blue', name: 'Blue', classes: 'bg-blue-500 checked:outline-blue-500' },
  { id: 'green', name: 'Green', classes: 'bg-green-500 checked:outline-green-500' },
  { id: 'yellow', name: 'Yellow', classes: 'bg-yellow-500 checked:outline-yellow-500' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  return (
    <fieldset>
      <legend className="block text-sm/6 font-semibold text-gray-900 dark:text-white">Choose a label color</legend>
      <div className="mt-6 flex items-center gap-x-3">
        {options.map((color) => (
          <div key={color.id} className="flex rounded-full outline -outline-offset-1 outline-black/10">
            <input
              defaultValue={color.id}
              defaultChecked={color === options[0]}
              name="color"
              type="radio"
              aria-label={color.name}
              className={classNames(
                color.classes,
                'size-8 appearance-none rounded-full forced-color-adjust-none checked:outline-2 checked:outline-offset-2 focus-visible:outline-3 focus-visible:outline-offset-3',
              )}
            />
          </div>
        ))}
      </div>
    </fieldset>
  )
}


// =============================================================================
// 10. Cards
// =============================================================================
import { CheckCircleIcon } from '@heroicons/react/20/solid'

const mailingLists = [
  { id: 'newsletter', title: 'Newsletter', description: 'Last message sent an hour ago', users: '621 users' },
  {
    id: 'existing-customers',
    title: 'Existing customers',
    description: 'Last message sent 2 weeks ago',
    users: '1200 users',
  },
  { id: 'trial-users', title: 'Trial users', description: 'Last message sent 4 days ago', users: '2740 users' },
]

export default function Example() {
  return (
    <fieldset>
      <legend className="text-sm/6 font-semibold text-gray-900 dark:text-white">Select a mailing list</legend>
      <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
        {mailingLists.map((mailingList) => (
          <label
            key={mailingList.id}
            aria-label={mailingList.title}
            aria-description={`${mailingList.description} to ${mailingList.users}`}
            className="group relative flex rounded-lg border border-gray-300 bg-white p-4 has-checked:outline-2 has-checked:-outline-offset-2 has-checked:outline-indigo-600 has-focus-visible:outline-3 has-focus-visible:-outline-offset-1 has-disabled:border-gray-400 has-disabled:bg-gray-200 has-disabled:opacity-25 dark:border-white/10 dark:bg-gray-800/50 dark:has-checked:bg-indigo-500/10 dark:has-checked:outline-indigo-500 dark:has-disabled:border-white/10 dark:has-disabled:bg-gray-800"
          >
            <input
              defaultValue={mailingList.id}
              defaultChecked={mailingList === mailingLists[0]}
              name="mailing-list"
              type="radio"
              className="absolute inset-0 appearance-none focus:outline-none"
            />
            <div className="flex-1">
              <span className="block text-sm font-medium text-gray-900 dark:text-white">{mailingList.title}</span>
              <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">{mailingList.description}</span>
              <span className="mt-6 block text-sm font-medium text-gray-900 dark:text-white">{mailingList.users}</span>
            </div>
            <CheckCircleIcon
              aria-hidden="true"
              className="invisible size-5 text-indigo-600 group-has-checked:visible dark:text-indigo-500"
            />
          </label>
        ))}
      </div>
    </fieldset>
  )
}


// =============================================================================
// 11. Small cards
// =============================================================================
const memoryOptions = [
  { id: '4gb', name: '4 GB', inStock: true },
  { id: '8gb', name: '8 GB', inStock: true },
  { id: '16gb', name: '16 GB', inStock: true },
  { id: '32gb', name: '32 GB', inStock: true },
  { id: '64gb', name: '64 GB', inStock: true },
  { id: '128gb', name: '128 GB', inStock: false },
]

export default function Example() {
  return (
    <fieldset aria-label="Choose a memory option">
      <div className="flex items-center justify-between">
        <div className="text-sm/6 font-medium text-gray-900 dark:text-white">RAM</div>
        <a
          href="#"
          className="text-sm/6 font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          See performance specs
        </a>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {memoryOptions.map((option) => (
          <label
            key={option.id}
            aria-label={option.name}
            className="group relative flex items-center justify-center rounded-md border border-gray-300 bg-white p-3 has-checked:border-indigo-600 has-checked:bg-indigo-600 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-indigo-600 has-disabled:border-gray-400 has-disabled:bg-gray-200 has-disabled:opacity-25 dark:border-white/10 dark:bg-gray-800/50 dark:has-checked:border-indigo-500 dark:has-checked:bg-indigo-500 dark:has-focus-visible:outline-indigo-500 dark:has-disabled:border-white/10 dark:has-disabled:bg-gray-800"
          >
            <input
              defaultValue={option.id}
              defaultChecked={option === memoryOptions[2]}
              name="option"
              type="radio"
              disabled={!option.inStock}
              className="absolute inset-0 appearance-none focus:outline-none disabled:cursor-not-allowed"
            />
            <span className="text-sm font-medium text-gray-900 uppercase group-has-checked:text-white dark:text-white">
              {option.name}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}


// =============================================================================
// 12. Stacked cards
// =============================================================================
const plans = [
  { id: 'hobby', name: 'Hobby', ram: '8GB', cpus: '4 CPUs', disk: '160 GB SSD disk', price: '$40' },
  { id: 'startup', name: 'Startup', ram: '12GB', cpus: '6 CPUs', disk: '256 GB SSD disk', price: '$80' },
  { id: 'business', name: 'Business', ram: '16GB', cpus: '8 CPUs', disk: '512 GB SSD disk', price: '$160' },
  { id: 'enterprise', name: 'Enterprise', ram: '32GB', cpus: '12 CPUs', disk: '1024 GB SSD disk', price: '$240' },
]

export default function Example() {
  return (
    <fieldset aria-label="Server size">
      <div className="space-y-4">
        {plans.map((plan) => (
          <label
            key={plan.id}
            aria-label={plan.name}
            aria-description={`${plan.ram}, ${plan.cpus}, ${plan.disk}, ${plan.price} per month`}
            className="group relative block rounded-lg border border-gray-300 bg-white px-6 py-4 has-checked:outline-2 has-checked:-outline-offset-2 has-checked:outline-indigo-600 has-focus-visible:outline-3 has-focus-visible:-outline-offset-1 sm:flex sm:justify-between dark:border-white/10 dark:bg-gray-800/50 dark:has-checked:outline-indigo-500"
          >
            <input
              defaultValue={plan.id}
              defaultChecked={plan.id === 'hobby'}
              name="plan"
              type="radio"
              className="absolute inset-0 appearance-none focus:outline-none"
            />
            <span className="flex items-center">
              <span className="flex flex-col text-sm">
                <span className="font-medium text-gray-900 dark:text-white">{plan.name}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  <span className="block sm:inline">
                    {plan.ram} / {plan.cpus}
                  </span>{' '}
                  <span aria-hidden="true" className="hidden sm:mx-1 sm:inline">
                    &middot;
                  </span>{' '}
                  <span className="block sm:inline">{plan.disk}</span>
                </span>
              </span>
            </span>
            <span className="mt-2 flex text-sm sm:mt-0 sm:ml-4 sm:flex-col sm:text-right">
              <span className="font-medium text-gray-900 dark:text-white">{plan.price}</span>
              <span className="ml-1 text-gray-500 sm:ml-0 dark:text-gray-400">/mo</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}


