'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiEdit, FiTrash, FiPlus, FiDollarSign, FiSun, FiMoon, FiArrowLeft, FiUser } from 'react-icons/fi';

interface Emprestimo {
    id: number;
    nome: string;
    valor: number;
    parcelas: number;
    valor_pago: number;
    valor_pago_cumulativo?: number;
    status: string;
}

export default function EmprestimosPage() {
    const router = useRouter();
    const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState<Partial<Emprestimo>>({});
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
        fetchEmprestimos();
    }, []);

    const fetchEmprestimos = async () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (token && userId) {
            try {
                const res = await fetch('/emprestimos/listar', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ usuario_id: userId }),
                });

                if (!res.ok) {
                    console.error(`Erro na requisição: ${res.status} ${res.statusText}`);
                    return;
                }

                const data = await res.json();

                setEmprestimos(data);
            } catch (err) {
                console.error('Erro ao buscar empréstimos:', err);
            }
        } else {
            console.warn('Token ou User ID não encontrado no localStorage.');
        }
    };

    const calculateRemaining = (emprestimo: Emprestimo) =>
        emprestimo.valor - emprestimo.valor_pago;

    function capitalizeFirstLetter(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

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

    const openModal = (emprestimo?: Emprestimo) => {
        setModalData(
            emprestimo
                ? {
                    ...emprestimo,
                    valor_pago_cumulativo: emprestimo.valor_pago,
                }
                : { nome: '', valor: 0, parcelas: 1, valor_pago: 0, valor_pago_cumulativo: 0, status: 'pendente' }
        );
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalData({ nome: '', valor: 0, parcelas: 1, valor_pago: 0 });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const isEditing = !!modalData.id;
        const endpoint = isEditing
            ? `/emprestimos/${modalData.id}/pagamento`
            : '/emprestimos/criar';
        const method = isEditing ? 'PUT' : 'POST';

        const { ...dataToSend } = modalData;

        try {
            const res = await fetch(endpoint, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...dataToSend, usuario_id: localStorage.getItem('userId') }),
            });

            if (res.ok) {
                fetchEmprestimos();
                closeModal();
            } else {
                const data = await res.json();
                setError(data.message || 'Erro ao salvar o empréstimo.');
            }
        } catch (err) {
            console.error(err);
            setError('Erro ao se conectar com o servidor.');
        } finally {
            setModalData((prev) => ({ ...prev, valor_pago_cumulativo: 0 }));
        }
    };

    const handleDelete = async (id: number) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/emprestimos/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setEmprestimos((prev) => prev.filter((emprestimo) => emprestimo.id !== id));
            } else {
                const data = await res.json();
                setError(data.message || 'Erro ao deletar o empréstimo.');
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
                    <FiDollarSign size={30} />
                    <h1>Meus Empréstimos</h1>
                </div>
                <div className="header-right">
                    <button className="create-loan-button" onClick={() => openModal()}>
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
                            className={`menu-dropdown ${isDarkMode ? 'dark' : ''} ${isMenuVisible ? 'visible' : 'hidden'
                                }`}
                        >
                            <button onClick={handleLogout}>Sair</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`emprestimos-container ${isDarkMode ? 'dark' : ''}`}>
                {error && <p className="error-message">{error}</p>}
                <ul className="emprestimos-list">
                    {emprestimos.map((emprestimo) => (
                        <li key={emprestimo.id}>
                            <div className="emprestimo-info">
                                <span className="emprestimo-nome">{emprestimo.nome}</span>
                                <span className="emprestimo-valor">
                                    Total: R$ {Number(emprestimo.valor).toFixed(2)}
                                </span>
                                <span className="emprestimo-valor-pago">
                                    Pago: R$ {Number(emprestimo.valor_pago).toFixed(2)}
                                </span>
                                {calculateRemaining(emprestimo) > 0 && (
                                    <span className="emprestimo-valor-restante">
                                        Restante: R$ {calculateRemaining(emprestimo).toFixed(2)}
                                    </span>
                                )}
                            </div>
                            <div className="action-container">
                                <span className={`emprestimo-status ${emprestimo.status.toLowerCase()}`}>
                                    {capitalizeFirstLetter(emprestimo.status)}
                                </span>
                                <div className="action-buttons">
                                    <button className="edit-button" onClick={() => openModal(emprestimo)}>
                                        <FiEdit size={18} />
                                    </button>
                                    <button className="delete-button" onClick={() => handleDelete(emprestimo.id)}>
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
                            <h2>{modalData.id ? 'Editar Empréstimo' : 'Criar Empréstimo'}</h2>
                            {error && <p className="error-message">{error}</p>}

                            <div className="form-group">
                                <label htmlFor="nome">Nome:</label>
                                <input
                                    id="nome"
                                    type="text"
                                    placeholder="Nome"
                                    value={modalData.nome || ''}
                                    onChange={(e) => setModalData({ ...modalData, nome: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="valor">Valor Total:</label>
                                <input
                                    id="valor"
                                    type="number"
                                    placeholder="Valor Total"
                                    value={modalData.valor === undefined || modalData.valor === 0 ? '' : modalData.valor}
                                    onChange={(e) => {
                                        const newValue = e.target.value === '' ? 0 : Number(e.target.value);
                                        setModalData({ ...modalData, valor: newValue });
                                    }}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="parcelas">Parcelas:</label>
                                <input
                                    id="parcelas"
                                    type="number"
                                    placeholder="Parcelas"
                                    value={modalData.parcelas !== undefined ? modalData.parcelas : ''}
                                    onChange={(e) => setModalData({ ...modalData, parcelas: Number(e.target.value) })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="valor_pago">Valor Pago:</label>
                                <input
                                    id="valor_pago"
                                    type="number"
                                    placeholder="Digite o valor pago"
                                    value={modalData.valor_pago === undefined || modalData.valor_pago === 0 ? '' : modalData.valor_pago}
                                    onChange={(e) => {
                                        const newValue = e.target.value === '' ? 0 : Number(e.target.value);

                                        setModalData((prev) => ({
                                            ...prev,
                                            valor_pago: newValue,
                                            valor_pago_cumulativo: prev.valor_pago_cumulativo
                                                ? prev.valor_pago_cumulativo - (prev.valor_pago || 0) + newValue
                                                : newValue,
                                        }));
                                    }}
                                />
                                {modalData.valor !== undefined &&
                                    modalData.valor > 0 &&
                                    (modalData.valor - (modalData.valor_pago_cumulativo || 0)) > 0 && (
                                        <p className="remaining-value">
                                            Restante: R$ {(modalData.valor - (modalData.valor_pago_cumulativo || 0)).toFixed(2)}
                                        </p>
                                    )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="status">Status:</label>
                                <select
                                    id="status"
                                    value={modalData.status || 'pendente'}
                                    onChange={(e) => setModalData({ ...modalData, status: e.target.value })}
                                    required
                                >
                                    <option value="pendente">Pendente</option>
                                    <option value="quitado">Quitado</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                            </div>

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
                .create-loan-button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    transition: background-color 0.3s ease;
                }
                .toggle-dark-mode:hover,
                .user-icon:hover,
                .create-loan-button:hover {
                    background-color: #e0e0e0;
                }
                .header.dark .toggle-dark-mode:hover,
                .header.dark .create-loan-button:hover,
                .header.dark .user-icon:hover {
                    background-color: #333;
                }
                .emprestimos-container {
                    padding: 1rem;
                    background-color: #f1f1f1;
                    min-height: calc(100vh);
                    transition: background-color 0.3s ease, color 0.3s ease;
                }
                .emprestimos-container.dark {
                    background-color: #121212;
                    color: white;
                }
                .emprestimos-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .emprestimos-list li {
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
                .emprestimos-container.dark .emprestimos-list li {
                    background: #1e1e1e;
                    color: white;
                }
                .emprestimo-info {
                    display: flex;
                    flex-direction: column;
                }
                .emprestimo-nome {
                    font-size: 1.2rem;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                }
                .emprestimo-valor,
                .emprestimo-valor-pago,
                .emprestimo-valor-restante {
                    font-size: 1rem;
                    color: #555;
                }
                .emprestimos-container.dark .emprestimo-valor,
                .emprestimos-container.dark .emprestimo-valor-pago,
                .emprestimos-container.dark .emprestimo-valor-restante {
                    color: #bbb;
                }
                .action-container {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
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
                .form-group {
                    display: flex;
                    flex-direction: column;
                }

                .form-group label {
                    font-weight: bold;
                    color: #333;
                }

                .modal.dark .form-group label {
                    color: #f5f5f5;
                }

                .form-group input,
                .form-group select {
                    padding: 0.8rem;
                    font-size: 1rem;
                    border-radius: 8px;
                    border: 1px solid #ddd;
                    background-color: #fff;
                    color: #333;
                    transition: border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease;
                }

                .form-group input:focus,
                .form-group select:focus {
                    border-color: #007bff;
                    outline: none;
                }

                .modal.dark .form-group input,
                .modal.dark .form-group select {
                    background-color: #2a2a2a;
                    color: #f5f5f5;
                    border-color: #555;
                }

                .modal.dark .form-group input:focus,
                .modal.dark .form-group select:focus {
                    border-color: #007bff;
                }
                .emprestimo-status {
                    font-size: 0.9rem;
                    font-weight: bold;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    white-space: nowrap;
                    display: inline-block;
                }

                .emprestimo-status.pendente {
                    background-color: #ffc107;
                    color: #212529;
                }

                .emprestimo-status.quitado {
                    background-color: #28a745;
                    color: white;
                }

                .emprestimo-status.cancelado {
                    background-color: #dc3545;
                    color: white;
                }
                .remaining-value {
                    font-size: 0.9rem;
                    color: #555;
                    margin-bottom: 1rem;
                }

                .modal.dark .remaining-value {
                    color: #bbb;
                }

            `}</style>
        </>
    );
}
