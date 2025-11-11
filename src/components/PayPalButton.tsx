import React, { useEffect, useRef } from 'react';

// Make sure the PayPal script is loaded in your index.html
// And that the 'paypal' object is available on the window
declare global {
    interface Window {
        paypal: any;
    }
}

interface PayPalButtonProps {
    amount: string;
    onSuccess: (details: any) => void;
    onError: (error: any) => void;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({ amount, onSuccess, onError }) => {
    const paypalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!window.paypal) {
            console.error("PayPal SDK script not loaded.");
            return;
        }
        if (paypalRef.current && paypalRef.current.childElementCount === 0) {
            window.paypal.Buttons({
                createOrder: (_data: any, actions: any) => {
                    return actions.order.create({
                        purchase_units: [{
                            description: 'NoFiador.com Property Listing Fee',
                            amount: {
                                value: amount,
                                currency_code: 'USD'
                            }
                        }]
                    });
                },
                onApprove: async (_data: any, actions: any) => {
                    try {
                        const details = await actions.order.capture();
                        onSuccess(details);
                    } catch (err) {
                        onError(err);
                    }
                },
                onError: (err: any) => {
                    onError(err);
                }
            }).render(paypalRef.current);
        }
    }, [amount, onSuccess, onError]);

    return <div ref={paypalRef} className="z-0 relative"></div>;
};

export default PayPalButton;
