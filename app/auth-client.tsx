"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useId, useState } from "react";

import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HelpHubLogo } from "@/components/helphub-logo";
import {
    ApiError,
    forgotPassword,
    getMyProfile,
    login,
    register,
    resendEmailOtp,
    resetPassword,
    verifyEmail,
    type RegisterPayload,
} from "@/lib/api";
import { clearSession, saveSession } from "@/lib/session";

type AuthMode = "login" | "register" | "verify" | "forgot" | "reset";
type BusyState =
    | AuthMode
    | "resendVerification"
    | "resendReset"
    | null;
type Notice = { type: "success" | "error"; message: string } | null;

const roleOptions: Array<{
    value: RegisterPayload["role"];
    label: string;
    description: string;
}> = [
        {
            value: "REQUESTER",
            label: "Người cần hỗ trợ",
            description: "Gửi yêu cầu hỗ trợ và theo dõi tình trạng tiếp nhận.",
        },
        {
            value: "VOLUNTEER",
            label: "Tình nguyện viên",
            description: "Tham gia hỗ trợ thông qua hành động hoặc quyên góp.",
        },
    ];

const primaryModes: AuthMode[] = ["login", "register"];

const initialLoginForm = {
    email: "",
    password: "",
};

const initialRegisterForm = {
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "REQUESTER" as RegisterPayload["role"],
};

const initialEmailOtpForm = {
    email: "",
    otp: "",
};

const initialForgotPasswordForm = {
    email: "",
};

const initialResetPasswordForm = {
    email: "",
    otp: "",
    newPassword: "",
};

export default function AuthClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const modeParam = searchParams.get("mode");
    const roleParam = searchParams.get("role");

    const [mode, setMode] = useState<AuthMode>(() => {
        if (modeParam === "register" || modeParam === "verify" || modeParam === "forgot" || modeParam === "reset") {
            return modeParam;
        }
        return "login";
    });
    const [loginForm, setLoginForm] = useState(initialLoginForm);
    const [registerForm, setRegisterForm] = useState(() => ({
        ...initialRegisterForm,
        role: (roleParam === "VOLUNTEER" || roleParam === "REQUESTER" ? roleParam : "REQUESTER") as RegisterPayload["role"],
    }));
    const [verifyForm, setVerifyForm] = useState(initialEmailOtpForm);
    const [forgotForm, setForgotForm] = useState(initialForgotPasswordForm);
    const [resetForm, setResetForm] = useState(initialResetPasswordForm);
    const [busy, setBusy] = useState<BusyState>(null);
    const [notice, setNotice] = useState<Notice>(null);

    useEffect(() => {
        const nextMode = searchParams.get("mode");
        if (nextMode === "register" || nextMode === "login" || nextMode === "verify" || nextMode === "forgot" || nextMode === "reset") {
            setMode(nextMode);
        }
        const nextRole = searchParams.get("role");
        if (nextRole === "VOLUNTEER" || nextRole === "REQUESTER") {
            setRegisterForm((prev) => ({
                ...prev,
                role: nextRole as RegisterPayload["role"],
            }));
        }
    }, [searchParams]);

    function changeMode(nextMode: AuthMode) {
        if (busy) {
            return;
        }

        if (nextMode === "verify") {
            const email =
                verifyForm.email || loginForm.email || registerForm.email;
            setVerifyForm({ ...verifyForm, email: email.trim() });
        }

        if (nextMode === "forgot") {
            setForgotForm({ email: loginForm.email.trim() });
        }

        setMode(nextMode);
        setNotice(null);
    }

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy("login");
        setNotice(null);

        if (loginForm.password.length < 15) {
            setNotice({
                type: "error",
                message: "Mật khẩu phải có độ dài tối thiểu 15 ký tự theo quy định bảo mật hệ thống.",
            });
            setBusy(null);
            return;
        }

        try {
            const auth = await login({
                email: loginForm.email.trim(),
                password: loginForm.password,
            });

            if (!auth.accessToken) {
                throw new ApiError(
                    "Phản hồi đăng nhập không chứa mã truy cập (token).",
                    500,
                    auth,
                );
            }

            const profile = await getMyProfile(auth.accessToken);

            saveSession(auth);
            setNotice({ type: "success", message: "Đăng nhập thành công." });
            router.replace(
                profile.role === "ADMIN" ? "/admin/dashboard" : "/dashboard",
            );
        } catch (error) {
            setNotice({ type: "error", message: getErrorMessage(error) });
            clearSession();
        } finally {
            setBusy(null);
        }
    }

    async function handleRegister(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy("register");
        setNotice(null);

        if (registerForm.password.length < 15) {
            setNotice({
                type: "error",
                message: "Mật khẩu phải có độ dài tối thiểu 15 ký tự theo quy định bảo mật hệ thống.",
            });
            setBusy(null);
            return;
        }

        if (registerForm.password.length > 64) {
            setNotice({
                type: "error",
                message: "Mật khẩu không được vượt quá 64 ký tự.",
            });
            setBusy(null);
            return;
        }

        try {
            const payload: RegisterPayload = {
                fullName: registerForm.fullName.trim(),
                email: registerForm.email.trim(),
                password: registerForm.password,
                role: registerForm.role,
            };

            if (registerForm.phone.trim()) {
                payload.phone = registerForm.phone.trim();
            }

            const response = await register(payload);

            clearSession();
            setRegisterForm(initialRegisterForm);
            setLoginForm({ email: payload.email, password: "" });
            setVerifyForm({ email: payload.email, otp: "" });
            setMode("verify");
            setNotice({
                type: "success",
                message:
                    response.message ??
                    "Tạo tài khoản thành công! Vui lòng kiểm tra email để lấy mã xác thực OTP.",
            });
        } catch (error) {
            setNotice({ type: "error", message: getErrorMessage(error) });
        } finally {
            setBusy(null);
        }
    }

    async function handleVerifyEmail(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy("verify");
        setNotice(null);

        try {
            const email = verifyForm.email.trim();
            const message = await verifyEmail({
                email,
                otp: verifyForm.otp.trim(),
            });

            setVerifyForm({ email, otp: "" });
            setLoginForm({ email, password: "" });
            setMode("login");
            setNotice({ type: "success", message: message || "Xác thực email thành công! Bạn có thể đăng nhập ngay." });
        } catch (error) {
            setNotice({ type: "error", message: getErrorMessage(error) });
        } finally {
            setBusy(null);
        }
    }

    async function handleResendVerification() {
        const email = verifyForm.email.trim();

        if (!email) {
            setNotice({
                type: "error",
                message: "Vui lòng nhập email trước khi yêu cầu mã mới.",
            });
            return;
        }

        setBusy("resendVerification");
        setNotice(null);

        try {
            const message = await resendEmailOtp({ email });
            setNotice({ type: "success", message: message || "Đã gửi lại mã xác thực tới email của bạn." });
        } catch (error) {
            setNotice({ type: "error", message: getErrorMessage(error) });
        } finally {
            setBusy(null);
        }
    }

    async function handleForgotPassword(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy("forgot");
        setNotice(null);

        try {
            const email = forgotForm.email.trim();
            const message = await forgotPassword({ email });

            setResetForm({ email, otp: "", newPassword: "" });
            setMode("reset");
            setNotice({ type: "success", message: message || "Đã gửi mã khôi phục tới email của bạn." });
        } catch (error) {
            setNotice({ type: "error", message: getErrorMessage(error) });
        } finally {
            setBusy(null);
        }
    }

    async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy("reset");
        setNotice(null);

        if (resetForm.newPassword.length < 15) {
            setNotice({
                type: "error",
                message: "Mật khẩu mới phải có độ dài tối thiểu 15 ký tự theo quy định bảo mật hệ thống.",
            });
            setBusy(null);
            return;
        }

        if (resetForm.newPassword.length > 64) {
            setNotice({
                type: "error",
                message: "Mật khẩu mới không được vượt quá 64 ký tự.",
            });
            setBusy(null);
            return;
        }

        try {
            const email = resetForm.email.trim();
            const message = await resetPassword({
                email,
                otp: resetForm.otp.trim(),
                newPassword: resetForm.newPassword,
            });

            setResetForm(initialResetPasswordForm);
            setLoginForm({ email, password: "" });
            setMode("login");
            setNotice({ type: "success", message: message || "Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại." });
        } catch (error) {
            setNotice({ type: "error", message: getErrorMessage(error) });
        } finally {
            setBusy(null);
        }
    }

    async function handleResendResetCode() {
        const email = resetForm.email.trim();

        if (!email) {
            setNotice({
                type: "error",
                message: "Vui lòng nhập email trước khi yêu cầu mã mới.",
            });
            return;
        }

        setBusy("resendReset");
        setNotice(null);

        try {
            const message = await forgotPassword({ email });
            setNotice({ type: "success", message: message || "Đã gửi lại mã khôi phục mật khẩu." });
        } catch (error) {
            setNotice({ type: "error", message: getErrorMessage(error) });
        } finally {
            setBusy(null);
        }
    }

    return (
        <main className="min-h-dvh bg-[#f0faf4] text-slate-950">
            {/* Topbar */}
            <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <a href="/" className="flex items-center gap-2.5 transition hover:opacity-80">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-white p-1 shadow-[0_2px_0_0_#cbd5e1] border-2 border-slate-200">
                            <HelpHubLogo className="size-full" />
                        </div>
                        <span className="text-base font-black tracking-tight text-slate-900">HelpHub</span>
                    </a>
                    <p className="hidden text-sm text-slate-500 sm:block">
                        Vì một cộng đồng không ai bị bỏ lại phía sau
                    </p>
                </div>
            </header>

            {/* Form area */}
            <div className="flex min-h-[calc(100dvh-57px)] items-center justify-center px-4 py-10 sm:px-6">
                <div className="w-full max-w-[500px]">
                    <AuthPanel
                        busy={busy}
                        forgotForm={forgotForm}
                        loginForm={loginForm}
                        mode={mode}
                        onForgotPassword={handleForgotPassword}
                        onLogin={handleLogin}
                        onModeChange={changeMode}
                        onRegister={handleRegister}
                        onResendResetCode={handleResendResetCode}
                        onResendVerification={handleResendVerification}
                        onResetPassword={handleResetPassword}
                        onVerifyEmail={handleVerifyEmail}
                        registerForm={registerForm}
                        resetForm={resetForm}
                        setForgotForm={setForgotForm}
                        setLoginForm={setLoginForm}
                        setRegisterForm={setRegisterForm}
                        setResetForm={setResetForm}
                        setVerifyForm={setVerifyForm}
                        verifyForm={verifyForm}
                    />

                    {notice ? <NoticeBanner notice={notice} /> : null}
                </div>
            </div>
        </main>
    );
}

function AuthPanel({
    busy,
    forgotForm,
    loginForm,
    mode,
    onForgotPassword,
    onLogin,
    onModeChange,
    onRegister,
    onResendResetCode,
    onResendVerification,
    onResetPassword,
    onVerifyEmail,
    registerForm,
    resetForm,
    setForgotForm,
    setLoginForm,
    setRegisterForm,
    setResetForm,
    setVerifyForm,
    verifyForm,
}: {
    busy: BusyState;
    forgotForm: typeof initialForgotPasswordForm;
    loginForm: typeof initialLoginForm;
    mode: AuthMode;
    onForgotPassword: (event: FormEvent<HTMLFormElement>) => void;
    onLogin: (event: FormEvent<HTMLFormElement>) => void;
    onModeChange: (mode: AuthMode) => void;
    onRegister: (event: FormEvent<HTMLFormElement>) => void;
    onResendResetCode: () => void;
    onResendVerification: () => void;
    onResetPassword: (event: FormEvent<HTMLFormElement>) => void;
    onVerifyEmail: (event: FormEvent<HTMLFormElement>) => void;
    registerForm: typeof initialRegisterForm;
    resetForm: typeof initialResetPasswordForm;
    setForgotForm: (value: typeof initialForgotPasswordForm) => void;
    setLoginForm: (value: typeof initialLoginForm) => void;
    setRegisterForm: (value: typeof initialRegisterForm) => void;
    setResetForm: (value: typeof initialResetPasswordForm) => void;
    setVerifyForm: (value: typeof initialEmailOtpForm) => void;
    verifyForm: typeof initialEmailOtpForm;
}) {
    const showTabs = mode === "login" || mode === "register";

    return (
        <div className="rounded-3xl border-2 border-slate-200/90 bg-white p-6 shadow-md sm:p-8">
            {/* Header */}
            {mode === "verify" ? (
                <div className="mb-6">
                    <button
                        type="button"
                        disabled={Boolean(busy)}
                        onClick={() => onModeChange("register")}
                        className="mb-3 flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-emerald-700 disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                        <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="currentColor"><path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" /></svg>
                        Quay lại Đăng ký
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-emerald-50">
                            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z" /><path d="m22 6-10 7L2 6" /></svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold leading-tight text-emerald-700 sm:text-[1.75rem]">
                                Xác thực Email
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                Nhập mã OTP 6 số đã được gửi tới <span className="font-medium text-slate-700">{verifyForm.email}</span>
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-6">
                    <h2 className="text-3xl font-semibold leading-tight text-emerald-700 sm:text-[2rem]">
                        {getModeTitle(mode)}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {getModeDescription(mode)}
                    </p>
                </div>
            )}

            {/* Tab bar — only for login / register */}
            {showTabs ? (
                <div
                    className="mb-6 grid grid-cols-2 gap-1.5 rounded-2xl border-2 border-slate-200 bg-slate-100 p-1.5"
                    role="tablist"
                    aria-label="Choose authentication mode"
                >
                    {primaryModes.map((item) => (
                        <button
                            key={item}
                            type="button"
                            role="tab"
                            disabled={Boolean(busy)}
                            aria-selected={mode === item}
                            className={tabClassName(mode === item)}
                            onClick={() => onModeChange(item)}
                        >
                            {getModeTabLabel(item)}
                        </button>
                    ))}
                </div>
            ) : null}

            {mode === "login" ? (
                <LoginForm
                    busy={busy}
                    form={loginForm}
                    onForgotPassword={() => onModeChange("forgot")}
                    onSubmit={onLogin}
                    setForm={setLoginForm}
                />
            ) : null}

            {mode === "register" ? (
                <RegisterForm
                    busy={busy}
                    form={registerForm}
                    onSubmit={onRegister}
                    setForm={setRegisterForm}
                />
            ) : null}

            {mode === "verify" ? (
                <VerifyEmailForm
                    busy={busy}
                    form={verifyForm}
                    onResend={onResendVerification}
                    onSubmit={onVerifyEmail}
                    setForm={setVerifyForm}
                />
            ) : null}

            {mode === "forgot" ? (
                <ForgotPasswordForm
                    busy={busy}
                    form={forgotForm}
                    onBack={() => onModeChange("login")}
                    onSubmit={onForgotPassword}
                    setForm={setForgotForm}
                />
            ) : null}

            {mode === "reset" ? (
                <ResetPasswordForm
                    busy={busy}
                    form={resetForm}
                    onBack={() => onModeChange("login")}
                    onResend={onResendResetCode}
                    onSubmit={onResetPassword}
                    setForm={setResetForm}
                />
            ) : null}
        </div>
    );
}

function LoginForm({
    busy,
    form,
    onForgotPassword,
    onSubmit,
    setForm,
}: {
    busy: BusyState;
    form: typeof initialLoginForm;
    onForgotPassword: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    setForm: (value: typeof initialLoginForm) => void;
}) {
    return (
        <form className="space-y-4" onSubmit={onSubmit}>
            <TextField
                autoComplete="email"
                label="Địa chỉ Email"
                name="email"
                onChange={(value) => setForm({ ...form, email: value })}
                placeholder="nhap-email@vidu.com"
                required
                type="email"
                value={form.email}
            />
            <TextField
                autoComplete="current-password"
                helperText="Mật khẩu có độ dài từ 15 đến 64 ký tự."
                label="Mật khẩu"
                maxLength={64}
                minLength={15}
                name="password"
                onChange={(value) => setForm({ ...form, password: value })}
                placeholder="Nhập mật khẩu (tối thiểu 15 ký tự)"
                required
                type="password"
                value={form.password}
            />
            <div className="flex justify-end">
                <button
                    type="button"
                    disabled={Boolean(busy)}
                    className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 disabled:cursor-not-allowed disabled:text-slate-400"
                    onClick={onForgotPassword}
                >
                    Quên mật khẩu?
                </button>
            </div>
            <SubmitButton busy={busy === "login"} label="Đăng nhập" />
        </form>
    );
}

function RegisterForm({
    busy,
    form,
    onSubmit,
    setForm,
}: {
    busy: BusyState;
    form: typeof initialRegisterForm;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    setForm: (value: typeof initialRegisterForm) => void;
}) {
    return (
        <form className="space-y-4" onSubmit={onSubmit}>
            <TextField
                autoComplete="name"
                label="Họ và tên"
                maxLength={50}
                name="fullName"
                onChange={(value) => setForm({ ...form, fullName: value })}
                placeholder="Ví dụ: Nguyễn Văn An"
                required
                value={form.fullName}
            />
            <TextField
                autoComplete="email"
                label="Địa chỉ Email"
                maxLength={50}
                name="registerEmail"
                onChange={(value) => setForm({ ...form, email: value })}
                placeholder="nhap-email@vidu.com"
                required
                type="email"
                value={form.email}
            />
            <TextField
                autoComplete="new-password"
                helperText="Mật khẩu bảo mật: độ dài từ 15 đến 64 ký tự."
                label="Mật khẩu"
                maxLength={64}
                minLength={15}
                name="registerPassword"
                onChange={(value) => setForm({ ...form, password: value })}
                placeholder="Tối thiểu 15 ký tự (tối đa 64)"
                required
                type="password"
                value={form.password}
            />
            <TextField
                autoComplete="tel"
                label="Số điện thoại liên hệ"
                maxLength={20}
                name="phone"
                onChange={(value) => setForm({ ...form, phone: value })}
                placeholder="0912 345 678"
                type="tel"
                value={form.phone}
            />

            <fieldset disabled={Boolean(busy)}>
                <legend className="mb-2 block text-sm font-bold text-slate-700">
                    Vai trò trên HelpHub
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                    {roleOptions.map((option) => {
                        const checked = form.role === option.value;

                        return (
                            <label
                                key={option.value}
                                className={`min-h-[96px] cursor-pointer rounded-2xl border-2 p-3 transition ${checked
                                    ? "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-[0_2px_0_0_#a7f3d0]"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    className="sr-only"
                                    checked={checked}
                                    onChange={() =>
                                        setForm({
                                            ...form,
                                            role: option.value,
                                        })
                                    }
                                />
                                <span className="block text-sm font-black">
                                    {option.label}
                                </span>
                                <span className="mt-1 block text-xs leading-5 text-slate-600">
                                    {option.description}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </fieldset>

            <SubmitButton busy={busy === "register"} label="Tạo tài khoản" />
        </form>
    );
}

function VerifyEmailForm({
    busy,
    form,
    onResend,
    onSubmit,
    setForm,
}: {
    busy: BusyState;
    form: typeof initialEmailOtpForm;
    onResend: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    setForm: (value: typeof initialEmailOtpForm) => void;
}) {
    return (
        <form className="space-y-4" onSubmit={onSubmit}>
            {/* Email field (read-only, pre-filled from register) */}
            <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                    Địa chỉ Email
                </label>
                <div className="flex h-11 w-full items-center rounded-xl border-2 border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-600">
                    {form.email}
                </div>
            </div>
            <TextField
                autoComplete="one-time-code"
                inputMode="numeric"
                label="Mã xác thực OTP (6 chữ số)"
                maxLength={6}
                name="verifyOtp"
                onChange={(value) => setForm({ ...form, otp: value })}
                placeholder="000000"
                required
                value={form.otp}
            />
            <div className="flex justify-end">
                <button
                    type="button"
                    disabled={Boolean(busy)}
                    className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 disabled:cursor-not-allowed disabled:text-slate-400"
                    onClick={onResend}
                >
                    {busy === "resendVerification"
                        ? "Đang gửi mã mới..."
                        : "Gửi lại mã OTP"}
                </button>
            </div>
            <SubmitButton busy={busy === "verify"} label="Xác thực Email" />
        </form>
    );
}

function ForgotPasswordForm({
    busy,
    form,
    onBack,
    onSubmit,
    setForm,
}: {
    busy: BusyState;
    form: typeof initialForgotPasswordForm;
    onBack: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    setForm: (value: typeof initialForgotPasswordForm) => void;
}) {
    return (
        <form className="space-y-4" onSubmit={onSubmit}>
            <TextField
                autoComplete="email"
                label="Email đăng ký của bạn"
                name="forgotEmail"
                onChange={(value) => setForm({ email: value })}
                placeholder="nhap-email@vidu.com"
                required
                type="email"
                value={form.email}
            />
            <SubmitButton busy={busy === "forgot"} label="Gửi mã khôi phục" />
            <BackButton busy={busy} label="Quay lại Đăng nhập" onClick={onBack} />
        </form>
    );
}

function ResetPasswordForm({
    busy,
    form,
    onBack,
    onResend,
    onSubmit,
    setForm,
}: {
    busy: BusyState;
    form: typeof initialResetPasswordForm;
    onBack: () => void;
    onResend: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    setForm: (value: typeof initialResetPasswordForm) => void;
}) {
    return (
        <form className="space-y-4" onSubmit={onSubmit}>
            <TextField
                autoComplete="email"
                label="Địa chỉ Email"
                name="resetEmail"
                onChange={(value) => setForm({ ...form, email: value })}
                placeholder="nhap-email@vidu.com"
                required
                type="email"
                value={form.email}
            />
            <TextField
                autoComplete="one-time-code"
                inputMode="numeric"
                label="Mã xác thực OTP (6 chữ số)"
                maxLength={6}
                name="resetOtp"
                onChange={(value) => setForm({ ...form, otp: value })}
                placeholder="000000"
                required
                value={form.otp}
            />
            <TextField
                autoComplete="new-password"
                helperText="Mật khẩu bảo mật: độ dài từ 15 đến 64 ký tự."
                label="Mật khẩu mới"
                maxLength={64}
                minLength={15}
                name="newPassword"
                onChange={(value) => setForm({ ...form, newPassword: value })}
                placeholder="Nhập mật khẩu mới (tối thiểu 15 ký tự)"
                required
                type="password"
                value={form.newPassword}
            />
            <div className="flex justify-end">
                <button
                    type="button"
                    disabled={Boolean(busy)}
                    className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 disabled:cursor-not-allowed disabled:text-slate-400"
                    onClick={onResend}
                >
                    {busy === "resendReset" ? "Đang gửi mã mới..." : "Gửi lại mã OTP"}
                </button>
            </div>
            <SubmitButton busy={busy === "reset"} label="Đặt lại mật khẩu" />
            <BackButton busy={busy} label="Quay lại Đăng nhập" onClick={onBack} />
        </form>
    );
}

function SubmitButton({ busy, label }: { busy: boolean; label: string }) {
    return (
        <Button
            type="submit"
            disabled={busy}
            className="mt-2 h-11 w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow-[0_3px_0_0_#065f46] transition"
        >
            {busy ? (
                <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Đang xử lý...
                </>
            ) : (
                label
            )}
        </Button>
    );
}

function BackButton({
    busy,
    label,
    onClick,
}: {
    busy: BusyState;
    label: string;
    onClick: () => void;
}) {
    return (
        <Button
            type="button"
            variant="outline"
            disabled={Boolean(busy)}
            onClick={onClick}
            className="h-10 w-full font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-800 transition"
        >
            {label}
        </Button>
    );
}

function TextField({
    helperText,
    label,
    name,
    onChange,
    value,
    type = "text",
    ...inputProps
}: {
    helperText?: string;
    label: string;
    name: string;
    onChange: (value: string) => void;
    value: string;
    type?: string;
} & Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "className" | "name" | "onChange" | "type" | "value"
>) {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isTouched, setIsTouched] = useState(false);
    const inputId = useId();
    const isPassword = type === "password" || name.toLowerCase().includes("password");
    const isEmail = type === "email" || name.toLowerCase().includes("email");
    const isOtp = name.toLowerCase().includes("otp");
    const isPhone = type === "tel" || name.toLowerCase().includes("phone");

    const inputType = isPassword && passwordVisible ? "text" : type;

    const min = inputProps.minLength ?? (isPassword ? 15 : undefined);
    const max = inputProps.maxLength ?? (isPassword ? 64 : undefined);

    let isInvalid = false;
    let isValid = false;
    let feedbackMessage = "";
    let countBadge = "";

    const hasValue = value.length > 0;

    if (hasValue) {
        if (isPassword) {
            const requiredMin = min ?? 15;
            countBadge = `${value.length}/${requiredMin}`;
            if (value.length < requiredMin) {
                isInvalid = true;
                feedbackMessage = `Cần tối thiểu ${requiredMin} ký tự`;
            } else if (max && value.length > max) {
                isInvalid = true;
                feedbackMessage = `Tối đa ${max} ký tự`;
            } else {
                isValid = true;
                feedbackMessage = "Mật khẩu đạt độ dài yêu cầu";
            }
        } else if (isEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isInvalid = true;
                feedbackMessage = "Email chưa đúng định dạng";
            } else {
                isValid = true;
                feedbackMessage = "Email hợp lệ";
            }
        } else if (isOtp) {
            countBadge = `${value.length}/6`;
            if (value.length < 6) {
                isInvalid = true;
                feedbackMessage = "Cần đủ 6 chữ số";
            } else if (!/^\d{6}$/.test(value)) {
                isInvalid = true;
                feedbackMessage = "Chỉ bao gồm chữ số";
            } else {
                isValid = true;
                feedbackMessage = "Mã OTP hợp lệ";
            }
        } else if (isPhone) {
            const cleanPhone = value.replace(/[\s.-]/g, "");
            if (!/^(0|\+84)[0-9]{9,10}$/.test(cleanPhone)) {
                isInvalid = true;
                feedbackMessage = "Số điện thoại chưa đúng (10 chữ số)";
            } else {
                isValid = true;
                feedbackMessage = "Số điện thoại hợp lệ";
            }
        } else {
            if (min && value.length < min) {
                isInvalid = true;
                countBadge = `${value.length}/${min}`;
                feedbackMessage = `Cần tối thiểu ${min} ký tự`;
            } else {
                isValid = true;
            }
        }
    } else if (isTouched && inputProps.required) {
        isInvalid = true;
        feedbackMessage = "Vui lòng nhập trường này";
    }

    const borderAndRingClass = isInvalid
        ? "border-2 border-rose-500 bg-rose-50/15 text-rose-950 placeholder:text-rose-300 focus-visible:border-rose-600 focus-visible:ring-2 focus-visible:ring-rose-200"
        : isValid
        ? "border-2 border-emerald-500 bg-emerald-50/15 text-slate-950 placeholder:text-slate-400 focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-200"
        : "border-2 border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200";

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <Label
                    htmlFor={inputId}
                    className="text-sm font-bold text-slate-700"
                >
                    {label}
                    {inputProps.required ? (
                        <span className="ml-1 text-rose-500">*</span>
                    ) : null}
                </Label>
                {countBadge ? (
                    <span
                        className={`font-mono text-xs font-bold tabular-nums transition-colors ${
                            isInvalid
                                ? "text-rose-600"
                                : isValid
                                ? "text-emerald-700"
                                : "text-slate-400"
                        }`}
                    >
                        {countBadge}
                    </span>
                ) : null}
            </div>
            <div className="relative">
                <Input
                    {...inputProps}
                    id={inputId}
                    name={name}
                    type={inputType}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    onBlur={(event) => {
                        setIsTouched(true);
                        inputProps.onBlur?.(event);
                    }}
                    aria-invalid={isInvalid ? "true" : undefined}
                    className={`h-11 px-3.5 text-sm transition-all duration-150 ${borderAndRingClass} ${
                        isPassword ? "pr-11" : ""
                    }`}
                />
                {isPassword ? (
                    <button
                        type="button"
                        aria-label={
                            passwordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                        }
                        title={
                            passwordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                        }
                        onClick={() =>
                            setPasswordVisible((current) => !current)
                        }
                        className={`absolute right-2.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg transition ${
                            isInvalid
                                ? "text-rose-500 hover:bg-rose-100 hover:text-rose-700"
                                : isValid
                                ? "text-emerald-600 hover:bg-emerald-100 hover:text-emerald-800"
                                : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        }`}
                    >
                        {passwordVisible ? (
                            <EyeOff className="size-4" />
                        ) : (
                            <Eye className="size-4" />
                        )}
                    </button>
                ) : null}
            </div>
            {feedbackMessage ? (
                <p
                    className={`flex items-center gap-1 text-xs font-semibold ${
                        isInvalid
                            ? "text-rose-600"
                            : isValid
                            ? "text-emerald-700"
                            : "text-slate-500"
                    }`}
                >
                    {isInvalid ? (
                        <AlertCircle className="size-3.5 shrink-0" />
                    ) : isValid ? (
                        <CheckCircle2 className="size-3.5 shrink-0" />
                    ) : null}
                    <span>{feedbackMessage}</span>
                </p>
            ) : helperText ? (
                <p className="text-xs font-medium text-slate-500">{helperText}</p>
            ) : null}
        </div>
    );
}

function EyeIcon({ crossed }: { crossed: boolean }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
        >
            <path d="M2.25 12s3.5-6 9.75-6 9.75 6 9.75 6-3.5 6-9.75 6-9.75-6-9.75-6Z" />
            <circle cx="12" cy="12" r="2.75" />
            {crossed ? <path d="M4.5 19.5 19.5 4.5" /> : null}
        </svg>
    );
}

function NoticeBanner({ notice }: { notice: Exclude<Notice, null> }) {
    const isSuccess = notice.type === "success";

    return (
        <div
            className={`mt-4 flex items-start gap-3 rounded-2xl border-2 px-4 py-3.5 text-sm font-bold shadow-xs ${isSuccess
                ? "border-emerald-200 bg-emerald-50 text-emerald-950 shadow-[0_2px_0_0_#a7f3d0]"
                : "border-rose-200 bg-rose-50 text-rose-950 shadow-[0_2px_0_0_#fecdd3]"
                }`}
            role="status"
        >
            {isSuccess ? (
                <CheckCircle2 className="size-5 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
                <AlertCircle className="size-5 shrink-0 text-rose-600 mt-0.5" />
            )}
            <div className="flex-1 leading-relaxed">{notice.message}</div>
        </div>
    );
}

function tabClassName(active: boolean): string {
    return `h-11 rounded-xl px-3 text-sm font-black tracking-wide transition disabled:cursor-not-allowed cursor-pointer ${active
        ? "bg-white text-emerald-800 shadow-[0_2px_0_0_#cbd5e1] border-2 border-slate-200"
        : "text-slate-500 hover:text-slate-800 disabled:text-slate-400"
        }`;
}

function getModeTitle(mode: AuthMode): string {
    switch (mode) {
        case "register":
            return "Tạo tài khoản mới";
        case "verify":
            return "Xác thực Email";
        case "forgot":
            return "Khôi phục mật khẩu";
        case "reset":
            return "Đặt lại mật khẩu";
        default:
            return "Đăng nhập";
    }
}

function getModeDescription(mode: AuthMode): string {
    switch (mode) {
        case "register":
            return "Đăng ký tài khoản người cần hỗ trợ hoặc tình nguyện viên.";
        case "verify":
            return "Nhập mã OTP 6 số đã được gửi tới địa chỉ email của bạn.";
        case "forgot":
            return "Nhập email của bạn để nhận mã khôi phục mật khẩu.";
        case "reset":
            return "Dùng mã xác thực OTP để thiết lập mật khẩu mới.";
        default:
            return "Đăng nhập bằng tài khoản HelpHub của bạn để tiếp tục.";
    }
}

function getModeTabLabel(mode: AuthMode): string {
    switch (mode) {
        case "register":
            return "Đăng ký";
        case "verify":
            return "Xác thực";
        default:
            return "Đăng nhập";
    }
}

function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        if (
            error.message.includes("Password does not meet security requirements") ||
            error.message.includes("INVALID_PASSWORD")
        ) {
            return "Mật khẩu không đáp ứng yêu cầu bảo mật: Phải có độ dài từ 15 đến 64 ký tự và không dùng mật khẩu phổ biến dễ đoán.";
        }
        if (
            error.message.includes("EMAIL_ALREADY_EXISTS") ||
            error.message.includes("Email is already registered")
        ) {
            return "Địa chỉ email này đã được đăng ký tài khoản HelpHub. Vui lòng chọn Đăng nhập hoặc sử dụng email khác.";
        }
        if (
            error.message.includes("Invalid email or password") ||
            error.message.includes("UNAUTHORIZED")
        ) {
            return "Email hoặc mật khẩu không chính xác.";
        }
        if (
            error.message.includes("INVALID_EMAIL_VERIFICATION") ||
            error.message.includes("Verification failed or code is no longer valid")
        ) {
            return "Mã OTP xác thực không chính xác hoặc đã hết hiệu lực. Vui lòng bấm 'Gửi lại mã OTP'.";
        }
        if (
            error.message.includes("INVALID_REGISTRATION_ROLE")
        ) {
            return "Vai trò đăng ký không hợp lệ. Vui lòng chọn lại vai trò.";
        }
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.";
}
