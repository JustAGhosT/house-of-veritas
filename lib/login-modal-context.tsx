"use client"

import { createContext, useContext, useState, ReactNode, useCallback } from "react"
import { LoginModal } from "@/components/login-modal"

interface LoginModalContextType {
  openLoginModal: () => void
  closeLoginModal: () => void
  isOpen: boolean
}

const LoginModalContext = createContext<LoginModalContextType | undefined>(undefined)

export function LoginModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openLoginModal = useCallback(() => setIsOpen(true), [])
  const closeLoginModal = useCallback(() => setIsOpen(false), [])

  return (
    <LoginModalContext.Provider value={{ openLoginModal, closeLoginModal, isOpen }}>
      {children}
      <LoginModal open={isOpen} onOpenChange={setIsOpen} />
    </LoginModalContext.Provider>
  )
}

export function useLoginModal() {
  const context = useContext(LoginModalContext)
  if (context === undefined) {
    throw new Error("useLoginModal must be used within a LoginModalProvider")
  }
  return context
}
