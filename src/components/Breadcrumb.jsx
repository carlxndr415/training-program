import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

const Breadcrumb = () => {
  const location = useLocation();
  
  // Define breadcrumb mappings
  const breadcrumbMap = {
    '/': { label: 'Home', path: '/' },
    '/workouts': { label: 'Workouts', path: '/workouts' },
    '/workouts/push-pull-legs': { label: 'Push Pull Legs', path: '/workouts/push-pull-legs' },
    '/workouts/full-body': { label: 'Full Body', path: '/workouts/full-body' },
    '/workouts/upper-lower': { label: 'Upper Lower', path: '/workouts/upper-lower' },
    '/tracking': { label: 'Tracking', path: '/tracking' },
    '/dashboard': { label: 'Progress Dashboard', path: '/dashboard' },
    '/nutrition': { label: 'Nutrition', path: '/nutrition' }
  };

  // Generate breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const breadcrumbs = [];
    
    // Always start with Home
    breadcrumbs.push({
      label: 'Home',
      path: '/',
      isLast: pathSegments.length === 0
    });

    if (pathSegments.length === 0) {
      return breadcrumbs;
    }

    // Build path incrementally
    let currentPath = '';
    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += `/${pathSegments[i]}`;
      
      if (breadcrumbMap[currentPath]) {
        breadcrumbs.push({
          label: breadcrumbMap[currentPath].label,
          path: breadcrumbMap[currentPath].path,
          isLast: i === pathSegments.length - 1
        });
      } else if (i === pathSegments.length - 1) {
        // Handle dynamic routes (like specific workouts)
        breadcrumbs.push({
          label: pathSegments[i].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          path: currentPath,
          isLast: true
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Don't show breadcrumb for home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index === 0 ? (
              <Link 
                to={crumb.path}
                className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
              >
                <Home size={16} />
                <span>{crumb.label}</span>
              </Link>
            ) : (
              <Link 
                to={crumb.path}
                className={`hover:text-blue-600 transition-colors ${crumb.isLast ? 'text-gray-900 font-medium' : ''}`}
              >
                {crumb.label}
              </Link>
            )}
            
            {!crumb.isLast && (
              <ChevronRight size={16} className="text-gray-400" />
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumb;