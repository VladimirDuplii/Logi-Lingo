import { Head, usePage } from '@inertiajs/react';
import WelcomeScreen from '@/Components/WelcomeScreen';
import { useEffect } from 'react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const { props } = usePage();
    useEffect(() => {
        if (props?.auth?.user) {
            window.location.href = '/dashboard';
        }
    }, [props?.auth?.user]);
    return (
        <>
            <Head title="Ласкаво просимо до LogicLingo" />
            <WelcomeScreen />
        </>
    );
}
