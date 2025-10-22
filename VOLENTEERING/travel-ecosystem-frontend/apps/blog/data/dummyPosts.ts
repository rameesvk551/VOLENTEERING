// Dummy blog post data for development
// You can import this in components or hooks for UI testing

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  tags: string[];
  categories: string[];
  publishDate: string;
}

export const dummyPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Exploring the Magic of Jaipur',
    slug: 'exploring-jaipur',
    summary: 'Discover the vibrant colors, palaces, and street food of Rajasthan’s Pink City.',
    content: `Jaipur, the capital of Rajasthan, is a city of royal heritage, bustling bazaars, and stunning architecture. From the Amber Fort to the Hawa Mahal, every corner tells a story. Don’t miss the local kachori and lassi!`,
  coverImage: '/240_F_196990370_mIPZ4fBBdYjcJV5nk09unnaegf9WKxVx.jpg',
    tags: ['India', 'Culture', 'Food'],
    categories: ['Destinations', 'City Guides'],
    publishDate: '2025-09-10',
  },
  {
    id: '2',
    title: 'Goa: Sun, Sand & Serenity',
    slug: 'goa-sun-sand-serenity',
    summary: 'A guide to Goa’s best beaches, hidden cafes, and vibrant nightlife.',
    content: `Goa offers a perfect blend of relaxation and adventure. Lounge on Palolem Beach, explore spice plantations, and dance the night away at beach shacks. Try the Goan fish curry for a true taste of the coast.`,
  coverImage: '/240_F_301845445_Aj4iICMuzOfFkKW0U43l4aFAo05HZxIZ.jpg',
    tags: ['Beach', 'Nightlife', 'Relaxation'],
    categories: ['Destinations', 'Beach Escapes'],
    publishDate: '2025-08-22',
  },
  {
    id: '3',
    title: 'Hiking the Hills of Kasol',
    slug: 'hiking-kasol',
    summary: 'Experience the tranquility of Himachal’s Parvati Valley with scenic hikes and riverside cafes.',
    content: `Kasol is a haven for trekkers and nature lovers. Walk along the Parvati River, visit the village of Tosh, and enjoy Israeli cuisine at local cafes. The pine forests and mountain views are unforgettable.`,
  coverImage: '/240_F_323363323_UEzAYM10g7kDKgBWO1qSUSmiBjjjvBsF.jpg',
    tags: ['Adventure', 'Nature', 'Hiking'],
    categories: ['Destinations', 'Mountain Retreats'],
    publishDate: '2025-07-15',
  },
  {
    id: '4',
    title: 'A Spiritual Journey in Hampi',
    slug: 'spiritual-journey-hampi',
    summary: 'Uncover the ancient ruins and mystical landscapes of Hampi, Karnataka.',
    content: `Hampi’s UNESCO World Heritage ruins are a testament to India’s rich history. Cycle through boulder-strewn landscapes, visit the Virupaksha Temple, and watch the sunset from Hemakuta Hill.`,
  coverImage: '/download (1).jpeg',
    tags: ['History', 'Spirituality', 'Ruins'],
    categories: ['Destinations', 'Cultural Heritage'],
    publishDate: '2025-06-05',
  },
  {
    id: '5',
    title: 'Ladakh: Land of High Passes',
    slug: 'ladakh-high-passes',
    summary: 'Journey through Ladakh’s dramatic landscapes, monasteries, and lakes.',
    content: `Ladakh is an adventurer’s paradise. Drive along the world’s highest motorable roads, visit Pangong Lake, and meditate in ancient monasteries. The stark beauty and vibrant culture will leave you spellbound.`,
  coverImage: '/download (2).jpeg',
    tags: ['Adventure', 'Mountains', 'Culture'],
    categories: ['Destinations', 'Adventure'],
    publishDate: '2025-05-18',
  },
  {
    id: '1',
    title: 'Exploring the Magic of Jaipur',
    slug: 'exploring-jaipur',
    summary: 'Discover the vibrant colors, palaces, and street food of Rajasthan’s Pink City.',
    content: `Jaipur, the capital of Rajasthan, is a city of royal heritage, bustling bazaars, and stunning architecture. From the Amber Fort to the Hawa Mahal, every corner tells a story. Don’t miss the local kachori and lassi!`,
  coverImage: '/240_F_196990370_mIPZ4fBBdYjcJV5nk09unnaegf9WKxVx.jpg',
    tags: ['India', 'Culture', 'Food'],
    categories: ['Destinations', 'City Guides'],
    publishDate: '2025-09-10',
  },
  {
    id: '2',
    title: 'Goa: Sun, Sand & Serenity',
    slug: 'goa-sun-sand-serenity',
    summary: 'A guide to Goa’s best beaches, hidden cafes, and vibrant nightlife.',
    content: `Goa offers a perfect blend of relaxation and adventure. Lounge on Palolem Beach, explore spice plantations, and dance the night away at beach shacks. Try the Goan fish curry for a true taste of the coast.`,
  coverImage: '/240_F_301845445_Aj4iICMuzOfFkKW0U43l4aFAo05HZxIZ.jpg',
    tags: ['Beach', 'Nightlife', 'Relaxation'],
    categories: ['Destinations', 'Beach Escapes'],
    publishDate: '2025-08-22',
  },
  {
    id: '3',
    title: 'Hiking the Hills of Kasol',
    slug: 'hiking-kasol',
    summary: 'Experience the tranquility of Himachal’s Parvati Valley with scenic hikes and riverside cafes.',
    content: `Kasol is a haven for trekkers and nature lovers. Walk along the Parvati River, visit the village of Tosh, and enjoy Israeli cuisine at local cafes. The pine forests and mountain views are unforgettable.`,
  coverImage: '/240_F_323363323_UEzAYM10g7kDKgBWO1qSUSmiBjjjvBsF.jpg',
    tags: ['Adventure', 'Nature', 'Hiking'],
    categories: ['Destinations', 'Mountain Retreats'],
    publishDate: '2025-07-15',
  },
  {
    id: '4',
    title: 'A Spiritual Journey in Hampi',
    slug: 'spiritual-journey-hampi',
    summary: 'Uncover the ancient ruins and mystical landscapes of Hampi, Karnataka.',
    content: `Hampi’s UNESCO World Heritage ruins are a testament to India’s rich history. Cycle through boulder-strewn landscapes, visit the Virupaksha Temple, and watch the sunset from Hemakuta Hill.`,
  coverImage: '/download (1).jpeg',
    tags: ['History', 'Spirituality', 'Ruins'],
    categories: ['Destinations', 'Cultural Heritage'],
    publishDate: '2025-06-05',
  },
  {
    id: '5',
    title: 'Ladakh: Land of High Passes',
    slug: 'ladakh-high-passes',
    summary: 'Journey through Ladakh’s dramatic landscapes, monasteries, and lakes.',
    content: `Ladakh is an adventurer’s paradise. Drive along the world’s highest motorable roads, visit Pangong Lake, and meditate in ancient monasteries. The stark beauty and vibrant culture will leave you spellbound.`,
  coverImage: '/download (2).jpeg',
    tags: ['Adventure', 'Mountains', 'Culture'],
    categories: ['Destinations', 'Adventure'],
    publishDate: '2025-05-18',
  },
];
