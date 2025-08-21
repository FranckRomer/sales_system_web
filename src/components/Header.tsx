// src/components/Header.tsx


export default function Header() {
    return (
        <header style={{
            backgroundColor: '#333',
            color: 'white',
            padding: '1rem 2rem'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {/* Logo */}
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
                    Sales System
                </h1>

                {/* Navigation */}
                <nav style={{
                    display: 'flex',
                    gap: '2rem',
                    alignItems: 'center'
                }}>
                    <a href="/" style={{
                        color: 'white',
                        textDecoration: 'none',
                        padding: '0.5rem 1rem'
                    }}>
                        Home
                    </a>
                    <a href="/sales-react" style={{
                        color: 'white',
                        textDecoration: 'none',
                        padding: '0.5rem 1rem'
                    }}>
                        Sales
                    </a>
                    <a href="/SalesList" style={{
                        color: 'white',
                        textDecoration: 'none',
                        padding: '0.5rem 1rem'
                    }}>
                        Sales List
                    </a>
                </nav>
            </div>
        </header>
    );
}
    
