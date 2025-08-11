import { Component, ReactNode, ErrorInfo } from 'react';
import { ErrorMessage, Button } from '@/shared/ui';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  handleReload = () => {
    window.location.reload();
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="text-center">
                  <div className="mb-4" style={{ fontSize: '4rem' }}>
                    😵‍💫
                  </div>
                  
                  <h1 className="h3 mb-3">Что-то пошло не так!</h1>
                  
                  <ErrorMessage 
                    message="Произошла неожиданная ошибка в приложении"
                    variant="alert"
                    className="mb-4"
                  />
                  
                  {this.state.error && (
                    <details className="mb-4 text-left">
                      <summary className="btn btn-link p-0 mb-2">
                        Показать детали ошибки
                      </summary>
                      <div className="alert alert-secondary">
                        <small>
                          <strong>Ошибка:</strong> {this.state.error.message}
                          <br />
                          <strong>Stack:</strong>
                          <pre className="mt-2 mb-0" style={{ fontSize: '0.75rem' }}>
                            {this.state.error.stack}
                          </pre>
                        </small>
                      </div>
                    </details>
                  )}
                  
                  <div className="d-flex gap-2 justify-content-center">
                    <Button 
                      variant="primary" 
                      onClick={this.handleReset}
                    >
                      Попробовать снова
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={this.handleReload}
                    >
                      Перезагрузить страницу
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}