/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Mock data for static features (sermons, events).
 * Contribution types are now fetched from the backend.
 */

import { Sermon, ChurchEvent, ContributionType } from '../types';

export const INITIAL_SERMONS: Sermon[] = [
  {
    id: 'sermon-1',
    title: 'Standing on the Solution Ground',
    preacher: 'Pastor Jonathan Wright',
    date: '2026-06-28',
    category: 'Faith & Deliverance',
    description: 'In this powerful foundational message, Pastor Jonathan Wright explains the vision of Solution Ground Ministry and how standing on God\'s promises provides answers to every human struggle.',
    duration: '42:15',
    thumbnailUrl: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'sermon-2',
    title: 'Youth on Fire: Answering the Call',
    preacher: 'Youth Pastor David K.',
    date: '2026-06-21',
    category: 'Youth Ministry',
    description: 'A stirring sermon aimed at energizing the younger generation to stay strong in faith, live with integrity, and be the light in a modern, complex world.',
    duration: '35:40',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'sermon-3',
    title: 'Walking in Divine Favor',
    preacher: 'Pastor Jonathan Wright',
    date: '2026-06-14',
    category: 'Spiritual Growth',
    description: 'Understand the principles of divine alignment. Learn how obedience and surrender open the windows of heaven to shower favor upon your life, career, and family.',
    duration: '48:10',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'sermon-4',
    title: 'The Blueprint of Prayer',
    preacher: 'Evangelist Sarah Cole',
    date: '2026-06-07',
    category: 'Prayer',
    description: 'Evangelist Sarah unpacks the Lord\'s prayer, demonstrating how Jesus provided a exact template for establishing fellowship, seeking provision, and obtaining deliverance.',
    duration: '39:25',
    thumbnailUrl: 'https://images.unsplash.com/photo-1445445290250-18a34739cd4c?auto=format&fit=crop&q=80&w=600',
  }
];

export const INITIAL_EVENTS: ChurchEvent[] = [
  {
    id: 'event-1',
    title: 'Youth Empowerment Summit 2026',
    description: 'A transformative 3-day summit for all youth. Gain insights on career building, spiritual growth, financial management, and leadership. Features outstanding panel speakers and worship sessions.',
    date: '2026-07-15',
    time: '09:00 AM - 04:00 PM',
    location: 'SGM Main Chapel & Youth Hall',
    category: 'Youth',
    capacity: 150,
    registeredUserIds: [],
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f30312245d5?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'event-2',
    title: 'Weekly Miracle & Deliverance Service',
    description: 'Join us for our weekly prophetic encounter. Come expecting a touch from heaven, dynamic worship, and life-changing prophetic declarations that shatter limitations.',
    date: '2026-07-08',
    time: '06:00 PM - 08:30 PM',
    location: 'SGM Sanctuary',
    category: 'Worship',
    capacity: 500,
    registeredUserIds: [],
    imageUrl: 'https://images.unsplash.com/photo-1445445290250-18a34739cd4c?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'event-3',
    title: 'SGM Community Outreach Feed the City',
    description: 'SGM is hitting the streets to feed the homeless and distribute essential supplies to families in need. Volunteer, contribute, or show up to serve our neighborhood with the love of Christ.',
    date: '2026-07-11',
    time: '10:00 AM - 02:00 PM',
    location: 'Community Center & SGM Outreach Van',
    category: 'Community',
    capacity: 100,
    registeredUserIds: [],
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'event-4',
    title: 'Youth Praise Party & Jam Session',
    description: 'A lively evening of music, games, drama, and contemporary Christian youth worship. All teenagers and young adults are welcome to join us for fun, faith, and refreshments!',
    date: '2026-07-24',
    time: '05:00 PM - 09:00 PM',
    location: 'Youth Annex Hall',
    category: 'Youth',
    capacity: 200,
    registeredUserIds: [],
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600'
  }
];

// Initial contribution types for fallback when backend is not available
export const INITIAL_CONTRIBUTION_TYPES: ContributionType[] = [
  {
    id: 1,
    user_id: 1,
    title: 'Youth Camp 2026 Support',
    description: 'Contribution towards registration, bus hire, and accommodation for the Annual youth camp.',
    target_amount: 5000,
    raised_amount: 350,
    created_by: 'youth_leader',
    status: 'active',
    deadline: '2026-07-20',
    created_at: '2026-07-01T00:00:00Z',
  },
  {
    id: 2,
    user_id: 1,
    title: 'Youth Instruments & Tech Fund',
    description: 'Funds targeted to acquire new digital drums and a bass amplifier for the SGM Youth Band.',
    target_amount: 2500,
    raised_amount: 50,
    created_by: 'youth_leader',
    status: 'active',
    deadline: '2026-08-15',
    created_at: '2026-07-02T00:00:00Z',
  },
  {
    id: 3,
    user_id: 1,
    title: 'Charity Food Drive Sponsorship',
    description: 'Supporting SGM Youth food drives to purchase grocery packs for marginalized families.',
    target_amount: 1500,
    raised_amount: 0,
    created_by: 'youth_leader',
    status: 'active',
    deadline: '2026-07-10',
    created_at: '2026-07-02T00:00:00Z',
  }
];