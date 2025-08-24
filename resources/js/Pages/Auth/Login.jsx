import React, { useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { PrimaryButton } from '@/Components/ui/LegacyButtons';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, router } from '@inertiajs/react';
import { AuthService } from '@/Services';

export default function Login({ status, canResetPassword }) {
    const [data, setData] = useState({
        email: '',
        password: '',
        remember: false,
    });
    
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [loginStatus, setLoginStatus] = useState(status);

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        const fieldValue = name === 'remember' ? checked : value;
        
        setData(prevData => ({
            ...prevData,
            [name]: fieldValue
        }));
    };

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            // Викликаємо API для входу
            const response = await AuthService.login({
                email: data.email,
                password: data.password
            });
            
            // Після успішного входу перенаправляємо на дашборд
            if (response.success) {
                // Створюємо також веб-сесію для доступу до захищених Inertia-сторінок
                try {
                    await AuthService.webLogin({
                        email: data.email,
                        password: data.password,
                        remember: data.remember,
                    });
                } catch (_) {
                    // even if web session fails, proceed with token flow
                }
                setLoginStatus('Успішний вхід. Перенаправлення...');
                router.visit('/dashboard');
            }
        } catch (error) {
            // Обробляємо помилки від API
            if (error.response && error.response.data) {
                const responseData = error.response.data;
                
                if (responseData.message) {
                    setLoginStatus(responseData.message);
                }
                
                if (responseData.errors) {
                    setErrors(responseData.errors);
                }
            } else {
                setLoginStatus('Помилка входу. Спробуйте ще раз.');
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {loginStatus && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {loginStatus}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={handleChange}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={handleChange}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={handleChange}
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
