import React from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error: error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo: errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{ padding: '20px', color: 'white', backgroundColor: '#333', borderRadius: '8px', margin: '20px', textAlign: 'center' }}>
                    <h2 style={{ color: '#ff6b6b' }}>Something went wrong.</h2>
                    <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left', marginTop: '10px', padding: '10px', backgroundColor: '#222', borderRadius: '4px' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <p style={{ marginTop: '15px', fontSize: '0.9em', color: '#aaa' }}>
                        Please try refreshing the page. If the problem persists, contact support.
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ErrorBoundary;