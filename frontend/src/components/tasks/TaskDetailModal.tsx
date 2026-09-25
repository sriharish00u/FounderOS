import React, { useState } from 'react';
import { useApp } from '../../context/useApp';

export const TaskDetailModal: React.FC = () => {
  const { 
    selectedTask, 
    setSelectedTask, 
    updateTaskStatus, 
    submitTaskDeliverable, 
    reviewTaskSubmission 
  } = useApp();

  const [deliverableText, setDeliverableText] = useState('');
  const [deliverableNotes, setDeliverableNotes] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!selectedTask) return null;

  const isInProgress = selectedTask.status === 'IN_PROGRESS';
  const isNotStarted = selectedTask.status === 'NOT_STARTED';

  const handleStartTask = () => {
    updateTaskStatus(selectedTask.id, 'IN_PROGRESS');
  };

  const handleSubmitWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableText.trim()) return;
    submitTaskDeliverable(selectedTask.id, deliverableText, deliverableNotes);
    setDeliverableText('');
    setDeliverableNotes('');
    setIsSubmitting(false);
  };

  const handleApprove = (submissionId: string) => {
    reviewTaskSubmission(
      selectedTask.id, 
      submissionId, 
      'approved', 
      reviewFeedback || 'Approved. Deliverable meets company benchmarks.'
    );
    setReviewFeedback('');
  };

  const handleReject = (submissionId: string) => {
    reviewTaskSubmission(
      selectedTask.id, 
      submissionId, 
      'changes_requested', 
      reviewFeedback || 'Please address feedback revisions and resubmit.'
    );
    setReviewFeedback('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[var(--paper)] border-2 border-[var(--ink)] w-full max-w-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col text-[var(--ink)]">
        <div className="p-5 border-b border-[var(--ink)] flex justify-between items-baseline bg-[var(--panel)]">
          <div>
            <div className="font-mono-custom text-[11px] text-[var(--muted)] tracking-widest">
              Deliverable Inspection · [{selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1).toLowerCase()}] · [{selectedTask.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}]
            </div>
            <h3 className="font-serif-display italic font-bold text-[24px] text-[var(--ink)] m-0">
              {selectedTask.title}
            </h3>
          </div>

          <button
            onClick={() => setSelectedTask(null)}
            className="font-mono-custom text-[12px] font-bold border border-[var(--ink)] px-2.5 py-1 hover:bg-[var(--ink)] hover:text-[var(--paper)]"
          >
            [ Close ]
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1 font-serif-body text-[14px]">
          <div>
            <p className="text-[14.5px] leading-relaxed text-[var(--ink)] m-0 whitespace-pre-wrap">
              {selectedTask.description}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 border border-[var(--rule)] bg-[var(--panel)] font-mono-custom text-[11px]">
            <div>
              <span className="text-[var(--muted)] block">Assignee:</span>
              <span className="text-[var(--ink)] font-bold">{selectedTask.assigneeName}</span>
            </div>
            <div>
              <span className="text-[var(--muted)] block">Creator:</span>
              <span className="text-[var(--ink)] font-bold">{selectedTask.creatorName}</span>
            </div>
            <div>
              <span className="text-[var(--muted)] block">Department:</span>
              <span className="text-[var(--ink)] font-bold">{selectedTask.department}</span>
            </div>
            <div>
              <span className="text-[var(--muted)] block">Deadline:</span>
              <span className="text-[var(--bad)] font-bold">{selectedTask.deadline}</span>
            </div>
          </div>

          {selectedTask.goalTitle && (
            <div className="p-3 border border-[var(--rule)] bg-[var(--panel)] font-mono-custom text-[11px]">
              <span className="text-[var(--muted)]">Strategic Goal Link:</span>{' '}
              <b className="text-[var(--accent)]">🎯 {selectedTask.goalTitle}</b>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-mono-custom text-[11px] tracking-wider text-[var(--muted)] m-0">
              Deliverable &amp; Submissions ({selectedTask.submissions.length})
            </h4>

            {isNotStarted && (
              <div className="p-4 border border-[var(--rule)] bg-[var(--panel)] text-center space-y-2 font-mono-custom text-[12px]">
                <p className="text-[var(--muted)] m-0">Task has not been started yet.</p>
                <button
                  onClick={handleStartTask}
                  className="px-4 py-1.5 bg-[var(--ink)] text-[var(--paper)] font-bold"
                >
                  Start Work (Move to In Progress)
                </button>
              </div>
            )}

            {isInProgress && !isSubmitting && (
              <div className="p-4 border border-[var(--rule)] bg-[var(--panel)] flex justify-between items-center font-mono-custom text-[11px]">
                <div>
                  <div className="font-bold text-[var(--ink)]">Work Currently In Progress</div>
                  <div className="text-[var(--muted)]">Ready to submit deliverable for review?</div>
                </div>
                <button
                  onClick={() => setIsSubmitting(true)}
                  className="px-4 py-1.5 bg-[var(--accent)] text-[var(--paper)] font-bold"
                >
                  Submit Deliverable &rarr;
                </button>
              </div>
            )}

            {isSubmitting && (
              <form onSubmit={handleSubmitWork} className="p-4 border border-[var(--ink)] bg-[var(--panel)] space-y-3 font-mono-custom text-[11px]">
                <div className="font-bold text-[var(--ink)]">Submit Work Output:</div>
                <div>
                  <label className="block text-[var(--muted)] mb-1">Deliverable Summary &amp; Output:</label>
                  <textarea
                    required
                    rows={3}
                    value={deliverableText}
                    onChange={e => setDeliverableText(e.target.value)}
                    placeholder="Describe what was accomplished, paste pull request / document link..."
                    className="w-full bg-[var(--paper)] border border-[var(--ink)] p-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[var(--muted)] mb-1">Verification Notes (Optional):</label>
                  <input
                    type="text"
                    value={deliverableNotes}
                    onChange={e => setDeliverableNotes(e.target.value)}
                    placeholder="e.g., all 42 tests passing, CTR projections verified"
                    className="w-full bg-[var(--paper)] border border-[var(--ink)] p-1.5 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSubmitting(false)}
                    className="px-3 py-1 border border-[var(--rule)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 bg-[var(--accent)] text-[var(--paper)] font-bold"
                  >
                    Submit to Manager
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {selectedTask.submissions.map((sub, idx) => (
                <div key={sub.id} className="p-3.5 border border-[var(--rule)] bg-[var(--panel)] space-y-2">
                  <div className="flex justify-between items-center font-mono-custom text-[11px]">
                    <span className="font-bold text-[var(--ink)]">Submission #{selectedTask.submissions.length - idx}</span>
                    <span className={`px-2 py-0.5 border font-bold ${
                      sub.reviewStatus === 'approved' ? 'border-[var(--good)] text-[var(--good)]' :
                      sub.reviewStatus === 'changes_requested' ? 'border-[var(--bad)] text-[var(--bad)]' :
                      'border-[var(--accent)] text-[var(--accent)]'
                    }`}>
                      {sub.reviewStatus ? (sub.reviewStatus === 'changes_requested' ? 'Changes Requested' : sub.reviewStatus.charAt(0).toUpperCase() + sub.reviewStatus.slice(1)) : 'Pending'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-[var(--paper)] border border-[var(--rule)] text-[13.5px] leading-relaxed">
                    {sub.deliverableSummary}
                  </div>

                  {sub.reviewNotes && (
                    <div className="p-2 border border-[var(--rule)] bg-[var(--paper)] text-[12.5px] italic text-[var(--accent)] font-serif-body">
                      <b>Manager Feedback ({sub.reviewedBy}):</b> "{sub.reviewNotes}"
                    </div>
                  )}

                  {sub.reviewStatus === 'pending' && (
                    <div className="pt-2 border-t border-[var(--rule)] space-y-2 font-mono-custom text-[11px]">
                      <div className="font-bold text-[var(--ink)]">Manager Decision:</div>
                      <input
                        type="text"
                        value={reviewFeedback}
                        onChange={e => setReviewFeedback(e.target.value)}
                        placeholder="Enter approval note or revision requests..."
                        className="w-full bg-[var(--paper)] border border-[var(--ink)] p-1.5 focus:outline-none"
                      />
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleApprove(sub.id)}
                          className="px-3 py-1 bg-[var(--good)] text-[var(--paper)] font-bold"
                        >
                        Approve &amp; Complete
                        </button>
                        <button
                          onClick={() => handleReject(sub.id)}
                          className="px-3 py-1 bg-[var(--bad)] text-[var(--paper)] font-bold"
                        >
                          Request Changes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-[var(--rule)]">
            <h4 className="font-mono-custom text-[11px] tracking-wider text-[var(--muted)] m-0">
              Audit &amp; Activity Log
            </h4>
            <div className="space-y-1 font-mono-custom text-[11px] text-[var(--muted)]">
              {selectedTask.activityLogs.map(log => (
                <div key={log.id} className="flex justify-between p-1.5 border-b border-[var(--rule)]">
                  <span>{log.action}</span>
                  <span>[{log.performedBy}] · {log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
