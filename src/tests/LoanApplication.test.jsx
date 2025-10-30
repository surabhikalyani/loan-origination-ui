import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoanApplication from "../components/LoanApplication";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitLoanApplication } from "../services/loanService";

vi.mock("../services/loanService", () => ({
    submitLoanApplication: vi.fn()
}));

describe("LoanApplication", () => {
    const fillForm = () => {
        fireEvent.change(screen.getByPlaceholderText("Jane Doe"), { target: { value: "Jane Doe" } });
        fireEvent.change(screen.getByPlaceholderText("123 Main St"), { target: { value: "123 Main St" } });
        fireEvent.change(screen.getByPlaceholderText("jane@example.com"), { target: { value: "jane@example.com" } });
        fireEvent.change(screen.getByPlaceholderText("5551112222"), { target: { value: "5551112222" } });
        fireEvent.change(screen.getByPlaceholderText("1234567890"), { target: { value: "1234567890" } });
        fireEvent.change(screen.getByPlaceholderText("25000"), { target: { value: "25000" } });
        fireEvent.change(screen.getByDisplayValue("Select Status"), { target: { value: "EMPLOYED" } });
        fireEvent.change(screen.getByPlaceholderText("5000"), { target: { value: "5000" } });
        fireEvent.change(screen.getByPlaceholderText("2000"), { target: { value: "2000" } });
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders all form fields", () => {
        render(<LoanApplication />);
        expect(screen.getByText("Loan Application")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Jane Doe")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("5551112222")).toBeInTheDocument();
        expect(screen.getByText("Apply for Loan")).toBeInTheDocument();
    });

    it("shows error if required fields are missing", async () => {
        render(<LoanApplication />);
        fireEvent.click(screen.getByText("Apply for Loan"));
        expect(await screen.findByText(/Name is required./)).toBeInTheDocument();
        expect(await screen.findByText(/Address is required./)).toBeInTheDocument();
        expect(await screen.findByText(/Email is required./)).toBeInTheDocument();
        expect(await screen.findByText(/Phone is required./)).toBeInTheDocument();
        expect(await screen.findByText(/SSN is required./)).toBeInTheDocument();
        expect(await screen.findByText(/Requested amount is required./)).toBeInTheDocument();
        expect(await screen.findByText(/Please select employment status./)).toBeInTheDocument();
        expect(await screen.findByText(/Existing debt is required./)).toBeInTheDocument();
    });

    it("validates email format", async () => {
        render(<LoanApplication />);
        fireEvent.change(screen.getByPlaceholderText("jane@example.com"), { target: { value: "invalidemail" } });
        fireEvent.click(screen.getByText("Apply for Loan"));
        expect(await screen.findByText(/Please enter a valid email/)).toBeInTheDocument();
    });

    it("submits successfully and displays approval result", async () => {
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
        submitLoanApplication.mockResolvedValueOnce(mockData);

        render(<LoanApplication />);
        fillForm();

        fireEvent.click(screen.getByText("Apply for Loan"));

        await waitFor(() => expect(submitLoanApplication).toHaveBeenCalledTimes(1));

        expect(await screen.findByText("✅ Approved")).toBeInTheDocument();
        expect(screen.getByText(/Total Loan Amount/)).toBeInTheDocument();
        expect(screen.getByText("$25,000.00")).toBeInTheDocument();
    });

    it("displays error message if API fails", async () => {
        submitLoanApplication.mockRejectedValueOnce(new Error("Network error"));

        render(<LoanApplication />);
        fillForm();

        fireEvent.click(screen.getByText("Apply for Loan"));

        await waitFor(() =>
            expect(screen.getByText(/Could not submit application/)).toBeInTheDocument()
        );
    });

    it("resets the form on reset button click", () => {
        render(<LoanApplication />);
        fillForm();
        fireEvent.click(screen.getByText("Reset"));
        expect(screen.getByPlaceholderText("Jane Doe").value).toBe("");
    });
});
