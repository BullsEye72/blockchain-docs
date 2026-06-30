"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import LoginForm from "./login/form";

export default function UserForm({ open, setOpen }) {
  return (
    <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white rounded-xl shadow-xl w-full max-w-sm">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
            <DialogTitle className="font-semibold text-gray-900">Connexion</DialogTitle>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          <LoginForm setOpen={setOpen} />
        </DialogPanel>
      </div>
    </Dialog>
  );
}
