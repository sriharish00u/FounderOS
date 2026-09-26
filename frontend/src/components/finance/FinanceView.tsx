import React, { useState } from 'react';
import {
  useFinanceSummaryQuery,
  useFinanceTransactionsQuery,
  useCreateFinanceTransactionMutation,
} from '../../hooks/queries';
import type { TransactionType, TransactionCategory } from '../../types';

const CATEGORIES: TransactionCategory[] = [
  'Subscription / MRR',
  'Services / Deals',
  'Payroll',
  'Cloud & Compute',
  'AI APIs',
  'Marketing',
  'Operations',
  'Other',
];

export const FinanceView: React.FC = () => {
  const { data: summary, isLoading: isSummaryLoading } = useFinanceSummaryQuery();
  const { data: transactions = [], isLoading: isTxLoading } = useFinanceTransactionsQuery();
  const createTxMutation = useCreateFinanceTransactionMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'expense' as TransactionType,
    amount: '',
    category: 'Operations' as TransactionCategory,
    date: new Date().toISOString().split('T')[0],
    account: 'Primary Operating (HDFC)',
    notes: '',
  });

  const handleCreateTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.amount) return;

    await createTxMutation.mutateAsync({
      title: form.title,
      type: form.type,
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      account: form.account,
      notes: form.notes,
      status: 'cleared',
    });

    setIsModalOpen(false);
    setForm({
      title: '',
      type: 'expense',
      amount: '',
      category: 'Operations',
      date: new Date().toISOString().split('T')[0],
      account: 'Primary Operating (HDFC)',
      notes: '',
    });
  };

  const runwayMonths = summary?.runwayMonths ?? 12.0;

  return (
    <div className="p-[30px_36px_44px] max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline border-b border-[var(--ink)] pb-4 mb-6 gap-4">
        <div>
          <h2 className="m-0 font-serif-display italic font-bold text-[28px] text-[var(--ink)]">
            Finance &amp; Runway Command
          </h2>
          <p className="font-serif-body italic text-[13.5px] text-[var(--muted)] m-0 mt-1">
            Cashflow velocity, monthly burn rate, categorized expenses, and real-time runway forecasting.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-1.5 font-mono-custom text-[11px] tracking-wider bg-[var(--accent)] text-[var(--paper)] font-bold hover:opacity-90 transition shadow-sm"
          type="button"
        >
          + Record Transaction
        </button>
      </div>

      {/* Runway Alert Banner if < 8 months */}
      {runwayMonths < 8 && (
        <div className="mb-6 p-4 border border-[var(--bad)] bg-[var(--panel)] text-[var(--ink)] flex items-center justify-between">
          <div>
            <div className="font-serif-display font-bold text-[16px] text-[var(--bad)]">
              ⚠️ Runway Alert: {runwayMonths} Months Remaining
            </div>
            <div className="font-serif-body italic text-[13px] text-[var(--muted)]">
              Net burn rate requires founder review on cloud compute, AI API usage, and discretionary spend.
            </div>
          </div>
        </div>
      )}

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="border border-[var(--rule)] bg-[var(--panel)] p-4">
          <div className="font-mono-custom text-[11px] text-[var(--muted)] tracking-wider">
            Total Cash Reserves
          </div>
          <div className="font-serif-display font-bold text-[32px] text-[var(--ink)]">
            ${summary ? summary.cashBalance.toLocaleString() : '---'}
          </div>
          <div className="font-mono-custom text-[10px] text-[var(--muted)]">Primary operating account</div>
        </div>

        <div className="border border-[var(--rule)] bg-[var(--panel)] p-4">
          <div className="font-mono-custom text-[11px] text-[var(--muted)] tracking-wider">
            Monthly Revenue (MRR)
          </div>
          <div className="font-serif-display font-bold text-[32px] text-[var(--good)]">
            ${summary ? summary.monthlyMRR.toLocaleString() : '---'}
          </div>
          <div className="font-mono-custom text-[10px] text-[var(--muted)]">Subscription + contract income</div>
        </div>

        <div className="border border-[var(--rule)] bg-[var(--panel)] p-4">
          <div className="font-mono-custom text-[11px] text-[var(--muted)] tracking-wider">
            Monthly Burn Rate
          </div>
          <div className="font-serif-display font-bold text-[32px] text-[var(--bad)]">
            ${summary ? summary.monthlyBurn.toLocaleString() : '---'}
          </div>
          <div className="font-mono-custom text-[10px] text-[var(--muted)]">Operating overhead &amp; compute</div>
        </div>

        <div className="border border-[var(--rule)] bg-[var(--panel)] p-4">
          <div className="font-mono-custom text-[11px] text-[var(--muted)] tracking-wider">
            Net Runway
          </div>
          <div className={`font-serif-display font-bold text-[32px] ${runwayMonths < 8 ? 'text-[var(--bad)]' : 'text-[var(--good)]'}`}>
            {summary ? `${summary.runwayMonths} mos` : '---'}
          </div>
          <div className="font-mono-custom text-[10px] text-[var(--muted)]">Based on net monthly burn</div>
        </div>
      </div>

      {/* Breakdown and Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="border border-[var(--ink)] bg-[var(--panel)] p-5 space-y-4">
          <h3 className="font-serif-display italic font-bold text-[20px] text-[var(--ink)] m-0">
            Expense Allocation
          </h3>

          {isSummaryLoading ? (
            <div className="py-4 font-mono-custom text-[11px] text-[var(--muted)]">Loading breakdown…</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(summary?.categoryBreakdown || {}).map(([cat, amount]) => {
                const totalExp = summary?.totalExpense || 1;
                const pct = Math.round((amount / totalExp) * 100);

                return (
                  <div key={cat} className="space-y-1 font-mono-custom text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-[var(--ink)] font-semibold">{cat}</span>
                      <span className="font-bold text-[var(--ink)]">${amount.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-[var(--paper)] h-2 border border-[var(--rule)]">
                      <div style={{ width: `${pct}%` }} className="bg-[var(--accent)] h-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Transaction Ledger */}
        <div className="lg:col-span-2 border border-[var(--ink)] bg-[var(--panel)] p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif-display italic font-bold text-[20px] text-[var(--ink)] m-0">
              Recent Transactions &amp; Invoices
            </h3>
            <span className="font-mono-custom text-[11px] text-[var(--muted)]">
              {transactions.length} records logged
            </span>
          </div>

          {isTxLoading ? (
            <div className="py-8 text-center font-mono-custom text-[11px] text-[var(--muted)]">
              Loading transactions…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-serif-body text-[13px] text-left">
                <thead>
                  <tr className="border-b border-[var(--ink)] font-mono-custom text-[10px] uppercase text-[var(--muted)] tracking-wider">
                    <th className="py-2">Date</th>
                    <th className="py-2">Description</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Type</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--rule)]">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[var(--paper)] transition-colors">
                      <td className="py-2.5 font-mono-custom text-[11px] text-[var(--muted)]">
                        {tx.date}
                      </td>
                      <td className="py-2.5 font-bold text-[var(--ink)]">{tx.title}</td>
                      <td className="py-2.5 font-mono-custom text-[11px] text-[var(--muted)]">
                        {tx.category}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`font-mono-custom text-[9px] uppercase px-1.5 py-0.5 border ${
                            tx.type === 'income'
                              ? 'bg-[var(--good)]/10 text-[var(--good)] border-[var(--good)]'
                              : 'bg-[var(--bad)]/10 text-[var(--bad)] border-[var(--bad)]'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td
                        className={`py-2.5 text-right font-mono-custom font-bold ${
                          tx.type === 'income' ? 'text-[var(--good)]' : 'text-[var(--bad)]'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center font-serif-body italic text-[var(--muted)]">
                        No transactions on record.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Record Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateTx}
            className="bg-[var(--paper)] border border-[var(--ink)] max-w-md w-full p-6 space-y-4 shadow-2xl font-serif-body"
          >
            <div className="flex justify-between items-center border-b border-[var(--ink)] pb-3">
              <h3 className="font-serif-display font-bold text-[20px] text-[var(--ink)] m-0">
                Record Financial Transaction
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--ink)]"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">
                  Type *
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as TransactionType })}
                  className="w-full p-2 bg-[var(--panel)] border border-[var(--rule)] text-[12px] font-mono-custom"
                >
                  <option value="expense">Expense (Outflow)</option>
                  <option value="income">Income (Inflow)</option>
                </select>
              </div>

              <div>
                <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">
                  Amount ($) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="2400"
                  className="w-full p-2 bg-[var(--panel)] border border-[var(--rule)] text-[13px]"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">
                Description / Vendor *
              </label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Anthropic API Compute"
                className="w-full p-2 bg-[var(--panel)] border border-[var(--rule)] text-[13px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as TransactionCategory })
                  }
                  className="w-full p-2 bg-[var(--panel)] border border-[var(--rule)] text-[12px] font-mono-custom"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono-custom text-[11px] text-[var(--muted)] mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full p-2 bg-[var(--panel)] border border-[var(--rule)] text-[12px] font-mono-custom"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--rule)]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 border border-[var(--rule)] font-mono-custom text-[11px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createTxMutation.isPending}
                className="px-4 py-1.5 bg-[var(--accent)] text-[var(--paper)] font-mono-custom text-[11px] font-bold shadow-sm"
              >
                {createTxMutation.isPending ? 'Saving…' : 'Save Transaction'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
