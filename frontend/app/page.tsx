import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to dashboard - the middleware will handle auth
  redirect('/dashboard');
}

