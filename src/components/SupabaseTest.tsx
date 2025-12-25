import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const SupabaseTest = () => {
  const [status, setStatus] = useState('Testing Supabase connection...');

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        
        // Test 1: Check client is created
        console.log('Supabase client exists:', !!supabase);
        setStatus('Supabase client created ✓');
        
        // Test 2: Try to get session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        console.log('Session test:', { hasSession: !!sessionData.session, error: sessionError });
        setStatus(prev => prev + '\nSession check ✓');
        
        // Test 3: Try a simple query
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        console.log('Query test:', { data, error });
        
        if (error) {
          setStatus(prev => prev + `\nQuery failed: ${error.message} ✗`);
        } else {
          setStatus(prev => prev + '\nQuery successful ✓');
        }
        
        setStatus(prev => prev + '\n\nAll tests completed!');
      } catch (error: any) {
        console.error('Test error:', error);
        setStatus(prev => prev + `\n\nError: ${error.message} ✗`);
      }
    };
    
    testConnection();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      padding: '20px', 
      border: '2px solid #ddd',
      borderRadius: '8px',
      zIndex: 9999,
      maxWidth: '400px',
      fontFamily: 'monospace',
      fontSize: '12px',
      whiteSpace: 'pre-wrap'
    }}>
      <strong>Supabase Connection Test</strong>
      <div style={{ marginTop: '10px' }}>{status}</div>
    </div>
  );
};
