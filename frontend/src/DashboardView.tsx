interface SurveyMetadata {
  id: number;
  title: string;
  description: string;
}

interface CitizenProfile {
  address: string;
  idHash: string;
  isVerified: boolean;
  reputation: number;
}

interface DashboardViewProps {
  surveys: SurveyMetadata[];
  citizen: CitizenProfile;
  onSelect: (id: number) => void;
}

const DashboardView = ({ surveys, citizen, onSelect }: DashboardViewProps) => {
  return (
    <div style={{ padding: '20px' }}>
      {/* Citizen ID Card Section */}
      <div style={{ 
        marginBottom: '40px', 
        padding: '30px', 
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)', 
        borderRadius: '15px', 
        color: '#fff',
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, fontSize: '150px', fontWeight: 'bold' }}>GOV</div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '24px', letterSpacing: '1px' }}>SOVEREIGN CITIZEN ID</h2>
            <p style={{ margin: '0', opacity: 0.8, fontSize: '12px' }}>DECENTRALIZED CIVIC IDENTITY</p>
          </div>
          <div style={{ 
            padding: '6px 12px', 
            background: citizen.isVerified ? '#4caf50' : '#ffa000', 
            borderRadius: '20px', 
            fontSize: '12px', 
            fontWeight: 'bold' 
          }}>
            {citizen.isVerified ? '✓ VERIFIED' : 'PENDING VERIFICATION'}
          </div>
        </div>

        <div style={{ marginTop: '40px', display: 'flex', gap: '40px' }}>
          <div>
            <p style={{ margin: '0', opacity: 0.6, fontSize: '11px' }}>CITIZEN ADDRESS</p>
            <code style={{ fontSize: '14px' }}>{citizen.address.slice(0, 12)}...{citizen.address.slice(-10)}</code>
          </div>
          <div>
            <p style={{ margin: '0', opacity: 0.6, fontSize: '11px' }}>ID HASH (SHA-256)</p>
            <code style={{ fontSize: '14px' }}>{citizen.idHash.slice(0, 8)}...{citizen.idHash.slice(-8)}</code>
          </div>
          <div>
            <p style={{ margin: '0', opacity: 0.6, fontSize: '11px' }}>ENGAGEMENT SCORE</p>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{citizen.reputation} XP</div>
          </div>
        </div>
      </div>

      <header style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333' }}>Civic Consultations & referendums</h2>
        <p style={{ color: '#666' }}>Your verified status allows you to participate in the following official public matters.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
        {surveys.map((s) => (
          <div 
            key={s.id} 
            style={{ 
              padding: '25px', 
              background: '#fff', 
              border: '1px solid #e0e0e0', 
              borderRadius: '10px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
            }}
            onClick={() => onSelect(s.id)}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = '#1a237e';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.02)';
              e.currentTarget.style.borderColor = '#e0e0e0';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#1a237e', textTransform: 'uppercase', letterSpacing: '1px' }}>Public Service</span>
              <span style={{ fontSize: '10px', color: '#999' }}>ID: {s.id}</span>
            </div>
            <h3 style={{ margin: '0 0 12px 0', color: '#1a237e', fontSize: '18px' }}>{s.title}</h3>
            <p style={{ margin: '0 0 20px 0', color: '#546e7a', fontSize: '14px', lineHeight: '1.5' }}>{s.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button style={{ padding: '8px 16px', background: '#f5f7f9', border: '1px solid #cfd8dc', borderRadius: '5px', fontSize: '12px', color: '#1a237e', fontWeight: '600', cursor: 'pointer' }}>
                Open Consultation
              </button>
              <span style={{ fontSize: '11px', color: '#4caf50', fontWeight: '500' }}>● SECURE</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardView;
