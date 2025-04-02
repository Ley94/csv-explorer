import { jest } from "@jest/globals";

const mockPrisma = {
  csvFile: {
    findFirst: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  csvEntry: {
    findMany: jest.fn(),
    createMany: jest.fn(),
    count: jest.fn(),
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(mockPrismaClient)),
  $disconnect: jest.fn(),
};

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

export { mockPrisma };
