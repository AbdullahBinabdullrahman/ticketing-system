/**
 * Test Data Factory
 * Generates realistic test data for various scenarios
 */

import type { CreateRequestInput } from "../../schemas/requests";
import type {
  CreatePartnerInput,
  CreateBranchInput,
} from "../../schemas/partners";

/**
 * GPS coordinates for various locations in Riyadh, Saudi Arabia
 */
export const TestLocations = {
  RIYADH_CENTER: { lat: 24.7136, lng: 46.6753, name: "Riyadh Center" },
  RIYADH_NORTH: { lat: 24.8, lng: 46.6753, name: "North Riyadh" },
  RIYADH_EAST: { lat: 24.7136, lng: 46.75, name: "East Riyadh" },
  RIYADH_SOUTH: { lat: 24.65, lng: 46.6753, name: "South Riyadh" },
  RIYADH_WEST: { lat: 24.7136, lng: 46.6, name: "West Riyadh" },
  AL_OLAYA: { lat: 24.6877, lng: 46.6857, name: "Al Olaya" },
  AL_MALAZ: { lat: 24.7265, lng: 46.7296, name: "Al Malaz" },
  DIPLOMATIC_QUARTER: {
    lat: 24.6912,
    lng: 46.6242,
    name: "Diplomatic Quarter",
  },
};

/**
 * Test customer names
 */
const customerNames = [
  "Ahmed Al-Saud",
  "Fatima Al-Otaibi",
  "Mohammed Al-Qahtani",
  "Noura Al-Harbi",
  "Abdullah Al-Ghamdi",
  "Sara Al-Mutairi",
  "Khalid Al-Zahrani",
  "Layla Al-Dosari",
  "Omar Al-Shehri",
  "Huda Al-Rasheed",
];

/**
 * Test customer phone numbers
 */
const customerPhones = [
  "+966501234567",
  "+966502345678",
  "+966503456789",
  "+966504567890",
  "+966505678901",
  "+966506789012",
  "+966507890123",
  "+966508901234",
  "+966509012345",
  "+966500123456",
];

/**
 * Generate a random customer
 */
export function generateCustomer(index: number = 0) {
  const nameIndex = index % customerNames.length;
  const phoneIndex = index % customerPhones.length;
  const locations = Object.values(TestLocations);
  const locationIndex = index % locations.length;
  const location = locations[locationIndex];

  return {
    name: customerNames[nameIndex],
    phone: customerPhones[phoneIndex],
    address: `Building ${100 + index}, Street ${50 + index}, ${
      location.name
    }, Riyadh`,
    lat: location.lat + (Math.random() - 0.5) * 0.01, // Small random offset
    lng: location.lng + (Math.random() - 0.5) * 0.01,
  };
}

/**
 * Generate a service request
 */
export function generateRequest(
  categoryId: number,
  pickupOptionId: number,
  customerIndex: number = 0,
  serviceId?: number
): CreateRequestInput {
  const customer = generateCustomer(customerIndex);

  return {
    categoryId,
    serviceId,
    pickupOptionId,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerAddress: customer.address,
    customerLat: customer.lat,
    customerLng: customer.lng,
  };
}

/**
 * Generate a partner
 */
export function generatePartner(
  name: string,
  categoryIds: number[],
  pickupOptionIds: number[]
): CreatePartnerInput {
  return {
    name,
    status: "active",
    contactEmail: `contact@${name.toLowerCase().replace(/\s+/g, "")}.com`,
    contactPhone: `+9665${Math.floor(Math.random() * 100000000)}`,
    categoryIds,
    pickupOptionIds,
  };
}

/**
 * Generate a branch
 */
export function generateBranch(
  partnerId: number,
  name: string,
  location: { lat: number; lng: number; name: string },
  radiusKm: number = 10
): CreateBranchInput {
  return {
    partnerId,
    name,
    lat: location.lat,
    lng: location.lng,
    contactName: `Manager - ${name}`,
    phone: `+9665${Math.floor(Math.random() * 100000000)}`,
    address: `${name}, ${location.name}, Riyadh, Saudi Arabia`,
    radiusKm,
  };
}

/**
 * Generate multiple requests with various parameters
 */
export function generateMultipleRequests(
  count: number,
  categoryIds: number[],
  pickupOptionIds: number[],
  serviceIds?: number[]
): CreateRequestInput[] {
  const requests: CreateRequestInput[] = [];

  for (let i = 0; i < count; i++) {
    const categoryId = categoryIds[i % categoryIds.length];
    const pickupOptionId = pickupOptionIds[i % pickupOptionIds.length];
    const serviceId = serviceIds
      ? serviceIds[i % serviceIds.length]
      : undefined;

    requests.push(generateRequest(categoryId, pickupOptionId, i, serviceId));
  }

  return requests;
}

/**
 * Generate test scenario data sets
 */
export const TestDataSets = {
  /**
   * Happy path scenario data
   */
  happyPath: {
    partner: {
      name: "Quick Fix Auto Services",
      status: "active" as const,
      contactEmail: "contact@quickfix.com",
      contactPhone: "+966501111111",
    },
    branches: [
      {
        name: "Main Branch",
        location: TestLocations.RIYADH_CENTER,
        radiusKm: 15,
      },
      {
        name: "North Branch",
        location: TestLocations.RIYADH_NORTH,
        radiusKm: 10,
      },
      {
        name: "East Branch",
        location: TestLocations.RIYADH_EAST,
        radiusKm: 10,
      },
    ],
  },

  /**
   * Multiple partners scenario
   */
  multiplePartners: [
    {
      name: "Express Auto Care",
      status: "active" as const,
      contactEmail: "info@expressauto.com",
      contactPhone: "+966502222222",
    },
    {
      name: "Pro Tire Services",
      status: "active" as const,
      contactEmail: "contact@protire.com",
      contactPhone: "+966503333333",
    },
    {
      name: "Fast Fix Mechanics",
      status: "active" as const,
      contactEmail: "support@fastfix.com",
      contactPhone: "+966504444444",
    },
  ],

  /**
   * Various pickup options
   */
  pickupScenarios: [
    {
      name: "Service at Location - Oil Change",
      pickupOptionName: "Service At Location",
      serviceName: "Oil Change",
      location: TestLocations.AL_OLAYA,
    },
    {
      name: "Drop-off at Center - Tire Replacement",
      pickupOptionName: "Drop-off In Center",
      serviceName: "Tire Replacement",
      location: TestLocations.AL_MALAZ,
    },
    {
      name: "Pickup and Return - Battery Service",
      pickupOptionName: "Pickup and Return",
      serviceName: "Battery Jump Start",
      location: TestLocations.DIPLOMATIC_QUARTER,
    },
  ],
};

/**
 * Generate test accounts credentials
 */
export const TestAccounts = {
  admin: {
    email: "admin@ticketing.com",
    password: "Admin123!",
    role: "admin" as const,
  },
  partner1: {
    email: "partner@quickfix.com",
    password: "Partner123!",
    role: "partner" as const,
  },
  partner2: {
    email: "partner@expressauto.com",
    password: "Partner123!",
    role: "partner" as const,
  },
  partner3: {
    email: "partner@protire.com",
    password: "Partner123!",
    role: "partner" as const,
  },
};

/**
 * Generate realistic notes
 */
export const TestNotes = {
  assignment: [
    "Assigned to nearest available branch",
    "Customer requested urgent service",
    "High priority - VIP customer",
    "Standard service request",
  ],
  confirmation: [
    "Confirmed - Technician will arrive within 30 minutes",
    "Service scheduled for tomorrow morning",
    "Emergency service dispatched immediately",
    "Confirmed - Customer to drop off vehicle at 2 PM",
  ],
  progress: [
    "Technician en route to customer location",
    "Vehicle inspection in progress",
    "Parts ordered - waiting for delivery",
    "Service in progress - estimated completion in 1 hour",
  ],
  completion: [
    "Service completed successfully",
    "All parts replaced - quality checked",
    "Customer satisfied with the service",
    "Vehicle ready for pickup",
  ],
  rejection: [
    "Branch fully booked - no available slots",
    "Service not available at this branch",
    "Customer location outside service area",
    "Required parts not in stock",
  ],
  closure: [
    "Verified with customer - service satisfactory",
    "Customer confirmed completion",
    "Payment processed - request closed",
    "All documentation completed",
  ],
};

/**
 * Delay helper for simulating time passage
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate timestamp for testing
 */
export function generateTimestamp(
  daysAgo: number = 0,
  hoursAgo: number = 0
): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
}

/**
 * Generate a request specifically for admin assignment testing
 * Uses realistic data that matches existing partner capabilities
 */
export function generateAdminAssignmentRequest(
  categoryId: number,
  pickupOptionId: number,
  serviceId?: number
): CreateRequestInput {
  // Use a location in Riyadh that's likely to have nearby partners
  const location = TestLocations.RIYADH_CENTER;
  const customer = generateCustomer(0);

  return {
    categoryId,
    serviceId,
    pickupOptionId,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerAddress: `${customer.address}`,
    customerLat: location.lat,
    customerLng: location.lng,
  };
}
