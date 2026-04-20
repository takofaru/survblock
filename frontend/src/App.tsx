import { useState, useEffect } from 'react';
import { isConnected, getAddress, setAllowed, getNetworkDetails } from '@stellar/freighter-api';
import VerificationView from './VerificationView';
import DashboardView from './DashboardView';
import SurveyView from './SurveyView';
import { getCitizen } from './contract';
import './App.css';

const MOCK_CONSULTATIONS = [
  { 
    id: 101, 
    title: "Urban Reforestation Initiative", 
    description: "Proposed plan to plant 5,000 native trees in the metropolitan district by 2027.",
    questions: ["Should the city prioritize public parks or roadside greening?", "Would you volunteer for weekend planting events?"]
  },
  { 
    id: 102, 
    title: "Sovereign Data Privacy Act", 
    description: "Public referendum on the proposed 2026 digital identity protection bill.",
    questions: ["Do you support stricter penalties for unauthorized PII handling?", "Should local data storage be mandatory for public services?"]
  },
  { 
    id: 103, 
    title: "Public Transit Optimization", 
    description: "Feedback on the proposed integration of autonomous shuttle routes.",
    questions: ["How often do you use the 'Express' shuttle lines?", "Which district requires better late-night coverage?"]
  }
];

type AppState = 'verification' | 'dashboard' | 'survey';

function App() {
  const [appState, setAppState] = useState<AppState>('verification');
  const [citizenIdHash, setCitizenIdHash] = useState<string | null>(null);
  const [selectedSurveyId, setSelectedSurveyId] = useState<number | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [isSimulation, setIsSimulation] = useState<boolean>(true);
  const [reputation, setReputation] = useState<number>(0);

  const checkConnection = async (prompt: boolean = false) => {
    try {
      const connected = await isConnected();
      if (connected && connected.isConnected) {
        if (prompt) await setAllowed();
        
        const addressObj = await getAddress();
        if (addressObj && addressObj.address) {
          setUserAddress(addressObj.address);
          
          const netDetails = await getNetworkDetails();
          setNetwork(netDetails.network);
          if (netDetails.network !== "TESTNET") {
            console.warn("Stellar network must be set to TESTNET.");
          }

          // Fetch real profile if not in simulation
          if (!isSimulation) {
            const profile = await getCitizen(addressObj.address);
            if (profile) {
              setCitizenIdHash(profile.id_hash);
              setReputation(profile.reputation);
              setAppState('dashboard');
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Wallet connection error:", err.message);
    }
  };

  useEffect(() => {
    checkConnection(false);
  }, [isSimulation]);

  const handleRegister = (idHash: string) => {
    setCitizenIdHash(idHash);
    setAppState('dashboard');
  };

  const handleSelectSurvey = (id: number) => {
    setSelectedSurveyId(id);
    setAppState('survey');
  };

  const selectedSurvey = MOCK_CONSULTATIONS.find(s => s.id === selectedSurveyId);

  return (
    <div className="App" style={{ minHeight: '100vh', padding: '20px', background: '#f0f2f5' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
             <span style={{ fontSize: '32px' }}>🏛️</span>
             <h1 style={{ margin: '0', color: '#1a237e', fontSize: '28px', letterSpacing: '-0.5px' }}>Sovereign Government Gateway</h1>
          </div>
          <p style={{ color: '#546e7a', fontSize: '15px' }}>Public Service Portal & Civic Consultation Hub</p>
          
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '11px', color: '#78909c', cursor: 'pointer', background: '#fff', padding: '6px 12px', borderRadius: '20px', border: '1px solid #cfd8dc' }}>
                <input 
                  type="checkbox" 
                  checked={isSimulation} 
                  onChange={() => setIsSimulation(!isSimulation)} 
                  style={{ marginRight: '8px' }}
                />
                Simulation Mode
              </label>
            </div>

            {userAddress ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '10px 20px', background: '#fff', borderRadius: '10px', fontSize: '13px', border: '1px solid #e0e0e0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '8px', height: '8px', background: network === "TESTNET" ? "#4caf50" : "#f44336", borderRadius: '50%' }}></div>
                <span style={{ color: '#455a64' }}><b>{network}:</b> {userAddress.slice(0, 6)}...{userAddress.slice(-4)}</span>
              </div>
            ) : (
              <button 
                onClick={() => checkConnection(true)}
                style={{ padding: '12px 24px', background: '#1a237e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
              >
                Authenticate with Freighter
              </button>
            )}
          </div>
        </header>

        <main>
          {appState === 'verification' && (
            <VerificationView onVerify={handleRegister} isSimulation={isSimulation} />
          )}

          {appState === 'dashboard' && citizenIdHash && (
            <DashboardView 
              surveys={MOCK_CONSULTATIONS} 
              citizen={{
                address: userAddress || '...',
                idHash: citizenIdHash,
                isVerified: true, // For walkthrough purposes
                reputation: reputation
              }}
              onSelect={handleSelectSurvey} 
            />
          )}

          {appState === 'survey' && selectedSurvey && citizenIdHash && (
            <SurveyView 
              surveyId={selectedSurvey.id}
              title={selectedSurvey.title}
              questions={selectedSurvey.questions}
              issuerSignature={citizenIdHash} // Using the anchored hash as the identity proof
              isSimulation={isSimulation}
              onComplete={() => {
                setReputation(prev => prev + 1);
                setAppState('dashboard');
              }}
              onCancel={() => setAppState('dashboard')}
            />
          )}
        </main>

        <footer style={{ marginTop: '60px', textAlign: 'center', fontSize: '11px', color: '#90a4ae', borderTop: '1px solid #e0e0e0', padding: '30px' }}>
          <strong>Legal Disclaimer:</strong> All data is secured by the Stellar Blockchain. Personal documents are hashed locally and never stored in plaintext on-chain or off-chain.
        </footer>
      </div>
    </div>
  );
}

export default App;
