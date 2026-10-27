import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { StatusScreen } from '../../components/status-screen';

export function ErrorPage() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : null;
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred';

  return <StatusScreen fullPage icon={<AlertTriangle size={26} />} code={status} title="Something went wrong" message={message} />;
}
