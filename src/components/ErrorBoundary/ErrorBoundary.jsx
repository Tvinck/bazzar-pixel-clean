import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Log error (Sentry integration can go here)
    console.error('ErrorBoundary caught:', error, errorInfo);
    
    // Analytics if available
    if (window.amplitude) {
      window.amplitude.track('app_error_caught', {
        error_message: error.message,
        component: errorInfo.componentStack
      });
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  }

  render() {
    if (this.state.hasError) {
      // If custom fallback provided, use it
      if (this.props.fallback) {
        return this.props.fallback({ 
          error: this.state.error,
          reset: this.handleReset 
        });
      }
      
      // Default fallback
      return (
        <div className="flex flex-col items-center justify-center 
                        min-h-[200px] p-6 text-center">
          <div className="text-4xl mb-3">😵</div>
          <p className="text-white font-medium mb-1">
            Что-то пошло не так
          </p>
          <p className="text-gray-400 text-sm mb-4">
            Этот блок временно недоступен
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-purple-600 rounded-xl 
                       text-white text-sm active:scale-95 transition-all"
          >
            Попробовать снова
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
