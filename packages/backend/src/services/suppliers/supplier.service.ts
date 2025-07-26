import { AppError } from '../../middleware/error.middleware';

export interface Supplier {
  id: string;
  name: string;
  businessName: string;
  email?: string;
  mobile: string;
  businessType: string;
  trustScore: number;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  categories: string[];
  specialties: string[];
  rating: number;
  totalOrders: number;
  deliveryTime: string;
  priceRange: 'low' | 'medium' | 'high';
  isActive: boolean;
  isVerified: boolean;
  joinedDate: Date;
}

export interface SupplierRecommendation extends Supplier {
  distance: number;
  matchScore: number;
  recommendationReason: string[];
}

// In-memory storage for mock data
class MockSupplierDatabase {
  private suppliers: Supplier[] = [];

  constructor() {
    // Pre-populate with sample suppliers
    this.suppliers = [
      {
        id: 'supplier-1',
        name: 'Rajesh Kumar',
        businessName: 'Fresh Vegetables Co.',
        email: 'rajesh@freshveggies.com',
        mobile: '9876543211',
        businessType: 'Vegetable Supplier',
        trustScore: 92,
        location: {
          address: '123 Market Street, Andheri',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400058',
          coordinates: { lat: 19.1136, lng: 72.8697 }
        },
        categories: ['Vegetables', 'Fruits'],
        specialties: ['Organic Vegetables', 'Same Day Delivery', 'Bulk Orders'],
        rating: 4.8,
        totalOrders: 150,
        deliveryTime: '2-4 hours',
        priceRange: 'medium',
        isActive: true,
        isVerified: true,
        joinedDate: new Date('2019-03-15')
      },
      {
        id: 'supplier-2',
        name: 'Priya Sharma',
        businessName: 'Spice Masters',
        email: 'priya@spicemasters.com',
        mobile: '9876543212',
        businessType: 'Spice Supplier',
        trustScore: 89,
        location: {
          address: '456 Crawford Market',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          coordinates: { lat: 18.9467, lng: 72.8342 }
        },
        categories: ['Spices', 'Condiments'],
        specialties: ['Authentic Spices', 'Custom Blends', 'Wholesale Rates'],
        rating: 4.7,
        totalOrders: 200,
        deliveryTime: '1-3 hours',
        priceRange: 'low',
        isActive: true,
        isVerified: true,
        joinedDate: new Date('2018-07-22')
      },
      {
        id: 'supplier-3',
        name: 'Mohammed Ali',
        businessName: 'Grain Suppliers Ltd.',
        email: 'ali@grainsuppliers.com',
        mobile: '9876543213',
        businessType: 'Grain Supplier',
        trustScore: 85,
        location: {
          address: '789 Dadar Market',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400014',
          coordinates: { lat: 19.0176, lng: 72.8562 }
        },
        categories: ['Grains', 'Pulses'],
        specialties: ['Premium Grains', 'Wholesale Rates', 'Fast Delivery'],
        rating: 4.5,
        totalOrders: 95,
        deliveryTime: '4-6 hours',
        priceRange: 'medium',
        isActive: true,
        isVerified: true,
        joinedDate: new Date('2020-01-10')
      },
      {
        id: 'supplier-4',
        name: 'Sunita Patel',
        businessName: 'Dairy Fresh',
        email: 'sunita@dairyfresh.com',
        mobile: '9876543214',
        businessType: 'Dairy Supplier',
        trustScore: 78,
        location: {
          address: '321 Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400050',
          coordinates: { lat: 19.0596, lng: 72.8295 }
        },
        categories: ['Dairy', 'Beverages'],
        specialties: ['Fresh Dairy', 'Cold Chain', 'Daily Delivery'],
        rating: 4.3,
        totalOrders: 80,
        deliveryTime: '1-2 hours',
        priceRange: 'high',
        isActive: true,
        isVerified: true,
        joinedDate: new Date('2019-11-05')
      },
      {
        id: 'supplier-5',
        name: 'Amit Singh',
        businessName: 'Oil & More',
        email: 'amit@oilandmore.com',
        mobile: '9876543215',
        businessType: 'Oil Supplier',
        trustScore: 82,
        location: {
          address: '654 Malad East',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400097',
          coordinates: { lat: 19.1868, lng: 72.8549 }
        },
        categories: ['Oils', 'Condiments'],
        specialties: ['Cooking Oils', 'Bulk Supply', 'Quality Assured'],
        rating: 4.4,
        totalOrders: 120,
        deliveryTime: '3-5 hours',
        priceRange: 'medium',
        isActive: true,
        isVerified: true,
        joinedDate: new Date('2020-05-18')
      }
    ];
  }

  findAll(): Supplier[] {
    return this.suppliers.filter(supplier => supplier.isActive);
  }

  findById(id: string): Supplier | undefined {
    return this.suppliers.find(supplier => supplier.id === id && supplier.isActive);
  }

  findByCategory(category: string): Supplier[] {
    return this.suppliers.filter(supplier =>
      supplier.isActive &&
      supplier.categories.some(cat => cat.toLowerCase() === category.toLowerCase())
    );
  }

  findByLocation(city: string, state?: string): Supplier[] {
    return this.suppliers.filter(supplier =>
      supplier.isActive &&
      supplier.location.city.toLowerCase() === city.toLowerCase() &&
      (!state || supplier.location.state.toLowerCase() === state.toLowerCase())
    );
  }

  search(query: string): Supplier[] {
    const searchTerm = query.toLowerCase();
    return this.suppliers.filter(supplier =>
      supplier.isActive && (
        supplier.name.toLowerCase().includes(searchTerm) ||
        supplier.businessName.toLowerCase().includes(searchTerm) ||
        supplier.businessType.toLowerCase().includes(searchTerm) ||
        supplier.categories.some(cat => cat.toLowerCase().includes(searchTerm)) ||
        supplier.specialties.some(spec => spec.toLowerCase().includes(searchTerm))
      )
    );
  }
}

const mockSupplierDb = new MockSupplierDatabase();

export class SupplierService {
  async getAllSuppliers(): Promise<Supplier[]> {
    return mockSupplierDb.findAll();
  }

  async getSupplierById(id: string): Promise<Supplier | null> {
    const supplier = mockSupplierDb.findById(id);
    return supplier || null;
  }

  async getSuppliersByCategory(category: string): Promise<Supplier[]> {
    return mockSupplierDb.findByCategory(category);
  }

  async getSuppliersByLocation(city: string, state?: string): Promise<Supplier[]> {
    return mockSupplierDb.findByLocation(city, state);
  }

  async searchSuppliers(query: string): Promise<Supplier[]> {
    if (!query || query.trim().length < 2) {
      throw new AppError('Search query must be at least 2 characters', 400, 'VALIDATION_ERROR');
    }

    return mockSupplierDb.search(query.trim());
  }

  async getRecommendedSuppliers(
    vendorLocation: { city: string; state: string; coordinates: { lat: number; lng: number } },
    preferences?: {
      categories?: string[];
      maxDistance?: number;
      minTrustScore?: number;
      priceRange?: string[];
    }
  ): Promise<SupplierRecommendation[]> {
    const allSuppliers = mockSupplierDb.findAll();
    const recommendations: SupplierRecommendation[] = [];

    for (const supplier of allSuppliers) {
      // Calculate distance (simplified calculation)
      const distance = this.calculateDistance(
        vendorLocation.coordinates,
        supplier.location.coordinates
      );

      // Apply filters
      if (preferences?.maxDistance && distance > preferences.maxDistance) {
        continue;
      }

      if (preferences?.minTrustScore && supplier.trustScore < preferences.minTrustScore) {
        continue;
      }

      if (preferences?.priceRange && !preferences.priceRange.includes(supplier.priceRange)) {
        continue;
      }

      // Calculate match score
      let matchScore = 0;
      const recommendationReasons: string[] = [];

      // Trust score factor (40% weight)
      matchScore += (supplier.trustScore / 100) * 40;
      if (supplier.trustScore >= 90) {
        recommendationReasons.push('Excellent trust score');
      } else if (supplier.trustScore >= 80) {
        recommendationReasons.push('High trust score');
      }

      // Distance factor (30% weight)
      const distanceScore = Math.max(0, (10 - distance) / 10);
      matchScore += distanceScore * 30;
      if (distance <= 2) {
        recommendationReasons.push('Very close to your location');
      } else if (distance <= 5) {
        recommendationReasons.push('Nearby location');
      }

      // Rating factor (20% weight)
      matchScore += (supplier.rating / 5) * 20;
      if (supplier.rating >= 4.5) {
        recommendationReasons.push('Highly rated by other vendors');
      }

      // Experience factor (10% weight)
      const experienceScore = Math.min(supplier.totalOrders / 100, 1);
      matchScore += experienceScore * 10;
      if (supplier.totalOrders >= 100) {
        recommendationReasons.push('Experienced with many successful orders');
      }

      // Category preference bonus
      if (preferences?.categories) {
        const categoryMatch = supplier.categories.some(cat =>
          preferences.categories!.includes(cat)
        );
        if (categoryMatch) {
          matchScore += 5;
          recommendationReasons.push('Specializes in your required categories');
        }
      }

      // Same city bonus
      if (supplier.location.city.toLowerCase() === vendorLocation.city.toLowerCase()) {
        matchScore += 5;
        recommendationReasons.push('Located in your city');
      }

      // Verified supplier bonus
      if (supplier.isVerified) {
        matchScore += 3;
        recommendationReasons.push('Verified supplier');
      }

      recommendations.push({
        ...supplier,
        distance,
        matchScore,
        recommendationReason: recommendationReasons
      });
    }

    // Sort by match score (highest first) and return top recommendations
    return recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10); // Return top 10 recommendations
  }

  private calculateDistance(
    coord1: { lat: number; lng: number },
    coord2: { lat: number; lng: number }
  ): number {
    // Simplified distance calculation (Haversine formula approximation)
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLng = this.toRadians(coord2.lng - coord1.lng);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async getSupplierAnalytics(supplierId: string) {
    const supplier = mockSupplierDb.findById(supplierId);

    if (!supplier) {
      throw new AppError('Supplier not found', 404, 'SUPPLIER_NOT_FOUND');
    }

    // Mock analytics data
    return {
      totalOrders: supplier.totalOrders,
      averageRating: supplier.rating,
      trustScore: supplier.trustScore,
      completionRate: 95, // Mock completion rate
      responseTime: '2 hours', // Mock average response time
      categories: supplier.categories,
      specialties: supplier.specialties,
      joinedDate: supplier.joinedDate,
      isVerified: supplier.isVerified
    };
  }
}