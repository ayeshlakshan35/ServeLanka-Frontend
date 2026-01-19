export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  imageUrl: string;
  provider: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
  };
  reviewCount: number;
}

export const CATEGORIES = [
  "All",
  "Cleaning",
  "Plumbing",
  "Beauty",
  "Carpentry",
  "Painting",
  "Gardening",
  "Electrical",
];

export const SERVICES: Service[] = [
  {
    id: "1",
    title: "Complete Home Deep Cleaning",
    description:
      "Our professional team will meticulously clean every corner of your home, vacuuming and scrubbing.",
    category: "Cleaning",
    price: "LKR 3,500",
    imageUrl:
      "https://images.unsplash.com/photo-1758273238415-01ec03d9ef27?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8aG9tZSUyMGRlZXAlMjBjbGVhbmluZ3xlbnwwfHwwfHx8MA%3D%3D",
    provider: {
      id: "p4",
      name: "Sparkle Squad",
      avatar: "https://i.pravatar.cc/150?u=p4",
      rating: 4.5,
    },
    reviewCount: 210,
  },
  {
    id: "c2",
    title: "Kitchen & Appliance Cleaning",
    description:
      "Specialized degreasing and cleaning for ovens, chimneys, and kitchen surfaces.",
    category: "Cleaning",
    price: "LKR 2,000",
    imageUrl:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600",
    provider: {
      id: "p9",
      name: "Kitchen Care",
      avatar: "https://i.pravatar.cc/150?u=p9",
      rating: 4.7,
    },
    reviewCount: 45,
  },
  {
    id: "c3",
    title: "Sofa & Upholstery Shampooing",
    description:
      "Refresh your furniture with our deep shampooing service. Removes stains and odors.",
    category: "Cleaning",
    price: "LKR 4,500",
    imageUrl:
      "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?auto=format&fit=crop&q=80&w=600",
    provider: {
      id: "p10",
      name: "SoftWash Pros",
      avatar: "https://i.pravatar.cc/150?u=p10",
      rating: 4.8,
    },
    reviewCount: 132,
  },
  {
    id: "c4",
    title: "Bathroom Sanitization Service",
    description:
      "Complete disinfection and hard water stain removal for sparkling clean bathrooms.",
    category: "Cleaning",
    price: "LKR 1,500",
    imageUrl:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600",
    provider: {
      id: "p11",
      name: "Hygiene Hub",
      avatar: "https://i.pravatar.cc/150?u=p11",
      rating: 4.6,
    },
    reviewCount: 89,
  },
  {
    id: "2",
    title: "Emergency Plumbing Repair",
    description:
      "Fast and reliable plumbing repair for leaks, clogs, and pipe issues. 24/7 emergency service.",
    category: "Plumbing",
    price: "LKR 3,000",
    imageUrl:
      "https://media.istockphoto.com/id/1146120013/photo/young-man-fixing-a-leak-under-the-bathroom-sink.webp?a=1&b=1&s=612x612&w=0&k=20&c=Lgj_9IH5CTA45dQfwfoAv4qFrgyv6l6Y2ECUy2My8Mw=",
    provider: {
      id: "p2",
      name: "AquaFlow Plumbing",
      avatar: "https://i.pravatar.cc/150?u=p2",
      rating: 4.9,
    },
    reviewCount: 89,
  },
  {
    id: "3",
    title: "Garden Maintenance & Landscaping",
    description:
      "Comprehensive garden care, including mowing, pruning, and planting. Create your dream outdoor space.",
    category: "Gardening",
    price: "LKR 4,000",
    imageUrl:
      "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?auto=format&fit=crop&q=80&w=800",
    provider: {
      id: "p3",
      name: "Green Thumb Gardens",
      avatar: "https://i.pravatar.cc/150?u=p3",
      rating: 4.7,
    },
    reviewCount: 56,
  },
  {
    id: "5",
    title: "Custom Furniture Assembly",
    description:
      "Expert carpentry and assembly for all your furniture needs. Modern and traditional styles.",
    category: "Carpentry",
    price: "LKR 5,500",
    imageUrl:
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800",
    provider: {
      id: "p5",
      name: "Master Woodwork",
      avatar: "https://i.pravatar.cc/150?u=p5",
      rating: 4.6,
    },
    reviewCount: 45,
  },
  {
    id: "7",
    title: "Professional Makeup Artist",
    description:
      "Professional makeup for weddings, events, and photoshoots. High-end products used.",
    category: "Beauty",
    price: "LKR 8,000",
    imageUrl:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800",
    provider: {
      id: "p7",
      name: "Glam Studio",
      avatar: "https://i.pravatar.cc/150?u=p7",
      rating: 4.9,
    },
    reviewCount: 78,
  },
];
