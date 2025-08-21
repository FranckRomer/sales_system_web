import { useState, useEffect } from 'react';

interface Sale {
    sale_id: number;
    customer_id: number;
    payment_method: string;
    subtotal: string;
    tax: string;
    total: string;
    total_discounts_amount: string;
    sale_datetime: string;
}

interface Customer {
    customer_id: number;
    name: string;
    customer_type: string;
}

export default function SalesList() {
    const API_BASE = "http://localhost:8000";
    const [sales, setSales] = useState<Sale[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<keyof Sale>('sale_datetime');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [salesRes, customersRes] = await Promise.all([
                fetch(`${API_BASE}/sales/`),
                fetch(`${API_BASE}/customers`)
            ]);

            if (!salesRes.ok || !customersRes.ok) {
                throw new Error('Error al cargar datos');
            }

            const [salesData, customersData] = await Promise.all([
                salesRes.json(),
                customersRes.json()
            ]);

            setSales(salesData);
            setCustomers(customersData);
        } catch (error: any) {
            console.error('Error loading data:', error);
            setError(`Error al cargar datos: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getCustomerName = (customerId: number) => {
        const customer = customers.find(c => c.customer_id === customerId);
        return customer ? customer.name : `Cliente ${customerId}`;
    };

    const formatCurrency = (amount: string) => {
        const num = parseFloat(amount);
        return isNaN(num) ? 'N/A' : `$${num.toFixed(2)}`;
    };

    const formatDateTime = (dateTime: string) => {
        try {
            const date = new Date(dateTime);
            return date.toLocaleString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateTime;
        }
    };

    const getPaymentMethodIcon = (method: string) => {
        switch (method.toLowerCase()) {
            case 'cash': return '💵';
            case 'credit card': return '💳';
            case 'store credit': return '🎫';
            default: return '💰';
        }
    };

    const filteredAndSortedSales = sales
        .filter(sale => {
            const customerName = getCustomerName(sale.customer_id).toLowerCase();
            const searchLower = searchTerm.toLowerCase();
            return customerName.includes(searchLower) || 
                   sale.payment_method.toLowerCase().includes(searchLower) ||
                   sale.sale_id.toString().includes(searchLower);
        })
        .sort((a, b) => {
            let aValue: any = a[sortBy];
            let bValue: any = b[sortBy];

            // Convertir strings numéricos a números para comparación
            if (sortBy === 'subtotal' || sortBy === 'tax' || sortBy === 'total' || sortBy === 'total_discounts_amount') {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

    const handleSort = (field: keyof Sale) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (field: keyof Sale) => {
        if (sortBy !== field) return '↕️';
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔄</div>
                <h3>Cargando ventas...</h3>
                <p>Conectando con la API...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>❌</div>
                <h3>Error al cargar datos</h3>
                <p>{error}</p>
                <button 
                    onClick={loadData}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginTop: '15px'
                    }}
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header y Controles */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '30px',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                <div>
                    <h2 style={{ margin: 0, color: '#333' }}>📊 Lista de Ventas</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                        Total: {filteredAndSortedSales.length} ventas
                    </p>
                </div>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="🔍 Buscar por cliente, método de pago o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '10px 15px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px',
                            minWidth: '250px'
                        }}
                    />
                    <button
                        onClick={loadData}
                        style={{
                            padding: '10px 15px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        🔄 Actualizar
                    </button>
                </div>
            </div>

            {/* Tabla de Ventas */}
            <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={{ 
                                padding: '15px', 
                                textAlign: 'left', 
                                cursor: 'pointer',
                                userSelect: 'none'
                            }}
                            onClick={() => handleSort('sale_id')}>
                                ID {getSortIcon('sale_id')}
                            </th>
                            <th style={{ 
                                padding: '15px', 
                                textAlign: 'left', 
                                cursor: 'pointer',
                                userSelect: 'none'
                            }}
                            onClick={() => handleSort('sale_datetime')}>
                                Fecha {getSortIcon('sale_datetime')}
                            </th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Cliente</th>
                            <th style={{ 
                                padding: '15px', 
                                textAlign: 'left', 
                                cursor: 'pointer',
                                userSelect: 'none'
                            }}
                            onClick={() => handleSort('payment_method')}>
                                Método de Pago {getSortIcon('payment_method')}
                            </th>
                            <th style={{ 
                                padding: '15px', 
                                textAlign: 'right', 
                                cursor: 'pointer',
                                userSelect: 'none'
                            }}
                            onClick={() => handleSort('subtotal')}>
                                Subtotal {getSortIcon('subtotal')}
                            </th>
                            <th style={{ 
                                padding: '15px', 
                                textAlign: 'right', 
                                cursor: 'pointer',
                                userSelect: 'none'
                            }}
                            onClick={() => handleSort('tax')}>
                                Impuestos {getSortIcon('tax')}
                            </th>
                            <th style={{ 
                                padding: '15px', 
                                textAlign: 'right', 
                                cursor: 'pointer',
                                userSelect: 'none'
                            }}
                            onClick={() => handleSort('total_discounts_amount')}>
                                Descuentos {getSortIcon('total_discounts_amount')}
                            </th>
                            <th style={{ 
                                padding: '15px', 
                                textAlign: 'right', 
                                cursor: 'pointer',
                                userSelect: 'none'
                            }}
                            onClick={() => handleSort('total')}>
                                Total {getSortIcon('total')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedSales.map((sale, index) => (
                            <tr key={sale.sale_id} style={{
                                borderBottom: '1px solid #f0f0f0',
                                backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa',
                                transition: 'background-color 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#f0f8ff';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#fafafa';
                            }}>
                                <td style={{ padding: '12px 15px', fontWeight: 'bold', color: '#007bff' }}>
                                    #{sale.sale_id}
                                </td>
                                <td style={{ padding: '12px 15px', color: '#666' }}>
                                    {formatDateTime(sale.sale_datetime)}
                                </td>
                                <td style={{ padding: '12px 15px', fontWeight: '500' }}>
                                    {getCustomerName(sale.customer_id)}
                                </td>
                                <td style={{ padding: '12px 15px' }}>
                                    <span style={{ marginRight: '8px' }}>
                                        {getPaymentMethodIcon(sale.payment_method)}
                                    </span>
                                    {sale.payment_method}
                                </td>
                                <td style={{ padding: '12px 15px', textAlign: 'right', fontWeight: '500' }}>
                                    {formatCurrency(sale.subtotal)}
                                </td>
                                <td style={{ padding: '12px 15px', textAlign: 'right', color: '#dc3545' }}>
                                    {formatCurrency(sale.tax)}
                                </td>
                                <td style={{ padding: '12px 15px', textAlign: 'right', color: '#28a745' }}>
                                    -{formatCurrency(sale.total_discounts_amount)}
                                </td>
                                <td style={{ 
                                    padding: '12px 15px', 
                                    textAlign: 'right', 
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                    color: '#28a745'
                                }}>
                                    {formatCurrency(sale.total)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredAndSortedSales.length === 0 && (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '40px', 
                        color: '#666' 
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📭</div>
                        <h3>No se encontraron ventas</h3>
                        <p>Intenta ajustar los filtros de búsqueda</p>
                    </div>
                )}
            </div>

            {/* Resumen */}
            {filteredAndSortedSales.length > 0 && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '20px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '15px'
                }}>
                    <div>
                        <strong>Total de ventas mostradas:</strong> {filteredAndSortedSales.length}
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div>
                            <strong>Subtotal total:</strong> {formatCurrency(
                                filteredAndSortedSales.reduce((sum, sale) => sum + parseFloat(sale.subtotal), 0).toString()
                            )}
                        </div>
                        <div>
                            <strong>Total general:</strong> {formatCurrency(
                                filteredAndSortedSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0).toString()
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
