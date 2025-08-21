import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#ffebee', 
                    borderRadius: '8px', 
                    border: '1px solid #f44336',
                    margin: '20px 0'
                }}>
                    <h3>❌ Algo salió mal</h3>
                    <p>El componente encontró un error inesperado:</p>
                    <pre style={{ 
                        backgroundColor: '#fff', 
                        padding: '10px', 
                        borderRadius: '4px', 
                        overflow: 'auto',
                        fontSize: '12px'
                    }}>
                        {this.state.error?.message}
                    </pre>
                    <button 
                        onClick={() => this.setState({ hasError: false, error: null })}
                        style={{ 
                            padding: '10px 20px', 
                            backgroundColor: '#f44336', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            marginTop: '10px'
                        }}
                    >
                        Reintentar
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
