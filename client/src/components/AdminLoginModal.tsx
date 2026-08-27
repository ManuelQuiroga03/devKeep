import React, { useState } from 'react';
import { Lock, KeyRound } from 'lucide-react';
import { Modal } from './Modal';
import { useAuth } from '../context/AuthContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setLoading(true);
    const success = await login(pin.trim());
    setLoading(false);

    if (success) {
      setPin('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Acceso de Propietario / Administrador">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center p-3 rounded-xl bg-cyanAccent/10 border border-cyanAccent/20">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-cyanAccent/20 text-cyanAccent mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-dark-textMain">Ingresa tu PIN de Administrador</h4>
          <p className="text-xs text-dark-textMuted mt-1">
            Los visitantes navegan en Modo Lectura. Ingresa tu clave para habilitar la creación y edición de contenidos.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
            PIN o Clave de Propietario *
          </label>
          <div className="relative">
            <input
              type="password"
              required
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-textMain focus:border-cyanAccent outline-none text-sm font-mono tracking-widest transition-all"
            />
            <KeyRound className="w-4 h-4 text-dark-textMuted absolute left-3 top-3" />
          </div>
        </div>

        <div className="pt-3 border-t border-dark-border flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={loading || !pin.trim()} className="btn-primary">
            {loading ? 'Verificando...' : 'Activar Modo Edición'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
