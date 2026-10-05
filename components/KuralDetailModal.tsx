import React from 'react';
import { Kural } from '../types/kural';
import { KuralCard } from './KuralCard';
import { SheetModal } from './SheetModal';

interface KuralDetailModalProps {
  kural: Kural | null;
  onClose: () => void;
  title?: string;
}

export const KuralDetailModal: React.FC<KuralDetailModalProps> = ({ kural, onClose, title = 'Kural Detail' }) => (
  <SheetModal visible={!!kural} onClose={onClose} title={title}>
    {kural && <KuralCard kural={kural} />}
  </SheetModal>
);
