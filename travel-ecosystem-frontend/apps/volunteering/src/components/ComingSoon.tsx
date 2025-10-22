import React from 'react';

interface ComingSoonProps {
  feature: string;
  description?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ feature, description }) => (
  <section style={{
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '2rem'
  }}>
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>🚧 {feature} is moving in</h1>
      <p style={{ marginTop: '1rem', color: '#555', maxWidth: '38rem', marginLeft: 'auto', marginRight: 'auto' }}>
        {description ?? 'We are migrating this experience into the standalone volunteering micro-frontend. Check back soon for the fully functional flow.'}
      </p>
    </div>
  </section>
);

export default ComingSoon;
