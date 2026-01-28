// Tailwind Plus UI Blocks - Product Features
// Source: https://tailwindcss.com/plus/ui-blocks/ecommerce/components/product-features
// Format: React JSX (v4.1)
// Downloaded automatically

// =============================================================================
// 1. With header, images, and descriptions
// =============================================================================
export default function Example() {
  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6 sm:py-32 lg:max-w-7xl lg:px-8">
        {/* Details section */}
        <section aria-labelledby="details-heading">
          <div className="flex flex-col items-center text-center">
            <h2 id="details-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              The Fine Details
            </h2>
            <p className="mt-3 max-w-3xl text-lg text-gray-600">
              Our patented padded snack sleeve construction protects your favorite treats from getting smooshed during
              all-day adventures, long shifts at work, and tough travel schedules.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-8">
            <div>
              <img
                alt="Drawstring top with elastic loop closure and textured interior padding."
                src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-04-detail-product-shot-01.jpg"
                className="aspect-3/2 w-full rounded-lg object-cover"
              />
              <p className="mt-8 text-base text-gray-500">
                The 20L model has enough space for 370 candy bars, 6 cylinders of chips, 1220 standard gumballs, or any
                combination of on-the-go treats that your heart desires. Yes, we did the math.
              </p>
            </div>
            <div>
              <img
                alt="Front zipper pouch with included key ring."
                src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-04-detail-product-shot-02.jpg"
                className="aspect-3/2 w-full rounded-lg object-cover"
              />
              <p className="mt-8 text-base text-gray-500">
                Up your snack organization game with multiple compartment options. The quick-access stash pouch is ready
                for even the most unexpected snack attacks and sharing needs.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}


// =============================================================================
// 2. With fading image
// =============================================================================
const features = [
  { name: 'Origin', description: 'Designed by Good Goods, Inc.' },
  { name: 'Material', description: 'Solid walnut base with rare earth magnets and polycarbonate add-ons.' },
  { name: 'Dimensions', description: '15" x 3.75" x .75"' },
  { name: 'Finish', description: 'Hand sanded and finished with natural oil' },
  { name: 'Includes', description: 'Pen Tray, Phone Tray, Small Tray, Large Tray, Sticky Note Holder' },
  { name: 'Considerations', description: 'Made from natural materials. Grain and color vary with each item.' },
]

export default function Example() {
  return (
    <div className="bg-white">
      <div aria-hidden="true" className="relative">
        <img
          alt=""
          src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-02-full-width.jpg"
          className="h-96 w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-white" />
      </div>

      <div className="relative mx-auto -mt-12 max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Technical Specifications</h2>
          <p className="mt-4 text-gray-500">
            Organize is a system to keep your desk tidy and photo-worthy all day long. Procrastinate your work while you
            meticulously arrange items into dedicated trays.
          </p>
        </div>

        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-16 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
          {features.map((feature) => (
            <div key={feature.name} className="border-t border-gray-200 pt-4">
              <dt className="font-medium text-gray-900">{feature.name}</dt>
              <dd className="mt-2 text-sm text-gray-500">{feature.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}


// =============================================================================
// 3. With image grid
// =============================================================================
const features = [
  { name: 'Origin', description: 'Designed by Good Goods, Inc.' },
  { name: 'Material', description: 'Solid walnut base with rare earth magnets and powder coated steel card cover' },
  { name: 'Dimensions', description: '6.25" x 3.55" x 1.15"' },
  { name: 'Finish', description: 'Hand sanded and finished with natural oil' },
  { name: 'Includes', description: 'Wood card tray and 3 refill packs' },
  { name: 'Considerations', description: 'Made from natural materials. Grain and color vary with each item.' },
]

export default function Example() {
  return (
    <div className="bg-white">
      <div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-8 gap-y-16 px-4 py-24 sm:px-6 sm:py-32 lg:max-w-7xl lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Technical Specifications</h2>
          <p className="mt-4 text-gray-500">
            The walnut wood card tray is precision milled to perfectly fit a stack of Focus cards. The powder coated
            steel divider separates active cards from new ones, or can be used to archive important task lists.
          </p>

          <dl className="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-16 lg:gap-x-8">
            {features.map((feature) => (
              <div key={feature.name} className="border-t border-gray-200 pt-4">
                <dt className="font-medium text-gray-900">{feature.name}</dt>
                <dd className="mt-2 text-sm text-gray-500">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="grid grid-cols-2 grid-rows-2 gap-4 sm:gap-6 lg:gap-8">
          <img
            alt="Walnut card tray with white powder coated steel divider and 3 punchout holes."
            src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-03-detail-01.jpg"
            className="rounded-lg bg-gray-100"
          />
          <img
            alt="Top down view of walnut card tray with embedded magnets and card groove."
            src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-03-detail-02.jpg"
            className="rounded-lg bg-gray-100"
          />
          <img
            alt="Side of walnut card tray with card groove and recessed card area."
            src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-03-detail-03.jpg"
            className="rounded-lg bg-gray-100"
          />
          <img
            alt="Walnut card tray filled with cards and card angled in dedicated groove."
            src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-03-detail-04.jpg"
            className="rounded-lg bg-gray-100"
          />
        </div>
      </div>
    </div>
  )
}


// =============================================================================
// 4. With wide images
// =============================================================================
const features = [
  {
    name: 'Adventure-ready',
    description:
      'The Drawstring Canister is water and tear resistant with durable canvas construction. This bag holds up to the demands of daily use while keeping your snacks secure.',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-04-detail-03.jpg',
    imageAlt: 'Printed photo of bag being tossed into the sky on top of grass.',
  },
  {
    name: 'Minimal and clean',
    description:
      "Everything you need, nothing you don't. This bag has the simple, contemporary design that enables you to tell everyone you know about how essentialism is the only rational way to live life.",
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-04-detail-01.jpg',
    imageAlt: 'Double stitched black canvas hook loop.',
  },
  {
    name: 'Organized',
    description:
      'Never lose your snacks again with our patent-pending snack stash pocket system. With dedicated pouches for each of your snacking needs, the Drawstring Canister unlocks new levels of efficiency and convenience.',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-04-detail-02.jpg',
    imageAlt: 'Black canvas body with chrome zipper and key ring.',
  },
]

export default function Example() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl py-24 sm:px-2 sm:py-32 lg:px-4">
        <div className="mx-auto max-w-2xl px-4 lg:max-w-none">
          <div className="max-w-3xl">
            <h2 className="font-semibold text-gray-500">Drawstring Canister</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Use it your way</p>
            <p className="mt-4 text-gray-500">
              The Drawstring Canister comes with multiple strap and handle options to adapt throughout your day.
              Shoulder sling it, backpack it, or handy carry it.
            </p>
          </div>

          <div className="mt-10 space-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8"
              >
                <div className="mt-6 lg:col-span-5 lg:mt-0 xl:col-span-4">
                  <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
                  <p className="mt-2 text-sm text-gray-500">{feature.description}</p>
                </div>
                <div className="flex-auto lg:col-span-7 xl:col-span-8">
                  <img
                    alt={feature.imageAlt}
                    src={feature.imageSrc}
                    className="aspect-5/2 w-full rounded-lg bg-gray-100 object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


// =============================================================================
// 5. With split image
// =============================================================================
const features = [
  {
    name: 'Durable',
    description: 'The leather cover and machined steel disc binding stand up to daily use for years to come.',
  },
  {
    name: 'Refillable',
    description: 'Buy it once and refill as often as you need. Subscribe and save on routine refills.',
  },
  {
    name: 'Thoughtfully designed',
    description:
      'The comfortable disc binding allows you to quickly rearrange pages or combine lined, graph, and blank refills.',
  },
  { name: 'Locally made', description: 'Responsibly and sustainably made real close to wherever you are, somehow.' },
]

export default function Example() {
  return (
    <div className="bg-white">
      <section aria-labelledby="features-heading" className="relative">
        <img
          alt="Black leather journal with silver steel disc binding resting on wooden shelf with machined steel pen."
          src="https://tailwindcss.com/plus-assets/img/ecommerce-images/confirmation-page-01-hero.jpg"
          className="aspect-3/2 w-full object-cover sm:aspect-5/2 lg:absolute lg:aspect-auto lg:h-full lg:w-1/2 lg:pr-4 xl:pr-16"
        />

        <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 sm:pb-32 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:pt-32">
          <div className="lg:col-start-2">
            <h2 id="features-heading" className="font-medium text-gray-500">
              Leatherbound Daily Journal
            </h2>
            <p className="mt-4 text-4xl font-bold tracking-tight text-gray-900">All in the Details</p>
            <p className="mt-4 text-gray-500">
              We've obsessed over every detail of this handcrafted journal to bring you the best materials for daily
              use.
            </p>

            <dl className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 text-sm sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.name}>
                  <dt className="font-medium text-gray-900">{feature.name}</dt>
                  <dd className="mt-2 text-gray-500">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </div>
  )
}


// =============================================================================
// 6. With tabs
// =============================================================================
import { Fragment } from 'react'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'

const tabs = [
  {
    name: 'Design',
    features: [
      {
        name: 'Adaptive and modular',
        description:
          'The Organize base set allows you to configure and evolve your setup as your items and habits change. The included trays and optional add-ons are easily rearranged to achieve that perfect setup.',
        imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-06-detail-01.jpg',
        imageAlt: 'Maple organizer base with slots, supporting white polycarbonate trays of various sizes.',
      },
    ],
  },
  {
    name: 'Material',
    features: [
      {
        name: 'Natural wood options',
        description:
          'Organize has options for rich walnut and bright maple base materials. Accent your desk with a contrasting material, or match similar woods for a calm and cohesive look. Every base is hand sanded and finished.',
        imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-06-detail-02.jpg',
        imageAlt:
          'Walnut organizer base with pen, sticky note, phone, and bin trays, next to modular drink coaster attachment.',
      },
    ],
  },
  {
    name: 'Considerations',
    features: [
      {
        name: 'Helpful around the home',
        description:
          "Our customers use Organize throughout the house to bring efficiency to many daily routines. Enjoy Organize in your workspace, kitchen, living room, entry way, garage, and more. We can't wait to see how you'll use it!",
        imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-06-detail-03.jpg',
        imageAlt: 'Walnut organizer base with white polycarbonate trays in the kitchen with various kitchen utensils.',
      },
    ],
  },
  {
    name: 'Included',
    features: [
      {
        name: "Everything you'll need",
        description:
          'The Organize base set includes the pen, phone, small, and large trays to help you group all your essential items. Expand your set with the drink coaster and headphone stand add-ons.',
        imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-06-detail-04.jpg',
        imageAlt: 'Walnut organizer system on black leather desk mat on top of white desk.',
      },
    ],
  },
]

export default function Example() {
  return (
    <div className="bg-white">
      <section aria-labelledby="features-heading" className="mx-auto max-w-7xl py-32 sm:px-2 lg:px-8">
        <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
          <div className="max-w-3xl">
            <h2 id="features-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Technical Specifications
            </h2>
            <p className="mt-4 text-gray-500">
              The Organize modular system offers endless options for arranging your favorite and most used items. Keep
              everything at reach and in its place, while dressing up your workspace.
            </p>
          </div>

          <TabGroup className="mt-4">
            <div className="-mx-4 flex overflow-x-auto sm:mx-0">
              <div className="flex-auto border-b border-gray-200 px-4 sm:px-0">
                <TabList className="-mb-px flex space-x-10">
                  {tabs.map((tab) => (
                    <Tab
                      key={tab.name}
                      className="border-b-2 border-transparent py-6 text-sm font-medium whitespace-nowrap text-gray-500 hover:border-gray-300 hover:text-gray-700 data-selected:border-indigo-500 data-selected:text-indigo-600"
                    >
                      {tab.name}
                    </Tab>
                  ))}
                </TabList>
              </div>
            </div>

            <TabPanels as={Fragment}>
              {tabs.map((tab) => (
                <TabPanel key={tab.name} className="space-y-16 pt-10 lg:pt-16">
                  {tab.features.map((feature) => (
                    <div key={feature.name} className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:gap-x-8">
                      <div className="mt-6 lg:col-span-5 lg:mt-0">
                        <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
                        <p className="mt-2 text-sm text-gray-500">{feature.description}</p>
                      </div>
                      <div className="lg:col-span-7">
                        <img
                          alt={feature.imageAlt}
                          src={feature.imageSrc}
                          className="aspect-2/1 w-full rounded-lg bg-gray-100 object-cover sm:aspect-5/2"
                        />
                      </div>
                    </div>
                  ))}
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>
        </div>
      </section>
    </div>
  )
}


// =============================================================================
// 7. With alternating sections
// =============================================================================
const features = [
  {
    name: 'Minimal and thoughtful',
    description:
      'Our laptop sleeve is compact and precisely fits 13" devices. The zipper allows you to access the interior with ease, and the front pouch provides a convenient place for your charger cable.',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-07-detail-01.jpg',
    imageAlt: 'White canvas laptop sleeve with gray felt interior, silver zipper, and tan leather zipper pull.',
  },
  {
    name: 'Refined details',
    description:
      'We design every detail with the best materials and finishes. This laptop sleeve features durable canvas with double-stitched construction, a felt interior, and a high quality zipper that hold up to daily use.',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-07-detail-02.jpg',
    imageAlt: 'Detail of zipper pull with tan leather and silver rivet.',
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6 sm:py-32 lg:max-w-7xl lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Protect your device</h2>
          <p className="mt-4 text-gray-500">
            As a digital creative, your laptop or tablet is at the center of your work. Keep your device safe with a
            fabric sleeve that matches in quality and looks.
          </p>
        </div>

        <div className="mt-16 space-y-16">
          {features.map((feature, featureIdx) => (
            <div
              key={feature.name}
              className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8"
            >
              <div
                className={classNames(
                  featureIdx % 2 === 0 ? 'lg:col-start-1' : 'lg:col-start-8 xl:col-start-9',
                  'mt-6 lg:col-span-5 lg:row-start-1 lg:mt-0 xl:col-span-4',
                )}
              >
                <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
                <p className="mt-2 text-sm text-gray-500">{feature.description}</p>
              </div>
              <div
                className={classNames(
                  featureIdx % 2 === 0 ? 'lg:col-start-6 xl:col-start-5' : 'lg:col-start-1',
                  'flex-auto lg:col-span-7 lg:row-start-1 xl:col-span-8',
                )}
              >
                <img
                  alt={feature.imageAlt}
                  src={feature.imageSrc}
                  className="aspect-5/2 w-full rounded-lg bg-gray-100 object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


// =============================================================================
// 8. With square images
// =============================================================================
const features = [
  {
    name: 'Three card types',
    description: 'Today, Next, and Someday cards allow you to defer your dreams into the future.',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-08-detail-01.jpg',
    imageAlt: 'Green cardstock box containing white, beige, and brown cards.',
  },
  {
    name: 'The perfect mix',
    description: 'Each refill pack contains plenty of cards to last you a month of procrastination.',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-08-detail-02.jpg',
    imageAlt: 'Green cardstock box open with 50 cards inside.',
  },
  {
    name: 'Dot grid backs',
    description: 'Flip a card over to doodle during meetings when you should be listening.',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-08-detail-03.jpg',
    imageAlt: 'Detail of white today card, beige next card, and brown someday card with dot grid.',
  },
  {
    name: 'Refill packs',
    description: 'Subscribe and save on routine refill packs to keep you productive all year long.',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-08-detail-04.jpg',
    imageAlt: 'Stack of three green cardstock boxes with 3 hole cutouts showing cards inside.',
  },
]

export default function Example() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6 sm:py-32 lg:max-w-7xl lg:px-8">
        <div className="max-w-3xl">
          <h2 id="features-heading" className="font-medium text-gray-500">
            Focus
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Simple productivity</p>
          <p className="mt-4 text-gray-500">
            Focus allows you to plan 10 daily tasks, while also thinking ahead about what's next. Forget distracting
            digital apps and embrace these small, sturdy pieces of paper.
          </p>
        </div>

        <div className="mt-11 grid grid-cols-1 items-start gap-x-6 gap-y-16 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
          {features.map((feature) => (
            <div key={feature.name} className="flex flex-col-reverse">
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">{feature.name}</h3>
                <p className="mt-2 text-sm text-gray-500">{feature.description}</p>
              </div>
              <img
                alt={feature.imageAlt}
                src={feature.imageSrc}
                className="aspect-square w-full rounded-lg bg-gray-100 object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


// =============================================================================
// 9. With tiered images
// =============================================================================
const features = [
  {
    name: 'Sleek design',
    description:
      'The machined kettle has a smooth black finish and contemporary shape that stands apart from most plastic appliances.',
  },
  { name: 'Comfort handle', description: 'Shaped for steady pours and insulated to prevent burns.' },
  {
    name: 'One-button control',
    description:
      'The one button control has a digital readout for setting temperature and turning the kettle on and off.',
  },
  { name: 'Long spout', description: "Designed specifically for controlled pour-overs that don't slash or sputter." },
]

export default function Example() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6 sm:py-32 lg:max-w-7xl lg:px-8">
        <div className="grid grid-cols-1 items-center gap-x-8 gap-y-16 lg:grid-cols-2">
          <div>
            <div className="border-b border-gray-200 pb-10">
              <h2 className="font-medium text-gray-500">Machined Kettle</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Elegant simplicity</p>
            </div>

            <dl className="mt-10 space-y-10">
              {features.map((feature) => (
                <div key={feature.name}>
                  <dt className="text-sm font-medium text-gray-900">{feature.name}</dt>
                  <dd className="mt-3 text-sm text-gray-500">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <img
              alt="Black kettle with long pour spot and angled body on marble counter next to coffee mug and pour-over system."
              src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-09-main-detail.jpg"
              className="aspect-square w-full rounded-lg bg-gray-100 object-cover"
            />
            <div className="mt-4 grid grid-cols-2 gap-4 sm:mt-6 sm:gap-6 lg:mt-8 lg:gap-8">
              <img
                alt="Detail of temperature setting button on kettle bass with digital degree readout."
                src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-09-detail-01.jpg"
                className="aspect-square w-full rounded-lg bg-gray-100 object-cover"
              />
              <img
                alt="Kettle spout pouring boiling water into coffee grounds in pour-over mug."
                src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-09-detail-02.jpg"
                className="aspect-square w-full rounded-lg bg-gray-100 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


