import { 
  ServiceItem, 
  Stylist, 
  Branch, 
  Booking, 
  PackageOffer, 
  CustomerNotification, 
  TimeSlot,
  CustomerRecord,
  Review,
  AuditLogItem,
  NotificationOutboxItem,
  SalonPolicyConfig,
  AdminUser
} from '../types';

// Helper function to generate human-readable globally unique booking reference: MK-XXXXXX
// Excludes ambiguous characters 0, O, 1, I (BR-C-016, DEC-024, AUD-03)
export function generateBookingReference(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let ref = 'MK-';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

export const BRANCHES: Branch[] = [
  {
    id: 'gulberg',
    name: 'Gulberg Branch (Flagship)',
    city: 'Lahore',
    address: '56, Main Boulevard, Gulberg III, Lahore',
    phone: '+92 42 3575 8899',
    hours: '10:00 AM – 09:00 PM (Mon-Sun)',
    rating: 4.9,
    isFlagship: true,
    timezone: 'Asia/Karachi',
    holidays: ['2025-06-17', '2025-08-14']
  },
  {
    id: 'dha-phase5',
    name: 'DHA Phase 5 Branch',
    city: 'Lahore',
    address: 'Sector C, Commercial Area, DHA Phase 5, Lahore',
    phone: '+92 42 3718 2244',
    hours: '10:30 AM – 09:00 PM (Mon-Sun)',
    rating: 4.8,
    timezone: 'Asia/Karachi'
  },
  {
    id: 'mall-of-lahore',
    name: 'Mall of Lahore Lounge',
    city: 'Lahore',
    address: '2nd Floor Luxury Wing, Mall of Lahore, Cantt',
    phone: '+92 42 3662 1100',
    hours: '11:00 AM – 10:00 PM (Mon-Sun)',
    rating: 4.9,
    timezone: 'Asia/Karachi'
  },
  {
    id: 'islamabad-f7',
    name: 'F-7 Markaz Studio',
    city: 'Islamabad',
    address: 'Block B, Jinnah Super Market, F-7, Islamabad',
    phone: '+92 51 265 9933',
    hours: '10:30 AM – 08:30 PM (Mon-Sun)',
    rating: 4.9,
    timezone: 'Asia/Karachi'
  },
  {
    id: 'karachi-clifton',
    name: 'Clifton Block 4 Parlor',
    city: 'Karachi',
    address: 'Plot 12-C, 7th Zamzama Commercial Lane, Clifton, Karachi',
    phone: '+92 21 3587 6622',
    hours: '10:00 AM – 09:30 PM (Mon-Sun)',
    rating: 4.8,
    timezone: 'Asia/Karachi'
  }
];

export const STYLISTS: Stylist[] = [
  {
    id: 'any',
    name: 'Any Available Expert',
    role: 'Top Available Professional',
    experience: '5+ Years Avg.',
    rating: 4.9,
    reviewsCount: 1420,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    specialty: ['All Treatments', 'Fast Service'],
    availableToday: true,
    bookable: true,
    createdAt: '2024-01-01T00:00:00Z',
    currentActiveWorkload: 1,
    workingHours: '10:00 AM - 09:00 PM',
    breaks: '02:00 PM - 02:30 PM',
    qualifiedServiceIds: ['bridal-makeup', 'hair-styling', 'hydra-facial', 'hair-coloring', 'manicure-pedicure', 'threading-waxing', 'party-glam-makeup']
  },
  {
    id: 'sana-malik',
    name: 'Sana Malik',
    role: 'Lead Bridal & Makeup Artist',
    experience: '9 Years Experience',
    rating: 4.98,
    reviewsCount: 680,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    specialty: ['Signature Bridal', 'Editorial Glow', 'Airbrush'],
    availableToday: true,
    bookable: true,
    createdAt: '2024-01-10T09:00:00Z',
    currentActiveWorkload: 3,
    workingHours: '10:00 AM - 07:00 PM',
    breaks: '01:30 PM - 02:00 PM',
    qualifiedServiceIds: ['bridal-makeup', 'party-glam-makeup', 'threading-waxing']
  },
  {
    id: 'zara-ahmed',
    name: 'Zara Ahmed',
    role: 'Senior Dermatological Aesthetician',
    experience: '7 Years Experience',
    rating: 4.95,
    reviewsCount: 512,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    specialty: ['Hydra Facial', 'Oxygen Peel', 'Collagen Lift'],
    availableToday: true,
    bookable: true,
    createdAt: '2024-02-15T10:00:00Z',
    currentActiveWorkload: 2,
    workingHours: '11:00 AM - 08:00 PM',
    breaks: '03:00 PM - 03:30 PM',
    qualifiedServiceIds: ['hydra-facial', 'whitening-facial-glow', 'derma-skincare-peel', 'aromatherapy-spa']
  },
  {
    id: 'alizeh-shah',
    name: 'Alizeh Shah',
    role: 'Master Hair Stylist & Colorist',
    experience: '8 Years Experience',
    rating: 4.92,
    reviewsCount: 430,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    specialty: ['Balayage', 'Keratin Smoothing', 'Precision Cut'],
    availableToday: true,
    bookable: true,
    createdAt: '2024-03-01T11:00:00Z',
    currentActiveWorkload: 2,
    workingHours: '10:30 AM - 08:30 PM',
    breaks: '02:00 PM - 02:30 PM',
    qualifiedServiceIds: ['hair-styling', 'hair-coloring', 'keratin-botox-hair']
  },
  {
    id: 'noor-fatima',
    name: 'Noor Fatima',
    role: 'Nail Spa & Lash Specialist',
    experience: '6 Years Experience',
    rating: 4.9,
    reviewsCount: 388,
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80',
    specialty: ['Gel Extensions', 'French Ombré', 'Russian Manicure'],
    availableToday: true,
    bookable: true,
    createdAt: '2024-04-10T12:00:00Z',
    currentActiveWorkload: 1,
    workingHours: '11:00 AM - 09:00 PM',
    breaks: '04:00 PM - 04:30 PM',
    qualifiedServiceIds: ['manicure-pedicure', 'gel-nail-extensions', 'threading-waxing']
  }
];

export const SERVICES: ServiceItem[] = [
  {
    id: 'bridal-makeup',
    slug: 'bridal-makeup',
    title: 'Bridal Makeup',
    category: 'Bridal',
    description: 'Look your best on your special day. Signature full HD bridal makeup with lashes, hair styling, dupatta setting & jewelry fixation.',
    duration: 90,
    price: 15000,
    rating: 4.99,
    reviewsCount: 342,
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=80',
    popular: true,
    featuredDiscount: 10,
    included: ['HD Airbrush Base', 'Signature Eye Contour', 'Lash Application', 'Dupatta & Jewelry Draping', 'Hairstyle & Fresh Roses'],
    active: true
  },
  {
    id: 'hair-styling',
    slug: 'hair-styling',
    title: 'Hair Styling & Blow Dry',
    category: 'Hair',
    description: 'Professional hair cut, volume blow dry, curls or sleek straightening with thermal protection and serum gloss finish.',
    duration: 60,
    price: 2500,
    rating: 4.88,
    reviewsCount: 215,
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    popular: false,
    included: ['Clarifying Shampoo Wash', 'Conditioning Mask', 'Volume Blow Dry', 'Texturizing & Shine Mist'],
    active: true
  },
  {
    id: 'hydra-facial',
    slug: 'hydra-facial',
    title: 'Hydra Facial Treatment',
    category: 'Facial',
    description: 'Deep cleansing & intense hydration for glowing skin. Multi-step vortex extraction, peptide infusion, and LED phototherapy.',
    duration: 45,
    price: 3000,
    rating: 4.96,
    reviewsCount: 489,
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80',
    popular: true,
    featuredDiscount: 20,
    included: ['Vortex Deep Cleansing', 'Gentle Salicylic Peel', 'Painless Extraction', 'Hyaluronic Acid Infusion', 'LED Light Therapy'],
    active: true
  },
  {
    id: 'hair-coloring',
    slug: 'hair-coloring',
    title: 'Hair Coloring & Balayage',
    category: 'Hair',
    description: 'Professional hair color with premium imported pigments, balayage highlights, gloss toner, and bond-building Olaplex protection.',
    duration: 60,
    price: 4500,
    rating: 4.91,
    reviewsCount: 178,
    imageUrl: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=600&auto=format&fit=crop&q=80',
    popular: true,
    included: ['Color Consultation', 'L’Oréal / Wella Formulation', 'Bond Repair Treatment', 'Gloss Toner & Finish'],
    active: true
  },
  {
    id: 'manicure-pedicure',
    slug: 'manicure-pedicure',
    title: 'Deluxe Manicure & Pedicure',
    category: 'Nail Art',
    description: 'Perfect care for your hands & feet. Rose petal soak, sugar exfoliation, cuticles grooming, relaxing massage and gel polish.',
    duration: 60,
    price: 2500,
    rating: 4.87,
    reviewsCount: 310,
    imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&auto=format&fit=crop&q=80',
    popular: false,
    included: ['Aromatic Soak', 'Organic Dead Sea Salt Scrub', 'Cuticle Refinement', 'Paraffin Wax Treatment', 'Gel Color Coat'],
    active: true
  },
  {
    id: 'threading-waxing',
    slug: 'threading-waxing',
    title: 'Face Threading & Brow Shaping',
    category: 'Threading',
    description: 'Perfect shape for your brows, upper lip, and chin. Gentle precision threading with organic thread and soothing aloe vera cooling gel.',
    duration: 30,
    price: 500,
    rating: 4.94,
    reviewsCount: 520,
    imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&auto=format&fit=crop&q=80',
    popular: false,
    included: ['Eyebrows Arch Alignment', 'Upper Lip & Forehead', 'Soothing Rose Water Mist', 'Aloe Vera Calming Gel'],
    active: true
  },
  {
    id: 'party-glam-makeup',
    slug: 'party-glam-makeup',
    title: 'Signature Party Glam Makeup',
    category: 'Makeup',
    description: 'Radiant, long-lasting evening glam tailored to your outfit. Includes soft smokey or cut-crease eyes, contour, and silk 3D lashes.',
    duration: 60,
    price: 8000,
    rating: 4.93,
    reviewsCount: 265,
    imageUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&auto=format&fit=crop&q=80',
    popular: true,
    included: ['Luminous Velvet Skin', 'Custom Eye Look', 'Faux Mink Lashes', 'Contour & Highlight Sculpting', 'Setting Spray Lock'],
    active: true
  },
  {
    id: 'whitening-facial-glow',
    slug: 'whitening-facial-glow',
    title: 'Instant Radiant Glow Facial',
    category: 'Facial',
    description: 'Brightening botanical facial infused with Vitamin C, arbutin extracts, and gold foil collagen mask for unmatched luminescence.',
    duration: 60,
    price: 4000,
    rating: 4.89,
    reviewsCount: 198,
    imageUrl: 'https://images.unsplash.com/photo-1512290900672-1f5076eb43df?w=600&auto=format&fit=crop&q=80',
    popular: false,
    included: ['Enzyme Exfoliation', 'Vitamin C Micro-Mist', '24K Gold Collagen Sheet', 'Jade Roller Lymphatic Massage'],
    active: true
  },
  {
    id: 'aromatherapy-spa',
    slug: 'aromatherapy-spa',
    title: 'Relaxing Full Body Aromatherapy',
    category: 'Body Spa',
    description: 'Deeply rejuvenating tension-relief massage using warm organic essential oils (Lavender & Rose) in a serene candlelit suite.',
    duration: 75,
    price: 6500,
    rating: 4.97,
    reviewsCount: 145,
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
    popular: false,
    included: ['Custom Scent Consultation', 'Warm Herbal Compress', 'Head & Scalp Stress Relief', 'Hot Towel Finish'],
    active: true
  },
  {
    id: 'gel-nail-extensions',
    slug: 'gel-nail-extensions',
    title: 'Acrylic / Gel Nail Extensions',
    category: 'Nail Art',
    description: 'Custom sculpted nail extensions with high-shine chrome, ombre, cat-eye, or intricate hand-painted nail artistry.',
    duration: 75,
    price: 4200,
    rating: 4.92,
    reviewsCount: 210,
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80',
    popular: true,
    included: ['Nail Prep & Cuticle Clean', 'Sculpted Gel Extensions', 'Free Nail Art on 2 Nails', 'UV Topcoat Shield'],
    active: true
  },
  {
    id: 'keratin-botox-hair',
    slug: 'keratin-botox-hair',
    title: 'Keratin Hair Botox & Gloss',
    category: 'Hair',
    description: 'Intense frizz control, split ends repair, and mirror-like glass shine for silky, smooth, manageable hair lasting 4-6 months.',
    duration: 120,
    price: 12000,
    rating: 4.95,
    reviewsCount: 167,
    imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&auto=format&fit=crop&q=80',
    popular: true,
    included: ['Formaldehyde-Free Formula', 'Deep Thermal Seal', 'Aftercare Consultation', 'Complimentary Keratin Shampoo Sample'],
    active: true
  },
  {
    id: 'derma-skincare-peel',
    slug: 'derma-skincare-peel',
    title: 'Dermaplaning & Glass Skin Glow',
    category: 'Skincare',
    description: 'Non-invasive exfoliation removing peach fuzz and dead skin cells, followed by cryogenic cooling and peptide hydration.',
    duration: 50,
    price: 3800,
    rating: 4.9,
    reviewsCount: 130,
    imageUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&auto=format&fit=crop&q=80',
    popular: false,
    included: ['Surgical Steel Dermaplaning', 'Hyaluronic Acid Quench', 'Cryo Ice Globe Massage', 'Broad Spectrum Sun Defense'],
    active: true
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bkg-001',
    reference: 'MK-7X9W2K',
    serviceId: 'bridal-makeup',
    serviceTitle: 'Bridal Makeup',
    serviceCategory: 'Bridal',
    servicePrice: 15000,
    tax: 750,
    totalAmount: 15750,
    duration: 90,
    date: '2025-06-12',
    time: '10:30 AM',
    branchId: 'gulberg',
    branchName: 'Mikyaj Gulberg Branch (Flagship)',
    branchAddress: '56, Main Boulevard, Gulberg, Lahore',
    stylistId: 'sana-malik',
    stylistName: 'Sana Malik (Lead Bridal Artist)',
    customerName: 'Hayat Khan',
    customerEmail: 'hayatkhan@gmail.com',
    customerPhone: '+92 300 1234567',
    specialRequests: "It's my wedding day ❤️ Please ensure soft smokey eyes with rose gold accents.",
    status: 'ACCEPTED',
    createdAt: '2025-06-01T14:30:00Z',
    updatedAt: '2025-06-01T14:35:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=80',
    rescheduleCount: 0,
    refundStatus: 'none',
    emailStatus: 'SENT',
    whatsAppStatus: 'SENT',
    statusHistory: [
      {
        id: 'sh-1',
        bookingId: 'bkg-001',
        fromStatus: 'DRAFT',
        toStatus: 'PENDING',
        actor: 'Customer: Hayat Khan',
        timestamp: '2025-06-01T14:30:00Z'
      },
      {
        id: 'sh-2',
        bookingId: 'bkg-001',
        fromStatus: 'PENDING',
        toStatus: 'ACCEPTED',
        actor: 'Admin: Sana Malik',
        reason: 'Confirmed bride availability & room slot allocated',
        timestamp: '2025-06-01T14:35:00Z'
      }
    ]
  },
  {
    id: 'bkg-002',
    reference: 'MK-4N8P3Z',
    serviceId: 'hydra-facial',
    serviceTitle: 'Hydra Facial Treatment',
    serviceCategory: 'Facial',
    servicePrice: 3000,
    tax: 150,
    totalAmount: 3150,
    duration: 45,
    date: '2025-05-20',
    time: '02:00 PM',
    branchId: 'gulberg',
    branchName: 'Mikyaj Gulberg Branch (Flagship)',
    branchAddress: '56, Main Boulevard, Gulberg, Lahore',
    stylistId: 'zara-ahmed',
    stylistName: 'Zara Ahmed (Skin Specialist)',
    customerName: 'Hayat Khan',
    customerEmail: 'hayatkhan@gmail.com',
    customerPhone: '+92 300 1234567',
    specialRequests: 'Extra focus on dry cheek area.',
    status: 'COMPLETED',
    createdAt: '2025-05-10T11:20:00Z',
    updatedAt: '2025-05-20T14:50:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80',
    rescheduleCount: 0,
    refundStatus: 'none',
    emailStatus: 'SENT',
    whatsAppStatus: 'SENT',
    review: {
      id: 'rev-1',
      bookingId: 'bkg-002',
      bookingRef: 'MK-4N8P3Z',
      customerName: 'Hayat Khan',
      serviceTitle: 'Hydra Facial Treatment',
      rating: 5,
      comment: 'Exceptional Hydra facial by Zara! My skin is glowing and completely hydrated.',
      createdAt: '2025-05-20T16:00:00Z',
      isModerated: true
    },
    statusHistory: [
      {
        id: 'sh-3',
        bookingId: 'bkg-002',
        fromStatus: 'PENDING',
        toStatus: 'ACCEPTED',
        actor: 'Admin: Front Desk',
        timestamp: '2025-05-10T11:25:00Z'
      },
      {
        id: 'sh-4',
        bookingId: 'bkg-002',
        fromStatus: 'ACCEPTED',
        toStatus: 'IN_PROGRESS',
        actor: 'Admin: Zara Ahmed',
        timestamp: '2025-05-20T14:02:00Z'
      },
      {
        id: 'sh-5',
        bookingId: 'bkg-002',
        fromStatus: 'IN_PROGRESS',
        toStatus: 'COMPLETED',
        actor: 'Admin: Zara Ahmed',
        timestamp: '2025-05-20T14:50:00Z'
      }
    ]
  },
  {
    id: 'bkg-003',
    reference: 'MK-9M2K6V',
    serviceId: 'hair-coloring',
    serviceTitle: 'Hair Coloring & Balayage',
    serviceCategory: 'Hair',
    servicePrice: 4500,
    tax: 225,
    totalAmount: 4725,
    duration: 60,
    date: '2025-06-13',
    time: '01:00 PM',
    branchId: 'gulberg',
    branchName: 'Mikyaj Gulberg Branch (Flagship)',
    branchAddress: '56, Main Boulevard, Gulberg, Lahore',
    stylistId: 'alizeh-shah',
    stylistName: 'Alizeh Shah',
    customerName: 'Ayesha Siddiqui',
    customerEmail: 'ayesha.s@outlook.com',
    customerPhone: '+92 321 4455667',
    specialRequests: 'Caramel blonde balayage with shadow root.',
    status: 'PENDING',
    createdAt: '2025-06-02T08:15:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=600&auto=format&fit=crop&q=80',
    rescheduleCount: 0,
    refundStatus: 'none',
    emailStatus: 'SENT',
    whatsAppStatus: 'PENDING',
    statusHistory: [
      {
        id: 'sh-6',
        bookingId: 'bkg-003',
        fromStatus: 'DRAFT',
        toStatus: 'PENDING',
        actor: 'Customer: Ayesha Siddiqui',
        timestamp: '2025-06-02T08:15:00Z'
      }
    ]
  },
  {
    id: 'bkg-004',
    reference: 'MK-3E7T9R',
    serviceId: 'gel-nail-extensions',
    serviceTitle: 'Acrylic / Gel Nail Extensions',
    serviceCategory: 'Nail Art',
    servicePrice: 4200,
    tax: 210,
    totalAmount: 4410,
    duration: 75,
    date: '2025-06-12',
    time: '03:30 PM',
    branchId: 'dha-phase5',
    branchName: 'Mikyaj DHA Phase 5 Branch',
    branchAddress: 'Sector C, DHA Phase 5, Lahore',
    stylistId: 'noor-fatima',
    stylistName: 'Noor Fatima',
    customerName: 'Mariam Tariq',
    customerEmail: 'mariam.tariq@gmail.com',
    customerPhone: '+92 333 8899001',
    status: 'ACCEPTED',
    createdAt: '2025-06-01T16:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80',
    rescheduleCount: 1,
    refundStatus: 'none',
    emailStatus: 'SENT',
    whatsAppStatus: 'DEAD_LETTER', // Testing dead-letter UI (§14.4, DEC-027)
    statusHistory: [
      {
        id: 'sh-7',
        bookingId: 'bkg-004',
        fromStatus: 'DRAFT',
        toStatus: 'PENDING',
        actor: 'Customer: Mariam Tariq',
        timestamp: '2025-06-01T16:00:00Z'
      },
      {
        id: 'sh-8',
        bookingId: 'bkg-004',
        fromStatus: 'PENDING',
        toStatus: 'ACCEPTED',
        actor: 'Admin: Front Desk',
        timestamp: '2025-06-01T16:10:00Z'
      }
    ]
  },
  {
    id: 'bkg-005',
    reference: 'MK-6W2Q8L',
    serviceId: 'party-glam-makeup',
    serviceTitle: 'Signature Party Glam Makeup',
    serviceCategory: 'Makeup',
    servicePrice: 8000,
    tax: 400,
    totalAmount: 8400,
    duration: 60,
    date: '2025-06-11',
    time: '05:00 PM',
    branchId: 'gulberg',
    branchName: 'Mikyaj Gulberg Branch (Flagship)',
    branchAddress: '56, Main Boulevard, Gulberg, Lahore',
    stylistId: 'sana-malik',
    stylistName: 'Sana Malik',
    customerName: 'Fatima Zahra',
    customerEmail: 'fatima.z@gmail.com',
    customerPhone: '+92 312 9988776',
    status: 'CANCELLED',
    cancellationReason: 'Emergency family travel abroad',
    createdAt: '2025-05-28T10:00:00Z',
    updatedAt: '2025-06-01T09:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&auto=format&fit=crop&q=80',
    rescheduleCount: 0,
    refundStatus: 'none',
    emailStatus: 'SENT',
    whatsAppStatus: 'SENT',
    statusHistory: [
      {
        id: 'sh-9',
        bookingId: 'bkg-005',
        fromStatus: 'ACCEPTED',
        toStatus: 'CANCELLED',
        actor: 'Customer: Fatima Zahra',
        reason: 'Customer cancelled > 24h prior (free policy)',
        timestamp: '2025-06-01T09:00:00Z'
      }
    ]
  }
];

export const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'cust-1',
    name: 'Hayat Khan',
    email: 'hayatkhan@gmail.com',
    phone: '+92 300 1234567',
    totalBookings: 3,
    totalSpendPKR: 21525,
    lastVisit: '2025-05-20',
    notes: ['VIP Bridal client', 'Prefers gentle pressure in facial', 'Prefers Sana Malik for makeup'],
    isGuest: false,
    createdAt: '2025-01-10T10:00:00Z'
  },
  {
    id: 'cust-2',
    name: 'Ayesha Siddiqui',
    email: 'ayesha.s@outlook.com',
    phone: '+92 321 4455667',
    totalBookings: 1,
    totalSpendPKR: 4725,
    lastVisit: '2025-06-13 (Scheduled)',
    notes: ['Interested in Olaplex hair treatments'],
    isGuest: false,
    createdAt: '2025-06-02T08:15:00Z'
  },
  {
    id: 'cust-3',
    name: 'Mariam Tariq',
    email: 'mariam.tariq@gmail.com',
    phone: '+92 333 8899001',
    totalBookings: 2,
    totalSpendPKR: 7035,
    lastVisit: '2025-04-12',
    notes: ['Nail art enthusiast', 'Frequent weekend visitor'],
    isGuest: false,
    createdAt: '2025-03-15T14:00:00Z'
  },
  {
    id: 'cust-4',
    name: 'Fatima Zahra',
    email: 'fatima.z@gmail.com',
    phone: '+92 312 9988776',
    totalBookings: 1,
    totalSpendPKR: 0,
    lastVisit: 'Cancelled',
    notes: [],
    isGuest: true,
    createdAt: '2025-05-28T10:00:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'aud-1',
    actorId: 'admin-owner',
    actorName: 'Hayat Rahman',
    actorRole: 'Owner',
    action: 'POLICY_OVERRIDE_CANCELLATION',
    entityType: 'Booking',
    entityId: 'MK-7X9W2K',
    reason: 'Approved late date modification due to weather emergency',
    beforeState: 'ACCEPTED (Date: 2025-06-10)',
    afterState: 'ACCEPTED (Date: 2025-06-12)',
    timestamp: '2025-06-01T15:00:00Z'
  },
  {
    id: 'aud-2',
    actorId: 'admin-1',
    actorName: 'Front Desk Admin',
    actorRole: 'Admin',
    action: 'STAFF_SCHEDULE_UPDATE',
    entityType: 'Staff',
    entityId: 'sana-malik',
    reason: 'Extended bridal preparation block on June 12',
    timestamp: '2025-06-01T12:30:00Z'
  },
  {
    id: 'aud-3',
    actorId: 'admin-owner',
    actorName: 'Hayat Rahman',
    actorRole: 'Owner',
    action: 'SETTINGS_UPDATE',
    entityType: 'Setting',
    entityId: 'cancellation_window',
    reason: 'Confirmed standard 24-hour self-service cancellation window',
    beforeState: '48h',
    afterState: '24h',
    timestamp: '2025-05-15T09:00:00Z'
  }
];

export const INITIAL_NOTIFICATION_OUTBOX: NotificationOutboxItem[] = [
  {
    id: 'outbox-1',
    bookingId: 'bkg-001',
    bookingRef: 'MK-7X9W2K',
    channel: 'email',
    event: 'booking_accepted',
    templateName: 'booking_accepted_email',
    recipient: 'hayatkhan@gmail.com',
    status: 'SENT',
    attemptCount: 1,
    maxAttempts: 5,
    createdAt: '2025-06-01T14:35:00Z',
    sentAt: '2025-06-01T14:35:10Z'
  },
  {
    id: 'outbox-2',
    bookingId: 'bkg-001',
    bookingRef: 'MK-7X9W2K',
    channel: 'whatsapp',
    event: 'booking_accepted',
    templateName: 'booking_accepted_wa',
    recipient: '+92 300 1234567',
    status: 'SENT',
    attemptCount: 1,
    maxAttempts: 5,
    createdAt: '2025-06-01T14:35:00Z',
    sentAt: '2025-06-01T14:35:15Z'
  },
  {
    id: 'outbox-3',
    bookingId: 'bkg-004',
    bookingRef: 'MK-3E7T9R',
    channel: 'whatsapp',
    event: 'booking_accepted',
    templateName: 'booking_accepted_wa',
    recipient: '+92 333 8899001',
    status: 'DEAD_LETTER', // Explicit test of dead-letter state (DEC-027, §14.4)
    attemptCount: 5,
    maxAttempts: 5,
    lastError: 'Meta Cloud API (Error 131026): Message undeliverable to unverified sandbox recipient',
    createdAt: '2025-06-01T16:10:00Z'
  },
  {
    id: 'outbox-4',
    bookingId: 'bkg-004',
    bookingRef: 'MK-3E7T9R',
    channel: 'email',
    event: 'booking_accepted',
    templateName: 'booking_accepted_email',
    recipient: 'mariam.tariq@gmail.com',
    status: 'SENT', // Email succeeded independently (ARCH-017 / DEC-011)
    attemptCount: 1,
    maxAttempts: 5,
    createdAt: '2025-06-01T16:10:00Z',
    sentAt: '2025-06-01T16:10:05Z'
  }
];

export const SALON_POLICIES: SalonPolicyConfig = {
  cancellationWindowHours: 24, // DEC-003, BR-C-007
  maxReschedules: 2, // DEC-004, BR-C-020
  slotIncrementMinutes: 30, // FR-ENG-05
  serviceBufferMinutes: 15,
  taxRatePercent: 5, // 5% GST
  currency: 'PKR', // DEC-023
  timezone: 'Asia/Karachi', // DEC-022
  emailNotificationsEnabled: true,
  whatsAppNotificationsEnabled: true,
  reminderTimingHoursBefore: 24
};


export const ADMIN_USERS: AdminUser[] = [
  {
    id: 'admin-owner',
    name: 'Hayat Rahman',
    email: 'hayat.rahman@mikyaj.com',
    role: 'ADMIN',
    isOwner: true, // Owner-flagged admin (§7, DEC-020)
    permissions: {
      viewFinancials: true,
      overridePolicies: true,
      manageStaff: true,
      manageServices: true,
      manageSettings: true,
      moderateReviews: true
    }
  },
  {
    id: 'admin-frontdesk',
    name: 'Front Desk Officer',
    email: 'frontdesk@mikyaj.com',
    role: 'ADMIN',
    isOwner: false, // Standard admin (financial totals hidden)
    permissions: {
      viewFinancials: false,
      overridePolicies: true, // With logged reason
      manageStaff: true,
      manageServices: true,
      manageSettings: false,
      moderateReviews: true
    }
  }
];

export const SPECIAL_PACKAGES: PackageOffer[] = [
  {
    id: 'pkg-royal-bridal',
    title: 'The Royal Maharani Bridal Suite',
    tagline: 'Complete 3-Day Wedding & Reception Luxury Pampering Package',
    originalPrice: 48000,
    discountedPrice: 38000,
    discountPercentage: 21,
    duration: '3 Days Experience',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    badge: 'MOST POPULAR BRIDAL',
    validTill: 'Limited slots for upcoming wedding season',
    servicesIncluded: [
      'Barat Signature HD Bridal Makeup & Hairstyling',
      'Walima Reception Glow Makeup & Draping',
      'Pre-Bridal Luxury Hydra Facial & Dermaplaning',
      'Full Body Moroccan Bath & Polisher',
      'Deluxe Gel Acrylic Manicure & Pedicure with Crystal Art',
      'Complimentary Mother/Sister Party Makeup'
    ]
  },
  {
    id: 'pkg-hydra-glow',
    title: 'Glass Skin Hydra-Revive Combo',
    tagline: 'Deep pore rejuvenation, oxygen infusion & gold mask treatment',
    originalPrice: 8500,
    discountedPrice: 5999,
    discountPercentage: 30,
    duration: '90 Minutes',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80',
    badge: '20% OFF THIS WEEK',
    validTill: 'Valid until Sunday midnight',
    servicesIncluded: [
      'Medical-grade 6-Step Hydra Facial',
      'Cryo Oxygen Infusion Therapy',
      '24K Gold Collagen Lift Mask',
      'Upper Body Neck & Shoulder Pressure Relief'
    ]
  },
  {
    id: 'pkg-weekend-pamper',
    title: 'Head-to-Toe Weekend Pamper Glow',
    tagline: 'Hair spa, deluxe mani-pedi, express facial & eyebrow styling',
    originalPrice: 9500,
    discountedPrice: 6800,
    discountPercentage: 28,
    duration: '120 Minutes',
    imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800&auto=format&fit=crop&q=80',
    badge: 'WEEKEND BESTSELLER',
    validTill: 'Available Every Friday - Sunday',
    servicesIncluded: [
      'Olaplex Hair Spa & Scalp Massage',
      'L’Oreal Nourishing Hair Mask Blow Dry',
      'Deluxe Rose Petal Spa Mani-Pedi',
      'Radiance Botanical Express Glow Mask',
      'Precision Brow & Lip Threading'
    ]
  }
];

export const TIME_SLOTS: TimeSlot[] = [
  // Morning
  { time: '09:00 AM', period: 'Morning', available: true, spotsLeft: 3 },
  { time: '09:30 AM', period: 'Morning', available: true, spotsLeft: 2 },
  { time: '10:00 AM', period: 'Morning', available: true, spotsLeft: 4 },
  { time: '10:30 AM', period: 'Morning', available: true, spotsLeft: 1 },
  { time: '11:00 AM', period: 'Morning', available: true, spotsLeft: 3 },
  { time: '11:30 AM', period: 'Morning', available: true, spotsLeft: 2 },
  { time: '12:00 PM', period: 'Morning', available: true, spotsLeft: 2 },
  { time: '12:30 PM', period: 'Morning', available: false, spotsLeft: 0 },
  // Afternoon
  { time: '01:00 PM', period: 'Afternoon', available: true, spotsLeft: 4 },
  { time: '01:30 PM', period: 'Afternoon', available: true, spotsLeft: 3 },
  { time: '02:00 PM', period: 'Afternoon', available: true, spotsLeft: 2 },
  { time: '02:30 PM', period: 'Afternoon', available: true, spotsLeft: 3 },
  { time: '03:00 PM', period: 'Afternoon', available: true, spotsLeft: 2 },
  { time: '03:30 PM', period: 'Afternoon', available: true, spotsLeft: 1 },
  { time: '04:00 PM', period: 'Afternoon', available: true, spotsLeft: 4 },
  { time: '04:30 PM', period: 'Afternoon', available: true, spotsLeft: 2 },
  // Evening
  { time: '05:00 PM', period: 'Evening', available: true, spotsLeft: 3 },
  { time: '05:30 PM', period: 'Evening', available: true, spotsLeft: 2 },
  { time: '06:00 PM', period: 'Evening', available: true, spotsLeft: 4 },
  { time: '06:30 PM', period: 'Evening', available: true, spotsLeft: 1 },
  { time: '07:00 PM', period: 'Evening', available: true, spotsLeft: 2 },
  { time: '07:30 PM', period: 'Evening', available: true, spotsLeft: 3 },
  { time: '08:00 PM', period: 'Evening', available: true, spotsLeft: 1 }
];

export const INITIAL_NOTIFICATIONS: CustomerNotification[] = [
  {
    id: 'n1',
    title: 'Upcoming Appointment Reminder',
    message: 'Your Bridal Makeup appointment is scheduled for Thursday, 12 June 2025 at 10:30 AM at Gulberg Branch.',
    timestamp: '10 mins ago',
    unread: true,
    type: 'reminder',
    channel: 'whatsapp',
    bookingRef: 'MK-7X9W2K'
  },
  {
    id: 'n2',
    title: '20% Off Hydra Facial Packages',
    message: 'Special seasonal discount applied to all advanced skincare treatments this week.',
    timestamp: '2 hours ago',
    unread: true,
    type: 'offer'
  },
  {
    id: 'n3',
    title: 'Booking Confirmed MK-7X9W2K',
    message: 'Lead Artist Sana Malik has been assigned to your bridal session.',
    timestamp: '1 day ago',
    unread: false,
    type: 'booking',
    channel: 'email',
    bookingRef: 'MK-7X9W2K'
  }
];

