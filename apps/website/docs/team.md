---
layout: page
---

<script setup>
import { VPTeamPage, VPTeamPageTitle, VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/AFCMS.png',
    name: 'AFCMS',
    title: 'Creator',
    links: [
      { icon: 'linkedin', link: 'https://linkedin.com/in/louis-walter' },
      { icon: 'github', link: 'https://github.com/AFCMS' },
      { icon: 'x', link: 'https://x.com/@AFCM_Dev' }
    ],
    sponsor: "https://github.com/sponsors/AFCMS"
  },
  /*{
    avatar: 'https://github.com/Klhmt.png',
    name: 'Klhmt',
    title: 'Maintainer',
    links: [
      { icon: 'linkedin', link: '' },
      { icon: 'github', link: 'https://github.com/Klhmt' },
      { icon: 'x', link: '' }
    ],
  },*/
]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      Meet the Team
    </template>
    <template #lead>
      The development of Oktomusic is in the hands of talented developpers
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members />
</VPTeamPage>
