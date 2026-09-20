import React from 'react';
import { clsx } from 'clsx';
import { DocumentStatus, DocumentType } from '../../types/index';

interface StatusBadgeProps {
  status: DocumentStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const configs: Record<DocumentStatus, { label: string; dotClass: string; bgClass: string; textClass: string }> = {
    READY: {
      label: 'Ready',
      dotClass: 'bg-green-500',
      bgClass: 'bg-green-500/10 border-green-500/20',
      textClass: 'text-green-500',
    },
    PROCESSING: {
      label: 'Processing',
      dotClass: 'bg-amber-500 animate-pulse',
      bgClass: 'bg-amber-500/10 border-amber-500/20',
      textClass: 'text-amber-500',
    },
    UPLOADED: {
      label: 'Uploaded',
      dotClass: 'bg-blue-500',
      bgClass: 'bg-blue-500/10 border-blue-500/20',
      textClass: 'text-blue-500',
    },
    FAILED: {
      label: 'Failed',
      dotClass: 'bg-red-500',
      bgClass: 'bg-red-500/10 border-red-500/20',
      textClass: 'text-red-500',
    },
  };

  const config = configs[status] || configs.UPLOADED;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
        config.bgClass,
        config.textClass
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', config.dotClass)} />
      {config.label}
    </span>
  );
};

interface TypeBadgeProps {
  type: DocumentType;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => {
  const styles: Record<DocumentType, string> = {
    PDF: 'bg-red-500/10 text-red-500 border-red-500/20',
    DOCX: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    TXT: 'bg-stone-500/10 text-stone-400 border-stone-500/20',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold tracking-wide border',
        styles[type] || styles.TXT
      )}
    >
      {type}
    </span>
  );
};
