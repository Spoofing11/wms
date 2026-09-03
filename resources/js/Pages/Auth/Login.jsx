import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import '../../../css/auth/login.css';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="login-page-wrapper">
            <Head title="Log in" />

            <div className="login-split-container">
                <div className="login-left-pane">
                    <img
                        src="/images/Login/split-1.webp"
                        alt="Composite Interior Illustration"
                        className="login-left-image"
                    />
                </div>

                <div className="login-right-pane">
                    <div className="login-card-inner">
                        <div className="login-brand-header">
                            <div className="login-logo-circle">
                                <img
                                    src="/images/Login/Composite-Logo-Peanut.webp"
                                    alt="Composite Logo"
                                    className="login-logo-img"
                                />
                            </div>
                            <h1 className="login-title-text">PT Composite Interior Prima</h1>
                            <p className="login-subtitle-text">Warehouse Management System</p>
                        </div>

                        <div className="login-divider"></div>

                        {errors.login && (
                            <div className="login-alert">
                                <svg
                                    className="login-alert-icon"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                                <div>
                                    <span
                                        style={{
                                            fontWeight: 700,
                                            display: 'block',
                                            marginBottom: '0.25rem',
                                        }}
                                    >
                                        Akses Terkunci
                                    </span>
                                    <span>{errors.login}</span>
                                </div>
                            </div>
                        )}

                        <div className="login-form-container">
                            <form onSubmit={submit} className="login-form">
                                <div className="login-input-group">
                                    <input
                                        type="text"
                                        id="login"
                                        name="login"
                                        value={data.login}
                                        placeholder="Username atau Email"
                                        className="login-input-field"
                                        required
                                        autoFocus
                                        onChange={(e) => setData('login', e.target.value)}
                                    />
                                </div>

                                <div className="login-input-group">
                                    <div className="password-wrapper">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            value={data.password}
                                            placeholder="Password"
                                            className="login-input-field"
                                            required
                                            autoComplete="current-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            id="toggle-password"
                                            className="password-toggle-btn"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <svg
                                                className="eye-icon"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                style={{ display: showPassword ? 'none' : 'block' }}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                            <svg
                                                className="eye-icon"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                style={{ display: showPassword ? 'block' : 'none' }}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="login-remember-row">
                                    <div className="login-remember-group">
                                        <label className="login-checkbox-label">
                                            <input
                                                type="checkbox"
                                                name="remember"
                                                id="remember"
                                                checked={data.remember}
                                                onChange={(e) => setData('remember', e.target.checked)}
                                            />
                                            <span>Ingat Saya</span>
                                        </label>
                                    </div>
                                    <div className="forgot-password-wrapper">
                                        <a
                                            id="forgot-password-trigger"
                                            className="forgot-password-link"
                                            onClick={() => setShowForgotModal(true)}
                                        >
                                            Lupa Password?
                                        </a>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="login-submit-button"
                                    disabled={processing}
                                >
                                    MASUK
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {showForgotModal && (
                <div
                    id="forgot-password-modal"
                    className="custom-modal"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowForgotModal(false);
                        }
                    }}
                >
                    <div className="custom-modal-content">
                        <h3 className="modal-title">Layanan Belum Tersedia</h3>
                        <p className="modal-text">
                            Silakan hubungi Tim IT. Layanan pemulihan kata sandi masih dalam tahap
                            pengembangan.
                        </p>
                        <button
                            type="button"
                            id="close-modal-btn"
                            className="modal-close-button"
                            onClick={() => setShowForgotModal(false)}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}