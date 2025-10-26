import React, { useState } from "react";
import api from "../api";

export default function LoanApplication() {
    const [form, setForm] = useState({
        name: "",
        address: "",
        email: "",
        phone: "",
        ssn: "",
        requestedAmount: "",
        employmentStatus: "",
        monthlyIncome: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const reset = () => {
        setForm({
            name: "",
            address: "",
            email: "",
            phone: "",
            ssn: "",
            requestedAmount: "",
            employmentStatus: "",
            monthlyIncome: ""
        });
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

        if (Object.values(form).some((v) => !v)) {
            setError("Please fill all fields.");
            return;
        }
        if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email)) {
            setError("Please enter a valid email address (e.g., jane@example.com)");
            return;
        }
        const cleanPhone = form.phone.replace(/\D/g, ""); // removes everything that’s not a digit
        const cleanSSN = form.ssn.replace(/\D/g, "");     // removes dashes, spaces, etc.

        setLoading(true);
        try {
            const { data } = await api.post("/api/loan-applications/apply", {
                ...form,
                requestedAmount: Number(form.requestedAmount),
                monthlyIncome: Number(form.monthlyIncome),
                phone: cleanPhone,
                ssn: cleanSSN
            });
            setResult(data);
        } catch (err) {
            console.error(err);
            setError("Could not submit application. Is backend running on port 8080?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <h2>Loan Application</h2>

            <form onSubmit={onSubmit} className="form-grid">
                <div className="full">
                    <label>Name</label>
                    <input name="name" value={form.name} onChange={onChange} placeholder="Jane Doe" required />
                </div>

                <div className="full">
                    <label>Address</label>
                    <input name="address" value={form.address} onChange={onChange} placeholder="123 Main St" required />
                </div>

                <div>
                    <label>Email</label>
                    <input name="email" type="email" value={form.email} onChange={onChange} placeholder="jane@example.com" required />
                </div>

                <div>
                    <label>Phone</label>
                    <input name="phone" value={form.phone} onChange={onChange} placeholder="5551111" pattern="^\D?(\d\D?){10}$" title="Phone number must contain exactly 10 digits (e.g., 5551112222 or 5551112222)" required />
                </div>

                <div>
                    <label>SSN</label>
                    <input name="ssn" value={form.ssn} onChange={onChange} placeholder="1234567890" pattern="^\D?(\d\D?){10}$" title="SSN must contain exactly 10 digits (e.g., 1234567890 or 123456789)" required />
                </div>

                <div>
                    <label>Requested Loan Amount</label>
                    <input
                        name="requestedAmount"
                        type="number"
                        min="0"
                        value={form.requestedAmount}
                        onChange={onChange}
                        placeholder="25000"
                        required
                    />
                </div>
                <div>
                    <label>Employment Status</label>
                    <select name={"employmentStatus"} value={form.employmentStatus} onChange={onChange} required>
                        <option value={""}>Select Status</option>
                        <option value={"EMPLOYED"}>Employed</option>
                        <option value={"UNEMPLOYED"}>Unemployed</option>
                    </select>
                </div>
                <div>
                    <label>Monthly Income</label>
                    <input
                        name="monthlyIncome"
                        type="number"
                        value={form.monthlyIncome}
                        onChange={onChange}
                        placeholder="5000"
                        required
                    />
                </div>
                <div className="full" style={{ display: "flex", gap: "8px" }}>
                    <button type="submit" disabled={loading} style={{ flex: 1 }}>
                        {loading ? "Processing..." : "Apply for Loan"}
                    </button>
                    <button type="button" onClick={reset} disabled={loading} style={{ flex: 1, background: "#6b7280" }}>
                        Reset
                    </button>
                </div>
            </form>

            {error && <div className="error">{error}</div>}

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
