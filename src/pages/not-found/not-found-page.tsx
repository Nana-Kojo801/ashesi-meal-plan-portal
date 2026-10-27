import { SearchX } from 'lucide-react';
import { StatusScreen } from '../../components/status-screen';

export function NotFoundPage() {
  return (
    <StatusScreen
      icon={<SearchX size={26} />}
      code={404}
      title="Page not found"
      message="This page doesn’t exist. Check the URL or head back to the dashboard."
    />
  );
}
