import axios from "axios";
import { handleApiError } from "./errorHandler";

const BASE_URL = import.meta.env.VITE_API_BASE; // e.g. http://localhost:8080
const ENDPOINT = import.meta.env.VITE_LOAN_ENDPOINT; // e.g. api/loan-applications/apply
const url = `${BASE_URL.replace(/\/$/, "")}/${ENDPOINT.replace(/^\//, "")}`;

export async function submitLoanApplication(form) {
    const cleanPhone = form.phone.replace(/\D/g, "");
    const cleanSSN = form.ssn.replace(/\D/g, "");

    const payload = {
        ...form,
        requestedAmount: Number(form.requestedAmount),
        monthlyIncome: Number(form.monthlyIncome),
        existingDebt: Number(form.existingDebt),
        phone: cleanPhone,
        ssn: cleanSSN,
    };

    try {
        const { data } = await axios.post(url, payload, {
            headers: { "Content-Type": "application/json" },
        });
        return data;
    } catch (err) {
        throw handleApiError(err);
    }
}
