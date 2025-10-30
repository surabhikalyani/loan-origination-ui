import "@testing-library/jest-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { submitLoanApplication } from "../services/loanService";
import axios from "axios";

// Mock the api module
vi.mock("axios", () => ({
    default: { post: vi.fn() },
}));

// Mock environment variables
beforeEach(() => {
    vi.stubEnv("VITE_LOAN_API_BASE_URL", "/api/loan-applications");
    vi.stubEnv("VITE_LOAN_ENDPOINT", "apply");
    vi.clearAllMocks();
});

describe("submitLoanApplication", () => {
    it("sends api request with correct payload using env URL", async () => {
        const mockData = {
            decision: "APPROVED",
            creditLines: 3,
            offer: {
                totalLoanAmount: 25000,
                interestRate: 0.075,
                termMonths: 24,
                monthlyPayment: 1080.5
            }
        };
        axios.post.mockResolvedValueOnce({ data: mockData });

        const input = {
            name: "Jane",
            phone: "555-111-2222",
            ssn: "123-456-6789",
            requestedAmount: "25000",
            monthlyIncome: "5000",
            existingDebt: "2000",
            employmentStatus: "EMPLOYED",
            address: "123 Main",
        };

        const result = await submitLoanApplication(input);

        // Verify API was called with combined URL from env vars
        expect(axios.post).toHaveBeenCalledWith(
            expect.stringMatching(/\/api\/loan-applications\/apply$/),
            expect.objectContaining({
                name: "Jane",
                phone: "5551112222",
                ssn: "1234566789",
                requestedAmount: 25000,
                monthlyIncome: 5000,
                existingDebt: 2000,
                employmentStatus: "EMPLOYED",
                address: "123 Main",
            }),
            expect.objectContaining({
                headers: { "Content-Type": "application/json" },
            })
        );

        // Verify it returns the API response data
        expect(result).toEqual(mockData);
    });

    it("throws and logs friendly message for 400 Bad Request", async () => {
        // Arrange
        // Simulate Axios-style error object for a 400 response
        const axiosError = {
            response: { status: 400 },
        };
        axios.post.mockRejectedValueOnce(axiosError);

        // Spy on console.error to ensure it's logged
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        const input = {
            name: "Jane",
            phone: "5551112222",
            ssn: "1234567890",
            requestedAmount: "25000",
            monthlyIncome: "5000",
            existingDebt: "2000",
            employmentStatus: "EMPLOYED",
            address: "123 Main",
        };

        // Act + Assert: Expect the mapped message
        await expect(submitLoanApplication(input)).rejects.toThrow(
            "Your application contains invalid data. Please review and try again."
        );

        // Verify the service attempted the correct request
        expect(axios.post).toHaveBeenCalledWith(
            "http://localhost:8080/api/loan-applications/apply",
            expect.objectContaining({
                name: "Jane",
                phone: "5551112222",
                ssn: "1234567890",
                requestedAmount: 25000,
                monthlyIncome: 5000,
                existingDebt: 2000,
                employmentStatus: "EMPLOYED",
                address: "123 Main",
            }),
            expect.objectContaining({
                headers: { "Content-Type": "application/json" },
            })
        );

        // Verify error was logged
        expect(consoleSpy).toHaveBeenCalledWith("[API Error]", axiosError);

        consoleSpy.mockRestore();
    });
});
