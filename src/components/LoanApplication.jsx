import React, { useState } from "react";
import { submitLoanApplication } from "../services/loanService";

export default function LoanApplication() {
    const [form, setForm] = useState({
        name: "",
        address: "",
        email: "",
        phone: "",
        ssn: "",
        requestedAmount: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [errors, setErrors] = useState({});

    //Centralized validation

    const validateForm = () => {
        const newErrors = {};

        if (!form.name.trim()) newErrors.name = "Name is required.";
        if (!form.address.trim()) newErrors.address = "Address is required.";
        if (!form.email.trim())
            newErrors.email = "Email is required.";
        else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email))
            newErrors.email = "Please enter a valid email address (e.g., jane@example.com).";

        const cleanPhone = form.phone.replace(/\D/g, "");
        if (!cleanPhone) newErrors.phone = "Phone is required.";
        else if (!/^\d{10}$/.test(cleanPhone))
            newErrors.phone = "Phone must contain exactly 10 digits.";

        const cleanSSN = form.ssn.replace(/\D/g, "");
        if (!cleanSSN) newErrors.ssn = "SSN is required.";
        else if (!/^\d{9,10}$/.test(cleanSSN))
            newErrors.ssn = "SSN must contain 9–10 digits.";

        if (!form.requestedAmount) newErrors.requestedAmount = "Requested amount is required.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined })); // clear per-field error
    };

    const reset = () => {
        setForm({
            name: "",
            address: "",
            email: "",
            phone: "",
            ssn: "",
            requestedAmount: ""
        });
        setErrors({});
        setResult(null);
        setError(null);
    };

    const formatCurrency = (num) => {
        if (num == null || num === "") return "";
        return `$${Number(num).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setResult(null);

        if (!validateForm()) return;

        setLoading(true);
        try {
            const data = await submitLoanApplication(form);
            setResult(data);
        } catch (err) {
            console.error(err);
            setError("Could not submit application.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="card">
            <h2>Loan Application</h2>

            <form onSubmit={onSubmit} className="form-grid" noValidate>
                {/* Name */}
                <div className="full">
                    <label>Name</label>
                    <input
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        placeholder="Jane Doe"
                        aria-invalid={!!errors.name}
                    />
                    {errors.name && <p className="error" style={{ color: "red" }}>{errors.name}</p>}
                </div>

                {/* Address */}
                <div className="full">
                    <label>Address</label>
                    <input
                        name="address"
                        value={form.address}
                        onChange={onChange}
                        placeholder="123 Main St"
                        aria-invalid={!!errors.address}
                    />
                    {errors.address && <p className="error" style={{ color: "red" }}>{errors.address}</p>}
                </div>

                {/* Email */}
                <div>
                    <label>Email</label>
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                        placeholder="jane@example.com"
                        aria-invalid={!!errors.email}
                    />
                    {errors.email && <p className="error" style={{ color: "red" }}>{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                    <label>Phone</label>
                    <input
                        name="phone"
                        value={form.phone}
                        onChange={onChange}
                        placeholder="5551112222"
                        aria-invalid={!!errors.phone}
                    />
                    {errors.phone && <p className="error" style={{ color: "red" }}>{errors.phone}</p>}
                </div>

                {/* SSN */}
                <div>
                    <label>SSN</label>
                    <input
                        name="ssn"
                        value={form.ssn}
                        onChange={onChange}
                        placeholder="1234567890"
                        aria-invalid={!!errors.ssn}
                    />
                    {errors.ssn && <p className="error" style={{ color: "red" }}>{errors.ssn}</p>}
                </div>

                {/* Requested Loan Amount */}
                <div>
                    <label>Requested Loan Amount</label>
                    <input
                        name="requestedAmount"
                        type="number"
                        min="0"
                        value={form.requestedAmount}
                        onChange={onChange}
                        placeholder="25000"
                        aria-invalid={!!errors.requestedAmount}
                    />
                    {errors.requestedAmount && <p className="error" style={{ color: "red" }}>{errors.requestedAmount}</p>}
                </div>

                {/* Buttons */}
                <div className="full" style={{ display: "flex", gap: "8px" }}>
                    <button type="submit" disabled={loading} style={{ flex: 1 }}>
                        {loading ? "Processing..." : "Apply for Loan"}
                    </button>
                    <button type="button" onClick={reset} disabled={loading} style={{ flex: 1, background: "#6b7280" }}>
                        Reset
                    </button>
                </div>
            </form>

            {/* Errors */}
            {error && <div className="error" style={{ color: "red" }}>{error}</div>}

            {/* Result */}
            {result && (
                <div className={`result ${result.decision === "APPROVED" ? "approved" : "denied"}`}>
                    <h3>{result.decision === "APPROVED" ? "✅ Approved" : "❌ Denied"}</h3>
                    <p><strong>Credit Lines:</strong> {result.creditLines}</p>

                    {result.decision === "DENIED" && <p><strong>Reason:</strong> {result.reason}</p>}

                    {result.decision === "APPROVED" && result.offer && (
                        <>
                            <p><strong>Total Loan Amount:</strong> {formatCurrency(result.offer.totalLoanAmount)}</p>
                            <p><strong>Interest Rate:</strong> {(result.offer.interestRate * 100).toFixed(1)}%</p>
                            <p><strong>Term:</strong> {result.offer.termMonths} months</p>
                            <p><strong>Monthly Payment:</strong> {formatCurrency(result.offer.monthlyPayment)}</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
