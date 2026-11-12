import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  X,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

export interface AdminUser {
  username: string;
  role: 'ADMIN';
  displayName: string;
}

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, user: AdminUser) => void;
  reasonMessage?: string;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  reasonMessage,
}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu Ban Tổ Chức.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok || !data?.token) {
        setErrorMsg(
          data?.error ||
            'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại!'
        );
        return;
      }

      onLoginSuccess(data.token, data.user);
      setUsername('');
      setPassword('');
    } catch {
      setErrorMsg('Không thể kết nối máy chủ xác thực. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-400/70 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              BẢO MẬT NGÂN HÀNG ĐỀ THI OLYMPIA
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
              Đăng Nhập Quyền Quản Trị & Đổi Đề
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {reasonMessage ||
            'Các chức năng Đổi đề, Chọn trận thi đấu cụ thể và Quản lý Kho câu hỏi CSV được bảo mật dành riêng cho Ban Tổ Chức để đảm bảo tính công bằng cho các Nhà Leo Núi.'}
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
              Tên đăng nhập Ban Tổ Chức
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Nhập tài khoản Ban Tổ Chức..."
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
              Mật khẩu bảo mật
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Nhập mật khẩu quản trị..."
                className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/70 border border-rose-500/50 rounded-xl text-xs font-semibold text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-extrabold shadow-lg cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Lock className="w-4 h-4 animate-pulse" />
                  Đang xác thực...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Đăng Nhập & Mở Khóa Quyền Đổi Đề
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
