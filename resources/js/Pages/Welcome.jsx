import { Head } from '@inertiajs/react';
import WelcomeScreen from '@/Components/WelcomeScreen';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Ласкаво просимо до LogicLingo" />
            <WelcomeScreen />
        </>
    );
}
