import React from 'react';
import './titlebar.css';
import Logo from '../assets/logo.png';

interface TitleBarProps {
    showBackButton?: boolean;
    onBackClick?: () => void;
    title?: string;
    showSettings?: boolean;
    onSettingsToggle?: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({
    showBackButton = false,
    onBackClick,
    title = "Mod Skin LoL",
    showSettings = false,
    onSettingsToggle
}) => {
    const handleMinimize = () => {
        if (window.electronAPI?.minimize) {
            window.electronAPI.minimize();
        }
    };

    const handleMaximize = () => {
        if (window.electronAPI?.maximize) {
            window.electronAPI.maximize();
        }
    };

    const handleClose = () => {
        if (window.electronAPI?.close) {
            window.electronAPI.close();
        }
    };

    return (
        <div className="title-bar">
            <div className="title-bar-left">
                <button
                    className={`title-bar-back-button ${!showBackButton ? 'hidden' : ''}`}
                    onClick={onBackClick}
                    title="Back"
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M10 12L6 8L10 4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>

            <div className="title-bar-center">
                <img src={Logo} alt="logo" className="title-bar-logo" />
                <span className="title-bar-title">{title}</span>
            </div>

            <div className="title-bar-right">
                <button
                    className={`title-bar-settings-btn ${showSettings ? 'active' : ''}`}
                    onClick={onSettingsToggle}
                    title="Settings"
                >
                    ⚙
                </button>
                <button
                    className="title-bar-button minimize"
                    onClick={handleMinimize}
                    title="Minimize"
                >
                    −
                </button>
                <button
                    className="title-bar-button maximize"
                    onClick={handleMaximize}
                    title="Maximize"
                >
                    □
                </button>
                <button
                    className="title-bar-button close"
                    onClick={handleClose}
                    title="Close"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default TitleBar;
