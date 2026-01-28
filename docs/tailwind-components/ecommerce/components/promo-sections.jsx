// Tailwind Plus UI Blocks - Promo Sections
// Source: https://tailwindcss.com/plus/ui-blocks/ecommerce/components/promo-sections
// Format: React JSX (v4.1)
// Downloaded automatically

// =============================================================================
// 1. With fading background image and testimonials
// =============================================================================
const testimonials = [
  {
    id: 1,
    quote:
      'My order arrived super quickly. The product is even better than I hoped it would be. Very happy customer over here!',
    attribution: 'Sarah Peters, New Orleans',
  },
  {
    id: 2,
    quote:
      'I had to return a purchase that didn’t fit. The whole process was so simple that I ended up ordering two new items!',
    attribution: 'Kelly McPherson, Chicago',
  },
  {
    id: 3,
    quote:
      'Now that I’m on holiday for the summer, I’ll probably order a few more shirts. It’s just so convenient, and I know the quality will always be there.',
    attribution: 'Chris Paul, Phoenix',
  },
]

export default function Example() {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Decorative background image and gradient */}
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute inset-0 mx-auto max-w-7xl overflow-hidden xl:px-8">
          <img
            alt=""
            src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-02-sale-full-width.jpg"
            className="size-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-white/75" />
        <div className="absolute inset-0 bg-linear-to-t from-white via-white" />
      </div>

      {/* Callout */}
      <section
        aria-labelledby="sale-heading"
        className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pt-32 text-center sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <h2 id="sale-heading" className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Get 25% off during our one-time sale
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-xl text-gray-600">
            Most of our products are limited releases that won't come back. Get your favorite items while they're in
            stock.
          </p>
          <a
            href="#"
            className="mt-6 inline-block w-full rounded-md border border-transparent bg-gray-900 px-8 py-3 font-medium text-white hover:bg-gray-800 sm:w-auto"
          >
            Get access to our one-time sale
          </a>
        </div>
      </section>

      {/* Testimonials */}
      <section
        aria-labelledby="testimonial-heading"
        className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
      >
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <h2 id="testimonial-heading" className="text-2xl font-bold tracking-tight text-gray-900">
            What are people saying?
          </h2>

          <div className="mt-16 space-y-16 lg:grid lg:grid-cols-3 lg:space-y-0 lg:gap-x-8">
            {testimonials.map((testimonial) => (
              <blockquote key={testimonial.id} className="sm:flex lg:block">
                <svg width={24} height={18} viewBox="0 0 24 18" aria-hidden="true" className="shrink-0 text-gray-300">
                  <path
                    d="M0 18h8.7v-5.555c-.024-3.906 1.113-6.841 2.892-9.68L6.452 0C3.188 2.644-.026 7.86 0 12.469V18zm12.408 0h8.7v-5.555C21.083 8.539 22.22 5.604 24 2.765L18.859 0c-3.263 2.644-6.476 7.86-6.451 12.469V18z"
                    fill="currentColor"
                  />
                </svg>
                <div className="mt-8 sm:mt-0 sm:ml-6 lg:mt-10 lg:ml-0">
                  <p className="text-lg text-gray-600">{testimonial.quote}</p>
                  <cite className="mt-4 block font-semibold text-gray-900 not-italic">{testimonial.attribution}</cite>
                </div>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}


// =============================================================================
// 2. Full-width with background image
// =============================================================================
export default function Example() {
  return (
    <div className="relative bg-gray-800 px-6 py-32 sm:px-12 sm:py-40 lg:px-16">
      <div className="absolute inset-0 overflow-hidden">
        <img
          alt=""
          src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-feature-section-full-width.jpg"
          className="size-full object-cover"
        />
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-gray-900/50" />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Long-term thinking</h2>
        <p className="mt-3 text-xl text-white">
          We're committed to responsible, sustainable, and ethical manufacturing. Our small-scale approach allows us to
          focus on quality and reduce our impact. We're doing our best to delay the inevitable heat-death of the
          universe.
        </p>
        <a
          href="#"
          className="mt-8 block w-full rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-100 sm:w-auto"
        >
          Read our story
        </a>
      </div>
    </div>
  )
}


// =============================================================================
// 3. Full-width with overlapping image tiles
// =============================================================================
export default function Example() {
  return (
    <div className="bg-white">
      <div className="overflow-hidden pt-32 sm:pt-14">
        <div className="bg-gray-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative pt-48 pb-16 sm:pb-24">
              <div>
                <h2 id="sale-heading" className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                  Final Stock.
                  <br />
                  Up to 50% off.
                </h2>
                <div className="mt-6 text-base">
                  <a href="#" className="font-semibold text-white">
                    Shop the sale
                    <span aria-hidden="true"> &rarr;</span>
                  </a>
                </div>
              </div>

              <div className="absolute -top-32 left-1/2 min-w-max -translate-x-1/2 transform sm:top-6 sm:translate-x-0">
                <div className="ml-24 flex space-x-6 sm:ml-3 lg:space-x-8">
                  <div className="flex space-x-6 sm:flex-col sm:space-y-6 sm:space-x-0 lg:space-y-8">
                    <div className="shrink-0">
                      <img
                        alt=""
                        src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-category-01.jpg"
                        className="size-64 rounded-lg object-cover md:size-72"
                      />
                    </div>

                    <div className="mt-6 shrink-0 sm:mt-0">
                      <img
                        alt=""
                        src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-category-02.jpg"
                        className="size-64 rounded-lg object-cover md:size-72"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-6 sm:-mt-20 sm:flex-col sm:space-y-6 sm:space-x-0 lg:space-y-8">
                    <div className="shrink-0">
                      <img
                        alt=""
                        src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-favorite-01.jpg"
                        className="size-64 rounded-lg object-cover md:size-72"
                      />
                    </div>

                    <div className="mt-6 shrink-0 sm:mt-0">
                      <img
                        alt=""
                        src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-favorite-02.jpg"
                        className="size-64 rounded-lg object-cover md:size-72"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-6 sm:flex-col sm:space-y-6 sm:space-x-0 lg:space-y-8">
                    <div className="shrink-0">
                      <img
                        alt=""
                        src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-category-01.jpg"
                        className="size-64 rounded-lg object-cover md:size-72"
                      />
                    </div>

                    <div className="mt-6 shrink-0 sm:mt-0">
                      <img
                        alt=""
                        src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-category-02.jpg"
                        className="size-64 rounded-lg object-cover md:size-72"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


// =============================================================================
// 4. With background image
// =============================================================================
export default function Example() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="relative overflow-hidden rounded-lg">
          <div className="absolute inset-0">
            <img
              alt=""
              src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-01-feature-section-01.jpg"
              className="size-full object-cover"
            />
          </div>
          <div className="relative bg-gray-900/75 px-6 py-32 sm:px-12 sm:py-40 lg:px-16">
            <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                <span className="block sm:inline">Level up</span>
                <span className="block sm:inline">your desk</span>
              </h2>
              <p className="mt-3 text-xl text-white">
                Make your desk beautiful and organized. Post a picture to social media and watch it get more likes than
                life-changing announcements. Reflect on the shallow nature of existence. At least you have a really nice
                desk setup.
              </p>
              <a
                href="#"
                className="mt-8 block w-full rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-100 sm:w-auto"
              >
                Shop Workspace
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


// =============================================================================
// 5. With overlapping image tiles
// =============================================================================
const collections = [
  {
    name: "Women's",
    href: '#',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-04-collection-01.jpg',
    imageAlt: 'Woman wearing an off-white cotton t-shirt.',
  },
  {
    name: "Men's",
    href: '#',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-04-collection-02.jpg',
    imageAlt: 'Man wearing a charcoal gray cotton t-shirt.',
  },
  {
    name: 'Desk Accessories',
    href: '#',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-04-collection-03.jpg',
    imageAlt: 'Person sitting at a wooden desk with paper note organizer, pencil and tablet.',
  },
]

export default function Example() {
  return (
    <div className="relative bg-white">
      {/* Background image and overlap */}
      <div aria-hidden="true" className="absolute inset-0 hidden sm:flex sm:flex-col">
        <div className="relative w-full flex-1 bg-gray-800">
          <div className="absolute inset-0 overflow-hidden">
            <img
              alt=""
              src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-04-hero-full-width.jpg"
              className="size-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gray-900 opacity-50" />
        </div>
        <div className="h-32 w-full bg-white md:h-40 lg:h-48" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 pb-96 text-center sm:px-6 sm:pb-0 lg:px-8">
        {/* Background image and overlap */}
        <div aria-hidden="true" className="absolute inset-0 flex flex-col sm:hidden">
          <div className="relative w-full flex-1 bg-gray-800">
            <div className="absolute inset-0 overflow-hidden">
              <img
                alt=""
                src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-04-hero-full-width.jpg"
                className="size-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gray-900 opacity-50" />
          </div>
          <div className="h-48 w-full bg-white" />
        </div>
        <div className="relative py-32">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">Mid-Season Sale</h1>
          <div className="mt-4 sm:mt-6">
            <a
              href="#"
              className="inline-block rounded-md border border-transparent bg-indigo-600 px-8 py-3 font-medium text-white hover:bg-indigo-700"
            >
              Shop Collection
            </a>
          </div>
        </div>
      </div>

      <section aria-labelledby="collection-heading" className="relative -mt-96 sm:mt-0">
        <h2 id="collection-heading" className="sr-only">
          Collections
        </h2>
        <div className="mx-auto grid max-w-md grid-cols-1 gap-y-6 px-4 sm:max-w-7xl sm:grid-cols-3 sm:gap-x-6 sm:gap-y-0 sm:px-6 lg:gap-x-8 lg:px-8">
          {collections.map((collection) => (
            <div
              key={collection.name}
              className="group relative h-96 rounded-lg bg-white shadow-xl sm:aspect-4/5 sm:h-auto"
            >
              <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-lg">
                <div className="absolute inset-0 overflow-hidden group-hover:opacity-75">
                  <img alt={collection.imageAlt} src={collection.imageSrc} className="size-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-black opacity-50" />
              </div>
              <div className="absolute inset-0 flex items-end rounded-lg p-6">
                <div>
                  <p aria-hidden="true" className="text-sm text-white">
                    Shop the collection
                  </p>
                  <h3 className="mt-1 font-semibold text-white">
                    <a href={collection.href}>
                      <span className="absolute inset-0" />
                      {collection.name}
                    </a>
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}


// =============================================================================
// 6. With offers and split image
// =============================================================================
const offers = [
  { name: 'Download the app', description: 'Get an exclusive $5 off code', href: '#' },
  { name: "Return when you're ready", description: '60 days of free returns', href: '#' },
  { name: 'Sign up for our newsletter', description: '15% off your first order', href: '#' },
]

export default function Example() {
  return (
    <div className="bg-white">
      <div className="flex flex-col border-b border-gray-200 lg:border-0">
        <nav aria-label="Offers" className="order-last lg:order-first">
          <div className="mx-auto max-w-7xl lg:px-8">
            <ul
              role="list"
              className="grid grid-cols-1 divide-y divide-gray-200 lg:grid-cols-3 lg:divide-x lg:divide-y-0"
            >
              {offers.map((offer) => (
                <li key={offer.name} className="flex flex-col">
                  <a
                    href={offer.href}
                    className="relative flex flex-1 flex-col justify-center bg-white px-4 py-6 text-center focus:z-10"
                  >
                    <p className="text-sm text-gray-500">{offer.name}</p>
                    <p className="font-semibold text-gray-900">{offer.description}</p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="relative">
          <div aria-hidden="true" className="absolute hidden h-full w-1/2 bg-gray-100 lg:block" />
          <div className="relative bg-gray-100 lg:bg-transparent">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:grid lg:grid-cols-2 lg:px-8">
              <div className="mx-auto max-w-2xl py-24 lg:max-w-none lg:py-64">
                <div className="lg:pr-16">
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl xl:text-6xl">
                    Focus on what matters
                  </h1>
                  <p className="mt-4 text-xl text-gray-600">
                    All the charts, datepickers, and notifications in the world can't beat checking off some items on a
                    paper card.
                  </p>
                  <div className="mt-6">
                    <a
                      href="#"
                      className="inline-block rounded-md border border-transparent bg-indigo-600 px-8 py-3 font-medium text-white hover:bg-indigo-700"
                    >
                      Shop Productivity
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="h-48 w-full sm:h-64 lg:absolute lg:top-0 lg:right-0 lg:h-full lg:w-1/2">
            <img
              alt=""
              src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-02-hero-half-width.jpg"
              className="size-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  )
}


// =============================================================================
// 7. With image tiles
// =============================================================================
export default function Example() {
  return (
    <div className="relative overflow-hidden bg-white">
      <div className="pt-16 pb-80 sm:pt-24 sm:pb-40 lg:pt-40 lg:pb-48">
        <div className="relative mx-auto max-w-7xl px-4 sm:static sm:px-6 lg:px-8">
          <div className="sm:max-w-lg">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Summer styles are finally here
            </h1>
            <p className="mt-4 text-xl text-gray-500">
              This year, our new summer collection will shelter you from the harsh elements of a world that doesn't care
              if you live or die.
            </p>
          </div>
          <div>
            <div className="mt-10">
              {/* Decorative image grid */}
              <div
                aria-hidden="true"
                className="pointer-events-none lg:absolute lg:inset-y-0 lg:mx-auto lg:w-full lg:max-w-7xl"
              >
                <div className="absolute transform sm:top-0 sm:left-1/2 sm:translate-x-8 lg:top-1/2 lg:left-1/2 lg:translate-x-8 lg:-translate-y-1/2">
                  <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="grid shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8">
                      <div className="h-64 w-44 overflow-hidden rounded-lg sm:opacity-0 lg:opacity-100">
                        <img
                          alt=""
                          src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-hero-image-tile-01.jpg"
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="h-64 w-44 overflow-hidden rounded-lg">
                        <img
                          alt=""
                          src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-hero-image-tile-02.jpg"
                          className="size-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="grid shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8">
                      <div className="h-64 w-44 overflow-hidden rounded-lg">
                        <img
                          alt=""
                          src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-hero-image-tile-03.jpg"
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="h-64 w-44 overflow-hidden rounded-lg">
                        <img
                          alt=""
                          src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-hero-image-tile-04.jpg"
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="h-64 w-44 overflow-hidden rounded-lg">
                        <img
                          alt=""
                          src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-hero-image-tile-05.jpg"
                          className="size-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="grid shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8">
                      <div className="h-64 w-44 overflow-hidden rounded-lg">
                        <img
                          alt=""
                          src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-hero-image-tile-06.jpg"
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="h-64 w-44 overflow-hidden rounded-lg">
                        <img
                          alt=""
                          src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-hero-image-tile-07.jpg"
                          className="size-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <a
                href="#"
                className="inline-block rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-center font-medium text-white hover:bg-indigo-700"
              >
                Shop Collection
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


// =============================================================================
// 8. Full-width with background image and large content
// =============================================================================
export default function Example() {
  return (
    <div className="bg-white">
      <div className="relative bg-gray-900">
        {/* Decorative image and overlay */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <img
            alt=""
            src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-01-hero-full-width.jpg"
            className="size-full object-cover"
          />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-gray-900 opacity-50" />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-32 text-center sm:py-64 lg:px-0">
          <h1 className="text-4xl font-bold tracking-tight text-white lg:text-6xl">New arrivals are here</h1>
          <p className="mt-4 text-xl text-white">
            The new arrivals have, well, newly arrived. Check out the latest options from our summer small-batch release
            while they're still in stock.
          </p>
          <a
            href="#"
            className="mt-8 inline-block rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-100"
          >
            Shop New Arrivals
          </a>
        </div>
      </div>
    </div>
  )
}


