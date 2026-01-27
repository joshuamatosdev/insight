import { InputGroup, InputAddon, InputGroupInput } from './input-group'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'

/**
 * InputGroup Examples
 *
 * Demonstrates various use cases for the InputGroup compound component.
 */

export function InputGroupExamples() {
  return (
    <div className="space-y-8 p-8">
      {/* Example 1: Currency input with leading dollar sign */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Price
        </label>
        <InputGroup>
          <InputAddon>$</InputAddon>
          <InputGroupInput type="number" placeholder="0.00" />
        </InputGroup>
      </div>

      {/* Example 2: Amount with trailing currency selector */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Amount with Currency
        </label>
        <InputGroup>
          <InputGroupInput type="number" placeholder="0.00" />
          <InputAddon>
            <select>
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>JPY</option>
            </select>
          </InputAddon>
        </InputGroup>
      </div>

      {/* Example 3: Both leading and trailing addons */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Budget Amount
        </label>
        <InputGroup>
          <InputAddon>$</InputAddon>
          <InputGroupInput type="number" placeholder="0.00" />
          <InputAddon>USD</InputAddon>
        </InputGroup>
      </div>

      {/* Example 4: URL input with protocol prefix */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Website URL
        </label>
        <InputGroup>
          <InputAddon>https://</InputAddon>
          <InputGroupInput type="url" placeholder="www.example.com" />
        </InputGroup>
      </div>

      {/* Example 5: Email domain input */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Email Address
        </label>
        <InputGroup>
          <InputGroupInput type="text" placeholder="username" />
          <InputAddon>@company.com</InputAddon>
        </InputGroup>
      </div>

      {/* Example 6: Weight input with unit selector */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Package Weight
        </label>
        <InputGroup>
          <InputGroupInput type="number" placeholder="0" />
          <InputAddon>
            <select>
              <option>lbs</option>
              <option>kg</option>
              <option>oz</option>
            </select>
          </InputAddon>
        </InputGroup>
      </div>

      {/* Example 7: Search with icon */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Search
        </label>
        <InputGroup>
          <InputAddon>
            <MagnifyingGlassIcon />
          </InputAddon>
          <InputGroupInput type="search" placeholder="Search contracts..." />
        </InputGroup>
      </div>

      {/* Example 8: Percentage input */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Discount
        </label>
        <InputGroup>
          <InputGroupInput type="number" placeholder="0" />
          <InputAddon>%</InputAddon>
        </InputGroup>
      </div>

      {/* Example 9: Phone number with country code */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Phone Number
        </label>
        <InputGroup>
          <InputAddon>
            <select>
              <option>+1</option>
              <option>+44</option>
              <option>+81</option>
            </select>
          </InputAddon>
          <InputGroupInput type="tel" placeholder="(555) 123-4567" />
        </InputGroup>
      </div>

      {/* Example 10: Disabled state */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Disabled Input
        </label>
        <InputGroup>
          <InputAddon>$</InputAddon>
          <InputGroupInput type="number" placeholder="0.00" disabled />
          <InputAddon>USD</InputAddon>
        </InputGroup>
      </div>
    </div>
  )
}
