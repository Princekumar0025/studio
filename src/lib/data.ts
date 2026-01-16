export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageId: string;
};

export const products: Product[] = [
  {
    id: 'foam-roller',
    name: 'High-Density Foam Roller',
    description: 'Perfect for muscle recovery, physical therapy, and deep tissue massage. Helps relieve muscle tension.',
    price: 24.99,
    imageId: 'foam-roller'
  },
  {
    id: 'resistance-bands',
    name: 'Resistance Band Set',
    description: 'Set of 5 loop bands for strength training, physical therapy, and home workouts. Comes in varying resistance levels.',
    price: 19.99,
    imageId: 'resistance-bands'
  },
  {
    id: 'kinesiology-tape',
    name: 'Kinesiology Tape',
    description: 'Water-resistant therapeutic tape for pain relief, muscle support, and faster recovery. 2-inch x 16-foot roll.',
    price: 12.50,
    imageId: 'kinesiology-tape'
  },
    {
    id: 'massage-ball',
    name: 'Lacrosse Massage Ball',
    description: 'Ideal for trigger point therapy, myofascial release, and relieving muscle knots. Durable and portable.',
    price: 7.99,
    imageId: 'massage-ball'
  },
  {
    id: 'stretch-strap',
    name: 'Yoga Stretch Strap',
    description: 'A non-elastic strap with multiple loops to aid in physical therapy, yoga, and improving flexibility.',
    price: 15.00,
    imageId: 'stretch-strap'
  },
  {
    id: 'cold-pack',
    name: 'Reusable Hot/Cold Pack',
    description: 'Flexible gel pack for providing pain relief from strains, sprains, and inflammation. Microwave and freezer safe.',
    price: 14.99,
    imageId: 'cold-pack'
  }
];

export const therapists = [
  {
    id: 'caleb-burgess',
    name: 'Dr. Caleb Burgess',
    title: 'DPT, OCS, CSCS',
    specializations: ['Orthopedic Clinical Specialist', 'Strength & Conditioning', 'Pain Science'],
    bio: 'Dr. Caleb Burgess is a Doctor of Physical Therapy and a board-certified Orthopedic Clinical Specialist. He is also a Certified Strength and Conditioning Specialist. He believes in an evidence-based approach, combining manual therapy with targeted exercises to help patients recover from pain and improve their performance.',
    imageId: 'caleb-burgess'
  },
  {
    id: 'jane-doe',
    name: 'Dr. Jane Doe',
    title: 'DPT, WCS',
    specializations: ['Women\'s Health', 'Pelvic Floor Therapy', 'Postpartum Recovery'],
    bio: 'Dr. Jane Doe is a Doctor of Physical Therapy specializing in women\'s health. She is passionate about helping women through all stages of life, from pregnancy to postpartum and beyond. She provides compassionate, one-on-one care to address pelvic pain, incontinence, and other related conditions.',
    imageId: 'jane-doe'
  }
];

export const conditions = [
  { slug: 'low-back-pain', name: 'Low Back Pain' },
  { slug: 'shoulder-impingement', name: 'Shoulder Impingement' },
  { slug: 'tennis-elbow', name: 'Tennis Elbow' },
  { slug: 'plantar-fasciitis', name: 'Plantar Fasciitis' },
  { slug: 'sciatica', name: 'Sciatica' },
  { slug: 'patellofemoral-pain', name: 'Patellofemoral Pain (Runner\'s Knee)' }
];
