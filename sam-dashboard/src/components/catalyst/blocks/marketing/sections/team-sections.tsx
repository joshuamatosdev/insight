// Tailwind Plus UI Blocks - Team Sections
// Source: https://tailwindcss.com/plus/ui-blocks/marketing/sections/team-sections
// Format: React JSX (v4.1)
// Downloaded automatically

import { Grid, Flex, Box } from '@/components/catalyst/layout'

const teamMembers = [
  {
    name: 'Leslie Alexander',
    role: 'Co-Founder / CEO',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Michael Foster',
    role: 'Co-Founder / CTO',
    imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Dries Vincent',
    role: 'Business Relations',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Lindsay Walton',
    role: 'Front-end Developer',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Courtney Henry',
    role: 'Designer',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Tom Cook',
    role: 'Director of Product',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
]

// =============================================================================
// 1. With small images (Light)
// =============================================================================
export function TeamSectionWithSmallImagesLight() {
  return (
    <Box className="bg-white py-24 sm:py-32">
      <Grid gap="xl" className="mx-auto max-w-7xl px-6 lg:px-8 xl:grid-cols-3">
        <Box className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-4xl">Meet our leadership</h2>
          <p className="mt-6 text-lg/8 text-gray-600">We're a dynamic group of individuals who are passionate about what we do and dedicated to delivering the best results for our clients.</p>
        </Box>
        <ul role="list" className="grid gap-x-8 gap-y-12 sm:grid-cols-2 sm:gap-y-16 xl:col-span-2">
          {teamMembers.map((member) => (
            <li key={member.name}>
              <Flex align="center" gap="lg">
                <img src={member.imageUrl} alt="" className="size-16 rounded-full outline-1 -outline-offset-1 outline-black/5" />
                <Box>
                  <h3 className="text-base/7 font-semibold tracking-tight text-gray-900">{member.name}</h3>
                  <p className="text-sm/6 font-semibold text-indigo-600">{member.role}</p>
                </Box>
              </Flex>
            </li>
          ))}
        </ul>
      </Grid>
    </Box>
  )
}


// =============================================================================
// 2. With small images (Dark)
// =============================================================================
export function TeamSectionWithSmallImagesDark() {
  return (
    <Box className="bg-gray-900 py-24 sm:py-32">
      <Grid gap="xl" className="mx-auto max-w-7xl px-6 lg:px-8 xl:grid-cols-3">
        <Box className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight text-pretty text-white sm:text-4xl">Meet our leadership</h2>
          <p className="mt-6 text-lg/8 text-gray-400">We're a dynamic group of individuals who are passionate about what we do and dedicated to delivering the best results for our clients.</p>
        </Box>
        <ul role="list" className="grid gap-x-8 gap-y-12 sm:grid-cols-2 sm:gap-y-16 xl:col-span-2">
          {teamMembers.map((member) => (
            <li key={member.name}>
              <Flex align="center" gap="lg">
                <img src={member.imageUrl} alt="" className="size-16 rounded-full outline-1 -outline-offset-1 outline-white/10" />
                <Box>
                  <h3 className="text-base/7 font-semibold tracking-tight text-white">{member.name}</h3>
                  <p className="text-sm/6 font-semibold text-indigo-400">{member.role}</p>
                </Box>
              </Flex>
            </li>
          ))}
        </ul>
      </Grid>
    </Box>
  )
}

export default TeamSectionWithSmallImagesLight
