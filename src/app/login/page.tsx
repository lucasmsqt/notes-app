'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiMoon, FiSun, FiBook } from 'react-icons/fi';

export default function LoginPage() {
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ error, setError ] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/');
        }

        const storedMode = localStorage.getItem('darkMode');
        setIsDarkMode(storedMode === 'true');
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.userId);
                router.push('/');
            } else {
                const data = await res.json();
                setError(data.message || 'Erro ao fazer login.');
            }
        } catch (err) {
            console.error(err);
            setError('Erro ao se conectar com o servidor');
        }
    };

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('darkMode', newMode.toString());
    };

    return (
        <>
        <div className={`header ${isDarkMode ? 'dark' : ''}`}>
                <FiBook size={30} className="icon" />
                <h1>Anotações</h1>

            <button
                onClick={toggleDarkMode}
                className="toggle-dark-mode"
            >
                {isDarkMode ? (
                    <FiSun size={24} color="white" />
                ) : (
                    <FiMoon size={24} color="black" />
                )}
            </button>
        </div>

        <div className={`login-container ${isDarkMode ? 'dark' : ''}`}>
            <form onSubmit={handleSubmit} className='login-form'>
                <h1>Login</h1>
                {error && <p className='error-message'>{error}</p>}
                <input
                    type="email"
                    placeholder='Email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder='Senha'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Entrar</button>
            </form>
        </div>

        <style jsx>{`
                .header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    padding: 1rem;
                    background-color: white;
                    color: black;
                    transition: background-color 0.3s ease, color 0.3s ease;
                }
                .header.dark {
                    background-color: #121212;
                    color: white;
                }
                .icon {
                    margin-right: 0.5rem;
                }
                .header h1 {
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin: 0;
                }
                .login-container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: #f5f5f5;
                    padding: 1rem;
                    position: relative; 
                    transition: background-color 0.3s ease, color 0.3s ease;
                }
                .login-container.dark {
                    background-color: #121212;
                    color: white;
                }
                .toggle-dark-mode {
                    position: absolute;
                    top: 1.4rem;
                    right: 1.5rem;
                    background: none;
                    border: none;
                    color: inherit;
                    font-size: 1rem;
                    cursor: pointer;
                }
                .login-form {
                    background: white;
                    border-radius: 8px;
                    padding: 2rem;
                    width: 100%;
                    max-width: 400px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .login-container.dark .login-form {
                    background: #1e1e1e;
                    box-shadow: 0 4px 6px rgba(255, 255, 255, 0.1);
                }
                .login-form h1 {
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                    text-align: center;
                    color: black;
                }
                .login-container.dark .login-form h1 {
                    color: white;
                }
                .login-form input {
                    width: 100%;
                    padding: 0.75rem;
                    margin-bottom: 1rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 1rem;
                    color: black;
                }
                .login-container.dark .login-form input {
                    background: #2b2b2b;
                    border: 1px solid #555;
                    color: white;
                }
                .login-form input::placeholder {
                    color: #aaa;
                }
                .login-container.dark .login-form input::placeholder {
                    color: #bbb;
                }
                .login-form button {
                    width: 100%;
                    padding: 0.75rem;
                    background-color: black;
                    color: white;
                    font-size: 1rem;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .login-form button:hover {
                    background-color: #333;
                }
                .login-container.dark .login-form button {
                    background-color: white;
                    color: black;
                }
                .login-container.dark .login-form button:hover {
                    background-color: #ddd;
                }
                .error-message {
                    color: red;
                    font-size: 0.875rem;
                    margin-bottom: 1rem;
                    text-align: center;
                }
            `}</style>
        </>
    );
}