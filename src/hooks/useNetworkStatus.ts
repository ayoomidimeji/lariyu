import { useState, useEffect } from 'react';

export type NetworkQuality = 'high' | 'medium' | 'low';

interface NetworkStatus {
    quality: NetworkQuality;
    effectiveType: string;
    downlink?: number;
    rtt?: number;
    saveData: boolean;
}

declare global {
    interface Navigator {
        connection?: {
            effectiveType: '4g' | '3g' | '2g' | 'slow-2g';
            downlink: number;
            rtt: number;
            saveData: boolean;
            addEventListener: (type: string, listener: () => void) => void;
            removeEventListener: (type: string, listener: () => void) => void;
        };
    }
}

export const useNetworkStatus = (): NetworkStatus => {
    const getQuality = (): NetworkQuality => {
        const connection = navigator.connection;

        if (!connection) {
            // Default to medium if Network Information API is not available
            return 'medium';
        }

        // Check if user has data saver enabled
        if (connection.saveData) {
            return 'low';
        }

        // Determine quality based on effective connection type
        switch (connection.effectiveType) {
            case '4g':
                return 'high';
            case '3g':
                return 'medium';
            case '2g':
            case 'slow-2g':
                return 'low';
            default:
                return 'medium';
        }
    };

    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(() => {
        const connection = navigator.connection;
        return {
            quality: getQuality(),
            effectiveType: connection?.effectiveType || '4g',
            downlink: connection?.downlink,
            rtt: connection?.rtt,
            saveData: connection?.saveData || false,
        };
    });

    useEffect(() => {
        const connection = navigator.connection;

        if (!connection) {
            return;
        }

        const updateNetworkStatus = () => {
            setNetworkStatus({
                quality: getQuality(),
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData,
            });
        };

        connection.addEventListener('change', updateNetworkStatus);

        return () => {
            connection.removeEventListener('change', updateNetworkStatus);
        };
    }, []);

    return networkStatus;
};
