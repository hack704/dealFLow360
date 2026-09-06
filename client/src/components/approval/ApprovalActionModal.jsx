import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { CheckCircle, XCircle, RotateCcw, MessageSquare } from 'lucide-react';

/**
 * ApprovalActionModal — Approve / Return / Reject a quotation from the queue.
 * Props:
 *   isOpen (bool), onClose (fn), onSubmit (fn(action, note)), loading (bool)
 */
const ApprovalActionModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [action, setAction] = useState('approve');
  const [note, setNote] = useState('');

  const actions = [
    { key: 'approve', label: 'Approve',           Icon: CheckCircle,  color: 'bg-[#30d158]/15 border-[#30d158]/40 text-[#30d158]' },
    { key: 'return',  label: 'Return for Revision', Icon: RotateCcw,  color: 'bg-[#ff9f0a]/15 border-[#ff9f0a]/40 text-[#ff9f0a]' },
    { key: 'reject',  label: 'Reject',             Icon: XCircle,     color: 'bg-[#ff453a]/15 border-[#ff453a]/40 text-[#ff453a]' }
  ];

  const handleSubmit = () => {
    onSubmit?.(action, note);
    setNote('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Take Approval Action">
      {/* Action selector */}
      <div className="flex flex-col gap-2 mb-4">
        {actions.map(({ key, label, Icon, color }) => (
          <button
            key={key}
            onClick={() => setAction(key)}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
              action === key ? `${color} ring-1 ring-inset ring-current` : 'border-white/10 text-[#86868b] hover:border-white/20'
            }`}
          >
            <Icon size={16} />
            <span className="text-[13px] font-semibold">{label}</span>
          </button>
        ))}
      </div>

      {/* Note */}
      <div className="mb-4">
        <label className="flex items-center gap-1.5 mb-1.5 text-[12px] font-medium text-[#86868b]">
          <MessageSquare size={12} /> Decision Note
          {action !== 'approve' && <span className="text-[#ff453a]">*</span>}
        </label>
        <textarea
          rows={3}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={action === 'approve' ? 'Optional note…' : 'Reason required for return/reject…'}
          className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] text-[#f5f5f7] placeholder-[#555] outline-none focus:border-white/25 transition-colors"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          variant={action === 'approve' ? 'success' : action === 'reject' ? 'danger' : 'secondary'}
          onClick={handleSubmit}
          loading={loading}
          disabled={action !== 'approve' && !note.trim()}
        >
          Confirm {actions.find(a => a.key === action)?.label}
        </Button>
      </div>
    </Modal>
  );
};

export default ApprovalActionModal;
