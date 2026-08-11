'use client';
import { useState } from 'react';

const INITIAL_ACCOUNTS = [
  { id: 1, name: '@loja.skincare', niche: 'Beleza', revenue: 'R$ 14.500', profit: 'R$ 8.200', status: 'Ativa' },
  { id: 2, name: '@tech.acessorios', niche: 'Eletrônicos', revenue: 'R$ 32.100', profit: 'R$ 18.500', status: 'Ativa' },
  { id: 3, name: '@casa.decor', niche: 'Casa', revenue: 'R$ 4.200', profit: 'R$ 1.100', status: 'Aquecimento' },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [showModal, setShowModal] = useState(false);
  const [newAcc, setNewAcc] = useState({ name: '', niche: '', revenue: '', profit: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    setAccounts([...accounts, { id: Date.now(), ...newAcc, status: 'Nova' }]);
    setShowModal(false);
    setNewAcc({ name: '', niche: '', revenue: '', profit: '' });
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Gestão de Contas</h1>
          <p className="page-subtitle">Acompanhe o faturamento e lucro de todas as suas contas em um só lugar.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Adicionar Conta</button>
      </div>

      <div className="grid-3" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-label" style={{ marginBottom: 8, marginTop: 0 }}>Faturamento Total (Mês)</div>
          <div className="stat-value grad" style={{ color: 'var(--green)' }}>R$ 50.800</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ marginBottom: 8, marginTop: 0 }}>Lucro Líquido Estimado</div>
          <div className="stat-value grad" style={{ color: 'var(--violet2)' }}>R$ 27.800</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ marginBottom: 8, marginTop: 0 }}>Contas Ativas</div>
          <div className="stat-value" style={{ color: 'var(--text)' }}>{accounts.length}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Suas Contas (TikTok Shop / Dropshipping)</h2>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--raised)', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Conta</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Nicho</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Faturamento</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Lucro</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(acc => (
                <tr key={acc.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s', ':hover': { background: 'var(--raised)' } }}>
                  <td style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--text)' }}>{acc.name}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--muted)' }}>{acc.niche}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--green)', fontWeight: 500 }}>{acc.revenue}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--violet2)', fontWeight: 500 }}>{acc.profit}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span className={`badge ${acc.status === 'Ativa' ? 'badge-green' : acc.status === 'Aquecimento' ? 'badge-gold' : 'badge-violet'}`}>
                      {acc.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: 12, borderRadius: 6, border: '1px solid var(--border)' }}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Adicionar Nova Conta</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Nome da Conta (ex: @loja.oficial)</label>
                <input className="input" required value={newAcc.name} onChange={e => setNewAcc({...newAcc, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Nicho</label>
                <input className="input" required value={newAcc.niche} onChange={e => setNewAcc({...newAcc, niche: e.target.value})} />
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Faturamento (R$)</label>
                  <input className="input" required value={newAcc.revenue} onChange={e => setNewAcc({...newAcc, revenue: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Lucro (R$)</label>
                  <input className="input" required value={newAcc.profit} onChange={e => setNewAcc({...newAcc, profit: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Salvar Conta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
