// React Skeleton (omit styling; fetch from /customers, /products, post to /sales)
import { useEffect, useState } from "react";

export default function SalesPage() {
    const API = "http://localhost:8000";
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [customerId, setCustomerId] = useState<string | undefined>();
    const [payment, setPayment] = useState("Cash");
    const [items, setItems] = useState([{ product_id: null, quantity: 1 }]);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    console.log('SalesPage component rendered - isInitialized:', isInitialized, 'loading:', loading, 'error:', error);

    const initializeComponent = async () => {
        console.log('=== INICIO: initializeComponent ===');
        setIsInitialized(true);
        setLoading(true);
        setError(null);
        
        try {
            console.log('Haciendo requests a la API...');
            const [custRes, prodRes] = await Promise.all([
                fetch(`${API}/customers`), 
                fetch(`${API}/products`)
            ]);
            
            console.log('Respuestas recibidas:', { custRes: custRes.status, prodRes: prodRes.status });
            
            if (!custRes.ok || !prodRes.ok) {
                throw new Error(`Error en la respuesta de la API: ${custRes.status} / ${prodRes.status}`);
            }
            
            const [cs, ps] = await Promise.all([custRes.json(), prodRes.json()]);
            
            console.log('Data loaded successfully:', { 
                customersCount: cs.length, 
                productsCount: ps.length,
                firstCustomer: cs[0],
                firstProduct: ps[0]
            });
            
            // Debug adicional: ver la estructura completa de los primeros elementos
            if (cs.length > 0) {
                console.log('Primer cliente completo:', JSON.stringify(cs[0], null, 2));
                console.log('Tipos de datos del cliente:', {
                    customer_id: typeof cs[0].customer_id,
                    name: typeof cs[0].name,
                    customer_type: typeof cs[0].customer_type,
                    credit_terms_days: typeof cs[0].credit_terms_days
                });
            }
            
            if (ps.length > 0) {
                console.log('Primer producto completo:', JSON.stringify(ps[0], null, 2));
                console.log('Tipos de datos del producto:', {
                    product_id: typeof ps[0].product_id,
                    name: typeof ps[0].name,
                    product_type: typeof ps[0].product_type,
                    list_price: typeof ps[0].list_price,
                    list_price_value: ps[0].list_price,
                    price: typeof ps[0].price,
                    price_value: ps[0].price
                });
            }
            
            setCustomers(cs);
            setProducts(ps);
            if (cs[0]) setCustomerId(cs[0].customer_id);
            setLoading(false);
            
            console.log('=== FIN: initializeComponent - ÉXITO ===');
        } catch (error: any) {
            console.error('=== ERROR en initializeComponent ===', error);
            setError(`Error al cargar datos: ${error.message}`);
            setLoading(false);
            setIsInitialized(false); // Resetear si hay error
        }
    };

    const setItem = (idx: number, patch: any) => {
        setItems(items.map((it, i) => i === idx ? { ...it, ...patch } : it));
    };

    const addRow = () => setItems([...items, { product_id: products[0]?.product_id ?? null, quantity: 1 }]);

    const delRow = (idx: number) => setItems(items.filter((_, i) => i !== idx));

    const valid = items.length > 0 && items.every(it => it.product_id && it.quantity > 0) && customerId;

    const submit = async () => {
        try {
            const resp = await fetch(`${API}/sales`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer_id: Number(customerId),
                    payment_method: payment,
                    items
                })
            });

            if (resp.status === 400) {
                setResult(await resp.json());
                return;
            }

            setResult(await resp.json());
        } catch (error: any) {
            console.error('Error submitting sale:', error);
            setResult({ error: error.message });
        }
    };

    // Debug: mostrar estado actual
    console.log('Estado actual:', {
        isInitialized,
        loading,
        error,
        customersCount: customers.length,
        productsCount: products.length
    });

    // Renderizar siempre, pero con contenido condicional
    return (
        <div>
            
            {/* Debug info */}
            {/* <div style={{ 
                backgroundColor: '#f0f0f0', 
                padding: '10px', 
                margin: '10px 0', 
                borderRadius: '4px', 
                fontSize: '12px',
                fontFamily: 'monospace'
            }}>
                <strong>Debug:</strong> isInitialized={String(isInitialized)}, loading={String(loading)}, error={String(error)}, customers={customers.length}, products={products.length}
            </div> */}
            
            {/* Botón de inicialización */}
            {!isInitialized && (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '12px', margin: '20px 0', border: '2px dashed #dee2e6' }}>
                    <h3>🚀 Componente React Listo</h3>
                    <p>Haz clic en el botón para cargar los datos y comenzar a usar la aplicación</p>
                    <button 
                        onClick={initializeComponent}
                        style={{ 
                            padding: '15px 30px', 
                            fontSize: '16px',
                            backgroundColor: '#007bff', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            marginTop: '15px',
                            boxShadow: '0 4px 6px rgba(0, 123, 255, 0.2)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#0056b3';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#007bff';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        🚀 Inicializar Aplicación
                    </button>
                    <p style={{ marginTop: '15px', fontSize: '14px', color: '#6c757d' }}>
                        API: {API}
                    </p>
                </div>
            )}

            {/* Estado de carga de datos */}
            {isInitialized && loading && (
                <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px', margin: '20px 0' }}>
                    <p>🔄 Cargando datos de la API...</p>
                    <p>Conectando con {API}</p>
                    <div style={{ marginTop: '10px' }}>
                        <div style={{ width: '100%', height: '4px', backgroundColor: '#ddd', borderRadius: '2px' }}>
                            <div style={{ width: '60%', height: '100%', backgroundColor: '#2196f3', borderRadius: '2px', animation: 'pulse 1.5s infinite' }}></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Estado de error */}
            {isInitialized && error && (
                <div style={{ color: 'red', padding: '20px', backgroundColor: '#ffebee', borderRadius: '8px', margin: '20px 0', textAlign: 'center' }}>
                    <p>❌ {error}</p>
                    <p>Verifica que tu backend esté ejecutándose en {API}</p>
                    <button 
                        onClick={initializeComponent} 
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
            )}

            {/* Contenido principal solo cuando no hay errores y los datos están cargados */}
            {isInitialized && !loading && !error && customers.length > 0 && products.length > 0 && (
                <>
                    <div style={{ marginBottom: '20px' }}>
                        <select 
                            value={customerId ?? ""} 
                            onChange={e => setCustomerId(e.target.value)}
                            style={{ marginRight: '10px', padding: '8px', borderRadius: '4px' }}
                        >
                            {customers.map(c => (
                                <option key={c.customer_id} value={c.customer_id}>
                                    {c.name} ({c.customer_type}, {c.credit_terms_days}d)
                                </option>
                            ))}
                        </select>
                        <select 
                            value={payment} 
                            onChange={e => setPayment(e.target.value)}
                            style={{ padding: '8px', borderRadius: '4px' }}
                        >
                            <option value="Credit Card">Credit Card</option>
                            <option value="Cash">Cash</option>
                            <option value="Store Credit">Store Credit</option>
                        </select>
                    </div>
                    
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f5f5f5' }}>
                                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Product</th>
                                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Qty</th>
                                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((it, idx) => (
                                <tr key={idx}>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                        <select
                                            value={it.product_id ?? ""}
                                            onChange={e => setItem(idx, { product_id: Number(e.target.value) })}
                                            style={{ width: '100%', padding: '6px', borderRadius: '4px' }}
                                        >
                                            <option value="">Select Product</option>
                                            {products.map(p => (
                                                <option key={p.product_id} value={p.product_id}>
                                                    {p.name} - ${(() => {
                                                        const price = p.list_price || p.price || p.listPrice || 0;
                                                        if (typeof price === 'number' && !isNaN(price)) {
                                                            return price.toFixed(2);
                                                        }
                                                        return 'N/A';
                                                    })()}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                        <input
                                            type="number"
                                            min="1"
                                            value={it.quantity}
                                            onChange={e => setItem(idx, { quantity: Number(e.target.value) })}
                                            style={{ width: '100%', padding: '6px', borderRadius: '4px' }}
                                        />
                                    </td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => delRow(idx)}
                                            style={{ 
                                                padding: '6px 12px', 
                                                backgroundColor: '#f44336', 
                                                color: 'white', 
                                                border: 'none', 
                                                borderRadius: '4px', 
                                                cursor: 'pointer' 
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <button 
                            onClick={addRow}
                            style={{ 
                                padding: '10px 20px', 
                                backgroundColor: '#4caf50', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: 'pointer',
                                marginRight: '10px'
                            }}
                        >
                            Add Row
                        </button>
                        <button 
                            onClick={submit} 
                            disabled={!valid}
                            style={{ 
                                padding: '10px 20px', 
                                backgroundColor: valid ? '#2196f3' : '#ccc', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: valid ? 'pointer' : 'not-allowed'
                            }}
                        >
                            Submit Sale
                        </button>
                    </div>
                    
                    {result && (
                        <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                            <h3>Result:</h3>
                            <pre style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    )}
                </>
            )}

            {/* Estado intermedio - datos cargados pero no hay contenido */}
            {isInitialized && !loading && !error && (customers.length === 0 || products.length === 0) && (
                <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px', margin: '20px 0', border: '1px solid #ffeaa7' }}>
                    <p>⚠️ Datos cargados pero no hay clientes o productos disponibles</p>
                    <p>Clientes: {customers.length}, Productos: {products.length}</p>
                    <button 
                        onClick={initializeComponent}
                        style={{ 
                            padding: '10px 20px', 
                            backgroundColor: '#ffc107', 
                            color: '#000', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            marginTop: '10px'
                        }}
                    >
                        Recargar Datos
                    </button>
                </div>
            )}
        </div>
    );
}