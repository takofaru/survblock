import { useState } from 'react';
import CryptoJS from 'crypto-js';
import { registerCitizen } from './contract';

interface VerificationViewProps {
  onVerify: (idHash: string) => void;
  isSimulation: boolean;
}

const VerificationView = ({ onVerify, isSimulation }: VerificationViewProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState({ name: '', idNumber: '' });

  const handleRegister = async () => {
    if (!formData.name || !formData.idNumber) {
      alert("Please enter both Name and Government ID Number.");
      return;
    }

    setIsVerifying(true);
    
    // 1. Generate cryptographic hash of the ID (Privacy-preserving anchoring)
    const idHash = CryptoJS.SHA256(formData.name + formData.idNumber).toString();

    try {
      if (isSimulation) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("SIMULATED ID ANCHORING:", idHash);
      } else {
        // 2. Anchor the hash to the Soroban Government Registry
        await registerCitizen(idHash);
      }
      
      alert("Citizen Identity Anchored Successfully! Awaiting Government Verification.");
      onVerify(idHash);
    } catch (err: any) {
      console.error(err);
      alert("Registration failed: " + err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div style={{ padding: '40px', background: '#fff', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#1a237e', marginBottom: '10px' }}>Sovereign Citizen Registry</h2>
        <p style={{ color: '#546e7a' }}>Anchor your identity to the blockchain to access public services and consultations.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#37474f' }}>Full Legal Name</label>
          <input 
            type="text" 
            placeholder="e.g. John Doe"
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cfd8dc', boxSizing: 'border-box' }}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#37474f' }}>Government ID Number</label>
          <input 
            type="password" 
            placeholder="Enter ID Number"
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cfd8dc', boxSizing: 'border-box' }}
            onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
          />
          <p style={{ fontSize: '11px', color: '#90a4ae', marginTop: '5px' }}>* Your ID is hashed locally. The raw ID number never leaves your device.</p>
        </div>

        <button 
          onClick={handleRegister} 
          disabled={isVerifying}
          style={{ 
            marginTop: '10px',
            padding: '14px', 
            fontSize: '16px', 
            background: '#1a237e', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#283593')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#1a237e')}
        >
          {isVerifying ? "Anchoring to Stellar..." : "Anchor Identity & Register"}
        </button>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: '#f5f7f9', borderRadius: '6px', fontSize: '13px', color: '#455a64' }}>
        <strong>How it works:</strong> We use the <strong>Stellar Network</strong> to store a cryptographic fingerprint of your ID. This allows you to prove you are a unique human without exposing your personal documents to third parties.
      </div>
    </div>
  );
};

export default VerificationView;
