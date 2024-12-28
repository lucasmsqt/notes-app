'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiEdit, FiTrash, FiPlus, FiFileText, FiSun, FiMoon, FiArrowLeft, FiUser } from 'react-icons/fi';

interface Conta {
    id: number;
    nome: string;
    valor: number;
    status: string;
    referencia: string;
}

export default function ContasPage() {
    const router = useRouter();
    const [contas, setContas] = useState<Conta[]>([]);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState<Partial<Conta>>({});
    const [error, setError] = useState('');
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }

        const storedMode = localStorage.getItem('darkMode');
        setIsDarkMode(storedMode === 'true');
    }, [router]);

    useEffect(() => {
        fetchContas();
    }, []);

    const calculateTotal = () => {
        return contas.reduce((total, conta) => {
            const valor = typeof conta.valor === 'string' ? parseFloat(conta.valor) : 0;
            return total + valor;
        }, 0);
    };      

    function capitalizeFirstLetter(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }    

    const fetchContas = async () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId'); 

        if (token && userId) {
            try {
                const res = await fetch('/contas/listar', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ usuario_id: userId }),
                });
                const data = await res.json();
                setContas(data);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('darkMode', newMode.toString());
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        router.push('/login');
    };

    const toggleMenu = () => {
        setIsMenuVisible((prev) => !prev);
    };

    const openModal = (conta?: Conta) => {
        const currentMonthYear = new Date().toISOString().slice(0, 7);
        setModalData(
            conta || { nome: '', valor: 0, status: 'Aberta', referencia: currentMonthYear }
        );
        setShowModal(true);
    };    

    const closeModal = () => {
        setShowModal(false);
        setModalData({ nome: '', valor: 0, status: 'Aberta' });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        const endpoint = modalData.id ? `/contas/editar/${modalData.id}` : '/contas/criar';
        const method = modalData.id ? 'PUT' : 'POST';

        try {
            const res = await fetch(endpoint, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(modalData),
            });

            if (res.ok) {
                fetchContas();
                closeModal();
            } else {
                const data = await res.json();
                setError(data.message || 'Erro ao salvar a conta.');
            }
        } catch (err) {
            console.error(err);
            setError('Erro ao se conectar com o servidor.');
        }
    };

    const handleDelete = async (id: number) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/contas/deletar/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setContas((prev) => prev.filter((conta) => conta.id !== id));
            } else {
                const data = await res.json();
                setError(data.message || 'Erro ao deletar a conta.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <div className={`header ${isDarkMode ? 'dark' : ''}`}>
                <div className="header-left">
                    <button
                        className="back-button"
                        onClick={() => router.push('/')}
                    >
                        <FiArrowLeft size={24} />
                    </button>
                    <FiFileText size={30} />
                    <h1>Minhas Contas</h1>
                </div>
                <div className="header-right">
                    <button className="create-account-button" onClick={() => openModal()}>
                        <FiPlus size={24} color={isDarkMode ? 'white' : 'black'} />
                    </button>
                    <button className="toggle-dark-mode" onClick={toggleDarkMode}>
                        {isDarkMode ? <FiSun size={24} color="white" /> : <FiMoon size={24} color="black" />}
                    </button>
                    <div className="user-menu">
                        <button className="user-icon" onClick={toggleMenu}>
                            <FiUser size={24} color={isDarkMode ? 'white' : 'black'} />
                        </button>
                        <div
                            className={`menu-dropdown ${isDarkMode ? 'dark' : ''} ${
                                isMenuVisible ? 'visible' : 'hidden'
                            }`}
                        >
                            <button onClick={handleLogout}>Sair</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`contas-container ${isDarkMode ? 'dark' : ''}`}>
                {error && <p className="error-message">{error}</p>}
                    <ul className="contas-list">
                        {contas.map((conta) => (
                            <li key={conta.id}>
                                <div className="conta-info">
                                    <span className="conta-nome">{conta.nome}</span>
                                    <span className="conta-valor">R$ {Number(conta.valor).toFixed(2)}</span>
                                    <span className="conta-referencia">
                                        {(() => {
                                            if (!conta.referencia) {
                                                console.log('Referência não definida:', conta);
                                                return 'Mês/Ano não definido';
                                            }

                                            try {
                                                const parsedDate = new Date(`${conta.referencia}-01T00:00:00`);
                                                console.log('Data parseada:', parsedDate);

                                                const formattedDate = parsedDate.toLocaleDateString('pt-BR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                });
                                    
                                                return capitalizeFirstLetter(formattedDate);
                                            } catch (error) {
                                                console.error('Erro ao processar a referência:', conta.referencia, error);
                                                return 'Erro ao definir referência';
                                            }
                                        })()}
                                    </span>
                                </div>
                                <div className="action-container">
                                    <span className={`conta-status ${conta.status.toLowerCase()}`}>{conta.status}</span>
                                    <div className="action-buttons">
                                        <button className="edit-button" onClick={() => openModal(conta)}>
                                            <FiEdit size={18} />
                                        </button>
                                        <button className="delete-button" onClick={() => handleDelete(conta.id)}>
                                            <FiTrash size={18} />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
            </div>

            {showModal && (
                <div className="modal-backdrop">
                    <div className={`modal ${isDarkMode ? 'dark' : ''}`}>
                        <form onSubmit={handleSubmit}>
                            <h2>{modalData.id ? 'Editar Conta' : 'Criar Conta'}</h2>
                            {error && <p className="error-message">{error}</p>}
                            <input
                                type="text"
                                placeholder="Nome"
                                value={modalData.nome || ''}
                                onChange={(e) => setModalData({ ...modalData, nome: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Valor"
                                value={modalData.valor !== undefined ? modalData.valor || '' : ''}
                                onChange={(e) => setModalData({ ...modalData, valor: Number(e.target.value) })}
                                required
                            />
                            <select
                                value={modalData.status || 'Aberta'}
                                onChange={(e) => setModalData({ ...modalData, status: e.target.value })}
                                required
                            >
                                <option value="Aberta">Aberta</option>
                                <option value="Paga">Paga</option>
                                <option value="Atrasada">Atrasada</option>
                            </select>
                            <input
                                type="month"
                                value={modalData.referencia?.slice(0, 7) || ''}
                                onChange={(e) => setModalData({ ...modalData, referencia: `${e.target.value}` })}
                            />
                            <div className="modal-actions">
                                <button type="submit">Salvar</button>
                                <button type="button" onClick={closeModal}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="footer">
                <p><b>Total:</b> R$ {calculateTotal().toFixed(2)}</p>
            </div>

            <style jsx>{`
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    background-color: white;
                    color: black;
                    transition: background-color 0.3s ease, color 0.3s ease;
                }
                .header.dark {
                    background-color: #121212;
                    color: white;
                }
                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .header-left h1 {
                    margin: 0;
                    font-size: 1.3rem;
                    font-weight: bold;
                }
                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .user-menu {
                    position: relative;
                }
                .menu-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 0.5rem;
                    background-color: white;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    overflow: hidden;
                    z-index: 10;
                    opacity: 0;
                    transform: translateY(-10px);
                    pointer-events: none;
                    transition: opacity 0.3s ease, transform 0.3s ease;
                }
                .menu-dropdown.dark {
                    background-color: #333;
                    color: white;
                }
                .menu-dropdown.visible {
                    opacity: 1;
                    transform: translateY(0);
                    pointer-events: auto;
                }
                .menu-dropdown.hidden {
                    opacity: 0;
                    transform: translateY(-10px);
                    pointer-events: none;
                }
                .menu-dropdown button {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: none;
                    border: none;
                    text-align: left;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: background-color 0.3s ease;
                }
                .menu-dropdown button:hover {
                    background-color: #f0f0f0;
                }
                .menu-dropdown.dark button:hover {
                    background-color: #444;
                }
                .toggle-dark-mode,
                .user-icon,
                .create-account-button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    transition: background-color 0.3s ease;
                }
                .toggle-dark-mode:hover,
                .user-icon:hover,
                .create-account-button:hover {
                    background-color: #e0e0e0;
                }
                .header.dark .toggle-dark-mode:hover,
                .header.dark .create-account-button:hover,
                .header.dark .user-icon:hover {
                    background-color: #333;
                }
                .contas-container {
                    padding: 1rem;
                    background-color: #f1f1f1;
                    min-height: calc(100vh);
                    transition: background-color 0.3s ease, color 0.3s ease;
                }
                .contas-container.dark {
                    background-color: #121212;
                    color: white;
                }
                .contas-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .contas-list li {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    background: white;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    transition: background-color 0.3s ease, color 0.3s ease;
                    color: black;
                }

                .contas-container.dark .contas-list li {
                    background: #1e1e1e;
                    color: white;
                }

                .conta-info {
                    display: flex;
                    flex-direction: column;
                }

                .conta-nome {
                    font-size: 1.2rem;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                }

                .conta-valor {
                    font-size: 1rem;
                    color: #555;
                }

                .contas-container.dark .conta-valor {
                    color: #bbb;
                }

                .action-container {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .conta-status {
                    font-size: 0.9rem;
                    font-weight: bold;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    white-space: nowrap;
                }

                .conta-status.aberta {
                    background-color: #28a745;
                    color: white;
                }

                .conta-status.paga {
                    background-color: #007bff;
                    color: white;
                }

                .conta-status.atrasada {
                    background-color: #dc3545;
                    color: white;
                }

                .action-buttons {
                    display: flex;
                    gap: 0.5rem;
                }

                .edit-button,
                .delete-button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    transition: color 0.3s ease;
                }

                .edit-button:hover {
                    color: #007bff;
                }

                .delete-button:hover {
                    color: #dc3545;
                }
                .error-message {
                    color: red;
                    text-align: center;
                    margin: 1rem 0;
                }
                 .modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background-color: rgba(0, 0, 0, 0.6);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    animation: fadeIn 0.3s ease-in-out forwards;
                }
                .modal {
                    background-color: #fff;
                    border-radius: 12px;
                    padding: 2rem;
                    width: 100%;
                    max-width: 400px;
                    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
                    transform: translateY(-20px);
                    opacity: 0;
                    animation: slideUp 0.3s ease-in-out forwards;
                    transition: background-color 0.3s ease, color 0.3s ease;
                }

                .modal.dark {
                    background-color: #1e1e1e;
                    color: #f5f5f5;
                }

                .modal h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    color: #333;
                    transition: color 0.3s ease;
                }

                .modal.dark h2 {
                    color: #f5f5f5;
                }

                .modal input,
                .modal select {
                    width: 100%;
                    padding: 0.8rem;
                    margin-bottom: 1rem;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    font-size: 1rem;
                    color: #333;
                    background-color: #fff;
                    outline: none;
                    transition: border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease;
                }

                .modal input:focus,
                .modal select:focus {
                    border-color: #007bff;
                }

                .modal.dark input,
                .modal.dark select {
                    color: #f5f5f5;
                    background-color: #2a2a2a;
                    border-color: #555;
                }

                .modal.dark input:focus,
                .modal.dark select:focus {
                    border-color: #007bff;
                }

                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .modal-actions button {
                    background-color: #007bff;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    padding: 0.8rem 1.5rem;
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }

                .modal-actions button:hover {
                    background-color: #0056b3;
                }

                .modal-actions button:last-child {
                    background-color: #e0e0e0;
                    color: #333;
                }

                .modal-actions button:last-child:hover {
                    background-color: #d6d6d6;
                }

                .modal.dark .modal-actions button:last-child {
                    background-color: #333;
                    color: #f5f5f5;
                }

                .modal.dark .modal-actions button:last-child:hover {
                    background-color: #444;
                }
                .error-message {
                    color: #dc3545;
                    font-size: 0.875rem;
                    margin-bottom: 1rem;
                    text-align: left;
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .footer {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    background-color: ${isDarkMode ? '#1e1e1e' : '#f9f9f9'};
                    color: ${isDarkMode ? 'white' : 'black'};
                    padding: 0.8rem;
                    text-align: center;
                    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
                }
                .footer p {
                    font-size: 18px;
                }
            `}</style>
        </>
    );
}
