'use client';

import { useRouter } from 'next/navigation';
import { FiList, FiMoon, FiSun, FiFileText, FiUser } from 'react-icons/fi';
import { FaMoneyBillAlt } from 'react-icons/fa';
import { useEffect, useState } from 'react';

export default function HomePage() {
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }

        const storedMode = localStorage.getItem('darkMode');
        setIsDarkMode(storedMode === 'true');
    }, [router]);

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

    return (
        <>
            <div className={`header ${isDarkMode ? 'dark' : ''}`}>
                <div className="header-left">
                    <FiList size={30} />
                    <h1>Categorias</h1>
                </div>
                <div className="header-right">
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

            <div className={`home-container ${isDarkMode ? 'dark' : ''}`}>
                <button className="contas-button" onClick={() => router.push('/contas')}>
                    <FiFileText size={24} />
                    <span>Contas</span>
                </button>
                <button className="emprestimos-button" onClick={() => router.push('/emprestimos')}>
                    <FaMoneyBillAlt size={24} />
                    <span>Empréstimos</span>
                </button>
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
               .toggle-dark-mode,
                .user-icon {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    transition: background-color 0.3s ease;
                }
                .toggle-dark-mode:hover,
                .user-icon:hover {
                    background-color: #e0e0e0;
                }
                .header.dark .toggle-dark-mode:hover,
                .header.dark .user-icon:hover {
                    background-color: #333;
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
                .home-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    height: calc(100vh);
                    background-color: #f1f1f1;
                    color: #333;
                    transition: background-color 0.3s ease, color 0.3s ease;
                }
                .home-container.dark {
                    background-color: #121212;
                    color: #f5f5f5;
                }
                .emprestimos-button, .contas-button {
                    width: 95%;
                    max-width: 500px;
                    padding: 1rem;
                    margin-top: 1rem;
                    background-color: #fff;
                    color: #121212;
                    border: none;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: background-color 0.3s ease, transform 0.2s ease;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 0.75rem;
                }
                .emprestimos-button:hover, .contas-button:hover {
                    background-color: #ddd;
                    transform: translateY(-2px);
                }
                .home-container.dark .contas-button, .home-container.dark .emprestimos-button {
                    background-color: #333;
                    color: #f5f5f5;
                }
                .home-container.dark .contas-button:hover, .home-container.dark .emprestimos-button:hover {
                    background-color: #444;
                }

                .emprestimos-button svg, .contas-button svg {
                    vertical-align: middle;
                }
            `}</style>
        </>
    );
}
