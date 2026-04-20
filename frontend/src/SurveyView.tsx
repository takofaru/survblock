import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { submitResponse, getCitizen } from './contract';
import { getAddress } from '@stellar/freighter-api';

interface SurveyViewProps {
  surveyId: number;
  title: string;
  questions: string[];
  issuerSignature: string; // Anchored ID Hash
  isSimulation: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

const SurveyView = ({ surveyId, title, questions, issuerSignature, isSimulation, onComplete, onCancel }: SurveyViewProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reputation, setReputation] = useState<number | null>(null);

  useEffect(() => {
    async function fetchReputation() {
      try {
        const { address } = await getAddress();
        if (address) {
          if (isSimulation) {
            setReputation(Math.floor(Math.random() * 5));
          } else {
            const profile = await getCitizen(address);
            if (profile) setReputation(profile.reputation);
          }
        }
      } catch (err) {
        console.error("Failed to fetch citizen profile", err);
      }
    }
    fetchReputation();
  }, [isSimulation]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Client-side AES Encryption
      const data = JSON.stringify(answers);
      const secretKey = "MOCK_SECRET_KEY";
      const encrypted = CryptoJS.AES.encrypt(data, secretKey).toString();

      // 2. Hash for Stellar
      const hash = CryptoJS.SHA256(encrypted).toString();

      if (isSimulation) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log("SIMULATED GATEWAY SUBMISSION:", { surveyId, hash, citizenHash: issuerSignature });
      } else {
        // 3. Submit to Soroban Contract
        await submitResponse(surveyId, hash);
      }

      alert(`Consultation "${title}" submitted successfully! ${isSimulation ? '(SIMULATED)' : ''}`);
      onComplete();
    } catch (err: any) {
      console.error(err);
      alert(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '30px', background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: '#1a237e', margin: 0 }}>{title}</h2>
          {reputation !== null && (
            <div style={{ 
              marginTop: '10px', 
              display: 'inline-block', 
              padding: '4px 12px', 
              background: '#1a237e', 
              color: '#fff', 
              borderRadius: '20px', 
              fontSize: '13px',
              fontWeight: 'bold'
            }}>
              Civic XP: {reputation}
            </div>
          )}
        </div>
        <button 
          onClick={onCancel} 
          style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '20px' }}
        >
          ✕
        </button>
      </div>

      <p style={{ color: '#546e7a', marginBottom: '30px' }}>This consultation is restricted to verified citizens. Your response will be anchored to your anchored ID fingerprint (<code>{issuerSignature.slice(0, 10)}...</code>).</p>
      
      {isSimulation && (
        <div style={{ padding: '10px', background: '#e3f2fd', color: '#1565c0', borderRadius: '6px', marginBottom: '25px', fontSize: '13px', border: '1px solid #bbdefb' }}>
          <strong>Gateway Simulation:</strong> Identity hash verification and response anchoring are simulated.
        </div>
      )}

      {questions.map((q, i) => (
        <div key={i} style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#37474f' }}>{q}</label>
          <textarea 
            rows={3}
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cfd8dc', boxSizing: 'border-box' }}
            onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })}
          />
        </div>
      ))}

      <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          style={{ 
            flex: 2, 
            padding: '14px', 
            background: '#1a237e', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isSubmitting ? "Anchoring Response..." : "Sign & Submit to Gateway"}
        </button>
        <button 
          onClick={onCancel} 
          style={{ flex: 1, padding: '14px', background: '#f5f7f9', color: '#37474f', border: '1px solid #cfd8dc', borderRadius: '6px', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SurveyView;
