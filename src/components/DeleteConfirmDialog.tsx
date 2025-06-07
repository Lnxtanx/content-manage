import React from 'react';
import styles from './DeleteConfirmDialog.module.css';
import { FaExclamationTriangle } from 'react-icons/fa';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemType: string;
}

const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, itemType }: DeleteConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <FaExclamationTriangle className={styles.warningIcon} />
        <h2>⚠️ Warning: Permanent Deletion</h2>
        <p>
          You are about to delete this {itemType}. This action <strong>cannot be undone</strong> and the data will be permanently removed from the database.
        </p>
        <p className={styles.confirmText}>
          Are you absolutely sure you want to proceed?
        </p>
        <div className={styles.buttons}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.deleteButton} onClick={onConfirm}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmDialog;
