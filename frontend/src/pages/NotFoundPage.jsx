import { Link } from 'react-router-dom';

export default function NotFoundPage({ message = "The page you're looking for doesn't exist." }) {
  return (
    <div className="container page narrow center">
      <p className="big-404" aria-hidden="true">404</p>
      <h1>Page not found</h1>
      <p className="muted">{message}</p>
      <Link to="/events" className="btn btn-primary">
        Browse events
      </Link>
    </div>
  );
}
