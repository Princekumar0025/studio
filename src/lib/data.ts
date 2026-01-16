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

export const treatmentGuides = [
  {
    id: 'neck-stretches',
    title: 'Gentle Neck Stretches for Pain Relief',
    description: 'A series of simple stretches to alleviate neck tension and improve flexibility.',
    imageId: 'neck-stretches-guide',
    steps: [
      {
        title: 'Neck Tilt',
        instructions: 'Gently tilt your head to one side, bringing your ear toward your shoulder. Hold for 20-30 seconds. Repeat on the other side. Do not force the stretch.'
      },
      {
        title: 'Neck Rotation',
        instructions: 'Slowly turn your head to look over one shoulder. Hold for 20-30 seconds. Return to center and repeat on the other side.'
      },
      {
        title: 'Forward Flexion (Chin Tuck)',
        instructions: 'Gently lower your chin to your chest, feeling a stretch along the back of your neck. Hold for 20-30 seconds.'
      }
    ]
  },
  {
    id: 'back-pain-exercises',
    title: 'Core Exercises for Lower Back Pain',
    description: 'Strengthen your core to support your spine and reduce lower back pain.',
    imageId: 'back-pain-guide',
    steps: [
      {
        title: 'Bird-Dog',
        instructions: 'Start on all fours. Extend one arm straight forward and the opposite leg straight back, keeping your core engaged and your back flat. Hold for 5 seconds, then switch sides. Repeat 10 times per side.'
      },
      {
        title: 'Glute Bridge',
        instructions: 'Lie on your back with your knees bent and feet flat on the floor. Lift your hips off the floor until your body forms a straight line from your shoulders to your knees. Squeeze your glutes. Hold for 5 seconds, then lower. Repeat 15 times.'
      },
      {
        title: 'Pelvic Tilt',
        instructions: 'Lie on your back with knees bent. Flatten your back against the floor by tightening your abdominal muscles and tilting your pelvis up slightly. Hold for 10 seconds. Repeat 10 times.'
      }
    ]
  },
  {
    id: 'knee-strengthening',
    title: 'Knee Strengthening Exercises',
    description: 'Improve stability and reduce pain with these knee-focused exercises.',
    imageId: 'knee-strengthening-guide',
    steps: [
      {
        title: 'Quad Sets',
        instructions: 'Sit on the floor with your injured leg straight. Place a small rolled towel under your knee. Tighten your thigh muscle (quadriceps) to press the back of your knee into the towel. Hold for 5 seconds. Repeat 10 times.'
      },
      {
        title: 'Straight Leg Raise',
        instructions: 'Lie on your back with one leg straight and the other bent. Tighten the thigh muscle of your straight leg and lift it to the height of your other knee. Hold for 3-5 seconds, then slowly lower. Repeat 15 times.'
      },
       {
        title: 'Wall Squat',
        instructions: 'Stand with your back against a wall, feet shoulder-width apart. Slowly slide down the wall until your knees are bent at a 45-degree angle. Hold for 10 seconds, then slide back up. Repeat 10 times.'
      }
    ]
  }
];
