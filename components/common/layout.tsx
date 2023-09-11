import React from 'react';
import { AuthContext, useAuth } from '@/hooks/auth';

export default function Layout({ children }: any) {
  const auth = useAuth();

  if (auth.isLoading) {
    return <div></div>
  }
  
  if (!auth.isAuthenticated) {
    auth.login();
    return <div></div>
  }

  return (
    <>
      <AuthContext.Provider value={ auth }>
        <main>{children}</main>
      </AuthContext.Provider>
    </>
  )
}