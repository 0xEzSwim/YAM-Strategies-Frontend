'use client';

import { ReactNode, useState } from 'react';
import { X } from 'lucide-react';

export type InformationType = 'info' | 'success' | 'warning' | 'error';

interface InformationProps {
    /**
     * Le contenu du message d'information
     */
    children: ReactNode;

    /**
     * Le type d'information qui détermine la couleur du message
     * @default 'info'
     */
    type?: InformationType;

    /**
     * Indique si le message peut être fermé
     * @default true
     */
    dismissible?: boolean;

    /**
     * Fonction appelée lorsque le message est fermé
     */
    onDismiss?: () => void;

    /**
     * Classe CSS additionnelle
     */
    className?: string;
}

/**
 * Composant d'affichage de messages d'information avec différents types (info, success, warning, error)
 */
const Information = ({ children, type = 'info', dismissible = true, onDismiss, className = '' }: InformationProps) => {
    const [isVisible, setIsVisible] = useState(true);

    // Définition des styles en fonction du type
    const styles = {
        info: {
            border: 'border-l-blue-500',
            text: 'text-blue-700',
            bg: 'bg-blue-50',
            hover: 'hover:text-blue-900'
        },
        success: {
            border: 'border-l-green-500',
            text: 'text-green-700',
            bg: 'bg-green-50',
            hover: 'hover:text-green-900'
        },
        warning: {
            border: 'border-l-yellow-500',
            text: 'text-yellow-700',
            bg: 'bg-yellow-50',
            hover: 'hover:text-yellow-900'
        },
        error: {
            border: 'border-l-red-500',
            text: 'text-red-700',
            bg: 'bg-red-50',
            hover: 'hover:text-red-900'
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        onDismiss?.();
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div
            className={`flex items-center gap-3 p-4 border-l-4 rounded-lg ${styles[type].border} ${styles[type].bg} ${styles[type].text} ${className}`}
        >
            <div className={`text-sm flex-grow`}>{children}</div>
            {dismissible && (
                <button onClick={handleDismiss} className={`${styles[type].hover} focus:outline-none ml-2`} aria-label="Fermer le message">
                    <X size={16} />
                </button>
            )}
        </div>
    );
};

export { Information };
